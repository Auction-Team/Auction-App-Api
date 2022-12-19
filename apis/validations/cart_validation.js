const Joi = require('joi');

const saveCartSchema = {
    body: Joi.object().keys({
        products: Joi.array().unique().required(),
    }),
};

module.exports = {
    saveCartSchema
}