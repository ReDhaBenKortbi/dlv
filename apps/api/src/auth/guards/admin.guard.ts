import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { OptionallyAuthenticatedRequest } from '../../common/types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<OptionallyAuthenticatedRequest>();
    if (req.user?.role !== Role.ADMIN) throw new ForbiddenException();
    return true;
  }
}
