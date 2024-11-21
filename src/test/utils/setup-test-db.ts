/* eslint-disable prettier/prettier */
import { Client } from 'pg';
import { config } from 'dotenv';
import * as path from 'path';

async function setupTestDatabase() {
  config({ path: path.join(process.cwd(), '.env.test') });

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    await client.connect();
    
    // Drop tables if they exist
    await client.query(`DROP TABLE IF EXISTS "fxql_entries" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "typeorm_migrations" CASCADE`);

    console.log('Test database prepared successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupTestDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to set up test database:', error);
      process.exit(1);
    });
}