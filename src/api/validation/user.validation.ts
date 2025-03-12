// src/api/validation/user.validation.ts
import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required'
    }),
    username: Joi.string().min(3).max(30).required().messages({
        'string.min': 'Username must be at least {#limit} characters long',
        'string.max': 'Username cannot exceed {#limit} characters',
        'string.empty': 'Username is required'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least {#limit} characters long',
        'string.empty': 'Password is required'
    })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required'
    })
});