// src/api/validation/stability-formula.validation.ts
import Joi from 'joi';

const scaleWeightSchema = Joi.object({
    scaleId: Joi.string().uuid().required().messages({
        'string.guid': 'Scale ID must be a valid UUID'
    }),
    weight: Joi.number().positive().required().messages({
        'number.base': 'Weight must be a number',
        'number.positive': 'Weight must be positive'
    }),
    isInverted: Joi.boolean().default(false)
});

export const createFormulaSchema = Joi.object({
    description: Joi.string().required().max(500).messages({
        'string.empty': 'Description is required',
        'string.max': 'Description cannot exceed {#limit} characters'
    }),
    isActive: Joi.boolean().default(true),
    scaleWeights: Joi.array().items(scaleWeightSchema).min(1).required().messages({
        'array.base': 'Scale weights must be an array',
        'array.min': 'At least one scale weight is required'
    })
});

export const updateFormulaSchema = Joi.object({
    description: Joi.string().max(500).messages({
        'string.max': 'Description cannot exceed {#limit} characters'
    }),
    isActive: Joi.boolean(),
    scaleWeights: Joi.array().items(scaleWeightSchema).min(1).messages({
        'array.base': 'Scale weights must be an array',
        'array.min': 'At least one scale weight is required'
    })
});