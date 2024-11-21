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
  // Add connection timeout
  connectTimeoutMS: 10000,
  // Increase pool size
  poolSize: 5,
});

async function runMigrations() {
  try {
    console.log('Initializing database connection...');
    await dataSource.initialize();
    
    console.log('Running migrations...');
    const migrations = await dataSource.runMigrations({ transaction: 'each' });
    console.log('Migrations completed:', migrations.length, 'migrations executed');
    
    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration error:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

runMigrations();