import { injectable, inject } from 'inversify';
import { Repository } from 'typeorm';
import { StabilityFormulaEntity } from '@/infrastructure/database/entities/stability-formula.entity';
import { StabilityFormula } from '@/domain/entities/stability-formula.entity';
import { IStabilityFormulaRepository } from '@/domain/interfaces/repositories/stability-formula-repository.interface';
import { BaseRepository } from './base.repository';
import { TYPES } from '../../types';

@injectable()
export class StabilityFormulaRepository extends BaseRepository<StabilityFormulaEntity, StabilityFormula> implements IStabilityFormulaRepository {
    constructor(
        @inject(TYPES.StabilityFormulaEntityRepository) repository: Repository<StabilityFormulaEntity>
    ) {
        super(repository);
    }

    async findByUserId(userId: string): Promise<StabilityFormula[]> {
        const entities = await this.findAll({
            where: [
                { userId },
                { isDefault: true } // Include default formulas too
            ],
            relations: ['scaleWeights', 'scaleWeights.scale'],
            order: {
                isDefault: 'DESC',
                createdAt: 'DESC'
            }
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async findActiveByUserId(userId: string): Promise<StabilityFormula | null> {
        // First, try to find an active user-specific formula
        const userFormula = await this.findOne({
            where: { userId, isActive: true },
            relations: ['scaleWeights', 'scaleWeights.scale'],
            order: { createdAt: 'DESC' }
        });

        if (userFormula) {
            return this.mapToDomain(userFormula);
        }

        // If no user formula found, return the default formula
        return this.findDefault();
    }

    async findDefault(): Promise<StabilityFormula | null> {
        const entity = await this.findOne({
            where: { isDefault: true, isActive: true },
            relations: ['scaleWeights', 'scaleWeights.scale'],
            order: { createdAt: 'DESC' }
        });

        return entity ? this.mapToDomain(entity) : null;
    }

    protected mapToDomain(entity: StabilityFormulaEntity): StabilityFormula {
        return {
            id: entity.id,
            userId: entity.userId,
            formula: entity.formula,
            description: entity.description,
            isDefault: entity.isDefault,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            scaleWeights: entity.scaleWeights?.map(sw => ({
                id: sw.id,
                stabilityFormulaId: sw.stabilityFormulaId,
                scaleId: sw.scaleId,
                weight: sw.weight,
                isInverted: sw.isInverted,
                createdAt: sw.createdAt,
                scale: sw.scale ? {
                    id: sw.scale.id,
                    name: sw.scale.name,
                    description: sw.scale.description || '',
                    isDefault: sw.scale.isDefault,
                    userId: sw.scale.userId,
                    minValue: sw.scale.minValue,
                    maxValue: sw.scale.maxValue,
                    isActive: sw.scale.isActive,
                    createdAt: sw.scale.createdAt,
                    updatedAt: sw.scale.updatedAt
                } : undefined
            }))
        };
    }

    protected mapToEntity(domain: Partial<StabilityFormula>): Partial<StabilityFormulaEntity> {
        const entity: Partial<StabilityFormulaEntity> = {};

        if (domain.id !== undefined) entity.id = domain.id;
        if (domain.formula !== undefined) entity.formula = domain.formula;
        if (domain.description !== undefined) entity.description = domain.description;
        if (domain.isDefault !== undefined) entity.isDefault = domain.isDefault;
        if (domain.isActive !== undefined) entity.isActive = domain.isActive;

        // Handle userId null/undefined conversion
        if (domain.userId !== undefined) {
            // @ts-ignore
            entity.userId = domain.userId;
        }

        // Don't include scaleWeights in the entity - they should be handled separately
        return entity;
    }
}