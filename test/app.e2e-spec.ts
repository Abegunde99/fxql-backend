/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './../src/app.module';
import { TestDatabaseModule } from '../src/test/utils/test-database';
import { DataSource } from 'typeorm';

describe('FxqlController (e2e)', () => {
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

    dataSource = moduleFixture.get<DataSource>(DataSource);

    try {
      await dataSource.query(`DROP TABLE IF EXISTS "fxql_entries" CASCADE`);
      await dataSource.query(`DROP TABLE IF EXISTS "typeorm_migrations" CASCADE`);

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

      console.log('Test database initialized successfully');
    } catch (error) {
      console.error('Database setup error:', error);
      throw error;
    }

    await app.init();
  });

  afterAll(async () => {
    try {
      // Clean up
      await dataSource.query(`DROP TABLE IF EXISTS "fxql_entries" CASCADE`);
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
});