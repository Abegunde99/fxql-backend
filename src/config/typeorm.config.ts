/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';

export const getTypeOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const dbUrl = configService.get<string>('database.url');
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  return {
    type: 'postgres',
    url: dbUrl,
    entities: [FxqlEntry],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    migrationsRun: true,
    synchronize: false, // Disable synchronize for safety
    ssl: {
      rejectUnauthorized: false // Required for Clever Cloud
    },
    logging: ['error'],
    autoLoadEntities: true,
  };
};