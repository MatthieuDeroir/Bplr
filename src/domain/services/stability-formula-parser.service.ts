
// src/domain/services/stability-formula-parser.service.ts
import { injectable } from 'inversify';
import { StabilityFormula } from '../entities/stability-formula.entity';
import { ScaleWeight } from '../entities/scale-weight.entity';

export interface FormulaParsingResult {
    isValid: boolean;
    errorMessage?: string;
    scaleWeights?: Omit<ScaleWeight, 'id' | 'stabilityFormulaId' | 'createdAt'>[];
}

@injectable()
export class StabilityFormulaParserService {
    /**
     * Parse a formula string into scale weights
     * Formula format: "scale1:weight1:inverted,scale2:weight2,scale3:weight3:inverted"
     * Example: "humeur:1,irritabilite:1:true,confiance:0.8,extraversion:0.5,bien_etre:1.2"
     */
    parseFormula(formula: string, availableScaleIds: string[]): FormulaParsingResult {
        try {
            // Check if the formula is valid JSON
            try {
                const jsonFormula = JSON.parse(formula);
                return this.parseJsonFormula(jsonFormula, availableScaleIds);
            } catch {
                // Not JSON, try parsing as string format
                return this.parseStringFormula(formula, availableScaleIds);
            }
        } catch (error: any) {
            return {
                isValid: false,
                errorMessage: `Failed to parse formula: ${error.message}`
            };
        }
    }

    private parseJsonFormula(jsonFormula: any, availableScaleIds: string[]): FormulaParsingResult {
        if (!Array.isArray(jsonFormula)) {
            return {
                isValid: false,
                errorMessage: 'JSON formula must be an array'
            };
        }

        const scaleWeights: Omit<ScaleWeight, 'id' | 'stabilityFormulaId' | 'createdAt'>[] = [];

        for (const item of jsonFormula) {
            if (!item.scaleId || typeof item.weight !== 'number') {
                return {
                    isValid: false,
                    errorMessage: 'Each item must have scaleId and weight'
                };
            }

            if (!availableScaleIds.includes(item.scaleId)) {
                return {
                    isValid: false,
                    errorMessage: `Scale ${item.scaleId} not found`
                };
            }

            scaleWeights.push({
                scaleId: item.scaleId,
                weight: item.weight,
                isInverted: !!item.isInverted
            });
        }

        return {
            isValid: true,
            scaleWeights
        };
    }

    private parseStringFormula(formula: string, availableScaleIds: string[]): FormulaParsingResult {
        const parts = formula.split(',');
        const scaleWeights: Omit<ScaleWeight, 'id' | 'stabilityFormulaId' | 'createdAt'>[] = [];

        for (const part of parts) {
            const elements = part.split(':');

            if (elements.length < 2 || elements.length > 3) {
                return {
                    isValid: false,
                    errorMessage: `Invalid format for part "${part}"`
                };
            }

            const scaleId = elements[0].trim();
            const weight = parseFloat(elements[1].trim());
            const isInverted = elements.length === 3 ? elements[2].trim() === 'true' : false;

            if (isNaN(weight)) {
                return {
                    isValid: false,
                    errorMessage: `Invalid weight in "${part}"`
                };
            }

            if (!availableScaleIds.includes(scaleId)) {
                return {
                    isValid: false,
                    errorMessage: `Scale ${scaleId} not found`
                };
            }

            scaleWeights.push({
                scaleId,
                weight,
                isInverted
            });
        }

        return {
            isValid: true,
            scaleWeights
        };
    }

    /**
     * Convert scale weights to a formula string
     */
    generateFormulaString(scaleWeights: ScaleWeight[]): string {
        return scaleWeights.map(sw => {
            return sw.isInverted
                ? `${sw.scaleId}:${sw.weight}:true`
                : `${sw.scaleId}:${sw.weight}`;
        }).join(',');
    }
}