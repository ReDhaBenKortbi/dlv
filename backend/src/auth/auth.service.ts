import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, fullName: dto.fullName, passwordHash },
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildResponse(user);
  }

  async me(userId: string) {
    let user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Auto-expire subscription when past end date
    if (user.isSubscribed && user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
      user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          isSubscribed: false,
          subscriptionStatus: SubscriptionStatus.NONE,
          subscriptionStartDate: null,
          subscriptionEndDate: null,
        },
      });
    }

    return this.toAuthUser(user);
  }

  async resetSubscription(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed: false,
        subscriptionStatus: SubscriptionStatus.NONE,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
      },
    });
  }

  private buildResponse(user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    isSubscribed: boolean;
    subscriptionStatus: string;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    createdAt: Date;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    isSubscribed: boolean;
    subscriptionStatus: string;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    createdAt: Date;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isSubscribed: user.isSubscribed,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      createdAt: user.createdAt,
    };
  }
}
