require('dotenv').config();

const express = require('express');

const cors = require('cors');

const mongoose = require('mongoose');

const errorMiddleware = require('./apis/middlewares/errorMiddleware');

const cookieParser = require('cookie-parser');

const passport = require('passport');

const cookieSession = require('cookie-session');

const tokenService = require('./apis/services/token_service');

const swaggerUI = require('swagger-ui-express');

const swaggerJsDoc = require('swagger-jsdoc');

const SocketServer = require('./socketServer')

const {ExpressPeerServer} = require('peer')


const app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

// Socket
const http = require('http').createServer(app)
const io = require('socket.io')(http)

io.on('connection', socket => {
    console.log(socket.id + "connected")
    SocketServer(socket)
})

// Create peer server
ExpressPeerServer(http, {path: '/'})

// // custom option swagger
options = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'API Auction APP',
        },
        servers: [
            {
                url:
                    `${process.env.SWAGGER_URL}:${process.env.PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    name: 'Authorization',
                    bearerFormat: 'JWT',
                    in: 'header',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [`${__dirname}/apis/routes/*.js`, 'server.js'],
};
// config swagger
const spec = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(spec));

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
    }),
);

// Config passport
app.use(passport.initialize());

app.use(passport.session());



// Oauth Google
app.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    }),
);

// Retrieve user data using the access token received
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        tokenService.sendToken(req.user._id, res);
    },
);

// middleWares handle error
app.use(errorMiddleware);

const URI = process.env.DB_CONNECTION;
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, err => {
    if (err) throw err;
    console.log('Connected to mongodb');
});



// connectWithRetry()
const port = process.env.PORT || 5000;

http.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
let count = 0;



