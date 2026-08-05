import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from './refresh-cookie';

// Tight limit on credential endpoints to blunt brute-force / stuffing.
const AUTH_THROTTLE = { default: { ttl: 60_000, limit: 5 } };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return { accessToken };
  }

  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return { accessToken };
  }

  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    if (!token) throw new UnauthorizedException('Missing refresh token');

    const { accessToken, refreshToken } = await this.authService.refresh(token);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Request() _req: AuthenticatedRequest,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_COOKIE_NAME
    ];
    if (token) await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions());
  }
}
