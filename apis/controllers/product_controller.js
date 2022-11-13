const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const productService = require('../services/product_service')
const mongoose = require('mongoose');


const createProduct = catchAsync(async (req, res) => {
    try {
        const { auctionName, brief, description, quantity,quantityUnit,mainImage,subImages,startingPrice,startAuctionTime,endAuctionTime,category} = req.body
        const newProduct = await postService.createProduct( auctionName, brief, description, quantity,quantityUnit,mainImage,subImages,startingPrice,startAuctionTime,endAuctionTime,category, req.user._id);
        console.log("Add new product finished")
        console.log(newPost)
        return res.status(httpStatus.OK).send({newProduct: {
            ...newProduct._doc,
            user: req.user
        }})
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
    
})

module.exports = {
    createProduct
};