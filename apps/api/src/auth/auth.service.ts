import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { fullName: dto.fullName, email: dto.email, passwordHash },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: stored.userId },
    });

    // Rotate: delete old token, issue new pair
    await this.prisma.refreshToken.delete({ where: { token } });
    return this.issueTokens(user.id, user.email, user.role);
  }

  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
