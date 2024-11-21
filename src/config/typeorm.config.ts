/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.get<string>('app.nodeEnv');
    const isProduction = nodeEnv === 'production';

    return {
      type: 'postgres',
      url: this.configService.get<string>('app.databaseUrl'),
      entities: [FxqlEntry],
      synchronize: false,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      logging: !isProduction,
      autoLoadEntities: true,
    };
  }
}