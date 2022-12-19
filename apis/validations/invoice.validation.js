const Joi = require('joi');

const saveInvoiceSchema = {
    body: Joi.object().keys({
        productId: Joi.string().required(),
        total: Joi.number().required().min(0),
        amount: Joi.number().required().min(0),
    }),
};

module.exports = {
    saveInvoiceSchema
}