const express = require('express');
const router = express.Router();

//Client
const authRoute = require('./auth_route');
const userRoute = require('./user_route');
const productRoute = require('./product_route');
const paypalRoute = require('./paypal_route');
const addressRoute = require('./address_route');
//Routes
router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/product', productRoute);
router.use('/paypal',paypalRoute);
router.use('/address',addressRoute);
module.exports = router;
