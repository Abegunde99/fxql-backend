/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFxqlEntries1700000000000 implements MigrationInterface {
    name = 'CreateFxqlEntries1700000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop table if exists to ensure clean state
        await queryRunner.query(`DROP TABLE IF EXISTS "fxql_entries" CASCADE`);

        // Create table with snake_case column names
        await queryRunner.query(`
            CREATE TABLE "fxql_entries" (
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

        // Create index after table creation
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_CURRENCY_PAIR"
            ON "fxql_entries" ("source_currency", "destination_currency")
        `);

        // Add update trigger for updated_at
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = now();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_fxql_entries_updated_at
                BEFORE UPDATE ON "fxql_entries"
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop trigger first
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_fxql_entries_updated_at ON "fxql_entries"`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
        
        // Drop index
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_CURRENCY_PAIR"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE IF EXISTS "fxql_entries" CASCADE`);
    }
}