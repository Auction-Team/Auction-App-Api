const WithDrawRequest  = require('../models/withdraw_request_model');

const createWithDrawRequest=async (transactionalMoney, id) => {
    console.log('Create WithDrawRequest');
    const newWithDrawRequest = new WithDrawRequest({
        transactionalMoney: transactionalMoney,
        owner: id,
    });
    return newWithDrawRequest.save();
};

const getWithDrawRequestInfo=async (withDrawRequestId) => {
    return await WithDrawRequest.findById(withDrawRequestId);
};
const updateOrderForWithDraw = async (withDrawId, orderId) => {
    const updatedWithDrawRequest=await WithDrawRequest.findByIdAndUpdate(
        withDrawId,
        {
            orderId: orderId
        },
        { new: true },
    )
    return updatedWithDrawRequest;
};

const getAllWithDraw = async()=>{
    return await WithDrawRequest.find();
}

module.exports = {
    getAllWithDraw,
    updateOrderForWithDraw,
    createWithDrawRequest,
    getWithDrawRequestInfo
};