const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const { productService } = require('../services');
const { s3 } = require('../utils/upload');


const createProduct = catchAsync(async (req, res,next) => {
    try {
        const newProduct = await productService.createProduct({...req.body},req.user.id);
        console.log("Add new product finished")
        console.log(newProduct)
        return res.status(httpStatus.OK).send({newProduct: {
            ...newProduct._doc,
            user: req.user
        }})
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
})

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
    uploadProductImage
};