const express = require('express');

const router = express.Router();

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { auctionPaymentController } = require('../controllers');

router.post(
    '/place',
    passport.authenticate('jwt', { session: false }),
    auctionPaymentController.placePrice,
);

module.exports = router;