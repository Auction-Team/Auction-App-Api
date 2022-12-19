const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const mongoose = require('mongoose');
const Category = require('../models/category_model');
const { categoryService } = require('../services');

// search category
const searchCategory = catchAsync(async (req, res, next) => {
    const categoryList = await categoryService.searchCategory(req)
    return res.status(httpStatus.OK).json({
        success: true,
        categoryList
    })
})

// create category
const createCategory = catchAsync(async (req, res, next) => {
    const categoryNew = await categoryService.createCategory(req);
    return res.status(httpStatus.OK).json({
        success: true,
        categoryNew,
    });
});

// detail category
const detailCategory = catchAsync(async (req, res, next) => {
    const { categoryId } = req.params;
    const detailCategory = await categoryService.findCategoryById(categoryId);
    if (!detailCategory)
        return next(new CustomError(httpStatus.BAD_REQUEST, 'Category not found'));
    return res.status(httpStatus.OK).json({
        success: true,
        detailCategory,
    });
});

// update category
const updateCategory = catchAsync(async (req, res, next) => {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    const detailCategory = await categoryService.findCategoryById(categoryId);
    if (!detailCategory)
        return next(new CustomError(httpStatus.BAD_REQUEST, 'Category not found'));

    detailCategory.name = name || detailCategory.name;
    detailCategory.description = description || '';
    await detailCategory.save();
    return res.status(httpStatus.OK).json({
        success: true,
        detailCategory,
    });
});

// delete category
const deleteCategory = catchAsync(async (req, res, next) => {
    const { categoryId } = req.params;
    const detailCategory = await categoryService.findCategoryById(categoryId);
    if (!detailCategory)
        return next(new CustomError(httpStatus.BAD_REQUEST, 'Category not found'));
    console.log('detailCategory',detailCategory)
    await Category.findByIdAndDelete(detailCategory._id)
    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Delete category successfully',
    });
});

module.exports = {
    createCategory,
    detailCategory,
    updateCategory,
    deleteCategory,
    searchCategory
};