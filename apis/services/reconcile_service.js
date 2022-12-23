const Reconcile  = require('../models/reconcile_model');
const User = require('../models/user_model');

const createReconcile = async (rid, action, transactionalMoney, currencyUnit, type, owner ) => {
    console.log("Create reconcile");
    transactionalMoney=transactionalMoney+' '+currencyUnit;
    var createdDate = new Date();
    const newReconcile = new Reconcile({
        rid: rid, 
        action: action, 
        transactionalMoney: transactionalMoney, 
        type: type,
        createdDate:createdDate,
        owner: owner
    })
    return newReconcile.save();
}

const increaseMoney = async (accountId, amount) => {

    await User.findByIdAndUpdate(
        accountId,
        {
            $inc: {accountBalance: amount},  // current value +amount
        },
        {
            new:true
        }
    )
    const updatedUser= await User.findByIdAndUpdate(
        accountId,
        {
            $inc: {availableBalance: amount}  // current value +amount
        },
        {
            new:true
        }
    )
    return updatedUser;
};

const getAllReconcile = async(ownerId)=>{
    // Reconcile.find({}, {
    //     'owner': ownerId,    // select keys to return here
    // }, {sort: '-_id'}, function(err, reconciles) {
    //     if(err!=null){
    //         return error;
    //     }
    //     return reconciles;
    // });

    // return await Reconcile.find({},  { owner: ownerId }, {sort: {_id: -1}},async  (err, docs) => { 
    //     if(err!=null){
    //         throw error;
    //     }
    //     return docs; });
    return await Reconcile.find({ owner:ownerId });
}

module.exports = {
    createReconcile,
    getAllReconcile,
    increaseMoney
};