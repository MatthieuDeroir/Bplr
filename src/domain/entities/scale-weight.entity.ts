// src/domain/entities/scale-weight.entity.ts

import {Scale} from "@/domain/entities/scale.entity";

export class ScaleWeight {
    id: string;
    stabilityFormulaId: string;
    scaleId: string;
    weight: number;
    isInverted: boolean; // For scales like irritability where higher is worse
    createdAt: Date;

    // Relations (not stored in DB)
    scale?: Scale;
}