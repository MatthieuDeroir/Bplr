// src/domain/entities/mood-scale-value.entity.ts
import {Scale} from "@/domain/entities/scale.entity";

export class MoodScaleValue {
    id: string;
    moodEntryId: string;
    scaleId: string;
    value: number;
    createdAt: Date;
    updatedAt: Date;

    // Relations (not stored in DB)
    scale?: Scale;
}