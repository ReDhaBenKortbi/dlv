import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '@prisma/client';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User>(_err: unknown, user: TUser | null): TUser | null {
    return user ?? null;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
