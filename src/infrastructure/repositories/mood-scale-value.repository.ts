import { injectable, inject } from 'inversify';
import { Repository } from 'typeorm';
import { MoodScaleValueEntity } from '../database/entities/mood-scale-value.entity';
import { MoodScaleValue } from '../../domain/entities/mood-scale-value.entity';
import { IMoodScaleValueRepository } from '../../domain/interfaces/repositories/mood-scale-value-repository.interface';
import { BaseRepository } from './base.repository';
import { TYPES } from '../../types';

@injectable()
export class MoodScaleValueRepository extends BaseRepository<MoodScaleValueEntity, MoodScaleValue> implements IMoodScaleValueRepository {
    constructor(
        @inject(TYPES.MoodScaleValueEntityRepository) repository: Repository<MoodScaleValueEntity>
    ) {
        super(repository);
    }

    async findByMoodEntryId(moodEntryId: string): Promise<MoodScaleValue[]> {
        const entities = await this.findAll({
            where: { moodEntryId },
            relations: ['scale', 'scale.levels']
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async updateByMoodEntryIdAndScaleId(
        moodEntryId: string,
        scaleId: string,
        value: number
    ): Promise<MoodScaleValue> {
        const entity = await this.findOne({
            where: { moodEntryId, scaleId }
        });

        if (!entity) {
            throw new Error(`Scale value for moodEntryId=${moodEntryId} and scaleId=${scaleId} not found`);
        }

        await this.repository.update(entity.id, { value } as any);

        const updatedEntity = await this.findOne({
            where: { id: entity.id },
            relations: ['scale', 'scale.levels']
        });

        if (!updatedEntity) {
            throw new Error(`Failed to find updated entity with id=${entity.id}`);
        }

        return this.mapToDomain(updatedEntity);
    }

    async deleteByMoodEntryId(moodEntryId: string): Promise<boolean> {
        const result = await this.repository.delete({ moodEntryId } as any);
        // @ts-ignore
        return result.affected !== undefined && result.affected > 0;
    }

    protected mapToDomain(entity: MoodScaleValueEntity): MoodScaleValue {
        const mappedEntity: MoodScaleValue = {
            id: entity.id,
            moodEntryId: entity.moodEntryId,
            scaleId: entity.scaleId,
            value: entity.value,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };

        if (entity.scale) {
            mappedEntity.scale = {
                id: entity.scale.id,
                name: entity.scale.name,
                description: entity.scale.description || '',
                isDefault: entity.scale.isDefault,
                userId: entity.scale.userId,
                minValue: entity.scale.minValue,
                maxValue: entity.scale.maxValue,
                isActive: entity.scale.isActive,
                createdAt: entity.scale.createdAt,
                updatedAt: entity.scale.updatedAt,
                levels: entity.scale.levels?.map(level => ({
                    id: level.id,
                    scaleId: level.scaleId,
                    level: level.level,
                    description: level.description,
                    createdAt: level.createdAt,
                    updatedAt: level.updatedAt
                }))
            };
        }

        return mappedEntity;
    }

    protected mapToEntity(domain: Partial<MoodScaleValue>): Partial<MoodScaleValueEntity> {
        const entity: Partial<MoodScaleValueEntity> = {
            ...(domain.id && { id: domain.id }),
            ...(domain.moodEntryId && { moodEntryId: domain.moodEntryId }),
            ...(domain.scaleId && { scaleId: domain.scaleId }),
            ...(domain.value !== undefined && { value: domain.value })
        };

        // Don't include scale in the entity - it should be handled via relations
        return entity;
    }
}