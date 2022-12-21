const Joi = require('joi');

const updateProfileSchema = {
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
    }),
};

module.exports = {
    updateProfileSchema
}