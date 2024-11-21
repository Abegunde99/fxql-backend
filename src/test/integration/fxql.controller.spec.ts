/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { ConfigModule } from '@nestjs/config';
import { TestDatabaseModule } from '../utils/test-database';
import { DataSource } from 'typeorm';

describe('FxqlController (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TestDatabaseModule,
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    // Get the DataSource from the app
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Initialize database and run migrations
    try {
      // Drop existing table if exists
      await dataSource.query(`DROP TABLE IF EXISTS "fxql_entries" CASCADE`);

      // Create tables
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "fxql_entries" (
          "entry_id" SERIAL PRIMARY KEY,
          "source_currency" VARCHAR(3) NOT NULL,
          "destination_currency" VARCHAR(3) NOT NULL,
          "buy_price" DECIMAL(10,4) NOT NULL,
          "sell_price" DECIMAL(10,4) NOT NULL,
          "cap_amount" INTEGER NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        )
      `);

      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_CURRENCY_PAIR"
        ON "fxql_entries" ("source_currency", "destination_currency")
      `);

      // Create updated_at trigger
      await dataSource.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      await dataSource.query(`
        CREATE TRIGGER update_fxql_entries_updated_at
            BEFORE UPDATE ON "fxql_entries"
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
      `);

      console.log('Test database initialized successfully');
    } catch (error) {
      console.error('Database setup error:', error);
      throw error;
    }

    await app.init();
  }, 30000); // Increase timeout for database setup

  afterAll(async () => {
    try {
      // Clean up
      await dataSource.query(`DROP TABLE IF EXISTS "fxql_entries" CASCADE`);
      await dataSource.query(`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE`);
      await app.close();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  beforeEach(async () => {
    try {
      // Clear the test table before each test
      await dataSource.query('TRUNCATE TABLE "fxql_entries" CASCADE');
    } catch (error) {
      console.error('Table cleanup error:', error);
      throw error;
    }
  });

  it('/fxql-statements (POST) - should parse and save valid FXQL statement', async () => {
    const response = await request(app.getHttpServer())
      .post('/fxql-statements')
      .send({
        FXQL: `USD-GBP {
          BUY 100
          SELL 200
          CAP 93800
        }`,
      });

    expect(response.status).toBe(201);
    expect(response.body.code).toBe('FXQL-200');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty('EntryId');
    expect(response.body.data[0].SourceCurrency).toBe('USD');
    expect(response.body.data[0].DestinationCurrency).toBe('GBP');
    expect(response.body.data[0].BuyPrice).toBe(100);
    expect(response.body.data[0].SellPrice).toBe(200);
    expect(response.body.data[0].CapAmount).toBe(93800);
  });

  it('/fxql-statements (POST) - should handle multiple statements', async () => {
    const response = await request(app.getHttpServer())
      .post('/fxql-statements')
      .send({
        FXQL: `
          USD-GBP {
            BUY 100
            SELL 200
            CAP 93800
          }
          EUR-USD {
            BUY 1.1
            SELL 1.2
            CAP 50000
          }
        `,
      });

    expect(response.status).toBe(201);
    expect(response.body.code).toBe('FXQL-200');
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].SourceCurrency).toBe('USD');
    expect(response.body.data[0].DestinationCurrency).toBe('GBP');
    expect(response.body.data[1].SourceCurrency).toBe('EUR');
    expect(response.body.data[1].DestinationCurrency).toBe('USD');
  });

  it('/fxql-statements (POST) - should reject invalid FXQL', async () => {
    const response = await request(app.getHttpServer())
      .post('/fxql-statements')
      .send({
        FXQL: `INVALID-GBP {
          BUY 100
          SELL 200
          CAP 93800
        }`,
      });

    expect(response.status).toBe(400);
  });

  it('/fxql-statements (POST) - should update existing currency pair', async () => {
    // First insertion
    await request(app.getHttpServer())
      .post('/fxql-statements')
      .send({
        FXQL: `USD-GBP {
          BUY 100
          SELL 200
          CAP 93800
        }`,
      });

    // Second insertion with same currency pair but different values
    const response = await request(app.getHttpServer())
      .post('/fxql-statements')
      .send({
        FXQL: `USD-GBP {
          BUY 110
          SELL 220
          CAP 94800
        }`,
      });

    expect(response.status).toBe(201);
    expect(response.body.code).toBe('FXQL-200');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].SourceCurrency).toBe('USD');
    expect(response.body.data[0].DestinationCurrency).toBe('GBP');
    expect(response.body.data[0].BuyPrice).toBe(110);
    expect(response.body.data[0].SellPrice).toBe(220);
    expect(response.body.data[0].CapAmount).toBe(94800);
  });
});