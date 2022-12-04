const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const { productService } = require('../services');


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
        const productId = mongoose.Types.ObjectId(req.body.productId);
        const mainImageFlag = mongoose.Types.ObjectId(req.body.mainImageFlag);
        const subImagesIndex = mongoose.Types.ObjectId(req.body.subImagesIndex);
        const product = await productService.getProductById(productId);
        if (mainImageFlag!=true)
        {
            if(product.mainImage=="/product/default-image"){
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
        if(!mainImageFlag){
            product.subImages.push(req.file.key);
        }else{
            product.mainImage = req.file.key;
        }
        await product.save({ validateBeforeSave: false });
        product.mainImage = process.env.S3_LOCATION + product.mainImage;
        product.subImages(function(item, index){
            console.log(' product.subImages['+index+'] is '+ item);
            product.subImages[index]=process.env.S3_LOCATION + product.subImages[index];
            console.log(' product.subImages['+index+'] is '+ item);
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