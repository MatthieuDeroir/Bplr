// src/domain/interfaces/repositories/scale-repository.interface.ts
import { Scale } from '@/domain/entities/scale.entity';

export interface IScaleRepository {
    findById(id: string): Promise<Scale | null>;
    findByName(name: string): Promise<Scale | null>;
    findAllByUserId(userId: string): Promise<Scale[]>;
    findDefaultScales(): Promise<Scale[]>;
    findActiveScales(userId: string): Promise<Scale[]>;
    findByIds(ids: string[]): Promise<Scale[]>;
    create(scale: Omit<Scale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Scale>;
    update(id: string, scaleData: Partial<Scale>): Promise<Scale>;
    delete(id: string): Promise<boolean>;
}