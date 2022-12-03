const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    auction_name: {
        type: String,
        maxlength: 255,
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
    quantity_unit:{
        type: String,
        maxlength:255,
        default:'',
        require:true
    },
    main_image: {
        type: String,
        default: '',
        //require:true
    },
    sub_images: [{
        type: String, 
        default: ''
    }],
    starting_price:{
        type: Number,
        require: true
    },
    start_auction_time:{
        type: Date,
        reqsuire:true
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
        ref: 'User',
        required:true
    }
});

module.exports = mongoose.model('Product', productSchema);
