// src/application/services/ai-assessment.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { MistralAPIClient, Message } from '@/infrastructure/services/mistral-api.client';
import { LoggerService } from '@/infrastructure/services/logger.service';
import { IScaleRepository } from '@/domain/interfaces/repositories/scale-repository.interface';
import { MoodEntryService } from './mood-entry.service';
import { CreateMoodEntryDto } from '../dtos/mood-entry.dto';

export interface ChatResponse {
    message: string;
    isAssessment: boolean;
    assessment?: any;
}

export interface AssessmentResult {
    scaleValues: {
        scaleId: string;
        scaleName: string;
        value: number;
    }[];
    sleepHours?: number;
    comment?: string;
    medication?: string;
}

@injectable()
export class AIAssessmentService {
    constructor(
        @inject(TYPES.MistralAPIClient) private mistralClient: MistralAPIClient,
        @inject(TYPES.Logger) private logger: LoggerService,
        @inject(TYPES.ScaleRepository) private scaleRepository: IScaleRepository,
        @inject(TYPES.MoodEntryService) private moodEntryService: MoodEntryService
    ) {}

    async processChatMessage(userId: string, message: string): Promise<ChatResponse> {
        try {
            // Get active scales for the system prompt
            const scales = await this.scaleRepository.findActiveScales(userId);

            // Build the system prompt with scale definitions
            const systemPrompt = this.buildSystemPrompt(scales);

            // Create messages array
            const messages: Message[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ];

            // Call Mistral API
            const response = await this.mistralClient.chatCompletion(messages);
            const assistantMessage = response.choices[0].message.content;

            this.logger.debug('Raw AI response:', { message: assistantMessage.substring(0, 500) });

            // Check if the response contains assessment data
            const isAssessment = this.containsAssessment(assistantMessage);
            let assessment = null;

            if (isAssessment) {
                this.logger.info('Assessment detected in AI response');
                assessment = this.extractAssessment(assistantMessage, scales);

                if (assessment) {
                    this.logger.debug('Extracted assessment', { assessment });
                } else {
                    this.logger.warn('Failed to extract assessment despite detecting it');
                }
            }

            return {
                message: assistantMessage,
                isAssessment,
                assessment
            };
        } catch (error) {
            this.logger.error('Error processing chat message', { error, userId, message });
            throw error;
        }
    }

    async generateMoodAssessment(userId: string, conversation: Message[]): Promise<AssessmentResult> {
        try {
            // Get active scales
            const scales = await this.scaleRepository.findActiveScales(userId);

            // Build system prompt
            const systemPrompt = this.buildAssessmentPrompt(scales);

            // Create messages array
            const messages: Message[] = [
                { role: 'system', content: systemPrompt },
                ...conversation,
                {
                    role: 'user',
                    content: 'Based on our conversation, can you provide a complete assessment of my mood in JSON format? Include values for all scales, sleep hours if mentioned, and any relevant comments.'
                }
            ];

            // Call Mistral API
            const response = await this.mistralClient.chatCompletion(messages, 0.3, 2000);
            const assistantMessage = response.choices[0].message.content;

            this.logger.debug('AI assessment response:', { messageSample: assistantMessage.substring(0, 500) });

            // Extract assessment
            const assessment = this.extractAssessment(assistantMessage, scales);

            if (!assessment || !assessment.scaleValues || assessment.scaleValues.length === 0) {
                this.logger.error('Failed to generate valid assessment', { messageSample: assistantMessage.substring(0, 500) });
                throw new Error('Failed to generate a valid mood assessment');
            }

            return assessment;
        } catch (error) {
            this.logger.error('Error generating mood assessment', { error, userId });
            throw error;
        }
    }

    async saveMoodAssessment(userId: string, assessment: AssessmentResult): Promise<any> {
        try {
            // Debug log the values being saved
            this.logger.debug('Saving assessment values:', {
                userId,
                scaleValues: assessment.scaleValues,
                sleepHours: assessment.sleepHours
            });

            const createDto: CreateMoodEntryDto = {
                userId,
                entryDate: new Date(),
                comment: assessment.comment,
                medication: assessment.medication,
                sleepHours: assessment.sleepHours,
                scaleValues: assessment.scaleValues
            };

            return await this.moodEntryService.createMoodEntry(createDto);
        } catch (error) {
            this.logger.error('Error saving mood assessment', { error, userId, assessment });
            throw error;
        }
    }

    private buildSystemPrompt(scales: any[]): string {
        const scaleDescriptions = scales.map(scale => {
            const levels = scale.levels || [];
            const levelDescriptions = levels
                .map((level: { level: any; description: any; }) => `    - ${level.level}: ${level.description}`)
                .join('\n');

            return `
- ${scale.name} (${scale.minValue}-${scale.maxValue}): ${scale.description}
  Levels:
${levelDescriptions}
`;
        }).join('\n');

        return `You are an empathetic and thoughtful mental health assistant specialized in mood tracking and assessment.
You help users track their mood and mental state using the following scales:

${scaleDescriptions}

When engaging with users:
1. Be conversational and empathetic, but also focused on gathering relevant information
2. Ask questions to understand their current mental state
3. You can assess their mood based on their responses
4. If you have enough information, you can provide a preliminary assessment of their mood

If providing an assessment, include JSON with the following format:
\`\`\`json
{
  "scaleValues": [
    {"scaleId": "scale_id_here", "scaleName": "Scale Name", "value": 7}
  ],
  "sleepHours": 7.5,
  "comment": "Brief assessment summary",
  "medication": "Any medication mentioned"
}
\`\`\`
`;
    }

    private buildAssessmentPrompt(scales: any[]): string {
        const scaleList = scales.map(scale =>
            `- ${scale.name} (${scale.minValue}-${scale.maxValue}): ${scale.description}`
        ).join('\n');

        const scaleDetails = scales.map(scale => {
            const levels = scale.levels || [];
            const levelDescriptions = levels
                .map((level: { level: any; description: any; }) => `    - ${level.level}: ${level.description}`)
                .join('\n');

            return `
## ${scale.name} (${scale.minValue}-${scale.maxValue})
${scale.description}

Levels:
${levelDescriptions}
`;
        }).join('\n');

        return `You are a mental health assessment expert. Your task is to carefully analyze the conversation with the user and provide a detailed assessment of their mood according to the following scales:

${scaleList}

For each scale, you need to select the most appropriate value based on what the user has shared.

${scaleDetails}

When asked to provide an assessment, you must return a JSON object with the following format:
\`\`\`json
{
  "scaleValues": [
    {"scaleId": "<id>", "scaleName": "<name>", "value": <level_number>},
    ...
  ],
  "sleepHours": <number or null>,
  "comment": "<brief overall assessment>",
  "medication": "<any medication mentioned or empty string>"
}
\`\`\`

Include values for ALL scales, even if you have to make an educated guess based on limited information. Use neutral values (middle of the scale) when you don't have enough information.

Always include the exact scaleId values:
${scales.map(s => `- "${s.id}" for ${s.name}`).join('\n')}
`;
    }

    private containsAssessment(text: string): boolean {
        return (text.includes('```json') || text.includes('{') && text.includes('}')) &&
            text.includes('"scaleValues"') &&
            (text.includes('"scaleName"') || text.includes('"value"'));
    }

    private extractAssessment(text: string, scales: any[]): AssessmentResult | null {
        try {
            this.logger.debug('Attempting to extract assessment from text', { textSample: text.substring(0, 200) });

            // Extract JSON from the text
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            let parsed = null;

            if (jsonMatch && jsonMatch[1]) {
                try {
                    const jsonStr = jsonMatch[1].trim();
                    this.logger.debug('Found JSON inside code block', { jsonStr: jsonStr.substring(0, 200) });
                    parsed = JSON.parse(jsonStr);
                } catch (e) {
                    this.logger.error('Failed to parse JSON from code block', { error: e });
                }
            }

            // If code block parsing failed, try other approaches
            if (!parsed) {
                // Try to find JSON object with scaleValues directly
                const objectRegex = /{[\s\S]*?"scaleValues"[\s\S]*?}/;
                const objectMatch = text.match(objectRegex);

                if (objectMatch) {
                    try {
                        // Clean up the JSON string
                        let jsonStr = objectMatch[0];
                        // Replace newlines with spaces
                        jsonStr = jsonStr.replace(/\n/g, ' ');
                        // Remove trailing commas in arrays/objects
                        jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

                        this.logger.debug('Found JSON object directly', { jsonStr: jsonStr.substring(0, 200) });
                        parsed = JSON.parse(jsonStr);
                    } catch (e) {
                        this.logger.error('Failed to parse direct JSON object', { error: e });
                    }
                }
            }

            // If still no valid JSON, try to manually extract scale values
            if (!parsed && text.includes('scaleValues') && text.includes('scaleId')) {
                this.logger.debug('Attempting manual extraction of scale values');
                // Extract each scale entry directly with regex
                const scaleEntries = [];
                const scaleRegex = /{"scaleId":\s*"([^"]+)",\s*"scaleName":\s*"([^"]+)",\s*"value":\s*(\d+)}/g;
                let match;

                while ((match = scaleRegex.exec(text)) !== null) {
                    scaleEntries.push({
                        scaleId: match[1],
                        scaleName: match[2],
                        value: parseInt(match[3], 10)
                    });
                }

                if (scaleEntries.length > 0) {
                    this.logger.debug('Manually extracted scale values', { scaleEntries });

                    // Extract other fields
                    let sleepHours = undefined;
                    const sleepMatch = text.match(/"sleepHours":\s*(\d+\.?\d*)/);
                    if (sleepMatch) {
                        sleepHours = parseFloat(sleepMatch[1]);
                    }

                    let comment = '';
                    const commentMatch = text.match(/"comment":\s*"([^"]+)"/);
                    if (commentMatch) {
                        comment = commentMatch[1];
                    }

                    let medication = '';
                    const medicationMatch = text.match(/"medication":\s*"([^"]+)"/);
                    if (medicationMatch) {
                        medication = medicationMatch[1];
                    }

                    parsed = {
                        scaleValues: scaleEntries,
                        sleepHours,
                        comment,
                        medication
                    };
                }
            }

            if (!parsed) {
                this.logger.warn('Could not extract valid assessment data from text');
                return null;
            }

            return this.validateAndFixAssessment(parsed, scales);
        } catch (error) {
            this.logger.error('Failed to extract assessment', { error, textSample: text.substring(0, 200) });
            return null;
        }
    }

    private validateAndFixAssessment(assessment: any, scales: any[]): AssessmentResult {
        // Add debugging for incoming assessment
        this.logger.debug('Validating assessment', {
            hasScaleValues: !!assessment.scaleValues,
            scaleValuesLength: assessment.scaleValues?.length
        });

        // Create a map of scale IDs to names
        const scaleMap = new Map(scales.map(s => [s.id, { name: s.name, min: s.minValue, max: s.maxValue }]));

        // Validate and fix scale values
        const scaleValues = Array.isArray(assessment.scaleValues) ?
            assessment.scaleValues
                .filter((sv: { scaleId: any; }) => sv && sv.scaleId && scaleMap.has(sv.scaleId))
                .map((sv: { scaleId: any; value: any; scaleName?: string }) => {
                    const scale = scaleMap.get(sv.scaleId);
                    const value = Number(sv.value);

                    return {
                        scaleId: sv.scaleId,
                        scaleName: sv.scaleName || scale!.name,
                        value: Math.max(Math.min(value, scale!.max), scale!.min)
                    };
                }) : [];

        this.logger.debug('Processed scale values', {
            valuesCount: scaleValues.length,
            values: scaleValues
        });

        // Add missing scales with neutral values
        for (const scale of scales) {
            if (!scaleValues.some((sv: { scaleId: any; }) => sv.scaleId === scale.id)) {
                const neutralValue = Math.floor((scale.minValue + scale.maxValue) / 2);
                this.logger.debug('Adding missing scale with neutral value', {
                    scaleId: scale.id,
                    scaleName: scale.name,
                    neutralValue
                });

                scaleValues.push({
                    scaleId: scale.id,
                    scaleName: scale.name,
                    value: neutralValue
                });
            }
        }

        // Validate sleep hours
        let sleepHours = assessment.sleepHours;
        if (sleepHours !== undefined && sleepHours !== null) {
            sleepHours = Number(sleepHours);
            if (isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24) {
                sleepHours = null;
            }
        }

        const result = {
            scaleValues,
            sleepHours,
            comment: assessment.comment || '',
            medication: assessment.medication || ''
        };

        this.logger.debug('Final assessment result', { result });
        return result;
    }
}