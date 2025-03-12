// src/api/controllers/mood-entry.controller.ts
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { TYPES } from '../../types';
import { MoodEntryService } from '@/application/services/mood-entry.service';
import { CreateMoodEntryDto, UpdateMoodEntryDto } from '@/application/dtos/mood-entry.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createMoodEntrySchema, updateMoodEntrySchema } from '../validation/mood-entry.validation';

@controller('/api/mood-entries')
export class MoodEntryController {
    constructor(
        @inject(TYPES.MoodEntryService) private moodEntryService: MoodEntryService
    ) {}

    @httpGet('/', authenticate())
    async getMoodEntries(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

            const entries = await this.moodEntryService.getMoodEntriesByUserId(userId, limit, offset);
            res.json(entries);
        } catch (error : any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpGet('/:id', authenticate())
    async getMoodEntryById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;

            const entry = await this.moodEntryService.getMoodEntryById(id, userId);

            if (!entry) {
                res.status(404).json({ message: 'Mood entry not found' });
                return;
            }

            res.json(entry);
        } catch (error : any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpPost('/', authenticate(), validate(createMoodEntrySchema))
    async createMoodEntry(req: Request, res: Response): Promise<void> {
        try {
            // @ts-ignore
            const userId = req.user.id;
            const dto: CreateMoodEntryDto = {
                ...req.body,
                userId
            };

            const entry = await this.moodEntryService.createMoodEntry(dto);
            res.status(201).json(entry);
        } catch (error : any) {
            if (error.message.includes('out of range') || error.message.includes('not found')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    @httpPut('/:id', authenticate(), validate(updateMoodEntrySchema))
    async updateMoodEntry(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;
            const dto: UpdateMoodEntryDto = req.body;

            const entry = await this.moodEntryService.updateMoodEntry(id, userId, dto);
            res.json(entry);
        } catch (error : any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('permission')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }

    @httpDelete('/:id', authenticate())
    async deleteMoodEntry(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // @ts-ignore
            const userId = req.user.id;

            await this.moodEntryService.deleteMoodEntry(id, userId);
            res.status(204).send();
        } catch (error : any) {
            if (error.message.includes('not found')) {
                res.status(404).json({ message: error.message });
            } else if (error.message.includes('permission')) {
                res.status(403).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    }
}