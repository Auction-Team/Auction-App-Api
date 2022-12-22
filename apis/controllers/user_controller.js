const httpStatus = require('http-status');
const { userService } = require('../services');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const { s3 } = require('../utils/upload');
const mongoose = require('mongoose');
const User = require('../models/user_model')

// sereach for user
const searchUser = catchAsync(async (req, res, next) => {
    const userList = await userService.searchUser(req);
    res.status(httpStatus.OK).json({
        success: true,
        userList
    });
});

// update profile user
const updateProfileUser = catchAsync(async (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.user.id);
    const {firstName, lastName, province, district, ward} = req.body
    const userById = await User.findById(userId);
    if(!userById)
        return next(new CustomError(httpStatus.BAD_REQUEST, 'User not found'))
    const fullName = firstName + ' ' + lastName
    userById.firstName = firstName;
    userById.lastName = lastName;
    userById.fullName = fullName;
    userById.province = province;
    userById.district = district || userById.district
    userById.province = province || userById.province
    userById.ward = ward || userById.ward
    await userById.save()
    userById.password = ''
    return res.status(httpStatus.OK).json({
        success: true,
        userById
    })
})

// upload profile user
const uploadImageUserProfile = catchAsync(async (req, res, next) => {
    try {
        const userId = mongoose.Types.ObjectId(req.user.id);
        const user = await userService.getUserById(userId);
        if (user.firstUpload) user.firstUpload = false;
        else {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: user.avatar,
            };
            await s3.headObject(params).promise();
            console.log('File found!');
            await s3.deleteObject(params, (err, data) => {
                // nothing todo
            });
        }
        user.avatar = req.file.key;
        await user.save({ validateBeforeSave: false });
        user.password = '';
        user.avatar = process.env.S3_LOCATION + user.avatar;
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {
    uploadImageUserProfile,
    searchUser,
    updateProfileUser
};
