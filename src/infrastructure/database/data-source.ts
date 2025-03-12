// src/infrastructure/database/data-source.ts
import { DataSource } from 'typeorm';
import * as path from 'path';
import { UserEntity } from './entities/user.entity';
import { ScaleEntity } from './entities/scale.entity';
import { ScaleLevelEntity } from './entities/scale-level.entity';
import { MoodEntryEntity } from './entities/mood-entry.entity';
import { MoodScaleValueEntity } from './entities/mood-scale-value.entity';
import { StabilityFormulaEntity } from './entities/stability-formula.entity';
import { ScaleWeightEntity } from './entities/scale-weight.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine migrations directory path relative to this file
const migrationsDir = path.join(__dirname, 'migrations');

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mood_tracker',
    synchronize: process.env.NODE_ENV !== 'production', // Don't use synchronize in production
    logging: process.env.NODE_ENV !== 'production',
    entities: [
        UserEntity,
        ScaleEntity,
        ScaleLevelEntity,
        MoodEntryEntity,
        MoodScaleValueEntity,
        StabilityFormulaEntity,
        ScaleWeightEntity
    ],
    migrations: [path.join(migrationsDir, '**', '*.{ts,js}')],
    migrationsTableName: 'migrations',
    migrationsRun: false // Don't automatically run migrations on app start
});

// Initialize data source and return the initialized instance
export const initializeDataSource = async (): Promise<DataSource> => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Data Source has been initialized');
        }
        return AppDataSource;
    } catch (error) {
        console.error('Error during Data Source initialization:', error);
        throw error;
    }
};

// Export current data source instance (will be initialized or throw if not)
export const getDataSource = (): DataSource => {
    if (!AppDataSource.isInitialized) {
        throw new Error('DataSource not initialized. Call initializeDataSource() first.');
    }
    return AppDataSource;
};