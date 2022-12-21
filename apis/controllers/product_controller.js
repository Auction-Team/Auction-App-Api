const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const { productService } = require('../services');
const { s3 } = require('../utils/upload');
const mongoose = require('mongoose');

// search all products
const searchProducts = catchAsync(async (req, res, next) => {
    const productList = await productService.searchProduct(req) || [];
    return res.status(httpStatus.OK).json({
        success: true,
        productList
    })
})
// sereach for user
// search all products by user(owner)
const searchOwnerProducts = catchAsync(async (req, res, next) => {
    console.log('my search product')
    const productList = await productService.searchOwnerProduct(req) || [];
    return res.status(httpStatus.OK).json({
        success: true,
        productList
    })
    return res.status(httpStatus.OK).json({
        success: true,
        message: 'API My Search'
    })
})

const getAllCategory = catchAsync(async (req, res, next) => {
    const categoryList = await productService.getAllCategory();
    console.log(categoryList);
    res.status(httpStatus.OK).json({
        success: true,
        categoryList
    });
});
const updateProduct = catchAsync(async (req,res,next)=>{
    const { productId } = req.params;
    const oldProduct= await productService.getProductById(productId);
    console.log(oldProduct);
    if(oldProduct==null|| oldProduct.owner.toString() !== req.user.id){
        return next(new CustomError(httpStatus.NOT_FOUND, 'Product not exists'));
    }else{
        let currentDateTime=new Date();
        if(oldProduct.startAuctionTime>=currentDateTime){
            const updatedProduct = await productService.updateProduct(productId,{...req.body});
            if (!updatedProduct) {
                return next(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Can not update produuct'));
            }
            updatedProduct.mainImage = process.env.S3_LOCATION + updatedProduct.mainImage;
            updatedProduct.subImages=updatedProduct.subImages.map(function(item){
                console.log(' product.subImages is: '+ item);
                return process.env.S3_LOCATION + item;
            });
            return res.status(httpStatus.OK).send({updatedProduct: {
                ...updatedProduct._doc
            }})
        }else{
            return next(new CustomError(httpStatus.BAD_REQUEST, 'Can not update product because it is being auctioned'));
        }
    }
})
const deleteProduct = catchAsync(async (req,res,next)=>{
    try {
        const { productId } = req.params;
        const oldProduct= await productService.getProductById(productId);
        if(!oldProduct || oldProduct.owner.toString() !== req.user.id){
            return next(new CustomError(httpStatus.NOT_FOUND, 'Product not exists'));
        }else{
            let currentDateTime=new Date();
            if(oldProduct.startAuctionTime >= currentDateTime){
                const deletedFlag = await productService.deleteProduct(productId);
                console.log(deletedFlag);
                return res.status(httpStatus.OK).send({success: {
                    deletedFlag
                }})
            }else{
                return next(new CustomError(httpStatus.BAD_REQUEST, 'Can not delete product because it is being auctioned'));
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
})

const createProduct = catchAsync(async (req, res,next) => {
    try {
        const newProduct = await productService.createProduct({...req.body},req.user.id);
        console.log("Add new product finished")
        console.log(newProduct)
        newProduct.mainImage = process.env.S3_LOCATION + newProduct.mainImage;
        return res.status(httpStatus.OK).send({product: {
            ...newProduct._doc
        }})
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
})
const getDetailProduct = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    console.log(productId);
    const oldProduct = await productService.getProductById(productId);
    console.log(oldProduct);
    if(oldProduct==null){
        return next(new CustomError(httpStatus.NOT_FOUND, 'Product not exists'));
    }
    oldProduct.mainImage = process.env.S3_LOCATION + oldProduct.mainImage;
    oldProduct.subImages=oldProduct.subImages.map(function(item){
        console.log(' product.subImages is: '+ item);
        return process.env.S3_LOCATION + item;
    });
    return res.status(httpStatus.OK).send({product: {
        ...oldProduct._doc
    }})
});
// upload profile user
const uploadProductImage = catchAsync(async (req, res, next) => {
    try {
        console.log("upload complete --> store data to database");
        const { productId,mainImageFlag,subImagesIndex } = req.query;
        const product = await productService.getProductById(productId);
        if (!product)
        return next(
            new CustomError(
                httpStatus.BAD_REQUEST,
                'Product not found'
            )
        );
        
        console.log("found product");

        if (mainImageFlag!=null && mainImageFlag === true)
        {
            console.log(product.mainImage);
            if(product.mainImage !== "product/default-image.png"){
                
                console.log("delete main image");
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: product.mainImage,
                };
                await s3.headObject(params).promise();
                console.log('File found!');
                await s3.deleteObject(params, (err, data) => {
                    // nothing todo
                });
            }
        }else{
            if(subImagesIndex!=null && subImagesIndex !== -1){
            console.log("delete sub image at"+ subImagesIndex);
            const productSubImageDelete=product.subImages[subImagesIndex];
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: productSubImageDelete,
            };
            await s3.headObject(params).promise();
            console.log('File found!');
            await s3.deleteObject(params, (err, data) => {
                // nothing todo
            });
            }
        }
        
        console.log("store new data");
        if(mainImageFlag!=null&& mainImageFlag ===true){
            product.mainImage = req.file.key;
        }else{
            if(subImagesIndex!=null && subImagesIndex !== -1){
                product.subImages[subImagesIndex]=req.file.key;
            }else{
                product.subImages.push(req.file.key);
            }
        }
        await product.save({ validateBeforeSave: false });
        product.mainImage = process.env.S3_LOCATION + product.mainImage;
        product.subImages=product.subImages.map(function(item){
            console.log(' product.subImages is: '+ item);
            return process.env.S3_LOCATION + item;
        });
        res.status(200).json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getDetailProduct,
    uploadProductImage,
    getAllCategory,
    searchProducts,
    searchOwnerProducts
};