const express = require('express');

const router = express.Router();

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { paypal_controller } = require('../controllers');

router.post(
    '/pay',
    // passport.authenticate('jwt', { session: false }),
    paypal_controller.createPayment,
);

router.get(
    '/success',
    paypal_controller.successPayment
)

router.get(
    '/cancel',
    paypal_controller.cancelPayment
)

module.exports = router;