const mongoose = require('mongoose');
const temporaryDebitModel = new mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId, 
        ref: 'Product',
        required:true
    },
    auctionMoney:{
        type:Number,
        require: true
    },
    shipFee:{
        type:Number,
        require: true
    },
    auctionFee:{
        type:Number,
        require: true
    },
    createdDate:{
        type: Date,
        require: false,
        default: new Date()
    },
    owner: {
        type: mongoose.Types.ObjectId, 
        ref: 'User',
        required:true
    }
});

module.exports = mongoose.model('TemporaryDebit', temporaryDebitModel);
