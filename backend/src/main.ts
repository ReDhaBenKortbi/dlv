import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

const SIGN_BATCH_ROUTE = /^\/books\/[^/]+\/content\/sign-batch$/;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const signBatchJson = json({ limit: '1mb' });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (SIGN_BATCH_ROUTE.test(req.path)) return signBatchJson(req, res, next);
    return next();
  });
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
