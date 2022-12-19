const express = require('express');

const router = express.Router();

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { paypal_controller } = require('../controllers');

router.post(
    '/pay',
    //passport.authenticate('jwt', { session: false }),
    paypal_controller.createPayment,
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

module.exports = router;