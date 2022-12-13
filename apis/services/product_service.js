const Product  = require('../models/product_model')
const Category = require('../models/category_model')
// const httpStatus = require('http-status')
// const CustomError = require('../../utils/custom-error')

const createProduct = async ({auctionName, description, quantity, quantityUnit, startingPrice, startAuctionTime, endAuctionTime, category}, id ) => {
    console.log("Create product");
    const mainImage="product/default-image";
    const subImages=[];
    const newProduct = new Product({
        auctionName: auctionName, 
        description: description, 
        quantity: quantity, 
        quantityUnit: quantityUnit,
        mainImage: mainImage,
        subImages: subImages, 
        startingPrice: startingPrice, 
        startAuctionTime: startAuctionTime, 
        endAuctionTime: endAuctionTime, 
        category: category, 
        owner: id
    })
    return newProduct.save()
}
const updateProduct = async (productId,{ auctionName, description, quantity, quantityUnit, startingPrice, startAuctionTime, endAuctionTime, category}) => {
    console.log("Update product");


    const updatedProduct= await Product.findByIdAndUpdate(
        productId,
        {
            auctionName: auctionName, 
            description: description, 
            quantity: quantity, 
            quantityUnit: quantityUnit,
            startingPrice: startingPrice, 
            startAuctionTime: startAuctionTime, 
            endAuctionTime: endAuctionTime, 
            category: category
        },
        { new: true }
    );

    return updatedProduct;
}
const deleteProduct = async (productId) => {
    console.log("Delete product");

    const deletedProduct= await Product.findByIdAndUpdate(
        productId,
        {
            deletedFlag:true
        },
        { new: true }
    );
    return deletedProduct.deletedFlag;
}
const getAllCategory = async()=>{
    //let buildSort = { name: 1};
    return await Category.find();
}
const getProductById = async (id) => {
    const product= Product.findById(id);
    console.log(product.deletedFlag);
    if(product.deletedFlag!=null&&product.deletedFlag!=false){
        return null;
    }else{
        return product;
    }
};

// const updatePost = async (content, images, id) => {
//     const post = await Post.findOneAndUpdate({_id: id}, {
//         content, images
//     }).populate("user likes", "avatar email fullName")
//     .populate({
//         path: "comments",
//         populate: {
//             path: "user likes",
//             select: "-password"
//         }
//     })
//     return post
// }

module.exports = {
    createProduct,
    getProductById,
    getAllCategory,
    updateProduct,
    deleteProduct
};