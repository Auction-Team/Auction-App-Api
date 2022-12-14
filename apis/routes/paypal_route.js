const express = require('express');

const router = express.Router();

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { paypal_controller } = require('../controllers');

router.post(
    '/pay',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.createPayment,
);

router.post(
    '/withdraw/create',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.createWithdraw,
);

router.post(
    '/withdraw',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.withdrawMoney,
);

router.post(
    '/capture-order',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.capturePaymentOrder,
);

router.post(
    '/success',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.successPayment
)

router.get(
    '/cancel',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.cancelPayment
)

router.get(
    '/all-transaction',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.getAllTransaction
)

router.get(
    '/withdraw/all-request',
    passport.authenticate('jwt', { session: false }),
    paypal_controller.getAllWithDrawRequest
)

module.exports = router;