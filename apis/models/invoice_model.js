const mongoose = require('mongoose');
const invoiceSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    total: {
        type: Number,
        default: 0,
    },
    amount: {
        type: Number,
        default: 0,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
    deleteFlag: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Invoice', invoiceSchema);