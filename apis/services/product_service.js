const Product = require('../models/product_model');
const Category = require('../models/category_model');
const User = require('../models/user_model');
const { build } = require('joi');

const searchOwnerProduct = async (req) => {
    const result = await Product.find({ owner: req.user.id });
    const listProduct = result.map((product) => {
        product.mainImage = process.env.S3_LOCATION + product.mainImage;
        return product;
    });
    return {
        datas: listProduct,
    };
};
const searchProduct = async (req) => {
    const { keySearch, multiSearchEnum, page, size, sort } = req.query;
    let buildSearch = {};
    const params = {
        keySearch: keySearch || '',
        multiSearchEnum: multiSearchEnum || '',
        page: Number.parseInt(page) || 0,
        size: Number.parseInt(size) || 5,
        sort: sort || 'startAuctionTime,asc',
    };
    console.log(params);
    const sortColumn = params.sort.split(',')[0];
    const sortDir = params.sort.split(',')[1] === 'asc' ? 1 : -1;
    const offset = params.page * params.size;
    const limit = params.size;
    let buildSort = {};
    switch (sortColumn) {
        case 'auctionName':
            buildSort = { auctionName: sortDir };
            break;
        case 'description':
            buildSort = { description: sortDir };
            break;
        default:
            buildSort = { startAuctionTime: 0 };
    }
    switch (params.multiSearchEnum) {
        case 'auctionName':
            buildSearch = {
                $or: [
                    { auctionName: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                ],
            };
            break;
        case 'description':
            buildSearch = {
                $or: [
                    { description: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                ],
            };
            break;
        default:
            buildSearch = {
                $or: [
                    { auctionName: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                    { description: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                ],
            };
    }
    const totalData = await Product.aggregate().match(
        buildSearch,
    ).count('product_count').then((data) => {
        return data.length > 0 ? data[0].product_count : 0;
    });
    if (totalData > 0) {
        const result = await Product.aggregate()
            .match(buildSearch)
            .lookup({
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'categoryList',
            })
            .unwind('$categoryList')
            .lookup({
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'userOwner',
            })
            .unwind('userOwner')
            .project({
                _id: 1,
                auctionName: 2,
                description: 3,
                mainImage: 4,
                startAuctionTime: 5,
                endAuctionTime: 6,
                quantity: 7,
                quantityUnit: 8,
                startingPrice: 9,
                categoryName: '$categoryList.name',
                owner: '$userOwner.fullName',
            })
            .sort(buildSort)
            .skip(offset)
            .limit(limit) || [];
        console.log(result);
        const listProduct = result.map((product) => {
            product.mainImage = process.env.S3_LOCATION + product.mainImage;
            return product;
        });

        return {
            totalData,
            datas: listProduct,
        };
    }
};
const createProduct = async ({
                                 auctionName,
                                 description,
                                 quantity,
                                 quantityUnit,
                                 startingPrice,
                                 startAuctionTime,
                                 endAuctionTime,
                                 category,
                             }, id) => {
    console.log('Create product');
    const mainImage = 'product/default-image.png';
    const subImages = [];
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
        owner: id,
    });
    return newProduct.save();
};
const updateProduct = async (productId, {
    auctionName,
    description,
    quantity,
    quantityUnit,
    startingPrice,
    startAuctionTime,
    endAuctionTime,
    category,
}) => {
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            auctionName: auctionName,
            description: description,
            quantity: quantity,
            quantityUnit: quantityUnit,
            startingPrice: startingPrice,
            startAuctionTime: startAuctionTime,
            endAuctionTime: endAuctionTime,
            category: category,
        },
        { new: true },
    );

    return updatedProduct;
};
const deleteProduct = async (productId) => {
    console.log('Delete product');

    const deletedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            deletedFlag: true,
        },
        { new: true },
    );
    return deletedProduct.deletedFlag;
};
const getAllCategory = async () => {
    //let buildSort = { name: 1};
    return Category.find();
};
const getProductById = async (id) => {
    const product = Product.findById(id);
    console.log(product.deletedFlag);
    if (product.deletedFlag != null && product.deletedFlag !== false) {
        return null;
    } else {
        return product;
    }
};

module.exports = {
    createProduct,
    getProductById,
    getAllCategory,
    updateProduct,
    deleteProduct,
    searchProduct,
    searchOwnerProduct,
};
