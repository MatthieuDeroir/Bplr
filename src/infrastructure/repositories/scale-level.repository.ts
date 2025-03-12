import { injectable, inject } from 'inversify';
import { Repository } from 'typeorm';
import { ScaleLevelEntity } from '@/infrastructure/database/entities/scale-level.entity';
import { ScaleLevel } from '@/domain/entities/scale-level.entity';
import { IScaleLevelRepository } from '@/domain/interfaces/repositories/scale-level-repository.interface';
import { BaseRepository } from './base.repository';
import { TYPES } from '../../types';

@injectable()
export class ScaleLevelRepository extends BaseRepository<ScaleLevelEntity, ScaleLevel> implements IScaleLevelRepository {
    constructor(
        @inject(TYPES.ScaleLevelEntityRepository) repository: Repository<ScaleLevelEntity>
    ) {
        super(repository);
    }

    async findByScaleId(scaleId: string): Promise<ScaleLevel[]> {
        const entities = await this.findAll({
            where: { scaleId },
            order: { level: 'ASC' }
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async deleteByScaleId(scaleId: string): Promise<boolean> {
        const result = await this.repository.delete({ scaleId } as any);
        // @ts-ignore
        return result.affected !== undefined && result.affected > 0;
    }

    protected mapToDomain(entity: ScaleLevelEntity): ScaleLevel {
        return {
            id: entity.id,
            scaleId: entity.scaleId,
            level: entity.level,
            description: entity.description,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };
    }

    protected mapToEntity(domain: Partial<ScaleLevel>): Partial<ScaleLevelEntity> {
        return {
            ...(domain.id && { id: domain.id }),
            ...(domain.scaleId && { scaleId: domain.scaleId }),
            ...(domain.level !== undefined && { level: domain.level }),
            ...(domain.description && { description: domain.description })
        };
    }
}