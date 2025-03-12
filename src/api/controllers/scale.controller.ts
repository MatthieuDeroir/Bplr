// src/api/controllers/scale.controller.ts
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '../../types';
import { ScaleService } from '@/application/services/scale.service';
import { CreateScaleDto, UpdateScaleDto } from '@/application/dtos/scale.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createScaleSchema, updateScaleSchema } from '../validation/scale.validation';

@controller('/api/scales')
export class ScaleController {
    constructor(
        @inject(TYPES.ScaleService) private scaleService: ScaleService
    ) {}

    @httpGet('/', authenticate())
    async getAllScales(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const scales = await this.scaleService.getAllScales(userId);
            res.json(scales);
        } catch (error : any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpGet('/:id', authenticate())
    async getScaleById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const scale = await this.scaleService.getScaleById(id);

            if (!scale) {
                res.status(404).json({ message: 'Scale not found' });
                return;
            }

            res.json(scale);
        } catch (error : any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpPost('/', authenticate(), validate(createScaleSchema))
    async createScale(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const dto: CreateScaleDto = req.body;

            const scale = await this.scaleService.createScale(userId, dto);
            res.status(201).json(scale);
        } catch (error : any) {
            if (error.message.includes('already exists')) {
                res.status(409).json({ message: error.message });
            } else if (error.message.includes('Invalid scale data')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    @httpPut('/:id', authenticate(), validate(updateScaleSchema))
    async updateScale(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;
            const dto: UpdateScaleDto = req.body;

            const scale = await this.scaleService.updateScale(id, userId, dto);
            res.json(scale);
        } catch (error : any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('permission')) {
                res.status(403).json({ message: error.message });
            } else if (error.message.includes('Invalid scale data')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    @httpDelete('/:id', authenticate())
    async deleteScale(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;

            await this.scaleService.deleteScale(id, userId);
            res.status(204).send();
        } catch (error : any) {
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
