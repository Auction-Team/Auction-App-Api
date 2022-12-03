const { Product } = require('../models/product_model')
// const httpStatus = require('http-status')
// const CustomError = require('../../utils/custom-error')

const createProduct = async (auctionName, description, quantity, quantityUnit, mainImage, subImages, startingPrice, startAuctionTime, endAuctionTime, category, id ) => {
    const newProduct = new Product({
        auctionName, description, quantity, quantityUnit, mainImage, subImages, startingPrice, startAuctionTime, endAuctionTime, category, id
    })
    return newProduct.save()
}

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
};