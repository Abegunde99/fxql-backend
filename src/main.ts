/* eslint-disable prettier/prettier */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as rateLimit from 'express-rate-limit';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet());
  app.use(
    rateLimit.default({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('FXQL Parser API')
    .setDescription('API for parsing Foreign Exchange Query Language statements')
    .setVersion('1.0')
    .addTag('FXQL')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();