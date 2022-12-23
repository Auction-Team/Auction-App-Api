const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const { auctionPaymentService, userService, productService } = require('../services');

const placeBid = catchAsync(async (req, res,next) => {
    try {
        const {productId,auctionMoney}=req.body;
        const product=await productService.getProductById(productId);
        let currentDateTime=new Date();
        console.log('product: '+product);
        if(product==null){
            res.status(400).json({ success: false, message: 'Product not exists' });
        }
        if(product.startAuctionTime>=currentDateTime&&product.endAuctionTime <=currentDateTime){
            res.status(400).json({ success: false, message: 'Can not bid on this item because it is not time for auction yet' });
        }
        if(auctionMoney<product.startingPrice){
            res.status(400).json({ success: false, message: 'This product cannot be auctioned for less than the starting price' });
        }
        const temporyDebit = await auctionPaymentService.createTemporyDebit({...req.body},req.user.id);
        if(temporyDebit=='NOT_ENOUGH_AVAILABLE_MONEY'){
            res.status(400).json({ success: false, message: 'You don not have enough money for place place bid for product'});
        }
        const userInfo=await userService.getUserById(req.user.id);
        console.log("Add new tempory debit")
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

const placeNewBid = catchAsync(async (req, res,next) => {
    try {
        const {productId, auctionMoney}=req.body;
        const temporyDebit = await auctionPaymentService.getTemporyDebitByAccountAndProduct(req.user.id,productId);
        const product=await productService.getProductById(productId);
        const currentDate=new Date();
        if(temporyDebit==null){
            res.status(400).json({ success: false, message: 'Not found old bid!'});
        }
        if(product.startAuctionTime>=currentDate&&product.endAuctionTime <=currentDate){
            res.status(400).json({ success: false, message: 'Can not bid on this item because it is not time for auction yet' });
        }
        if(auctionMoney<product.startingPrice){
            res.status(400).json({ success: false, message: 'This product cannot be auctioned for less than the starting price' });
        }
        const newTemporyDebit=await auctionPaymentService.updateTemporyDebit({...req.body},req.user.id);
        if(newTemporyDebit=='NOT_ENOUGH_AVAILABLE_MONEY'){
            res.status(400).json({ success: false, message: 'You don not have enough money for place place bid for product'});
        }
        const userInfo=await userService.getUserById(req.user.id);
        console.log("Add new tempory debit")
        console.log(newTemporyDebit)
        return res.status(httpStatus.OK).send({temporyDebit: {
                ...newTemporyDebit._doc
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

const doEndAuction = catchAsync(async (req, res,next) => {
    try {
        const {productId}=req.body;
        const product=await productService.getProductById(productId);
        let currentDateTime=new Date();
        if(product.endAuctionTime>=currentDateTime){
           return res.status(400).json({ success: false, message: 'The auction cannot be closed before the end of the auction' });
        }
        const winner = await auctionPaymentService.deleteAllTemporyByProduct(productId);
        if(winner=='NO_USER_PARTICIPANT_TO_AUCTION'){
            res.status(400).json({ success: false, message: 'No user participant to auction'});
        }
        console.log(winner)
        return res.status(httpStatus.OK).send({winner: true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
})

module.exports = {
    placeBid,
    placeNewBid,
    doEndAuction
};