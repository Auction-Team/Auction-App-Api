const express = require('express');
const router = express.Router();

//Client
const authRoute = require('./auth_route');
const productRoute = require('./product_route');
//Routes
router.use('/auth', authRoute);
router.use('/product', productRoute);
module.exports = router;
