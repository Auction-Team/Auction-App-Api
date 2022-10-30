const jwt = require('jsonwebtoken');

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

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateResetPasswordToken,
};
