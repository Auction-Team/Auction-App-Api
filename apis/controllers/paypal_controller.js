const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET,
});

const createPayment = catchAsync(async (req, res, next) => {
    const create_payment_json = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal',
        },
        'redirect_urls': {
            'return_url': 'http://localhost:5000/api/paypal/success',
            'cancel_url': 'http://localhost:5000/api/paypal/cancel',
        },
        'transactions': [{
            'item_list': {
                'items': [{
                    'name': 'Iphone 4S',
                    'sku': '001',
                    'price': '25.00',
                    'currency': 'USD',
                    'quantity': 1,
                }],
            },
            'amount': {
                'currency': 'USD',
                'total': '25.00',
            },
            'description': 'Iphone 4S cũ giá siêu rẻ',
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
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        'payer_id': payerId,
        'transactions': [{
            'amount': {
                'currency': 'USD',
                'total': '25.00',
            },
        }],
    };
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(payment);
            res.send('Success (Mua hàng thành công)');
        }
    });
});

const cancelPayment = catchAsync(async (req, res, next) => {
    res.send('Cancelled (Đơn hàng đã hủy)');
});

module.exports = {
    createPayment,
    successPayment,
    cancelPayment
};