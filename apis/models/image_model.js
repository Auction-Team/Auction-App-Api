const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
    imageLink: {
        type: String,
    },
    tagId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
    }
});

module.exports = mongoose.model('Image', imageSchema);
