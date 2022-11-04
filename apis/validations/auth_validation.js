const Joi = require('joi');

const loginSchema = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

const registerSchema = {
    body: Joi.object().keys({
        firstName: Joi.string().max(15).required(),
        lastName: Joi.string().max(30).required(),
        fullName: Joi.string().max(45).required(),
        email: Joi.string().required().email(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    }),
};

const forgotPasswordSchema = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
    }),
};

const activateTokenForgotPasswordSchema = {
    body: Joi.object().keys({
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
        confirmPassword: Joi.ref('password'),
    }),
};

module.exports = {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    activateTokenForgotPasswordSchema,
};