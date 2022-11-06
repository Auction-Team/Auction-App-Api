const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const CustomError = require('../utils/custom-error');
const { Token, User } = require('../models');
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

const saveToken = async (userId, accessToken) => {
    const tokenByUserId = await findTokenByUserId(userId);
    if (tokenByUserId) await Token.deleteOne({ userId });
    const token = new Token();
    token.userId = userId;
    token.accessToken = accessToken;
    await token.save();
};

const findTokenByUserId = async (userId) => {
    return await Token.findOne({ userId });
};

const deleteTokenOfUserByUserId = async (userId) => {
    await Token.findOneAndDelete({ userId });
};

const sendToken = async (id, res) => {
    const access_token = generateAccessToken(id);

    const refresh_token = generateRefreshToken(id);

    saveToken(id, access_token);

    // Options for cookie refresh token
    const optionsRefreshToken = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res.status(httpStatus.OK)
        .cookie('refresh_token', refresh_token, optionsRefreshToken)
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
    findTokenByUserId,
    deleteTokenOfUserByUserId,
};
