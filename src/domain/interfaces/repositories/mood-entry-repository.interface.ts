// src/domain/interfaces/repositories/mood-entry-repository.interface.ts
import { MoodEntry } from '../../entities/mood-entry.entity';

export interface IMoodEntryRepository {
    findById(id: string): Promise<MoodEntry | null>;
    findByUserIdWithScaleValues(userId: string, limit?: number, offset?: number): Promise<MoodEntry[]>;
    findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<MoodEntry[]>;
    create(moodEntry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MoodEntry>;
    update(id: string, moodEntryData: Partial<MoodEntry>): Promise<MoodEntry>;
    delete(id: string): Promise<boolean>;
    calculateStats(userId: string, startDate?: Date, endDate?: Date): Promise<any>;
}