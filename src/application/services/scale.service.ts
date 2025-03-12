// src/application/services/scale.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { IScaleRepository } from '@/domain/interfaces/repositories/scale-repository.interface';
import { IScaleLevelRepository } from '@/domain/interfaces/repositories/scale-level-repository.interface';
import { ScaleManagementService } from '@/domain/services/scale-management.service';
import { Scale } from '@/domain/entities/scale.entity';
import { CreateScaleDto, UpdateScaleDto, ScaleDto, ScaleLevelDto } from '../dtos/scale.dto';

@injectable()
export class ScaleService {
    constructor(
        @inject(TYPES.ScaleRepository) private scaleRepository: IScaleRepository,
        @inject(TYPES.ScaleLevelRepository) private scaleLevelRepository: IScaleLevelRepository,
        @inject(TYPES.ScaleManagementService) private scaleManagementService: ScaleManagementService
    ) {}

    async getAllScales(userId: string): Promise<ScaleDto[]> {
        const scales = await this.scaleRepository.findAllByUserId(userId);
        return scales.map(scale => this.mapToDto(scale));
    }

    async getScaleById(id: string): Promise<ScaleDto | null> {
        const scale = await this.scaleRepository.findById(id);
        if (!scale) return null;

        const levels = await this.scaleLevelRepository.findByScaleId(id);
        scale.levels = levels;

        return this.mapToDto(scale);
    }

    async createScale(userId: string, dto: CreateScaleDto): Promise<ScaleDto> {
        // Create scale entity
        const scale: Omit<Scale, 'id' | 'createdAt' | 'updatedAt'> = {
            name: dto.name,
            description: dto.description,
            isDefault: false,
            userId,
            minValue: dto.minValue,
            maxValue: dto.maxValue,
            isActive: dto.isActive
        };

        // Validate scale data
        const errors = this.scaleManagementService.validateScaleData(scale, dto.levels);
        if (errors.length > 0) {
            throw new Error(`Invalid scale data: ${errors.join(', ')}`);
        }

        // Check if a scale with the same name already exists for this user
        const existingScale = await this.scaleRepository.findByName(dto.name);
        if (existingScale && existingScale.userId === userId) {
            throw new Error(`A scale with name "${dto.name}" already exists`);
        }

        // Create the scale
        const createdScale = await this.scaleRepository.create(scale);

        // Create levels
        const scaleLevels = dto.levels.map(level => ({
            scaleId: createdScale.id,
            level: level.level,
            description: level.description
        }));

        await this.scaleLevelRepository.createMany(scaleLevels);

        // Fetch the complete scale with levels
        return this.getScaleById(createdScale.id) as Promise<ScaleDto>;
    }

    async updateScale(id: string, userId: string, dto: UpdateScaleDto): Promise<ScaleDto> {
        const scale = await this.scaleRepository.findById(id);
        if (!scale) {
            throw new Error(`Scale with id ${id} not found`);
        }

        // Check permissions - only owner or admin can update
        if (scale.userId !== userId && scale.isDefault) {
            throw new Error('You do not have permission to update this scale');
        }

        // Update scale properties
        const updateData: Partial<Scale> = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

        // Update the scale
        if (Object.keys(updateData).length > 0) {
            await this.scaleRepository.update(id, updateData);
        }

        // Update levels if provided
        if (dto.levels && dto.levels.length > 0) {
            // Validate levels
            const scaleWithLevels = {...scale, ...updateData};
            const errors = this.scaleManagementService.validateScaleData(scaleWithLevels, dto.levels);
            if (errors.length > 0) {
                throw new Error(`Invalid scale data: ${errors.join(', ')}`);
            }

            // Delete existing levels
            await this.scaleLevelRepository.deleteByScaleId(id);

            // Create new levels
            const scaleLevels = dto.levels.map(level => ({
                scaleId: id,
                level: level.level,
                description: level.description
            }));

            await this.scaleLevelRepository.createMany(scaleLevels);
        }

        // Fetch the updated scale with levels
        return this.getScaleById(id) as Promise<ScaleDto>;
    }

    async deleteScale(id: string, userId: string): Promise<boolean> {
        const scale = await this.scaleRepository.findById(id);
        if (!scale) {
            throw new Error(`Scale with id ${id} not found`);
        }

        // Check permissions - only owner or admin can delete
        if (scale.userId !== userId && scale.isDefault) {
            throw new Error('You do not have permission to delete this scale');
        }

        // Cannot delete default scales (only admin can)
        if (scale.isDefault && userId !== 'admin') {
            throw new Error('Cannot delete system default scales');
        }

        return this.scaleRepository.delete(id);
    }

    private mapToDto(scale: Scale): ScaleDto {
        return {
            id: scale.id,
            name: scale.name,
            description: scale.description,
            isDefault: scale.isDefault,
            userId: scale.userId,
            minValue: scale.minValue,
            maxValue: scale.maxValue,
            isActive: scale.isActive,
            levels: scale.levels?.map(level => ({
                id: level.id,
                level: level.level,
                description: level.description
            }))
        };
    }
}