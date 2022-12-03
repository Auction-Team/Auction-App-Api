const express = require('express');

const router = express.Router();

const { userController } = require('../controllers');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { uploadImageUser, s3 } = require('../utils/upload');

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
    // passport.authenticate('jwt', { session: false }),
    // authorize,
    userController.searchUser
)

module.exports = router;
