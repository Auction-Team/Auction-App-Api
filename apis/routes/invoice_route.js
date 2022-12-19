const express = require('express');

const router = express.Router();

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { invoiceController } = require('../controllers');

const { categoryValidation, invoiceValidation } = require('../validations');

const validate = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: The category invoice API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         total:
 *           type: number
 *         amount:
 *           type: number
 *       example:
 *         productId: 63982deaf1c0689128a2c49f
 *         total: 50
 *         amount: 2
 */
/**
 * @swagger
 * /api/invoice/list:
 *   get:
 *     summary: List invoice by user id
 *     tags: [Invoice]
 *     responses:
 *       200:
 *         description: Get list invoice successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get(
    '/list',
    passport.authenticate('jwt', { session: false }),
    invoiceController.listInvoiceByUser,
);
/**
 * @swagger
 * /api/invoice/create:
 *   post:
 *     summary: Create invoice
 *     tags: [Invoice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Invoice'
 *     responses:
 *       200:
 *         description: Create invoice successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    validate(invoiceValidation.saveInvoiceSchema),
    invoiceController.createInvoice,
);
/**
 * @swagger
 * /api/invoice/delete/{invoiceId}:
 *   delete:
 *     summary: Delete cart
 *     tags: [Invoice]
 *     parameters:
 *      - in: path
 *        name: invoiceId
 *        schema:
 *          type: string
 *        required: true
 *        description: Id invoice
 *     responses:
 *       200:
 *         description: Delete invoice successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.delete(
    '/delete/:invoiceId',
    passport.authenticate('jwt', { session: false }),
    invoiceController.deleteInvoice,
);

module.exports = router;