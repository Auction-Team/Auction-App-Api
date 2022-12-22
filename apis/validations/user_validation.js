const Joi = require('joi');

const updateProfileSchema = {
    body: Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        province: Joi.string(),
        district: Joi.string(),
        ward: Joi.string()
    }),
};

module.exports = {
    updateProfileSchema
}