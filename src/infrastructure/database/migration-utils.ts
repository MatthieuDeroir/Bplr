// src/infrastructure/database/migration-utils.ts
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

export async function createMigration(dataSource: DataSource, name: string): Promise<string> {
    const timestamp = Date.now();
    const className = `${name}${timestamp}`;
    const filename = `${timestamp}-${name}.ts`;

    const template = `import { MigrationInterface, QueryRunner } from "typeorm";

export class ${className} implements MigrationInterface {
    name = '${className}';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // TODO: implement migration
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // TODO: implement reversion
    }
}
`;

    const migrationsDir = path.join(__dirname, 'migrations');

    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const filePath = path.join(migrationsDir, filename);
    fs.writeFileSync(filePath, template);

    console.log(`Migration file created at: ${filePath}`);
    return filePath;
}

export async function runMigrations(dataSource: DataSource): Promise<void> {
    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        const pendingMigrations = await dataSource.showMigrations();
        if (pendingMigrations) {
            console.log('Running migrations...');
            await dataSource.runMigrations();
            console.log('Migrations completed successfully.');
        } else {
            console.log('No pending migrations.');
        }
    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
}

export async function revertLastMigration(dataSource: DataSource): Promise<void> {
    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        console.log('Reverting last migration...');
        await dataSource.undoLastMigration();
        console.log('Last migration reverted successfully.');
    } catch (error) {
        console.error('Error reverting migration:', error);
        throw error;
    }
}
