const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const { productService } = require('../services');
const { s3 } = require('../utils/upload');


// sereach for user
const getAllCategory = catchAsync(async (req, res, next) => {
    const categoryList = await productService.getAllCategory();
    res.status(httpStatus.OK).json({
        success: true,
        categoryList
    });
});
const updateProduct = catchAsync(async (req,res,next)=>{
    const oldProduct=productService.getProductById(productId);
    if(oldProduct==null||oldProduct.owner!=req.user.id){
        return next(new CustomError(httpStatus.NOT_FOUND, 'Product not exists'));
    }else{
        let currentDateTime=new Date();
        if(oldProduct.startAuctionTime>=currentDateTime){
            const updatedProduct = await productService.updateProduct({...req.body});
            if (!updatedProduct) {
                return next(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Can not update produuct'));
            }
            
            updatedProduct.mainImage = process.env.S3_LOCATION + product.mainImage;
            updatedProduct.subImages=product.subImages.map(function(item){
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
        const oldProduct=productService.getProductById(req.params.id);
        if(oldProduct==null||oldProduct.owner!=req.user.id){
            return next(new CustomError(httpStatus.NOT_FOUND, 'Product not exists'));
        }else{
            let currentDateTime=new Date();
            if(oldProduct.startAuctionTime>=currentDateTime){
                const deletedFlag = await productService.deleteProduct(req.params.id);
                return res.status(httpStatus.OK).send({success: {
                    deletedFlag
                }})
            }else{
                return next(new CustomError(httpStatus.BAD_REQUEST, 'Can not update product because it is being auctioned'));
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
        newProduct.mainImage = process.env.S3_LOCATION + product.mainImage;
        return res.status(httpStatus.OK).send({newProduct: {
            ...newProduct._doc
        }})
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
})
const getDetailProduct = catchAsync(async (req, res, next) => {
    const oldProduct = await productService.getUserProfile(req.param.productId);

    if(oldProduct==null||oldProduct.owner!=req.user.id){
        return next(new CustomError(httpStatus.NOT_FOUND, 'Product not exists'));
    }
    oldProduct.mainImage = process.env.S3_LOCATION + product.mainImage;
    oldProduct.subImages=product.subImages.map(function(item){
        console.log(' product.subImages is: '+ item);
        return process.env.S3_LOCATION + item;
    });
    return res.status(httpStatus.OK).send({oldProduct: {
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

        if (mainImageFlag!=null&&mainImageFlag==true)
        {
            console.log(product.mainImage);
            if(product.mainImage!="product/default-image"){
                
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
            if(subImagesIndex!=null && subImagesIndex!=-1){
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
        if(mainImageFlag!=null&&mainImageFlag==true){
            product.mainImage = req.file.key;
        }else{
            if(subImagesIndex!=null && subImagesIndex!=-1){
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
};