const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    auctionName: {
        type: String,
        maxlength: 255,
        require:true
    },
    brief: {
        type: String,
        maxlength: 500,
        require:true
    },
    description: {
        type: String,
        maxlength: 5000
    },
    quantity:{
        type:Number,
        default:1,
        require:true
    },
    quantityUnit:{
        type: String,
        maxlength:255,
        default:'',
        require:true
    },
    mainImage: {
        type: String,
        default: '',
        //require:true
    },
    subImages: [{
        type: String, 
        default: ''
    }],
    startingPrice:{
        type: Float64Array,
        require: true
    },
    startAuctionTime:{
        type: Date,
        require:true
    },
    endAuctionTime:{
        type: Date,
        require: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    owner: {
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    }
});

module.exports = mongoose.model('Product', productSchema);
