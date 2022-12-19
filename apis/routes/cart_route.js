const express = require('express');

const router = express.Router();

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { cartController, categoryController } = require('../controllers');

const { cartValidation, categoryValidation } = require('../validations');

const validate = require('../middlewares/validate');
const authorize = require('../middlewares/authorize');
/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: The cart managing API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - products
 *       properties:
 *         products:
 *           type: array
 *       example:
 *         products: []
 */
/**
 * @swagger
 * /api/cart/list:
 *   get:
 *     summary: Get cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Get cart successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get(
    '/list',
    passport.authenticate('jwt', { session: false }),
    cartController.getCartByUser,
);
/**
 * @swagger
 * /api/cart/save:
 *   post:
 *     summary: Save cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       200:
 *         description: Save cart successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/save',
    passport.authenticate('jwt', { session: false }),
    validate(cartValidation.saveCartSchema),
    cartController.saveCart,
);

/**
 * @swagger
 * /api/cart/remove:
 *   post:
 *     summary: Remove cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Cart'
 *     responses:
 *       200:
 *         description: Remove cart successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/remove',
    passport.authenticate('jwt', { session: false }),
    validate(cartValidation.saveCartSchema),
    cartController.deleteCartInProductList,
);

module.exports = router;