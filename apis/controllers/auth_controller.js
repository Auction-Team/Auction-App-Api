const httpStatus = require('http-status');
const { userService, tokenService } = require('../services');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const sendEmail = require('../utils/send_email');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Login user
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userService.getUserByEmail(email);
    if (!user)
        return next(new CustomError(httpStatus.NOT_FOUND, 'Email not exists'));
    if (!(await userService.comparePassword(password, user.password)))
        return next(
            new CustomError(httpStatus.BAD_REQUEST, 'Password not correct')
        );

    await tokenService.sendToken(user._id, res);
});

// Register user
const register = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (await userService.checkEmailExists(email))
        return next(new CustomError(httpStatus.BAD_REQUEST, 'Email is exists'));

    const user = await userService.createUser({ ...req.body });
    return res.status(httpStatus.OK).json({
        success: true,
        message: user,
    });
});

// forgot password user
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const user = await userService.checkEmailExists(email);
    if (!user)
        return next(
            new CustomError(httpStatus.BAD_REQUEST, 'Email is not exists')
        );

    // Get rest token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/auth/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Auction App Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`,     
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new CustomError(httpStatus.INTERNAL_SERVER_ERROR, error.message)
        );
    }
});

// Rest Password
const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    const user = await userService.getUserByPasswordToken(token);
    if (!user)
        return next(
            new CustomError(
                httpStatus.BAD_REQUEST,
                'Password reset token is invalid or has been expired'
            )
        );

    if (password !== confirmPassword)
        return next(
            new CustomError(httpStatus.BAD_REQUEST, 'Password does not match')
        );

    // Set up new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Update password successfully',
    });
});

const refreshToken = catchAsync(async (req, res, next) => {
    const { refresh_token } = req.cookies;
    if (!refresh_token)
        return next(new CustomError(httpStatus.BAD_REQUEST, 'Please logging'));
    tokenService.getAccessTokenByRefreshToken(refresh_token, res);
});

const logout = catchAsync(async (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.user.id);

    await tokenService.deleteTokenOfUserByUserId(userId);

    res.cookie('refresh_token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Logout successfully',
    });
});

const profile = catchAsync(async (req, res, next) => {
    const user = await userService.getUserProfile(req.user._id.toString());

    if (!user)
        return next(new CustomError(httpStatus.NOT_FOUND, 'User not exists'));

    return res.status(httpStatus.OK).json({
        success: true,
        user,
    });
});

const changePassword = catchAsync(async (req, res, next) => {
    const id = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const user = await userService.getUserById(id);
    const isMatchPassword = await bcrypt.compare(oldPassword, user.password);
    if (isMatchPassword) {
        const newPasswordBcrypt = await bcrypt.hash(newPassword, 10);
        user.password = newPasswordBcrypt;
        user.save();
    }
    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Change password successfully',
    });
});

const secret = (req, res, next) => {
    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Test passport',
    });
};

module.exports = {
    login,
    register,
    forgotPassword,
    resetPassword,
    secret,
    refreshToken,
    logout,
    profile,
    changePassword,
};
