// src/domain/services/stability-calculator.service.ts
import { injectable } from 'inversify';
import { Scale } from '../entities/scale.entity';
import { MoodScaleValue } from '../entities/mood-scale-value.entity';
import { StabilityFormula } from '../entities/stability-formula.entity';
import { ScaleWeight } from '../entities/scale-weight.entity';

export interface StabilityCalculationResult {
    stabilityScore: number;
    normalizedScore: number; // 0-100 scale
    calculationBreakdown: {
        scaleId: string;
        scaleName: string;
        value: number;
        weight: number;
        isInverted: boolean;
        contribution: number;
    }[];
}

@injectable()
export class StabilityCalculatorService {
    /**
     * Calculate stability score based on mood scale values and a stability formula
     */
    calculateStability(
        moodScaleValues: MoodScaleValue[],
        scales: Scale[],
        stabilityFormula: StabilityFormula,
        scaleWeights: ScaleWeight[]
    ): StabilityCalculationResult {
        // Prepare a map for quick lookups
        const scalesMap = new Map<string, Scale>();
        scales.forEach(scale => {
            scalesMap.set(scale.id, scale);
        });

        const scaleValuesMap = new Map<string, number>();
        moodScaleValues.forEach(sv => {
            scaleValuesMap.set(sv.scaleId, sv.value);
        });

        const scaleWeightsMap = new Map<string, ScaleWeight>();
        scaleWeights.forEach(sw => {
            scaleWeightsMap.set(sw.scaleId, sw);
        });

        let totalWeightedScore = 0;
        let totalWeights = 0;
        const calculationBreakdown: StabilityCalculationResult['calculationBreakdown'] = [];

        // Calculate weighted score for each scale value
        for (const scaleValue of moodScaleValues) {
            const scale = scalesMap.get(scaleValue.scaleId);
            const scaleWeight = scaleWeightsMap.get(scaleValue.scaleId);

            if (!scale || !scaleWeight) continue;

            const value = scaleValue.value;
            const weight = scaleWeight.weight;
            const isInverted = scaleWeight.isInverted;

            // For inverted scales (like irritability where higher is worse)
            // we invert the value
            const adjustedValue = isInverted
                ? scale.maxValue - value + scale.minValue
                : value;

            const contribution = adjustedValue * weight;
            totalWeightedScore += contribution;
            totalWeights += weight;

            calculationBreakdown.push({
                scaleId: scale.id,
                scaleName: scale.name,
                value,
                weight,
                isInverted,
                contribution
            });
        }

        // Avoid division by zero
        if (totalWeights === 0) {
            return {
                stabilityScore: 0,
                normalizedScore: 0,
                calculationBreakdown
            };
        }

        const stabilityScore = totalWeightedScore / totalWeights;

        // Calculate normalized score (0-100)
        // Find the theoretical max and min scores based on the scales and weights
        let maxPossibleScore = 0;
        let minPossibleScore = 0;

        for (const sw of scaleWeights) {
            const scale = scalesMap.get(sw.scaleId);
            if (!scale) continue;

            if (sw.isInverted) {
                maxPossibleScore += scale.minValue * sw.weight;
                minPossibleScore += scale.maxValue * sw.weight;
            } else {
                maxPossibleScore += scale.maxValue * sw.weight;
                minPossibleScore += scale.minValue * sw.weight;
            }
        }

        const scoreRange = maxPossibleScore - minPossibleScore;
        let normalizedScore = 0;

        if (scoreRange > 0) {
            normalizedScore = 100 - (((stabilityScore - minPossibleScore) / scoreRange) * 100)
        }

        return {
            stabilityScore,
            normalizedScore,
            calculationBreakdown
        };
    }

    /**
     * Get a text description of the stability level
     */
    getStabilityDescription(normalizedScore: number): string {
        if (normalizedScore < 20) {
            return "Crise sévère";
        } else if (normalizedScore < 35) {
            return "Instabilité importante";
        } else if (normalizedScore < 50) {
            return "Modérément instable";
        } else if (normalizedScore < 65) {
            return "Légèrement instable";
        } else if (normalizedScore < 80) {
            return "Stabilité moyenne";
        } else {
            return "Bonne stabilité";
        }
    }
}
