const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model('Cart', cartSchema)