const User = require('../models/user_model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { uploadImageUser, s3 } = require('../utils/upload');

const searchUser = async (req) => {
    const userList = await User.aggregate([
        {
            $match: {
                $or: [
                    { 'email': { $regex: '.*' + 'hohoaiphong' + '.*', $options: 'i' } },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                fullName: 2,
                email: 3,
                avatar: 4,
            },
        },
    ]).sort({ email: 1 })
        .skip(2)
        .limit(1)
        .allowDiskUse(true);
    return userList;
};

const checkEmailExists = async (email) => {
    return await User.findOne({ email });
};

const getUserById = async (id) => {
    return await User.findById(id);
};

const getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const getUserProfile = async (id) => {
    return await User.findById(id).select('-password');
};

const comparePassword = async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash);
};

const createUser = async ({
                              firstName,
                              lastName,
                              fullName,
                              email,
                              password,
                          }) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        email: email,
        password: passwordHash,
    });

    return newUser.save();
};

const getUserByPasswordToken = async (token) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    return await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
};

module.exports = {
    checkEmailExists,
    createUser,
    getUserByEmail,
    comparePassword,
    getUserByPasswordToken,
    getUserProfile,
    getUserById,
    searchUser,
};
;
