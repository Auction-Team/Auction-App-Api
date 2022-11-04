const mongoose = require('mongoose');
const tagSchema = new mongoose.Schema({
    labelVi: {
        type: String,
    },
    labelEn: {
        type: String,
    },
    // productId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Product',
    // }
});

module.exports = mongoose.model('Tag', tagSchema);
