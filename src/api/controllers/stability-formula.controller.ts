// src/api/controllers/stability-formula.controller.ts
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '../../types';
import { StabilityFormulaService } from '@/application/services/stability-formula.service';
import { CreateStabilityFormulaDto, UpdateStabilityFormulaDto } from '@/application/dtos/stability-formula.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createFormulaSchema, updateFormulaSchema } from '../validation/stability-formula.validation';

@controller('/api/stability-formulas')
export class StabilityFormulaController {
    constructor(
        @inject(TYPES.StabilityFormulaService) private formulaService: StabilityFormulaService
    ) {}

    @httpGet('/', authenticate())
    async getStabilityFormulas(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const formulas = await this.formulaService.getFormulasByUserId(userId);
            res.json(formulas);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpGet('/active', authenticate())
    async getActiveFormula(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const formula = await this.formulaService.getActiveFormula(userId);

            if (!formula) {
                res.status(404).json({ message: 'No active stability formula found' });
                return;
            }

            res.json(formula);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpPost('/', authenticate(), validate(createFormulaSchema))
    async createStabilityFormula(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const dto: CreateStabilityFormulaDto = req.body;

            const formula = await this.formulaService.createFormula(userId, dto);
            res.status(201).json(formula);
        } catch (error: any) {
            if (error.message.includes('Invalid formula')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    @httpPut('/:id', authenticate(), validate(updateFormulaSchema))
    async updateStabilityFormula(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;
            const dto: UpdateStabilityFormulaDto = req.body;

            const formula = await this.formulaService.updateFormula(id, userId, dto);
            res.json(formula);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('permission')) {
                res.status(403).json({ message: error.message });
            } else if (error.message.includes('Invalid formula')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    @httpDelete('/:id', authenticate())
    async deleteStabilityFormula(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;

            await this.formulaService.deleteFormula(id, userId);
            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('permission') || error.message.includes('Cannot delete')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }
}