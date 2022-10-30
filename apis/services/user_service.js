const User = require('../models/user_model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const checkEmailExists = async (email) => {
    return await User.findOne({ email });
};

const getUserByEmail = async (email) => {
    return await User.findOne({ email });
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
};
