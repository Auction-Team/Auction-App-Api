const Reconcile  = require('../models/reconcile_model');

const createReconcile = async (rid, action, transactionalMoney, currencyUnit, type, owner ) => {
    console.log("Create reconcile");
    transactionalMoney=transactionalMoney+currencyUnit;
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
const getAllReconcile = async()=>{
    return await Reconcile.findAll({ 
        // Add order conditions here....
        order: [
            ['createdDate', 'DESC']
        ]
    });
}

module.exports = {
    createReconcile,
    getAllReconcile
};