/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';
import { CreateFxqlEntries1700000000000 } from '../migrations/1700000000000-CreateFxqlEntries';

config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [FxqlEntry],
  migrations: [CreateFxqlEntries1700000000000],
  ssl: {
    rejectUnauthorized: false
  },
});

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations completed successfully');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error running migrations:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runMigrations();