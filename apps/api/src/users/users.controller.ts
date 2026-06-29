import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.usersService.me(req.user.id);
  }

  @UseGuards(AdminGuard)
  @Get()
  list() {
    return this.usersService.list();
  }

  @UseGuards(AdminGuard)
  @Get('stats')
  stats() {
    return this.usersService.stats();
  }

  @UseGuards(AdminGuard)
  @Patch(':id/subscription')
  updateSubscription(
    @Param('id') id: string,
    @Body('isSubscribed') isSubscribed: boolean,
  ) {
    return this.usersService.updateSubscription(id, isSubscribed);
  }
}
