import { injectable, inject } from 'inversify';
import { Repository, In } from 'typeorm';
import { ScaleEntity } from '@/infrastructure/database/entities/scale.entity';
import { Scale } from '@/domain/entities/scale.entity';
import { IScaleRepository } from '@/domain/interfaces/repositories/scale-repository.interface';
import { BaseRepository } from './base.repository';
import { TYPES } from '../../types';

@injectable()
export class ScaleRepository extends BaseRepository<ScaleEntity, Scale> implements IScaleRepository {
    constructor(
        @inject(TYPES.ScaleEntityRepository) repository: Repository<ScaleEntity>
    ) {
        super(repository);
    }

    async findByName(name: string): Promise<Scale | null> {
        const entity = await this.findOne({
            where: { name },
            relations: ['levels']
        });

        return entity ? this.mapToDomain(entity) : null;
    }

    async findAllByUserId(userId: string): Promise<Scale[]> {
        const entities = await this.findAll({
            where: [
                { userId },
                { isDefault: true } // Include default scales too
            ],
            relations: ['levels'],
            order: {
                name: 'ASC',
                levels: {
                    level: 'ASC'
                }
            }
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async findDefaultScales(): Promise<Scale[]> {
        const entities = await this.findAll({
            where: { isDefault: true },
            relations: ['levels'],
            order: {
                name: 'ASC',
                levels: {
                    level: 'ASC'
                }
            }
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async findActiveScales(userId: string): Promise<Scale[]> {
        const entities = await this.findAll({
            where: [
                { userId, isActive: true },
                { isDefault: true, isActive: true } // Include default scales too
            ],
            relations: ['levels'],
            order: {
                name: 'ASC',
                levels: {
                    level: 'ASC'
                }
            }
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async findByIds(ids: string[]): Promise<Scale[]> {
        const entities = await this.findAll({
            where: { id: In(ids) },
            relations: ['levels']
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    protected mapToDomain(entity: ScaleEntity): Scale {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description || '',
            isDefault: entity.isDefault,
            userId: entity.userId,
            minValue: entity.minValue,
            maxValue: entity.maxValue,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            levels: entity.levels?.map(level => ({
                id: level.id,
                scaleId: level.scaleId,
                level: level.level,
                description: level.description,
                createdAt: level.createdAt,
                updatedAt: level.updatedAt
            }))
        };
    }

    protected mapToEntity(domain: Partial<Scale>): Partial<ScaleEntity> {
        // Create a new object for entity mapping
        const entity: Partial<ScaleEntity> = {};

        // Map regular properties
        if (domain.id !== undefined) entity.id = domain.id;
        if (domain.name !== undefined) entity.name = domain.name;
        if (domain.description !== undefined) entity.description = domain.description;
        if (domain.isDefault !== undefined) entity.isDefault = domain.isDefault;
        if (domain.minValue !== undefined) entity.minValue = domain.minValue;
        if (domain.maxValue !== undefined) entity.maxValue = domain.maxValue;
        if (domain.isActive !== undefined) entity.isActive = domain.isActive;

        // Handle userId null/undefined conversion
        if (domain.userId !== undefined) {
            // If it's null or a string, preserve it as-is
            // @ts-ignore
            entity.userId = domain.userId;
        }

        // Don't include levels in the entity - they should be handled separately
        return entity;
    }
}