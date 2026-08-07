import './instrument';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Trust exactly one hop (the hosting platform's reverse proxy) so
  // req.ip / X-Forwarded-For reflect the real client, not the proxy —
  // required for the throttler to rate-limit per visitor correctly.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // Let in-flight requests finish and close DB connections cleanly when
  // the host sends a shutdown signal (e.g. on redeploy), instead of
  // killing the process mid-request.
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
