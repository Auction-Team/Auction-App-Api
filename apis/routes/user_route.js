const express = require('express');

const router = express.Router();

const { userController } = require('../controllers');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { uploadImageUser, s3 } = require('../utils/upload');
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
    userController.searchUser
)

module.exports = router;
