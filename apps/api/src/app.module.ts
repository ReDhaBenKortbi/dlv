import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { envValidationSchema } from './env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    // Must be the first import — sets up Sentry's request/exception
    // interceptors before other modules register their own.
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    // Global baseline rate limit: 100 requests / minute / IP.
    // Auth routes tighten this further with a per-route @Throttle override.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    BooksModule,
    UsersModule,
    PaymentsModule,
    TicketsModule,
    ReviewsModule,
  ],
  providers: [
    // Reports uncaught exceptions to Sentry (no-ops if SENTRY_DSN isn't set),
    // then re-throws so Nest's default error handling still runs.
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
