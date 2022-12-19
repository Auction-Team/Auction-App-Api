const express = require('express');
const router = express.Router();

//Client
const authRoute = require('./auth_route');
const userRoute = require('./user_route');
const productRoute = require('./product_route');
const paypalRoute = require('./paypal_route');
const addressRoute = require('./address_route');
const categoryRoute = require('./category_route');
const cartRoute = require('./cart_route');
const invoiceRoute = require('./invoice_route');
//Routes
router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/product', productRoute);
router.use('/paypal', paypalRoute);
router.use('/address', addressRoute);
router.use('/category', categoryRoute);
router.use('/cart', cartRoute);
router.use('/invoice', invoiceRoute);
module.exports = router;
