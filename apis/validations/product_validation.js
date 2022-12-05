const Joi = require('joi');
const createProductSchema = {
    body: Joi.object().keys({
        auctionName: Joi.string().max(255).required(),
        description: Joi.string().max(500),
        quantity: Joi.number().min(1).required(),
        quantityUnit: Joi.string().max(255).required(),
        startingPrice: Joi.number().required(),
        startAuctionTime: Joi.date().required(),
        endAuctionTime: Joi.date().required(),
        category: Joi.string().required()
    }),
};

const updateProductSchema = {
    body: Joi.object().keys({
        auctionName: Joi.string().max(255).required(),
        description: Joi.string().max(500),
        quantity: Joi.number().min(1).required(),
        quantityUnit: Joi.string().max(255).required(),
        startingPrice: Joi.number().required(),
        startAuctionTime: Joi.date().required(),
        endAuctionTime: Joi.date().required(),
        category: Joi.string().required()
    }),
};

module.exports = {
    createProductSchema,
    updateProductSchema
};
