// src/domain/entities/mood-entry.entity.ts
import {MoodScaleValue} from "@/domain/entities/mood-scale-value.entity";

export class MoodEntry {
    id: string;
    userId: string;
    entryDate: Date;
    comment?: string;
    medication?: string;
    sleepHours?: number;
    stabilityScore?: number;
    createdAt: Date;
    updatedAt: Date;

    // Relations (not stored in DB)
    scaleValues?: MoodScaleValue[];
}