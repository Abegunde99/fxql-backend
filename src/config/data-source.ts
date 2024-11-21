/* eslint-disable prettier/prettier */
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';
import { CreateFxqlEntries1700000000000 } from '../migrations/1700000000000-CreateFxqlEntries';

config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [FxqlEntry],
  migrations: [CreateFxqlEntries1700000000000],
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: false,
  logging: true,
  migrationsRun: false, // Set this to false explicitly
  migrationsTableName: 'typeorm_migrations', // Explicit migrations table name
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
