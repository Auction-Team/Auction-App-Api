const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const { auctionPaymentService, userService } = require('../services');

const placePrice = catchAsync(async (req, res,next) => {
    try {
        const temporyDebit = await auctionPaymentService.createTemporyDebit({...req.body},req.user.id);
        const userInfo=await userService.getUserById(req.user.id);
        console.log("Add new product finished")
        console.log(temporyDebit)
        return res.status(httpStatus.OK).send({temporyDebit: {
            ...temporyDebit._doc
            }, 
            userInfo:{
                ...userInfo._doc
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
})

module.exports = {
    placePrice
};