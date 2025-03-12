// src/application/dtos/stability-formula.dto.ts
export class StabilityFormulaDto {
    id: string;
    userId: string | null;
    formula: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
    scaleWeights?: ScaleWeightDto[];
}

export class ScaleWeightDto {
    scaleId: string;
    scaleName?: string;
    weight: number;
    isInverted: boolean;
}

export class CreateStabilityFormulaDto {
    description: string;
    isActive: boolean = true;
    scaleWeights: ScaleWeightDto[];
}

export class UpdateStabilityFormulaDto {
    description?: string;
    isActive?: boolean;
    scaleWeights?: ScaleWeightDto[];
}