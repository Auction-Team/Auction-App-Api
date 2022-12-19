const Category = require('../models/category_model');
const mongoose = require('mongoose');
const Product = require('../models/product_model');

const searchCategory = async (req) => {
    const { keySearch, multiSearchEnum, page, size, sort } = req.query;
    let buildSearch = {};
    const params = {
        keySearch: keySearch || '',
        multiSearchEnum: multiSearchEnum || '',
        page: Number.parseInt(page) || 0,
        size: Number.parseInt(size) || 5,
        sort: sort || 'name,asc',
    };
    const sortColumn = params.sort.split(',')[0];
    const sortDir = params.sort.split(',')[1] === 'asc' ? 1 : -1;
    const offset = params.page * params.size;
    const limit = params.size;
    let buildSort = {};
    switch (sortColumn) {
        case 'name':
            buildSort = { name: sortDir };
            break;
        case 'description':
            buildSort = { description: sortDir };
            break;
        default:
            buildSort = { name: 0 };
    }
    switch (params.multiSearchEnum) {
        case 'name':
            buildSearch = {
                $or: [
                    { name: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
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
                    { name: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                    { description: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                ],
            };
    }
    const totalData = await Category.aggregate().match(
        buildSearch,
    ).count('category_count').then((data) => {
        return data.length > 0 ? data[0].category_count : 0;
    });
    if (totalData > 0) {
        const result = await Category.aggregate()
            .match(buildSearch)
            .project({
                _id: 1,
                name: 2,
                description: 3,
            })
            .sort(buildSort)
            .skip(offset)
            .limit(limit) || [];
        return {
            totalData,
            datas: result,
        };
    }
}

const createCategory = async (req) => {
    const categoryNew = new Category({
        name: req.body.name,
        description: req.body.description || ''
    });
    return categoryNew.save();
};

const findCategoryById = async (categoryId) => {
    const categoryIdObject = await mongoose.Types.ObjectId(categoryId);
    return Category.findById(categoryIdObject);
};

module.exports = {
    createCategory,
    findCategoryById,
    searchCategory
};