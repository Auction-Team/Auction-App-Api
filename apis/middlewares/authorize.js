const { User } = require('../models');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const CustomError = require('../utils/custom-error');
const catchAsync = require('../utils/catch-async')
module.exports = catchAsync(async (req, res, next) => {
    if(req.user.role === 'User') next(new CustomError(403,'Access denied'));
})