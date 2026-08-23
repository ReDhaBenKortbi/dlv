import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { UpdateUserTierDto } from './dto/update-user-tier.dto';
import { UsersFilterDto } from './dto/users-filter.dto';
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
  list(@Query() filter: UsersFilterDto) {
    return this.usersService.list(filter);
  }

  @UseGuards(AdminGuard)
  @Get('stats')
  stats() {
    return this.usersService.stats();
  }

  @UseGuards(AdminGuard)
  @Patch(':id/subscription')
  updateSubscription(@Param('id') id: string, @Body() dto: UpdateUserTierDto) {
    return this.usersService.updateSubscription(id, dto.plan);
  }
}
