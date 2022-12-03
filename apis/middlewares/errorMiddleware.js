const httpStatus = require('http-status');
const CustomError = require('../utils/custom-error');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;

    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        console.log('development','in development');
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack,
        });
    }

    if (process.env.NODE_ENV === 'PRODUCTION') {
        let error = { ...err };
        error.message = err.message;

        // Handling wrong JWT error
        if (err.name === 'JsonWebTokenError') {
            const message = 'Json Web Token is invalid. Try again!!!';
            error = new CustomError(httpStatus.BAD_REQUEST, message);
        }

        // Handling Expired JWT error
        if (err.name === 'TokenExpiredError') {
            const message = 'Json Web Token is expired. Try again!!!';
            error = new CustomError(httpStatus.BAD_REQUEST, message);
        }
        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};
