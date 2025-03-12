// src/api/validation/mood-entry.validation.ts
import Joi from 'joi';

export const createMoodEntrySchema = Joi.object({
    entryDate: Joi.date().default(Date.now).messages({
        'date.base': 'Entry date must be a valid date'
    }),
    comment: Joi.string().allow('').max(1000).messages({
        'string.max': 'Comment cannot exceed {#limit} characters'
    }),
    medication: Joi.string().allow('').max(255).messages({
        'string.max': 'Medication cannot exceed {#limit} characters'
    }),
    sleepHours: Joi.number().min(0).max(24).allow(null).messages({
        'number.base': 'Sleep hours must be a number',
        'number.min': 'Sleep hours cannot be negative',
        'number.max': 'Sleep hours cannot exceed 24'
    }),
    scaleValues: Joi.array().items(
        Joi.object({
            scaleId: Joi.string().uuid().required().messages({
                'string.guid': 'Scale ID must be a valid UUID'
            }),
            value: Joi.number().integer().required().messages({
                'number.base': 'Scale value must be a number',
                'number.integer': 'Scale value must be an integer'
            })
        })
    ).min(1).required().messages({
        'array.base': 'Scale values must be an array',
        'array.min': 'At least one scale value is required'
    })
});

export const updateMoodEntrySchema = Joi.object({
    entryDate: Joi.date().messages({
        'date.base': 'Entry date must be a valid date'
    }),
    comment: Joi.string().allow('').max(1000).messages({
        'string.max': 'Comment cannot exceed {#limit} characters'
    }),
    medication: Joi.string().allow('').max(255).messages({
        'string.max': 'Medication cannot exceed {#limit} characters'
    }),
    sleepHours: Joi.number().min(0).max(24).allow(null).messages({
        'number.base': 'Sleep hours must be a number',
        'number.min': 'Sleep hours cannot be negative',
        'number.max': 'Sleep hours cannot exceed 24'
    }),
    scaleValues: Joi.array().items(
        Joi.object({
            scaleId: Joi.string().uuid().required().messages({
                'string.guid': 'Scale ID must be a valid UUID'
            }),
            value: Joi.number().integer().required().messages({
                'number.base': 'Scale value must be a number',
                'number.integer': 'Scale value must be an integer'
            })
        })
    ).min(1).messages({
        'array.base': 'Scale values must be an array',
        'array.min': 'At least one scale value is required'
    })
});