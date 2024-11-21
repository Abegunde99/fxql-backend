/* eslint-disable prettier/prettier */
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';
import * as path from 'path';

// Load the appropriate .env file
config({ path: path.join(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const options: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [FxqlEntry],
  migrations: ['src/migrations/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};

export default new DataSource(options);