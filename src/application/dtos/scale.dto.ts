// src/application/dtos/scale.dto.ts
export class ScaleDto {
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
    userId: string | null;
    minValue: number;
    maxValue: number;
    isActive: boolean;
    levels?: ScaleLevelDto[];
}

export class ScaleLevelDto {
    id: string;
    level: number;
    description: string;
}

export class CreateScaleDto {
    name: string;
    description: string;
    minValue: number;
    maxValue: number;
    isActive: boolean = true;
    levels: { level: number; description: string }[];
}

export class UpdateScaleDto {
    name?: string;
    description?: string;
    isActive?: boolean;
    levels?: { level: number; description: string }[];
}
