// src/api/validation/scale.validation.ts
import Joi from 'joi';

export const scaleValidator = {
    name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Scale name is required',
        'string.min': 'Scale name must be at least {#limit} characters',
        'string.max': 'Scale name cannot exceed {#limit} characters'
    }),
    description: Joi.string().allow('').max(500).messages({
        'string.max': 'Description cannot exceed {#limit} characters'
    }),
    minValue: Joi.number().integer().required().messages({
        'number.base': 'Minimum value must be a number',
        'number.integer': 'Minimum value must be an integer'
    }),
    maxValue: Joi.number().integer().greater(Joi.ref('minValue')).required().messages({
        'number.base': 'Maximum value must be a number',
        'number.integer': 'Maximum value must be an integer',
        'number.greater': 'Maximum value must be greater than minimum value'
    }),
    isActive: Joi.boolean().default(true),
    levels: Joi.array().items(
        Joi.object({
            level: Joi.number().integer().required(),
            description: Joi.string().required().messages({
                'string.empty': 'Level description is required'
            })
        })
    ).required().messages({
        'array.base': 'Levels must be an array',
        'array.empty': 'At least one level is required'
    })
};

export const createScaleSchema = Joi.object({
    name: scaleValidator.name,
    description: scaleValidator.description,
    minValue: scaleValidator.minValue,
    maxValue: scaleValidator.maxValue,
    isActive: scaleValidator.isActive,
    levels: scaleValidator.levels
});

export const updateScaleSchema = Joi.object({
    name: scaleValidator.name.optional(),
    description: scaleValidator.description.optional(),
    isActive: scaleValidator.isActive.optional(),
    levels: scaleValidator.levels.optional()
});