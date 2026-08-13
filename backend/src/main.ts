import * as dns from 'dns';

// Fix Node.js Windows SRV DNS resolution for MongoDB Atlas (mongodb+srv://)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore fallback
}

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for web and mobile clients
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Serve local uploaded files statically if needed
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`=========================================`);
  logger.log(`🚀 Heyama Backend API running on http://localhost:${port}`);
  logger.log(`📡 Socket.IO WebSocket Gateway is active`);
  logger.log(`📦 MongoDB URI: ${process.env.MONGODB_URI ? 'Configuré (MongoDB Atlas)' : 'Default'}`);
  logger.log(`🪣 S3 Bucket: ${process.env.S3_BUCKET_NAME || 'heyama-objects'}`);
  logger.log(`=========================================`);
}
bootstrap();
