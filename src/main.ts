/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  
  // Compression
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get('app.cors.origin'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('FXQL Backend API')
    .setDescription('Foreign Exchange Query Language Parser API Documentation')
    .setVersion('1.0')
    .addServer(process.env.NODE_ENV === 'production' 
      ? 'https://fxql-backend-spmc.onrender.com' // Replace with your Render URL
      : 'http://localhost:' + configService.get('app.port'))
    .addBearerAuth()
    .addTag('FXQL')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'FXQL API Documentation',
    customfavIcon: 'https://example.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      docExpansion: 'list',
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  
  console.log(`Application running on port ${port}`);
  console.log(`Swagger documentation available at ${await app.getUrl()}/api`);
}

bootstrap();