const express = require('express');

const router = express.Router();

const { authController } = require('../controllers');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

const { authValidation } = require('../validations');

const validate = require('../middlewares/validate');

router.post(
    '/login',
    validate(authValidation.loginSchema),
    authController.login
);

router.post(
    '/register',
    validate(authValidation.registerSchema),
    authController.register
);

router.post(
    '/forgot-password',
    validate(authValidation.forgotPasswordSchema),
    authController.forgotPassword
);

router.put(
    '/password/reset/:token',
    validate(authValidation.activateTokenForgotPasswordSchema),
    authController.resetPassword
);

router.get('/refresh/token', authController.refreshToken);

router.get(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    authController.logout
);

router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    authController.profile
);

router.get(
    '/secret',
    passport.authenticate('jwt', { session: false }),
    authController.secret
);

module.exports = router;
