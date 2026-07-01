import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';

// Tight limit on credential endpoints to blunt brute-force / stuffing.
const AUTH_THROTTLE = { default: { ttl: 60_000, limit: 5 } };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Request() _req: AuthenticatedRequest, @Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }
}
