const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const paypal = require('paypal-rest-sdk');
const { reconcileService } = require('../services');
const { randomUUID } = require('crypto'); 

const depositTitle='Deposit money into the system';
const inwardType='IN';
const outwardType='OUT';
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET,
});

const createPayment = catchAsync(async (req, res, next) => {
    let transactionalMoney=req.body.transactionalMoney;

    const create_payment_json = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal',
        },
        'redirect_urls': {
            'return_url': process.env.FE_DOMAIN+'/api/paypal/inward/success',
            'cancel_url': process.env.FE_DOMAIN+'/api/paypal/inward/cancel',
        },
        'transactions': [{
            'item_list': {
                'items': [{
                    'name': depositTitle,
                    'sku': '000',
                    'price': transactionalMoney.toString(),
                    'currency': 'USD',
                    'quantity': 1,
                }],
            },
            'amount': {
                'currency': 'USD',
                'total': transactionalMoney.toString(),
            },
            'description': 'Deposit money into the system with Paypal.',
        }],
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }

        }
    });
});

const successPayment = catchAsync(async (req, res, next) => {
    const payerId = req.body.PayerID;
    const paymentId = req.body.paymentId;
    const accountId=req.user.id;
    const transactionalMoney=req.body.transactionalMoney;

    const execute_payment_json = {
        'payer_id': payerId,
        'transactions': [{
            'amount': {
                'currency': 'USD',
                'total': transactionalMoney.toString(),
            },
        }],
    };
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            //throw error;
            return next(new CustomError(httpStatus.BAD_REQUEST, ''));
           
        } else {
            console.log(payment);
            var rid=randomUUID()+new Date().toISOString().replace(/:/g, '-');
            //res.send('Nạp tiền thành công');
            reconcileService.createReconcile(rid,depositTitle,transactionalMoney,'USD',inwardType,accountId);
            return res.status(httpStatus.OK).send({success: true});
        }
    });
});

//Don't need it (NMĐ)
const cancelPayment = catchAsync(async (req, res, next) => {
    res.send('Transaction has been cancel');
});

module.exports = {
    createPayment,
    successPayment,
    cancelPayment
};