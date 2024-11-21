/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FxqlModule } from './fxql/fxql.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';
import { appConfig } from './config/configuration';
import { validate } from './config/env.validation';
import { TypeOrmConfigService } from './config/typeorm.config';
import { FxqlExceptionFilter } from './fxql/filters/fxql-exception.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate,
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        '.env'
      ],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> => ({
        throttlers: [
          {
            ttl: 60,
            limit: configService.get<number>('app.rateLimit.max'),
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    FxqlModule,
    HealthModule,
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FxqlExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}