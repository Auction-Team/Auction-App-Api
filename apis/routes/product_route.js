const express = require('express');

const router = express.Router();

const productController = require('../controllers/product_controller');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { productValidation } = require('../validations');

const validate = require('../middlewares/validate');

router.post(
    '/create',
    validate(productValidation.createProductSchema),
    productController.createProduct
);