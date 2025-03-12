// src/domain/interfaces/repositories/stability-formula-repository.interface.ts
import { StabilityFormula } from '@/domain/entities/stability-formula.entity';

export interface IStabilityFormulaRepository {
    findById(id: string): Promise<StabilityFormula | null>;
    findByUserId(userId: string): Promise<StabilityFormula[]>;
    findActiveByUserId(userId: string): Promise<StabilityFormula | null>;
    findDefault(): Promise<StabilityFormula | null>;
    create(formula: Omit<StabilityFormula, 'id' | 'createdAt' | 'updatedAt'>): Promise<StabilityFormula>;
    update(id: string, formulaData: Partial<StabilityFormula>): Promise<StabilityFormula>;
    delete(id: string): Promise<boolean>;
}