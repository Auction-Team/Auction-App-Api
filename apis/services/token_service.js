const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const CustomError = require('../utils/custom-error');
const User = require('../models/user_model');
const generateResetPasswordToken = ({ email }) => {
    return jwt.sign({ email }, process.env.PASSPORT_JWT_RESET_PASSWORD, {
        expiresIn: '5m',
    });
};

const generateAccessToken = (id) => {
    const payload = {
        id,
    };

    return jwt.sign(payload, process.env.PASSPORT_JWT_ACCESS_TOKEN, {
        expiresIn: '1d',
    });
};

const generateRefreshToken = (id) => {
    const payload = {
        id,
    };

    return jwt.sign(payload, process.env.PASSPORT_JWT_REFRESH_TOKEN, {
        expiresIn: '7d',
    });
};

const getAccessTokenByRefreshToken = async (refreshToken, res) => {
    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.PASSPORT_JWT_REFRESH_TOKEN
        );
        const user = await User.findById(decoded.id);
        if (!user)
            throw new CustomError(httpStatus.NOT_FOUND, 'User not found!');
        const accessToken = generateAccessToken(user._id);
        res.status(httpStatus.OK).json({
            success: true,
            accessToken,
        });
    } catch (error) {
        throw new CustomError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const sendToken = (id, res) => {
    const access_token = generateAccessToken(id);

    const refresh_token = generateRefreshToken(id);

    // Options for cookie
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res.status(httpStatus.OK)
        .cookie('refresh_token', refresh_token, options)
        .json({
            success: true,
            access_token,
        });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateResetPasswordToken,
    sendToken,
    getAccessTokenByRefreshToken,
};
