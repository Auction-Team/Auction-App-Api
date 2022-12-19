const Joi = require('joi');
const createCategorySchema = {
    body: Joi.object().keys({
        name: Joi.string().max(255).required(),
        description: Joi.string().max(500),
    }),
}

module.exports = {
    createCategorySchema,
}