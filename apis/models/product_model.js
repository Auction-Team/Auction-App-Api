const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 255
    },
    brief: {
        type: String,
        maxlength: 500
    },
    description: {
        type: String,
        maxlength: 5000
    },
    quantity:{
        type:Number,
        default:0
    },
    startingPrice:{
        type: Float64Array
    },
    startAuctionTime:{
        type: Date,
        require:true
    },
    endAuctionTime:{
        type: Date,
        require: true
    },
    listTags: [{
        type: mongoose.Types.ObjectId, 
        ref: 'Tag'
    }],
    owner: {
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    }
});

module.exports = mongoose.model('Product', productSchema);
