import { injectable, inject } from 'inversify';
import { Repository, Between } from 'typeorm';
import { MoodEntryEntity } from '../database/entities/mood-entry.entity';
import { MoodEntry } from '../../domain/entities/mood-entry.entity';
import { IMoodEntryRepository } from '../../domain/interfaces/repositories/mood-entry-repository.interface';
import { BaseRepository } from './base.repository';
import { TYPES } from '../../types';
import { MoodScaleValue } from '../../domain/entities/mood-scale-value.entity';

@injectable()
export class MoodEntryRepository extends BaseRepository<MoodEntryEntity, MoodEntry> implements IMoodEntryRepository {
    constructor(
        @inject(TYPES.MoodEntryEntityRepository) repository: Repository<MoodEntryEntity>
    ) {
        super(repository);
    }

    async findByUserIdWithScaleValues(userId: string, limit?: number, offset?: number): Promise<MoodEntry[]> {
        const options: any = {
            where: { userId },
            relations: ['scaleValues', 'scaleValues.scale'],
            order: { entryDate: 'DESC' }
        };

        if (limit) options.take = limit;
        if (offset) options.skip = offset;

        const entities = await this.findAll(options);
        return entities.map(entity => this.mapToDomain(entity));
    }

    async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<MoodEntry[]> {
        const entities = await this.findAll({
            where: {
                userId,
                entryDate: Between(startDate, endDate)
            },
            relations: ['scaleValues', 'scaleValues.scale'],
            order: { entryDate: 'ASC' }
        });

        return entities.map(entity => this.mapToDomain(entity));
    }

    async calculateStats(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
        const query = this.repository.createQueryBuilder('entry')
            .where('entry.userId = :userId', { userId });

        if (startDate && endDate) {
            query.andWhere('entry.entryDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate
            });
        }

        // Get aggregate stats
        const aggregateStats = await query
            .select([
                'AVG(entry.stabilityScore) as avgStability',
                'MIN(entry.stabilityScore) as minStability',
                'MAX(entry.stabilityScore) as maxStability',
                'COUNT(entry.id) as entryCount'
            ])
            .getRawOne();

        // Get scale value trends
        const scaleValueTrends = await this.repository.createQueryBuilder('entry')
            .leftJoinAndSelect('entry.scaleValues', 'value')
            .leftJoinAndSelect('value.scale', 'scale')
            .where('entry.userId = :userId', { userId })
            .select([
                'scale.id as scaleId',
                'scale.name as scaleName',
                'AVG(value.value) as avgValue',
                'MIN(value.value) as minValue',
                'MAX(value.value) as maxValue'
            ])
            .groupBy('scale.id, scale.name')
            .getRawMany();

        return {
            aggregateStats,
            scaleValueTrends
        };
    }

    protected mapToDomain(entity: MoodEntryEntity): MoodEntry {
        return {
            id: entity.id,
            userId: entity.userId,
            entryDate: entity.entryDate,
            comment: entity.comment,
            medication: entity.medication,
            sleepHours: entity.sleepHours,
            stabilityScore: entity.stabilityScore,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            scaleValues: entity.scaleValues?.map(sv => ({
                id: sv.id,
                moodEntryId: sv.moodEntryId,
                scaleId: sv.scaleId,
                value: sv.value,
                createdAt: sv.createdAt,
                updatedAt: sv.updatedAt,
                scale: sv.scale ? {
                    id: sv.scale.id,
                    name: sv.scale.name,
                    description: sv.scale.description || '',
                    isDefault: sv.scale.isDefault,
                    userId: sv.scale.userId,
                    minValue: sv.scale.minValue,
                    maxValue: sv.scale.maxValue,
                    isActive: sv.scale.isActive,
                    createdAt: sv.scale.createdAt,
                    updatedAt: sv.scale.updatedAt
                } : undefined
            }))
        };
    }

    protected mapToEntity(domain: Partial<MoodEntry>): Partial<MoodEntryEntity> {
        const entity: Partial<MoodEntryEntity> = {
            ...(domain.id && { id: domain.id }),
            ...(domain.userId && { userId: domain.userId }),
            ...(domain.entryDate && { entryDate: domain.entryDate }),
            ...(domain.comment !== undefined && { comment: domain.comment }),
            ...(domain.medication !== undefined && { medication: domain.medication }),
            ...(domain.sleepHours !== undefined && { sleepHours: domain.sleepHours }),
            ...(domain.stabilityScore !== undefined && { stabilityScore: domain.stabilityScore })
        };

        // Don't include scaleValues in the entity - they should be handled separately
        return entity;
    }
}