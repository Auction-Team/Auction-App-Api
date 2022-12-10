const express = require('express');

const router = express.Router();

const productController = require('../controllers/product_controller');

const passport = require('passport');

const { productValidation } = require('../validations');

const validate = require('../middlewares/validate');

const {uploadSingleImageProduct, s3 } = require('../utils/upload');


router.get(
    '/category/list',
    productController.getAllCategory
);

router.get(
    '/detail',
    productController.getDetailProduct
);

router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    validate(productValidation.createProductSchema),
    productController.createProduct
);

router.put(
    '/edit',
    passport.authenticate('jwt', { session: false }),
    validate(productValidation.createProductSchema),
    productController.updateProduct
);

router.delete(
    '/delete',
    passport.authenticate('jwt', { session: false }),
    productController.deleteProduct
);

router.post(
    '/upload',
    passport.authenticate('jwt', { session: false }),
    uploadSingleImageProduct.single('file'),
    productController.uploadProductImage
);

module.exports = router;