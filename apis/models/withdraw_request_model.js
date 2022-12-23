const mongoose = require('mongoose');
const withDrawRequest = new mongoose.Schema({
    orderId:{
        type:String,
        require: false
    },
    transactionalMoney:{
        type:Number,
        require: true
    },
    emailPaypal:{
        type:String,
        require:true
    },
    user: {
        type: mongoose.Types.ObjectId, 
        ref: 'User',
        required:true
    }
});

module.exports = mongoose.model('WithdrawRequest', withDrawRequest);
