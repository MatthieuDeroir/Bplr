// src/domain/entities/stability-formula.entity.ts
import { ScaleWeight } from './scale-weight.entity';

export class StabilityFormula {
    id: string;
    userId: string | null; // Null for system default formula
    formula: string; // Could be a JSON string or a simple formula
    description: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Relations (not stored in DB)
    scaleWeights?: ScaleWeight[];
}