import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global baseline rate limit: 100 requests / minute / IP.
    // Auth routes tighten this further with a per-route @Throttle override.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    BooksModule,
    UsersModule,
    PaymentsModule,
    TicketsModule,
    ReviewsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
