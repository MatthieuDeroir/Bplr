
// src/domain/services/scale-management.service.ts
import { injectable } from 'inversify';
import { Scale } from '../entities/scale.entity';
import { ScaleLevel } from '../entities/scale-level.entity';

export interface CreateScaleWithLevelsParams {
    name: string;
    description: string;
    userId: string | null;
    minValue: number;
    maxValue: number;
    levels: {
        level: number;
        description: string;
    }[];
}

@injectable()
export class ScaleManagementService {
    /**
     * Validate scale data before creation or update
     */
    validateScaleData(scale: Partial<Scale>, levels?: Partial<ScaleLevel>[]): string[] {
        const errors: string[] = [];

        // Validate scale properties
        if (!scale.name?.trim()) {
            errors.push('Scale name is required');
        }

        if (scale.minValue === undefined || scale.maxValue === undefined) {
            errors.push('Min and max values are required');
        } else if (scale.minValue >= scale.maxValue) {
            errors.push('Max value must be greater than min value');
        }

        // Validate levels if provided
        if (levels?.length) {
            // Check if all required levels are present
            if (scale.minValue !== undefined && scale.maxValue !== undefined) {
                const expectedLevelsCount = scale.maxValue - scale.minValue + 1;
                if (levels.length !== expectedLevelsCount) {
                    errors.push(`Expected ${expectedLevelsCount} levels, got ${levels.length}`);
                }
            }

            // Check if each level has a description
            for (const level of levels) {
                if (!level.description?.trim()) {
                    errors.push(`Description is required for level ${level.level}`);
                }
            }

            // Check for duplicate levels
            const levelValues = levels.map(l => l.level);
            const uniqueLevelValues = new Set(levelValues);
            if (levelValues.length !== uniqueLevelValues.size) {
                errors.push('Duplicate level values found');
            }
        }

        return errors;
    }

    /**
     * Generate default levels for a scale
     */
    generateDefaultLevels(minValue: number, maxValue: number): Omit<ScaleLevel, 'id' | 'scaleId' | 'createdAt' | 'updatedAt'>[] {
        const levels: Omit<ScaleLevel, 'id' | 'scaleId' | 'createdAt' | 'updatedAt'>[] = [];

        for (let i = minValue; i <= maxValue; i++) {
            levels.push({
                level: i,
                description: `Level ${i}`
            });
        }

        return levels;
    }
}
