// src/api/controllers/ai-assessment.controller.ts
import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost } from 'inversify-express-utils';
import { TYPES } from '../../types';
import { AIAssessmentService } from '@/application/services/ai-assessment.service';
import { authenticate } from '../middlewares/auth.middleware';

@controller('/api/ai-assessment')
export class AIAssessmentController {
    constructor(
        @inject(TYPES.AIAssessmentService) private aiService: AIAssessmentService
    ) {}

    @httpPost('/chat', authenticate())
    async chatMessage(req: Request, res: Response): Promise<void> {
        try {
            const { message } = req.body;
            // @ts-ignore
            const userId = req.user.id;

            if (!message) {
                res.status(400).json({ message: 'Message is required' });
                return;
            }

            const response = await this.aiService.processChatMessage(userId, message);
            res.json(response);
        } catch (error : any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpPost('/assess', authenticate())
    async assessMood(req: Request, res: Response): Promise<void> {
        try {
            const { conversation } = req.body;
            // @ts-ignore
            const userId = req.user.id;

            if (!conversation || !Array.isArray(conversation)) {
                res.status(400).json({ message: 'Valid conversation history is required' });
                return;
            }

            const assessment = await this.aiService.generateMoodAssessment(userId, conversation);
            res.json(assessment);
        } catch (error : any) {
            res.status(500).json({ message: error.message });
        }
    }

    @httpPost('/save-assessment', authenticate())
    async saveAssessment(req: Request, res: Response): Promise<void> {
        try {
            const assessment = req.body;
            // @ts-ignore
            const userId = req.user.id;

            if (!assessment || !assessment.scaleValues || !Array.isArray(assessment.scaleValues)) {
                res.status(400).json({ message: 'Valid assessment data is required' });
                return;
            }

            const savedEntry = await this.aiService.saveMoodAssessment(userId, assessment);
            res.status(201).json(savedEntry);
        } catch (error : any) {
            res.status(500).json({ message: error.message });
        }
    }
}