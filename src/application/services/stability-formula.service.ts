import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { IStabilityFormulaRepository } from '@/domain/interfaces/repositories/stability-formula-repository.interface';
import { IScaleWeightRepository } from '@/domain/interfaces/repositories/scale-weight-repository.interface';
import { IScaleRepository } from '@/domain/interfaces/repositories/scale-repository.interface';
import { StabilityFormulaParserService } from '@/domain/services/stability-formula-parser.service';
import { StabilityFormula } from '@/domain/entities/stability-formula.entity';
import { ScaleWeight } from '@/domain/entities/scale-weight.entity';
import { CreateStabilityFormulaDto, UpdateStabilityFormulaDto, StabilityFormulaDto, ScaleWeightDto } from '@/application/dtos/stability-formula.dto';
import { NotFoundError } from '@/domain/exceptions/not-found.error';
import { ForbiddenError } from '@/domain/exceptions/forbidden.error';
import { ValidationError } from '@/domain/exceptions/validation.error';
import { LoggerService } from '@/infrastructure/services/logger.service';

@injectable()
export class StabilityFormulaService {
    constructor(
        @inject(TYPES.StabilityFormulaRepository) private formulaRepository: IStabilityFormulaRepository,
        @inject(TYPES.ScaleWeightRepository) private scaleWeightRepository: IScaleWeightRepository,
        @inject(TYPES.ScaleRepository) private scaleRepository: IScaleRepository,
        @inject(TYPES.StabilityFormulaParserService) private formulaParserService: StabilityFormulaParserService,
        @inject(TYPES.Logger) private logger: LoggerService
    ) {}

    async getFormulasByUserId(userId: string): Promise<StabilityFormulaDto[]> {
        try {
            const formulas = await this.formulaRepository.findByUserId(userId);
            return formulas.map(formula => this.mapToDto(formula));
        } catch (error) {
            this.logger.error('Error getting formulas by user ID', { error, userId });
            throw error;
        }
    }

    async getFormulaById(id: string): Promise<StabilityFormulaDto | null> {
        try {
            const formula = await this.formulaRepository.findById(id);
            return formula ? this.mapToDto(formula) : null;
        } catch (error) {
            this.logger.error('Error getting formula by ID', { error, formulaId: id });
            throw error;
        }
    }

    async getActiveFormula(userId: string): Promise<StabilityFormulaDto | null> {
        try {
            const formula = await this.formulaRepository.findActiveByUserId(userId);
            return formula ? this.mapToDto(formula) : null;
        } catch (error) {
            this.logger.error('Error getting active formula', { error, userId });
            throw error;
        }
    }

    async createFormula(userId: string, dto: CreateStabilityFormulaDto): Promise<StabilityFormulaDto> {
        try {
            // Validate scale weights
            await this.validateScaleWeights(dto.scaleWeights);

            // Generate formula string
            const formula = this.generateFormulaString(dto.scaleWeights);

            // Create the formula entity
            const newFormula: Omit<StabilityFormula, 'id' | 'createdAt' | 'updatedAt'> = {
                userId,
                formula,
                description: dto.description,
                isDefault: false,
                isActive: dto.isActive
            };

            const createdFormula = await this.formulaRepository.create(newFormula);

            // Create scale weights
            const scaleWeights = dto.scaleWeights.map(sw => ({
                stabilityFormulaId: createdFormula.id,
                scaleId: sw.scaleId,
                weight: sw.weight,
                isInverted: sw.isInverted
            }));

            await this.scaleWeightRepository.createMany(scaleWeights);

            // If set as active, deactivate other formulas
            if (dto.isActive) {
                await this.deactivateOtherFormulas(userId, createdFormula.id);
            }

            // Fetch the complete formula with weights
            const completeFormula = await this.formulaRepository.findById(createdFormula.id);
            if (!completeFormula) {
                throw new Error('Failed to retrieve created formula');
            }

            return this.mapToDto(completeFormula);
        } catch (error) {
            this.logger.error('Error creating formula', { error, userId, dto });
            throw error;
        }
    }

    async updateFormula(id: string, userId: string, dto: UpdateStabilityFormulaDto): Promise<StabilityFormulaDto> {
        try {
            const formula = await this.formulaRepository.findById(id);
            if (!formula) {
                throw new NotFoundError('StabilityFormula', id);
            }

            if (formula.userId !== userId && formula.isDefault) {
                throw new ForbiddenError('You do not have permission to update this formula');
            }

            // Update formula properties
            const updateData: Partial<StabilityFormula> = {};
            if (dto.description !== undefined) updateData.description = dto.description;
            if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

            // Update scale weights if provided
            if (dto.scaleWeights && dto.scaleWeights.length > 0) {
                // Validate scale weights
                await this.validateScaleWeights(dto.scaleWeights);

                // Generate new formula string
                const formulaString = this.generateFormulaString(dto.scaleWeights);
                updateData.formula = formulaString;

                // Update the formula
                await this.formulaRepository.update(id, updateData);

                // Delete existing scale weights
                await this.scaleWeightRepository.deleteByFormulaId(id);

                // Create new scale weights
                const scaleWeights = dto.scaleWeights.map(sw => ({
                    stabilityFormulaId: id,
                    scaleId: sw.scaleId,
                    weight: sw.weight,
                    isInverted: sw.isInverted
                }));

                await this.scaleWeightRepository.createMany(scaleWeights);
            } else {
                // Just update the formula properties
                await this.formulaRepository.update(id, updateData);
            }

            // If set as active, deactivate other formulas
            if (dto.isActive) {
                await this.deactivateOtherFormulas(userId, id);
            }

            // Fetch the updated formula with weights
            const updatedFormula = await this.formulaRepository.findById(id);
            if (!updatedFormula) {
                throw new Error('Failed to retrieve updated formula');
            }

            return this.mapToDto(updatedFormula);
        } catch (error) {
            this.logger.error('Error updating formula', { error, formulaId: id, userId, dto });
            throw error;
        }
    }

    async deleteFormula(id: string, userId: string): Promise<boolean> {
        try {
            const formula = await this.formulaRepository.findById(id);
            if (!formula) {
                throw new NotFoundError('StabilityFormula', id);
            }

            if (formula.userId !== userId && formula.isDefault) {
                throw new ForbiddenError('You do not have permission to delete this formula');
            }

            if (formula.isDefault) {
                throw new ForbiddenError('Cannot delete system default formula');
            }

            // If this is the active formula, activate the default formula
            if (formula.isActive) {
                const defaultFormula = await this.formulaRepository.findDefault();
                if (defaultFormula) {
                    await this.formulaRepository.update(defaultFormula.id, { isActive: true });
                }
            }

            // Delete the formula (cascade will delete scale weights)
            return this.formulaRepository.delete(id);
        } catch (error) {
            this.logger.error('Error deleting formula', { error, formulaId: id, userId });
            throw error;
        }
    }

    private async validateScaleWeights(scaleWeights: ScaleWeightDto[]): Promise<void> {
        if (!scaleWeights || scaleWeights.length === 0) {
            throw new ValidationError('At least one scale weight is required');
        }

        const scaleIds = scaleWeights.map(sw => sw.scaleId);
        const scales = await this.scaleRepository.findByIds(scaleIds);

        if (scales.length !== scaleIds.length) {
            const foundIds = scales.map(s => s.id);
            const missingIds = scaleIds.filter(id => !foundIds.includes(id));
            throw new ValidationError(`Invalid scale IDs: ${missingIds.join(', ')}`);
        }

        // Check for duplicate scale IDs
        const uniqueIds = new Set(scaleIds);
        if (uniqueIds.size !== scaleIds.length) {
            throw new ValidationError('Duplicate scale IDs found');
        }

        // Validate weights
        for (const sw of scaleWeights) {
            if (sw.weight <= 0) {
                throw new ValidationError(`Weight must be positive for scale ${sw.scaleId}`);
            }
        }
    }

    private generateFormulaString(scaleWeights: ScaleWeightDto[]): string {
        return scaleWeights.map(sw => {
            return sw.isInverted
                ? `${sw.scaleId}:${sw.weight}:true`
                : `${sw.scaleId}:${sw.weight}`;
        }).join(',');
    }

    private async deactivateOtherFormulas(userId: string, activeFormulaId: string): Promise<void> {
        const formulas = await this.formulaRepository.findByUserId(userId);

        for (const formula of formulas) {
            if (formula.id !== activeFormulaId && formula.isActive && formula.userId === userId) {
                await this.formulaRepository.update(formula.id, { isActive: false });
            }
        }
    }

    private mapToDto(formula: StabilityFormula): StabilityFormulaDto {
        return {
            id: formula.id,
            userId: formula.userId,
            formula: formula.formula,
            description: formula.description,
            isDefault: formula.isDefault,
            isActive: formula.isActive,
            scaleWeights: formula.scaleWeights?.map(sw => ({
                scaleId: sw.scaleId,
                scaleName: sw.scale?.name,
                weight: sw.weight,
                isInverted: sw.isInverted
            }))
        };
    }
}