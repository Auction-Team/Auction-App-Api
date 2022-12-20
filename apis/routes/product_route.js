const express = require('express');

const router = express.Router();

const productController = require('../controllers/product_controller');

const passport = require('passport');

const { productValidation } = require('../validations');

const validate = require('../middlewares/validate');

const {uploadSingleImageProduct, s3 } = require('../utils/upload');

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The product managing API
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
 *         - owner
 *       properties:
 *         auctionName:
 *           type: string
 *         description:
 *           type: string
 *         quantity:
 *           type: number
 *         quantityUnit:
 *           type: string
 *         mainImage:
 *           type: string
 *         subImages:
 *           type: string
 *         startingPrice:
 *           type: number
 *         startAuctionTime:
 *           type: string
 *         endAuctionTime:
 *           type: string
 *         category:
 *           type: string
 *         owner:
 *           type: string
 *       example:
 *         auctionName: Iphone X
 *         description: điện thoại apple
 *         quantity: 1
 *         quantityUnit: "1"
 *         startingPrice: 100000
 *         startAuctionTime: 2022-12-20T09:12:28.000+00:00
 *         endAuctionTime: 2022-12-30T09:12:28.000+00:00
 *         category: 63982d56558272f4da1d32ed
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProduct:
 *       type: object
 *       required:
 *         - auctionName
 *         - description
 *         - quantity
 *         - quantityUnit
 *         - startingPrice
 *         - startAuctionTime
 *         - endAuctionTime
 *         - category
 *       properties:
 *         auctionName:
 *           type: string
 *         description:
 *           type: string
 *         quantity:
 *           type: number
 *         quantityUnit:
 *           type: string
 *         startingPrice:
 *           type: number
 *         startAuctionTime:
 *           type: string
 *         endAuctionTime:
 *           type: string
 *         category:
 *           type: string
 *       example:
 *         auctionName: Iphone X
 *         description: điện thoại apple
 *         quantity: 1
 *         quantityUnit: "1"
 *         startingPrice: 100000
 *         startAuctionTime: 2022-12-20T09:12:28.000+00:00
 *         endAuctionTime: 2022-12-30T09:12:28.000+00:00
 *         category: 63982d56558272f4da1d32ed
 */

/**
 * @swagger
 * /api/product/search:
 *   get:
 *     summary: Search product list
 *     tags: [Product]
 *     parameters:
 *     - in: query
 *       name: keySearch
 *       type: string
 *       description: input value search product
 *     - in: query
 *       name: multiSearchEnum
 *       type: string
 *       description: column search
 *     - in: query
 *       name: page
 *       type: integer
 *       description: page of list data
 *     - in: query
 *       name: size
 *       type: integer
 *       description: size of list data
 *     - in: query
 *       name: sort
 *       type: string
 *       description: column search
 *     responses:
 *       200:
 *         description: Upload images successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get(
    '/search',
    passport.authenticate('jwt', { session: false }),
    productController.searchProducts
)

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The product managing API
 */

/**
 * @swagger
 * /api/product/my/search:
 *   get:
 *     summary: Get my product list
 *     tags: [Product]
 *     parameters:
 *     responses:
 *       200:
 *         description: Upload images successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get(
    '/my/search',
    passport.authenticate('jwt', { session: false }),
    productController.searchOwnerProducts
)

/**
 * @swagger
 * /api/product/category/list:
 *  get:
 *      summary: Get category
 *      tags: [Product]
 *      description: Get all category
 *      responses:
 *          '200':
 *              description: Get category successfully
 *          '400':
 *              description: Bad request
 *          '500':
 *              description: Internal server error
 */
router.get(
    '/category/list',
    productController.getAllCategory
);

/**
 * @swagger
 * /api/product/detail/{productId}:
 *  get:
 *      summary: Get detail product
 *      tags: [Product]
 *      description: Get product by product ID
 *      parameters:
 *      - in: path
 *        name: productId
 *        schema:
 *          type: string
 *        required: true
 *        description: Product ID
 *      responses:
 *          '200':
 *              description: Get product successfully
 *          '400':
 *              description: Bad request
 *          '500':
 *              description: Internal server error
 */
router.get(
    '/detail/:productId',
    productController.getDetailProduct
);
/**
 * @swagger
 * /api/product/create:
 *   post:
 *     summary: Create product
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
 *         description: Create product successfully
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


/**
 * @swagger
 * /api/product/edit/{productId}:
 *   put:
 *     summary: Update product
 *     tags: [Product]
 *     parameters:
 *      - in: path
 *        name: productId
 *        schema:
 *          type: string
 *        required: true
 *        description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Update product successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.put(
    '/edit/:productId',
    passport.authenticate('jwt', { session: false }),
    validate(productValidation.createProductSchema),
    productController.updateProduct
);

/**
 * @swagger
 * /api/product/delete/{productId}:
 *  delete:
 *      summary: Delete product
 *      tags: [Product]
 *      description: Delete product by product ID
 *      parameters:
 *      - in: path
 *        name: productId
 *        schema:
 *          type: string
 *        required: true
 *        description: Product ID
 *      responses:
 *          '200':
 *              description: Delete product successfully
 *          '400':
 *              description: Bad request
 *          '500':
 *              description: Internal server error
 */
router.delete(
    '/delete/:productId',
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