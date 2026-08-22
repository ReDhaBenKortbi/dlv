import type { Request } from 'express';
import type { User } from '@prisma/client';

export type AuthenticatedRequest = Request & { user: User };
export type OptionallyAuthenticatedRequest = Request & { user?: User };
