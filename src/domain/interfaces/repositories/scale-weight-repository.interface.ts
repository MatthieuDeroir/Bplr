// src/domain/interfaces/repositories/scale-weight-repository.interface.ts
import { ScaleWeight } from '../../entities/scale-weight.entity';

export interface IScaleWeightRepository {
    findByFormulaId(formulaId: string): Promise<ScaleWeight[]>;
    create(scaleWeight: Omit<ScaleWeight, 'id' | 'createdAt'>): Promise<ScaleWeight>;
    createMany(scaleWeights: Omit<ScaleWeight, 'id' | 'createdAt'>[]): Promise<ScaleWeight[]>;
    update(id: string, scaleWeightData: Partial<ScaleWeight>): Promise<ScaleWeight>;
    updateByFormulaIdAndScaleId(
        formulaId: string,
        scaleId: string,
        weightData: Partial<Omit<ScaleWeight, 'id' | 'formulaId' | 'scaleId' | 'createdAt'>>
    ): Promise<ScaleWeight>;
    delete(id: string): Promise<boolean>;
    deleteByFormulaId(formulaId: string): Promise<boolean>;
}