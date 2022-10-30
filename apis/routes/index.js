const express = require('express');
const router = express.Router();

//Client
const authRoute = require('./auth_route');
//Routes

router.use('/auth', authRoute);

module.exports = router;
