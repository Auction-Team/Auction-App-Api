const express = require('express');

const router = express.Router();

const productController = require('../controllers/product_controller');

const passport = require('passport');

const { productValidation } = require('../validations');

const validate = require('../middlewares/validate');


router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    validate(productValidation.createProductSchema),
    productController.createProduct
);


module.exports = router;