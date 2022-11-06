const mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    accessToken: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Token = mongoose.model('token', tokenSchema);

module.exports = { Token };
