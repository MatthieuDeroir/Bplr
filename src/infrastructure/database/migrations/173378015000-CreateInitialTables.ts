// src/infrastructure/database/migrations/1713378015000-CreateInitialTables.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1713378015000 implements MigrationInterface {
    name = 'CreateInitialTables1713378015000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "username" character varying NOT NULL,
                "passwordHash" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create scales table
        await queryRunner.query(`
            CREATE TABLE "scales" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "isDefault" boolean NOT NULL DEFAULT false,
                "userId" uuid,
                "minValue" integer NOT NULL,
                "maxValue" integer NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_scales" PRIMARY KEY ("id")
            )
        `);

        // Create scale_levels table
        await queryRunner.query(`
            CREATE TABLE "scale_levels" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "scaleId" uuid NOT NULL,
                "level" integer NOT NULL,
                "description" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_scale_levels" PRIMARY KEY ("id")
            )
        `);

        // Create mood_entries table
        await queryRunner.query(`
            CREATE TABLE "mood_entries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "entryDate" TIMESTAMP NOT NULL,
                "comment" text,
                "medication" character varying,
                "sleepHours" float,
                "stabilityScore" float,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_mood_entries" PRIMARY KEY ("id")
            )
        `);

        // Create mood_scale_values table
        await queryRunner.query(`
            CREATE TABLE "mood_scale_values" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "moodEntryId" uuid NOT NULL,
                "scaleId" uuid NOT NULL,
                "value" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_mood_scale_values" PRIMARY KEY ("id")
            )
        `);

        // Create stability_formulas table
        await queryRunner.query(`
            CREATE TABLE "stability_formulas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid,
                "formula" text NOT NULL,
                "description" text NOT NULL,
                "isDefault" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_stability_formulas" PRIMARY KEY ("id")
            )
        `);

        // Create scale_weights table
        await queryRunner.query(`
            CREATE TABLE "scale_weights" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "stabilityFormulaId" uuid NOT NULL,
                "scaleId" uuid NOT NULL,
                "weight" float NOT NULL,
                "isInverted" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_scale_weights" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "scales" 
            ADD CONSTRAINT "FK_scales_users" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") 
            ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "scale_levels" 
            ADD CONSTRAINT "FK_scale_levels_scales" 
            FOREIGN KEY ("scaleId") REFERENCES "scales"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "mood_entries" 
            ADD CONSTRAINT "FK_mood_entries_users" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "mood_scale_values" 
            ADD CONSTRAINT "FK_mood_scale_values_mood_entries" 
            FOREIGN KEY ("moodEntryId") REFERENCES "mood_entries"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "mood_scale_values" 
            ADD CONSTRAINT "FK_mood_scale_values_scales" 
            FOREIGN KEY ("scaleId") REFERENCES "scales"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "stability_formulas" 
            ADD CONSTRAINT "FK_stability_formulas_users" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") 
            ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "scale_weights" 
            ADD CONSTRAINT "FK_scale_weights_stability_formulas" 
            FOREIGN KEY ("stabilityFormulaId") REFERENCES "stability_formulas"("id") 
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "scale_weights" 
            ADD CONSTRAINT "FK_scale_weights_scales" 
            FOREIGN KEY ("scaleId") REFERENCES "scales"("id") 
            ON DELETE CASCADE
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_scales_userId" ON "scales" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_scales_isDefault" ON "scales" ("isDefault")`);
        await queryRunner.query(`CREATE INDEX "IDX_scale_levels_scaleId" ON "scale_levels" ("scaleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_mood_entries_userId" ON "mood_entries" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_mood_entries_entryDate" ON "mood_entries" ("entryDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_mood_scale_values_moodEntryId" ON "mood_scale_values" ("moodEntryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_mood_scale_values_scaleId" ON "mood_scale_values" ("scaleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_stability_formulas_userId" ON "stability_formulas" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_stability_formulas_isDefault" ON "stability_formulas" ("isDefault")`);
        await queryRunner.query(`CREATE INDEX "IDX_scale_weights_stabilityFormulaId" ON "scale_weights" ("stabilityFormulaId")`);
        await queryRunner.query(`CREATE INDEX "IDX_scale_weights_scaleId" ON "scale_weights" ("scaleId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "scale_weights" DROP CONSTRAINT "FK_scale_weights_scales"`);
        await queryRunner.query(`ALTER TABLE "scale_weights" DROP CONSTRAINT "FK_scale_weights_stability_formulas"`);
        await queryRunner.query(`ALTER TABLE "stability_formulas" DROP CONSTRAINT "FK_stability_formulas_users"`);
        await queryRunner.query(`ALTER TABLE "mood_scale_values" DROP CONSTRAINT "FK_mood_scale_values_scales"`);
        await queryRunner.query(`ALTER TABLE "mood_scale_values" DROP CONSTRAINT "FK_mood_scale_values_mood_entries"`);
        await queryRunner.query(`ALTER TABLE "mood_entries" DROP CONSTRAINT "FK_mood_entries_users"`);
        await queryRunner.query(`ALTER TABLE "scale_levels" DROP CONSTRAINT "FK_scale_levels_scales"`);
        await queryRunner.query(`ALTER TABLE "scales" DROP CONSTRAINT "FK_scales_users"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_scale_weights_scaleId"`);
        await queryRunner.query(`DROP INDEX "IDX_scale_weights_stabilityFormulaId"`);
        await queryRunner.query(`DROP INDEX "IDX_stability_formulas_isDefault"`);
        await queryRunner.query(`DROP INDEX "IDX_stability_formulas_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_mood_scale_values_scaleId"`);
        await queryRunner.query(`DROP INDEX "IDX_mood_scale_values_moodEntryId"`);
        await queryRunner.query(`DROP INDEX "IDX_mood_entries_entryDate"`);
        await queryRunner.query(`DROP INDEX "IDX_mood_entries_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_scale_levels_scaleId"`);
        await queryRunner.query(`DROP INDEX "IDX_scales_isDefault"`);
        await queryRunner.query(`DROP INDEX "IDX_scales_userId"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "scale_weights"`);
        await queryRunner.query(`DROP TABLE "stability_formulas"`);
        await queryRunner.query(`DROP TABLE "mood_scale_values"`);
        await queryRunner.query(`DROP TABLE "mood_entries"`);
        await queryRunner.query(`DROP TABLE "scale_levels"`);
        await queryRunner.query(`DROP TABLE "scales"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}