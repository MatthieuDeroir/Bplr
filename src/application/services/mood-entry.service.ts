// src/application/services/mood-entry.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { IMoodEntryRepository } from '@/domain/interfaces/repositories/mood-entry-repository.interface';
import { IMoodScaleValueRepository } from '@/domain/interfaces/repositories/mood-scale-value-repository.interface';
import { IScaleRepository } from '@/domain/interfaces/repositories/scale-repository.interface';
import { IStabilityFormulaRepository } from '@/domain/interfaces/repositories/stability-formula-repository.interface';
import { IScaleWeightRepository } from '@/domain/interfaces/repositories/scale-weight-repository.interface';
import { StabilityCalculatorService } from '@/domain/services/stability-calculator.service';
import { MoodEntry } from '@/domain/entities/mood-entry.entity';
import { MoodScaleValue } from '@/domain/entities/mood-scale-value.entity';
import { Scale } from '@/domain/entities/scale.entity';
import { MoodEntryDto, CreateMoodEntryDto, UpdateMoodEntryDto, MoodScaleValueDto } from '../dtos/mood-entry.dto';

@injectable()
export class MoodEntryService {
    constructor(
        @inject(TYPES.MoodEntryRepository) private moodEntryRepository: IMoodEntryRepository,
        @inject(TYPES.MoodScaleValueRepository) private moodScaleValueRepository: IMoodScaleValueRepository,
        @inject(TYPES.ScaleRepository) private scaleRepository: IScaleRepository,
        @inject(TYPES.StabilityFormulaRepository) private stabilityFormulaRepository: IStabilityFormulaRepository,
        @inject(TYPES.ScaleWeightRepository) private scaleWeightRepository: IScaleWeightRepository,
        @inject(TYPES.StabilityCalculatorService) private stabilityCalculatorService: StabilityCalculatorService
    ) {}

    async getMoodEntriesByUserId(userId: string, limit?: number, offset?: number): Promise<MoodEntryDto[]> {
        const entries = await this.moodEntryRepository.findByUserIdWithScaleValues(userId, limit, offset);
        return entries.map(entry => this.mapToDto(entry));
    }

    async getMoodEntryById(id: string, userId: string): Promise<MoodEntryDto | null> {
        const entry = await this.moodEntryRepository.findById(id);
        if (!entry || entry.userId !== userId) return null;

        const scaleValues = await this.moodScaleValueRepository.findByMoodEntryId(id);
        entry.scaleValues = scaleValues;

        return this.mapToDto(entry);
    }

    async createMoodEntry(dto: CreateMoodEntryDto): Promise<MoodEntryDto> {
        // Validate scale values
        const activeScales = await this.scaleRepository.findActiveScales(dto.userId);
        const scaleIds = activeScales.map(scale => scale.id);

        for (const scaleValue of dto.scaleValues) {
            if (!scaleIds.includes(scaleValue.scaleId)) {
                throw new Error(`Scale with id ${scaleValue.scaleId} not found or not active`);
            }

            const scale = activeScales.find(s => s.id === scaleValue.scaleId);
            if (scale && (scaleValue.value < scale.minValue || scaleValue.value > scale.maxValue)) {
                throw new Error(`Value ${scaleValue.value} is out of range for scale ${scale.name}`);
            }
        }

        // Calculate stability score
        const stabilityScore = await this.calculateStabilityScore(
            dto.userId,
            dto.scaleValues.map(sv => ({
                scaleId: sv.scaleId,
                value: sv.value
            }))
        );

        // Create mood entry
        const moodEntry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: dto.userId,
            entryDate: dto.entryDate,
            comment: dto.comment,
            medication: dto.medication,
            sleepHours: dto.sleepHours,
            stabilityScore
        };

        const createdEntry = await this.moodEntryRepository.create(moodEntry);

        // Create scale values
        const scaleValues: Omit<MoodScaleValue, 'id' | 'createdAt' | 'updatedAt'>[] =
            dto.scaleValues.map(sv => ({
                moodEntryId: createdEntry.id,
                scaleId: sv.scaleId,
                value: sv.value
            }));

        await this.moodScaleValueRepository.createMany(scaleValues);

        // Fetch the complete entry with scale values
        return this.getMoodEntryById(createdEntry.id, dto.userId) as Promise<MoodEntryDto>;
    }

    async updateMoodEntry(id: string, userId: string, dto: UpdateMoodEntryDto): Promise<MoodEntryDto> {
        const entry = await this.moodEntryRepository.findById(id);
        if (!entry) {
            throw new Error(`Mood entry with id ${id} not found`);
        }

        if (entry.userId !== userId) {
            throw new Error('You do not have permission to update this mood entry');
        }

        // Update mood entry properties
        const updateData: Partial<MoodEntry> = {};
        if (dto.entryDate !== undefined) updateData.entryDate = dto.entryDate;
        if (dto.comment !== undefined) updateData.comment = dto.comment;
        if (dto.medication !== undefined) updateData.medication = dto.medication;
        if (dto.sleepHours !== undefined) updateData.sleepHours = dto.sleepHours;

        // Update scale values if provided
        if (dto.scaleValues && dto.scaleValues.length > 0) {
            // Delete existing scale values
            await this.moodScaleValueRepository.deleteByMoodEntryId(id);

            // Create new scale values
            const scaleValues: Omit<MoodScaleValue, 'id' | 'createdAt' | 'updatedAt'>[] =
                dto.scaleValues.map(sv => ({
                    moodEntryId: id,
                    scaleId: sv.scaleId,
                    value: sv.value
                }));

            await this.moodScaleValueRepository.createMany(scaleValues);

            // Recalculate stability score
            const stabilityScore = await this.calculateStabilityScore(
                userId,
                dto.scaleValues.map(sv => ({
                    scaleId: sv.scaleId,
                    value: sv.value
                }))
            );

            updateData.stabilityScore = stabilityScore;
        }

        // Update the entry
        if (Object.keys(updateData).length > 0) {
            await this.moodEntryRepository.update(id, updateData);
        }

        // Fetch the updated entry with scale values
        return this.getMoodEntryById(id, userId) as Promise<MoodEntryDto>;
    }

    async deleteMoodEntry(id: string, userId: string): Promise<boolean> {
        const entry = await this.moodEntryRepository.findById(id);
        if (!entry) {
            throw new Error(`Mood entry with id ${id} not found`);
        }

        if (entry.userId !== userId) {
            throw new Error('You do not have permission to delete this mood entry');
        }

        return this.moodEntryRepository.delete(id);
    }

    async calculateStabilityScore(
        userId: string,
        scaleValues: { scaleId: string; value: number }[]
    ): Promise<number> {
        // Get active formula for the user
        const userFormula = await this.stabilityFormulaRepository.findActiveByUserId(userId);
        const formula = userFormula || await this.stabilityFormulaRepository.findDefault();

        if (!formula) {
            throw new Error('No stability formula found');
        }

        // Get scale weights
        const scaleWeights = await this.scaleWeightRepository.findByFormulaId(formula.id);

        // Get scales
        const scaleIds = [...new Set([
            ...scaleValues.map(sv => sv.scaleId),
            ...scaleWeights.map(sw => sw.scaleId)
        ])];

        const scales: Scale[] = [];
        for (const scaleId of scaleIds) {
            const scale = await this.scaleRepository.findById(scaleId);
            if (scale) scales.push(scale);
        }

        // Convert to domain entities
        const moodScaleValues: MoodScaleValue[] = scaleValues.map(sv => ({
            id: '', // Not needed for calculation
            moodEntryId: '', // Not needed for calculation
            scaleId: sv.scaleId,
            value: sv.value,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // Calculate stability
        const result = this.stabilityCalculatorService.calculateStability(
            moodScaleValues,
            scales,
            formula,
            scaleWeights
        );

        return result.normalizedScore;
    }

    private mapToDto(entry: MoodEntry): MoodEntryDto {
        const dto: MoodEntryDto = {
            id: entry.id,
            userId: entry.userId,
            entryDate: entry.entryDate,
            comment: entry.comment,
            medication: entry.medication,
            sleepHours: entry.sleepHours,
            stabilityScore: entry.stabilityScore,
            scaleValues: entry.scaleValues?.map(sv => ({
                scaleId: sv.scaleId,
                scaleName: sv.scale?.name,
                value: sv.value,
                description: sv.scale?.levels?.find(l => l.level === sv.value)?.description
            })) || []
        };

        if (entry.stabilityScore !== undefined && entry.stabilityScore !== null) {
            dto.stabilityDescription = this.stabilityCalculatorService.getStabilityDescription(entry.stabilityScore);
        }

        return dto;
    }
}