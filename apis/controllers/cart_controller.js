const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const cartService = require('../services/cart_service');
const Product = require('../models/product_model');
const Cart = require('../models/cart_model');
const mongoose = require('mongoose');

const getCartByUser = catchAsync(async (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.user.id);
    const listCart = await Cart.aggregate()
        .lookup({
            from: 'products',
            localField: 'products',
            foreignField: '_id',
            as: 'productList',
        })
        .project({
            user: 1,
            productList: "$productList"
        })
    ;
    return res.status(httpStatus.OK).json({
        success: true,
        listCart,
    });
});


const saveCart = catchAsync(async (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.user.id);
    const { products } = req.body;
    const isUserIsExistsCart = await cartService.isCartExistsInUser(req.user.id);
    if (!isUserIsExistsCart) {
        // user not already to create a new cart
        const listProductIdsMongo = cartService.generateListProductValid(products);
        listProductIdsMongo.then((products) => {
            const newCart = new Cart({
                user: userId,
                products,
            });
            newCart.save();
            return res.status(httpStatus.OK).json({
                success: true,
                newCart,
            });
        });
    } else {
        const cartByUserId = await cartService.getCartByUserId(userId);
        const productListIds = cartByUserId.products.map(product => product.toString());
        const listProductUpdateCart = products.filter(productId => {
            return !productListIds.includes(productId);
        }) || [];
        if (listProductUpdateCart.length > 0) {
            listProductUpdateCart.forEach(productId => {
                const productIdMongo = mongoose.Types.ObjectId(productId);
                cartByUserId.products.push(productIdMongo);
            });
            cartByUserId.save();
        }
        return res.status(httpStatus.OK).json({
            success: true,
            cartByUserId,
        });
    }
});

const deleteCartInProductList = catchAsync(async (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.user.id);
    const { products } = req.body;
    const cartByUserId = await cartService.getCartByUserId(userId);
    const productListIds = cartByUserId.products.map(product => product.toString());
    cartByUserId.products = productListIds.reduce((prev, cur) => {
        if (products.includes(cur))
            return prev;
        const productIdsMongo = mongoose.Types.ObjectId(cur);
        prev.push(productIdsMongo);
        return prev;
    }, []);
    await cartByUserId.save();
    return res.status(httpStatus.OK).json({
        success: true,
        cartByUserId,
    });
});

module.exports = {
    saveCart,
    deleteCartInProductList,
    getCartByUser,
};