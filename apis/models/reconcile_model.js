const mongoose = require('mongoose');
const reconcileSchema = new mongoose.Schema({
    rid: {
        type: String,
        required: true,
    },
    action:{
        type:String,
        require: true
    },
    transactionalMoney:{
        type:String,
        require: true
    },
    type:{
        type:String,
        require: true
    },
    createdDate:{
        type:Date,
        require: true
    },
    owner: {
        type: mongoose.Types.ObjectId, 
        ref: 'User',
        required:true
    }
});

module.exports = mongoose.model('Reconcile', reconcileSchema);
