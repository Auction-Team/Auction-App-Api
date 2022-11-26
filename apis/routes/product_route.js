const express = require('express');

const router = express.Router();

const productController = require('../controllers/product_controller');

const passport = require('passport');

const { productValidation } = require('../validations');

const validate = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The auth managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - auctionName
 *         - description
 *         - quantity
 *         - quantityUnit
 *         - mainImage
 *         - subImages
 *         - startingPrice
 *         - startAuctionTime
 *         - endAuctionTime
 *         - category
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *       example:
 *         firstName: doe
 *         lastName: john
 *         fullName: john doe
 *         email: johndoe@gmail.com
 *         password: hoaiphong
 */

/**
 * @swagger
 * /api/product/create:
 *   post:
 *     summary: Login user
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Login success
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    validate(productValidation.createProductSchema),
    productController.createProduct
);


module.exports = router;