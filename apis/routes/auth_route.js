const express = require('express');
const router = express.Router();

const { authController } = require('../controllers');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/forgot-password', authController.forgotPassword);

router.put('/password/reset/:token', authController.resetPassword);

module.exports = router;
