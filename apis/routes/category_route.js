const express = require('express');

const router = express.Router();

const { categoryController } = require('../controllers');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const authorize = require('../middlewares/authorize');

const { categoryValidation } = require('../validations');

const validate = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: The category managing API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *       example:
 *         name: Category name
 *         description: Description Category
 */

/**
 * @swagger
 * /api/category/search:
 *   get:
 *     summary: Search category list
 *     tags: [Category]
 *     parameters:
 *     - in: query
 *       name: keySearch
 *       type: string
 *       description: input value search category
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
    authorize,
    categoryController.searchCategory
)
/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Create category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Create category successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    authorize,
    validate(categoryValidation.createCategorySchema),
    categoryController.createCategory,
);

/**
 * @swagger
 * /api/category/update/{categoryId}:
 *   put:
 *     summary: Create category
 *     tags: [Category]
 *     parameters:
 *      - in: path
 *        name: categoryId
 *        schema:
 *          type: string
 *        required: true
 *        description: Id category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Update category successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.put(
    '/update/:categoryId',
    passport.authenticate('jwt', { session: false }),
    authorize,
    validate(categoryValidation.createCategorySchema),
    categoryController.updateCategory,
);

/**
 * @swagger
 * /api/category/detail/{categoryId}:
 *   get:
 *     summary: Detail category
 *     tags: [Category]
 *     parameters:
 *      - in: path
 *        name: categoryId
 *        schema:
 *          type: string
 *        required: true
 *        description: Id category
 *     responses:
 *       200:
 *         description: Get category by id successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.get(
    '/detail/:categoryId',
    passport.authenticate('jwt', { session: false }),
    authorize,
    categoryController.detailCategory
)

/**
 * @swagger
 * /api/category/delete/{categoryId}:
 *   delete:
 *     summary: Delete category
 *     tags: [Category]
 *     parameters:
 *      - in: path
 *        name: categoryId
 *        schema:
 *          type: string
 *        required: true
 *        description: Id category
 *     responses:
 *       200:
 *         description: Delete category successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.delete(
    '/delete/:categoryId',
    passport.authenticate('jwt', { session: false }),
    authorize,
    categoryController.deleteCategory
)

module.exports = router;