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

const paypal = require('paypal-rest-sdk');

const ejs = require('ejs');

const app = express();
app.use(cors({
    origin: '*',
}));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.get('/',(req,res) => res.render('index'))

// test Paypal sandbox
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// Authorize url
paypal.openid_connect.authorize_url({'scope': 'openid profile'})
// Get tokeninfo with Authorize code
paypal.openIdConnect.tokeninfo.create("Replace with authorize code", (error, tokeninfo) => {
    console.log(tokeninfo);
});
// Get tokeninfo with Refresh code
paypal.openIdConnect.tokeninfo.refresh("Replace with refresh_token", (error, tokeninfo) => {
    console.log(tokeninfo);
});

// Get userinfo with Access code
paypal.openIdConnect.userinfo.get("Replace with access_code", (error, userinfo) => {
    console.log(userinfo);
});
app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:5000/success",
            "cancel_url": "http://localhost:5000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Iphone 4S",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Iphone 4S cũ giá siêu rẻ"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }

        }
    });

});

app.get('/success', (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(payment);
            res.send('Success (Mua hàng thành công)');
        }
    });
});

app.get('/cancel',(req,res) => res.send('Cancelled (Đơn hàng đã hủy)'));

// end test paypal sandbox

// Custom swagger

// custom option swagger
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

// const URI = process.env.DB_CONNECTION;
// mongoose.connect(
//     URI,
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     },
//     (err) => {
//         if (err) throw err;
//         console.log('Connected to mongodb');
//     }
// );
// const dbHost = process.env.DB_HOST || 'localhost'
// const dbPort = process.env.DB_PORT || 27017
// const dbName = process.env.DB_NAME || 'my_db_name'
// const dbUser = process.env.DB_USER
// const dbUserPassword = process.env.DB_PASSWORD
// const mongoUrl = `mongodb://myuser:myuserpass@127.0.0.1:27017/my_db`
// console.log("mongoUrl", mongoUrl);
// const connectWithRetry = function () {
//     // when using with docker, at the time we up containers. Mongodb take few seconds to starting, during that time NodeJS server will try to connect MongoDB until success.
//     return mongoose.connect(
//         mongoUrl,
//         { useNewUrlParser: true, useUnifiedTopology: true },
//         (err) => {
//             if (err) {
//                 console.error(
//                     'Failed to connect to mongo on startup - retrying in 5 sec',
//                     err
//                 );
//                 setTimeout(connectWithRetry, 5000);
//             }
//         }
//     )
// };
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
