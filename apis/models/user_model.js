const mongoose = require('mongoose');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 15,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
    },
    fullName: {
        type: String,
        required: true,
        maxlength: 30,
    },
    avatar: {
        type: String,
        default:
            'user/hinh-anh-chill+(2).jpg',
    },
    firstUpload: {
        type: Boolean,
        default: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        private: true,
    },
    role: {
        type: String,
        default: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    province: {
        type: String,
        maxlength: 255,
    },
    district: {
        type: String,
        maxlength: 255,
    },
    ward: {
        type: String,
        maxlength: 255,
    },
    accountBalance: {
        type: Number,
        require:false,
        default:0
    },
    availableBalance: {
        type: Number,
        require:false,
        default:0
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
