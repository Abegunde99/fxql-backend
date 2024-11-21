/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlModule } from './fxql/fxql.module';
import { LoggerModule } from './logger/logger.module';
import configuration from './config/configuration';
import { getTypeOrmConfig } from './config/typeorm.config';
import { FxqlExceptionFilter } from './fxql/filters/fxql-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    FxqlModule,
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FxqlExceptionFilter,
    },
  ],
})
export class AppModule {}