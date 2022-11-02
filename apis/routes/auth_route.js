const express = require('express');

const router = express.Router();

const { authController } = require('../controllers');

const passport = require('passport');

const passportConfig = require('../middlewares/passport');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/forgot-password', authController.forgotPassword);

router.put('/password/reset/:token', authController.resetPassword);

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
