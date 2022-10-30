require('dotenv').config();

const express = require('express');

const cors = require('cors');

const mongoose = require('mongoose');

const errorMiddleware = require('./apis/middlewares/errorMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./apis/routes/index'));

// Handle Uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down server due to uncaught exception');
    process.exit(1);
});

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
