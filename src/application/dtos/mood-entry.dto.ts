// src/application/dtos/mood-entry.dto.ts
export class MoodEntryDto {
    id: string;
    userId: string;
    entryDate: Date;
    comment?: string;
    medication?: string;
    sleepHours?: number;
    stabilityScore?: number;
    scaleValues: MoodScaleValueDto[];
    stabilityDescription?: string;
}

export class MoodScaleValueDto {
    scaleId: string;
    scaleName?: string;
    value: number;
    description?: string;
}

export class CreateMoodEntryDto {
    userId: string;
    entryDate: Date;
    comment?: string;
    medication?: string;
    sleepHours?: number;
    scaleValues: MoodScaleValueDto[];
}

export class UpdateMoodEntryDto {
    entryDate?: Date;
    comment?: string;
    medication?: string;
    sleepHours?: number;
    scaleValues?: MoodScaleValueDto[];
}