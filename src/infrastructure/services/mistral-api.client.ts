// src/infrastructure/services/mistral-api.client.ts
import { injectable, inject } from 'inversify';
import axios, { AxiosInstance } from 'axios';
import { TYPES } from '../../types';
import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';
import { ApplicationError } from '@/domain/exceptions/application.error';

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: Message;
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class MistralAPIError extends ApplicationError {
    constructor(message: string) {
        super(message);
    }
}

@injectable()
export class MistralAPIClient {
    private apiKey: string;
    private httpClient: AxiosInstance;

    constructor(
        @inject(TYPES.ConfigService) private configService: ConfigService,
        @inject(TYPES.Logger) private logger: LoggerService
    ) {
        this.apiKey = this.configService.get('MISTRAL_API_KEY') || 'G1ZMWTPfPKUCjaKLgAvzQEjkXZ8jTGWp';

        if (!this.apiKey) {
            this.logger.warn('Mistral API key not set. AI functionality will not work.');
        }


        this.httpClient = axios.create({
            baseURL: 'https://api.mistral.ai/v1',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async chatCompletion(messages: Message[], temperature: number = 0.7, maxTokens: number = 1000): Promise<ChatCompletionResponse> {
        try {
            if (!this.apiKey) {
                throw new MistralAPIError('Mistral API key not configured');
            }

            const response = await this.httpClient.post('/chat/completions', {
                model: this.configService.get('MISTRAL_MODEL') || 'mistral-large-latest',
                messages,
                temperature,
                max_tokens: maxTokens,
                top_p: 0.95
            });

            return response.data;
        } catch (error : any) {
            this.logger.error('Error calling Mistral API', {
                error: error.response?.data || error.message,
                statusCode: error.response?.status
            });

            if (error.response) {
                throw new MistralAPIError(`Mistral API error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            } else if (error.request) {
                throw new MistralAPIError('No response received from Mistral API');
            } else {
                throw new MistralAPIError(`Error setting up request: ${error.message}`);
            }
        }
    }
}
