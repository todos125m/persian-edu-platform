import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

// Cached Express instance across warm serverless invocations.
let cachedHandler: ((req: Request, res: Response) => void) | null = null;

async function bootstrap(): Promise<(req: Request, res: Response) => void> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Reflect the caller's origin so any Vercel domain (prod + previews) works.
  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: Request, res: Response) {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  return cachedHandler(req, res);
}
