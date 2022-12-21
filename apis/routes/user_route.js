const express = require('express');

const router = express.Router();

const { userController } = require('../controllers');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { uploadImageUser, s3 } = require('../utils/upload');

const { userValidation } = require('../validations');

const validate = require('../middlewares/validate');

const authorize = require('../middlewares/authorize')
/**
 * @swagger
 * tags:
 *   name: User
 *   description: The user managing API
 */
/**
 * @swagger
 * /api/user/upload:
 *   post:
 *     summary: Upload images user
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Upload images successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/upload',
    passport.authenticate('jwt', { session: false }),
    uploadImageUser.single('file'),
    userController.uploadImageUserProfile
);

/**
 * @swagger
 * /api/user/search:
 *   get:
 *     summary: Search user list
 *     tags: [User]
 *     parameters:
 *     - in: query
 *       name: keySearch
 *       type: string
 *       description: input value search user
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
    userController.searchUser
)

/**
 * @swagger
 * /api/user/update/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              firstName:
 *                  type: string
 *              lastName:
 *                  type: string
 *              province:
 *                  type: string
 *              district:
 *                  type: string
 *              ward:
 *                  type: string
 *             required:
 *                 - firstName
 *                 - lastName
 *             examples:
 *                  firstName: doe
 *                  lastName: Join
 *                  province: Thành phố hồ chí minh
 *                  district: Cách mạng tháng 8
 *                  ward: Đường Lê Thị Hoa
 *     responses:
 *       200:
 *         description: Upload images successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.put(
    '/update/profile',
    passport.authenticate('jwt', { session: false }),
    validate(userValidation.updateProfileSchema),
    userController.updateProfileUser
)

module.exports = router;
