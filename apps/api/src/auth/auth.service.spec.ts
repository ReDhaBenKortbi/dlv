import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

// bcryptjs is mocked so tests stay fast (no cost-12 hashing) and deterministic.
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const hashMock = hash as jest.MockedFunction<typeof hash>;
const compareMock = compare as jest.MockedFunction<typeof compare>;

// Minimal prisma double: only the methods AuthService touches.
function createPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
}

describe('AuthService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwt: { sign: jest.Mock };
  let config: { getOrThrow: jest.Mock };
  let service: AuthService;

  const user = {
    id: 'u_1',
    email: 'user@example.com',
    role: 'USER',
    passwordHash: 'stored-hash',
    fullName: 'Jane Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = createPrismaMock();
    jwt = { sign: jest.fn().mockReturnValue('access-token') };
    config = { getOrThrow: jest.fn().mockReturnValue('jwt-secret') };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
    prisma.refreshToken.create.mockResolvedValue({});
  });

  describe('register', () => {
    const dto = {
      fullName: 'Jane Doe',
      email: 'user@example.com',
      password: 'Password123!',
    };

    it('rejects an email that is already in use', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('hashes the password at cost 12 and creates the user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      hashMock.mockResolvedValue('new-hash' as never);
      prisma.user.create.mockResolvedValue(user);

      const result = await service.register(dto);

      expect(hashMock).toHaveBeenCalledWith(dto.password, 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash: 'new-hash',
        },
      });
      expect(result.accessToken).toBe('access-token');
      expect(typeof result.refreshToken).toBe('string');
    });
  });

  describe('login', () => {
    const dto = { email: 'user@example.com', password: 'Password123!' };

    it('rejects an unknown email with UnauthorizedException', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(compareMock).not.toHaveBeenCalled();
    });

    it('rejects a wrong password with UnauthorizedException', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      compareMock.mockResolvedValue(false as never);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('issues tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      compareMock.mockResolvedValue(true as never);

      const result = await service.login(dto);

      expect(compareMock).toHaveBeenCalledWith(dto.password, user.passwordHash);
      expect(result.accessToken).toBe('access-token');
      expect(typeof result.refreshToken).toBe('string');
    });
  });

  describe('issueTokens (via login)', () => {
    it('signs the access token with the JWT_SECRET and a 15m expiry', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      compareMock.mockResolvedValue(true as never);

      await service.login({ email: user.email, password: 'x' });

      expect(config.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: user.id, email: user.email, role: user.role },
        { secret: 'jwt-secret', expiresIn: '15m' },
      );
    });

    it('persists a refresh token expiring ~7 days out', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      compareMock.mockResolvedValue(true as never);

      await service.login({ email: user.email, password: 'x' });

      const createCalls = prisma.refreshToken.create.mock.calls as Array<
        [{ data: { token: string; userId: string; expiresAt: Date } }]
      >;
      const createArg = createCalls[0][0];
      expect(createArg.data.userId).toBe(user.id);
      expect(createArg.data.token).toEqual(expect.any(String));

      const expected = Date.now() + 7 * 24 * 60 * 60 * 1000;
      expect(
        Math.abs(createArg.data.expiresAt.getTime() - expected),
      ).toBeLessThan(60_000);
    });
  });

  describe('refresh', () => {
    it('rejects an unknown token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('nope')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an expired token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        token: 'old',
        userId: user.id,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh('old')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('rotates the token: deletes the old one and issues a new pair', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        token: 'old',
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000),
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue(user);

      const result = await service.refresh('old');

      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'old' },
      });
      expect(result.accessToken).toBe('access-token');
      expect(typeof result.refreshToken).toBe('string');
      // The newly issued refresh token is not the rotated-out one.
      expect(result.refreshToken).not.toBe('old');
    });
  });

  describe('logout', () => {
    it('deletes the supplied refresh token', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('some-token');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-token' },
      });
    });
  });
});
