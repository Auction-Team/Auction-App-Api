const User = require('../models/user_model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { uploadImageUser, s3 } = require('../utils/upload');

const searchUser = async (req) => {
    const { keySearch, multiSearchEnum, page, size, sort } = req.query;
    let buildSearch = {};
    const params = {
        keySearch: keySearch || '',
        multiSearchEnum: multiSearchEnum || '',
        page: Number.parseInt(page) || 0,
        size: Number.parseInt(size) || 5,
        sort: sort || 'email,asc',
    };
    const sortColumn = params.sort.split(',')[0];
    const sortDir = params.sort.split(',')[1] === 'asc' ? 1 : -1;
    const offset = params.page * params.size;
    const limit = params.size;
    let buildSort = {};
    switch (sortColumn) {
        case 'email':
            buildSort = { email: sortDir };
            break;
        case 'fullName':
            buildSort = { fullName: sortDir };
            break;
        default:
            buildSort = { email: 0 };
    }
    switch (params.multiSearchEnum) {
        case 'email':
            buildSearch = {
                $or: [
                    { email: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                ],
            };
            break;
        case 'fullName':
            buildSearch = {
                $or: [
                    { fullName: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                ],
            };
            buildSearch = {
                'fullName': { $regex: '.*' + params.keySearch + '.*', $options: 'i' },
            };
            break;
        default:
            buildSearch = {
                $or: [
                    { email: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                    { fullName: { $regex: '.*' + params.keySearch + '.*', $options: 'i' } },
                ],
            };
    }
    const totalData = await User.aggregate().match(buildSearch)
        .count('user_count').then((data) => {
        return data.length > 0 ? data[0].user_count : 0;
    });
    if (totalData > 0) {
        const result = await User.aggregate()
            .match(buildSearch).project({
                _id: 1,
                fullName: 2,
                email: 3,
                avatar: 4,
            })
            .sort(buildSort)
            .skip(offset)
            .limit(limit) || [];
        return {
            totalData,
            datas: result,
        };
    }
    return {
        totalData,
        datas: [],
    };
};

const checkEmailExists = async (email) => {
    return User.findOne({ email });
};

const getUserById = async (id) => {
    return User.findById(id);
};

const getUserByEmail = async (email) => {

    return User.findOne({ email });
};

const getUserProfile = async (id) => {
    return User.findById(id).select('-password');
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
                              province,
                              district,
                              ward,
                          }) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        email: email,
        password: passwordHash,
        province,
        district,
        ward,
    });

    return newUser.save();
};

const getUserByPasswordToken = async (token) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    return User.findOne({
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

