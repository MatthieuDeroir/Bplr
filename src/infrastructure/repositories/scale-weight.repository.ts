import { injectable, inject } from 'inversify';
import { Repository } from 'typeorm';
import { ScaleWeightEntity } from '../database/entities/scale-weight.entity';
import { ScaleWeight } from '../../domain/entities/scale-weight.entity';
import { IScaleWeightRepository } from '../../domain/interfaces/repositories/scale-weight-repository.interface';
import { BaseRepository } from './base.repository';
import { TYPES } from '../../types';

@injectable()
export class ScaleWeightRepository extends BaseRepository<ScaleWeightEntity, ScaleWeight> implements IScaleWeightRepository {
    constructor(
        @inject(TYPES.ScaleWeightEntityRepository) repository: Repository<ScaleWeightEntity>
    ) {
        super(repository);
    }

    async findByFormulaId(formulaId: string): Promise<ScaleWeight[]> {
        const entities = await this.findAll({
            where: { stabilityFormulaId: formulaId },
            relations: ['scale']
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async updateByFormulaIdAndScaleId(
        formulaId: string,
        scaleId: string,
        weightData: Partial<Omit<ScaleWeight, 'id' | 'formulaId' | 'scaleId' | 'createdAt'>>
    ): Promise<ScaleWeight> {
        const entity = await this.findOne({
            where: { stabilityFormulaId: formulaId, scaleId }
        });

        if (!entity) {
            throw new Error(`Scale weight for formulaId=${formulaId} and scaleId=${scaleId} not found`);
        }

        const updateData: Partial<ScaleWeightEntity> = {};
        if (weightData.weight !== undefined) updateData.weight = weightData.weight;
        if (weightData.isInverted !== undefined) updateData.isInverted = weightData.isInverted;

        await this.repository.update(entity.id, updateData);

        const updatedEntity = await this.findOne({
            where: { id: entity.id },
            relations: ['scale']
        });

        if (!updatedEntity) {
            throw new Error(`Failed to find updated entity with id=${entity.id}`);
        }

        return this.mapToDomain(updatedEntity);
    }

    async deleteByFormulaId(formulaId: string): Promise<boolean> {
        const result = await this.repository.delete({ stabilityFormulaId: formulaId } as any);
        // @ts-ignore
        return result.affected !== undefined && result.affected > 0;
    }

    protected mapToDomain(entity: ScaleWeightEntity): ScaleWeight {
        const scaleWeight: ScaleWeight = {
            id: entity.id,
            stabilityFormulaId: entity.stabilityFormulaId,
            scaleId: entity.scaleId,
            weight: entity.weight,
            isInverted: entity.isInverted,
            createdAt: entity.createdAt
        };

        if (entity.scale) {
            scaleWeight.scale = {
                id: entity.scale.id,
                name: entity.scale.name,
                description: entity.scale.description || '',
                isDefault: entity.scale.isDefault,
                userId: entity.scale.userId,
                minValue: entity.scale.minValue,
                maxValue: entity.scale.maxValue,
                isActive: entity.scale.isActive,
                createdAt: entity.scale.createdAt,
                updatedAt: entity.scale.updatedAt
            };
        }

        return scaleWeight;
    }

    protected mapToEntity(domain: Partial<ScaleWeight>): Partial<ScaleWeightEntity> {
        const entity: Partial<ScaleWeightEntity> = {
            ...(domain.id && { id: domain.id }),
            ...(domain.stabilityFormulaId && { stabilityFormulaId: domain.stabilityFormulaId }),
            ...(domain.scaleId && { scaleId: domain.scaleId }),
            ...(domain.weight !== undefined && { weight: domain.weight }),
            ...(domain.isInverted !== undefined && { isInverted: domain.isInverted })
        };

        // Don't include scale in the entity - it should be handled via relations
        return entity;
    }
}