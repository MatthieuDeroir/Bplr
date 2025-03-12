// src/domain/interfaces/repositories/scale-level-repository.interface.ts
import { ScaleLevel } from '../../entities/scale-level.entity';

export interface IScaleLevelRepository {
    findById(id: string): Promise<ScaleLevel | null>;
    findByScaleId(scaleId: string): Promise<ScaleLevel[]>;
    create(scaleLevel: Omit<ScaleLevel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScaleLevel>;
    createMany(scaleLevels: Omit<ScaleLevel, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ScaleLevel[]>;
    update(id: string, scaleLevelData: Partial<ScaleLevel>): Promise<ScaleLevel>;
    delete(id: string): Promise<boolean>;
    deleteByScaleId(scaleId: string): Promise<boolean>;
}