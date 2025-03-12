// src/domain/interfaces/repositories/mood-scale-value-repository.interface.ts
import { MoodScaleValue } from '../../entities/mood-scale-value.entity';

export interface IMoodScaleValueRepository {
    findByMoodEntryId(moodEntryId: string): Promise<MoodScaleValue[]>;
    create(moodScaleValue: Omit<MoodScaleValue, 'id' | 'createdAt' | 'updatedAt'>): Promise<MoodScaleValue>;
    createMany(moodScaleValues: Omit<MoodScaleValue, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<MoodScaleValue[]>;
    updateByMoodEntryIdAndScaleId(
        moodEntryId: string,
        scaleId: string,
        value: number
    ): Promise<MoodScaleValue>;
    deleteByMoodEntryId(moodEntryId: string): Promise<boolean>;
}