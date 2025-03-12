// src/domain/entities/scale.entity.ts
import { ScaleLevel } from './scale-level.entity';

export class Scale {
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
    userId: string | null; // Nullable for system default scales
    minValue: number;
    maxValue: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Relations (not stored in DB)
    levels?: ScaleLevel[];
}