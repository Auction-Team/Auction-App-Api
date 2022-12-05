const express = require('express');

const router = express.Router();

const { authController } = require('../controllers');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { authValidation } = require('../validations');

const { uploadImageUser, s3 } = require('../utils/upload');

const validate = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The auth managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fistName
 *         - lastName
 *         - fullName
 *         - email
 *         - password
 *         - province
 *         - district
 *         - ward
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
 *         province:
 *           type: string
 *         district:
 *           type: string
 *         ward:
 *           type: string
 *       example:
 *         firstName: doe
 *         lastName: john
 *         fullName: john doe
 *         email: johndoe@gmail.com
 *         password: hoaiphong
 *         province: Thành phố hố chí minh
 *         district: Cách mạng tháng 8
 *         ward: Đường lê thị hoa
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              email:
 *                  type: string
 *              password:
 *                  type: string
 *           example:
 *              email: longtam20015@gmail.com
 *              password: hoaiphong
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
    '/login',
    validate(authValidation.loginSchema),
    authController.login,
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Register success
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/register',
    validate(authValidation.registerSchema),
    authController.register,
);

/**
 * @swagger
 * /api/auth/forgot/password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              email:
 *                  type: string
 *             example:
 *               email: johndoe@gmail.com
 *     responses:
 *       200:
 *         description: Forgot password success
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.post(
    '/forgot/password',
    validate(authValidation.forgotPasswordSchema),
    authController.forgotPassword,
);

/**
 * @swagger
 * /api/auth/password/reset/{token}:
 *   put:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *      - in: path
 *        name: token
 *        schema:
 *          type: string
 *        required: true
 *        description: Token reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              password:
 *                  type: string
 *              confirmPassword:
 *                  type: string
 *             required:
 *                 - password
 *                 - confirmPassword
 *             examples:
 *                  password: 1234567
 *                  confirmPassword: 1234567
 *     responses:
 *       200:
 *         description: Rest password successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.put(
    '/password/reset/:token',
    validate(authValidation.activateTokenForgotPasswordSchema),
    authController.resetPassword,
);

/**
 * @swagger
 * /api/auth/refresh/token:
 *  get:
 *      summary: Refresh token
 *      tags: [Auth]
 *      description: API Refresh token
 *      responses:
 *          '200':
 *              description: Refresh token successfully
 *          '400':
 *              description: Bad request
 *          '500':
 *              description: Internal server error
 */
router.get('/refresh/token', authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *  get:
 *      summary: Logout
 *      tags: [Auth]
 *      description: API logout
 *      responses:
 *          '200':
 *              description: Logout successfully
 *          '400':
 *              description: Bad request
 *          '500':
 *              description: Internal server error
 */
router.get(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    authController.logout,
);

/**
 * @swagger
 * /api/auth/profile:
 *  get:
 *      summary: Profile
 *      tags: [Auth]
 *      description: API Profile
 *      responses:
 *          '200':
 *              description: Get Profile successfully
 *          '400':
 *              description: Bad request
 *          '500':
 *              description: Internal server error
 */
router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    authController.profile,
);

/**
 * @swagger
 * /api/auth/change/password:
 *   put:
 *     summary: Change password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              oldPassword:
 *                  type: string
 *              newPassword:
 *                  type: string
 *              confirmNewPassword:
 *                  type: string
 *             examples:
 *                  oldPassword: oldPassword
 *                  newPassword: newPassword
 *                  confirmNewPassword: confirmNewPassword
 *     responses:
 *       200:
 *         description: Change password successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 *
 */
router.put(
    '/change/password',
    passport.authenticate('jwt', { session: false }),
    validate(authValidation.changePasswordSchema),
    authController.changePassword,
);

/**
 * @swagger
 * /api/auth/secret:
 *  get:
 *      security:
 *          - bearerAuth: []
 *      summary: test authorization
 *      tags: [Auth]
 *      description: use to test authorization JWT
 *      responses:
 *          '200':
 *              description: success
 *          '500':
 *                  description: Internal server error
 */
router.get(
    '/secret',
    // passport.authenticate('jwt', { session: false }),
    authController.secret,
);

router.post('/upload', uploadImageUser.single('file'), async (req, res, err) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.file.key,
    };
    const data = await s3.getSignedUrl('getObject', params);
    res.status(200).json(data);
});

module.exports = router;
