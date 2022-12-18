const Cart = require('../models/cart_model');
const Product = require('../models/product_model');
const mongoose = require('mongoose');

const isCartExistsInUser = async (userId) => {
    const userIdMongo = await mongoose.Types.ObjectId(userId);
    return Cart.findOne({ user: userIdMongo });
};

const generateListProductValid = async (products) => {
    if (Array.isArray(products) && products.length > 0) {
        return await products.reduce(async (prev, productId) => {
            const isValid = mongoose.Types.ObjectId.isValid(productId);
            if (isValid) {
                const productIdMongo = mongoose.Types.ObjectId(productId);
                const productById = await Product.findById(productIdMongo);
                const acc = await prev;
                if (productById)
                    return [productById._id, ...acc];
                return [...acc];
            }
            return prev;
        }, Promise.resolve([])).then((result) => {
            return result;
        });
    }
    return [];
};

const getCartByUserId = async (userIdMongo) => {
    return Cart.findOne({ user: userIdMongo });
};

module.exports = {
    isCartExistsInUser,
    generateListProductValid,
    getCartByUserId
};