require('dotenv').config();

const express = require('express');

const cors = require('cors');

const mongoose = require('mongoose');

const errorMiddleware = require('./apis/middlewares/errorMiddleware');

const cookieParser = require('cookie-parser');

const passport = require('passport');

const cookieSession = require('cookie-session');

const tokenService = require('./apis/services/token_service');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Routes
app.use('/api', require('./apis/routes/index'));

// Handle Uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down server due to uncaught exception');
    process.exit(1);
});

// config cookie session
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: ['test'],
    })
);

// Config passport
app.use(passport.initialize());

app.use(passport.session());

// Oauth Google
app.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// Retrieve user data using the access token received
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        tokenService.sendToken(req.user._id, res);
    }
);

// middleWares handle error
app.use(errorMiddleware);

const URI = process.env.DB_CONNECTION;
mongoose.connect(
    URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        if (err) throw err;
        console.log('Connected to mongodb');
    }
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
