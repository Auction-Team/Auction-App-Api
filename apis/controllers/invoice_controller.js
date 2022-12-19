const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const { invoiceService } = require('../services');
const Invoice = require('../models/invoice_model');
const mongoose = require('mongoose');

const listInvoiceByUser = catchAsync(async (req, res, next) => {
    const userId = mongoose.Types.ObjectId(req.user.id);
    const datas = await Invoice.aggregate()
        .match({
            buyer: userId,
            deleteFlag: false
        })
        .lookup({
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productResult',
        })
        .unwind('$productResult')
        .project({
            total: 1,
            amount: 2,
            productName: '$productResult.auctionName',
            mainImage: '$productResult.mainImage',
            productId: '$productResult._id',
            createdDate: 3,
            buyer: 5
        })

    return res.status(httpStatus.OK).json({
        success: true,
        datas
    });
})

const createInvoice = catchAsync(async (req, res, next) => {
    const { productId, total, amount } = req.body;
    const userId = req.user.id;
    const newInvoice = await invoiceService.createInvoice(productId, userId, total, amount);
    if (newInvoice) {
        return res.status(httpStatus.OK).json({
            success: true,
            newInvoice,
        });
    }
    return next(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Interal Server Error'));
});

const deleteInvoice = catchAsync(async (req, res, next) => {
    const { invoiceId } = req.params;
    const isValidInvoiceId = mongoose.Types.ObjectId.isValid(invoiceId);
    if (!isValidInvoiceId)
        return next(new CustomError(httpStatus.BAD_REQUEST, 'Invoice id not found'));
    const invoiceIdMongo = mongoose.Types.ObjectId(invoiceId);
    const invoiceById = await Invoice.findById(invoiceIdMongo);
    if(!invoiceById)
        return next(new CustomError(httpStatus.BAD_REQUEST, 'Invoice id not found'));
    invoiceById.deleteFlag = true;
    await invoiceById.save();
    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Delete invoice successfully',
    });
});

module.exports = {
    listInvoiceByUser,
    deleteInvoice,
    createInvoice,
};