/* eslint-disable prettier/prettier */
import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('FXQL Backend API')
  .setDescription('Foreign Exchange Query Language Parser API Documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('FXQL')
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    filter: true,
    displayRequestDuration: true,
  },
  customSiteTitle: 'FXQL API Documentation',
};