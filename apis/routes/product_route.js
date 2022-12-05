const express = require('express');

const router = express.Router();

const productController = require('../controllers/product_controller');

const passport = require('passport');

const { productValidation } = require('../validations');

const validate = require('../middlewares/validate');

const {uploadSingleImageProduct, s3 } = require('../utils/upload');

router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    validate(productValidation.createProductSchema),
    productController.createProduct
);

router.post(
    '/upload',
    passport.authenticate('jwt', { session: false }),
    uploadSingleImageProduct.single('file'),
    productController.uploadProductImage
);


module.exports = router;