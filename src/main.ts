/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  // Enable garbage collection
  if (process.env.NODE_ENV === 'production') {
    global.gc?.();
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // Reduce logging in production
    cors: true,
    bufferLogs: true,
  });

  // Security
  app.use(helmet());
  
  // Compression
  app.use(compression());

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger with caching
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('FXQL Parser API')
      .setDescription('Foreign Exchange Query Language Parser')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();