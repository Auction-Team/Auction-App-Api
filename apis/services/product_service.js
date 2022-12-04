const Product  = require('../models/product_model')
// const httpStatus = require('http-status')
// const CustomError = require('../../utils/custom-error')

const createProduct = async ({auctionName, description, quantity, quantityUnit, startingPrice, startAuctionTime, endAuctionTime, category}, id ) => {
    console.log("Create product");
    const mainImage="/product/default-image";
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

const getProductById = async (id) => {
    return Product.findById(id);
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
    getProductById
};