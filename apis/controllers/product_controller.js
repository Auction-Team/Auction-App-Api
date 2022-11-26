const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const { productService } = require('../services');


const createProduct = catchAsync(async (req, res,next) => {
        const newProduct = await productService.createProduct({...req.body},req.user.id);
        console.log("Add new product finished")
        console.log(newProduct)
        return res.status(httpStatus.OK).send({newProduct: {
            ...newProduct._doc,
            user: req.user
        }})
})

module.exports = {
    createProduct
};