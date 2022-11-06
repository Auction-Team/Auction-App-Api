const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
    imageLink: {
        type: String,
    },
});

module.exports = mongoose.model('Image', imageSchema);
