const mongoose = require('mongoose');
const tagSchema = new mongoose.Schema({
    labelVi: {
        type: String,
    },
    labelEn: {
        type: String,
    },
    image:{
        type: mongoose.Types.ObjectId,
        require: false
    }
});

module.exports = mongoose.model('Tag', tagSchema);
