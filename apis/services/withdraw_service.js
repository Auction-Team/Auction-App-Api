const WithDrawRequest  = require('../models/withdraw_request_model');
const {userService}=require('../services');
const User = require('../models/user_model');

const createWithDrawRequest=async ({transactionalMoney,emailPaypal}, id) => {
    console.log('Create WithDrawRequest');
    const userInfo=await userService.getUserById(id);
    if(userInfo.availableBalance<transactionalMoney){
        return 'DONT_HAVE_ENOUGH_MONEY';
    }
    await temporyDebitAccount(id,transactionalMoney);
    const newWithDrawRequest = new WithDrawRequest({
        transactionalMoney: transactionalMoney,
        emailPaypal:emailPaypal,
        user: id,
    });
    return newWithDrawRequest.save();
};

const deleteWithDrawRequest=async (requestId) => {
    const request=await getWithDrawRequestInfo(requestId);
    const result =await request.remove();
    return result;
};

const getListWithDrawRequest=async()=>{
    const withDrawRequestList=await WithDrawRequest.find();
    return withDrawRequestList;
}

async function temporyDebitAccount(accountId, transactionalMoney){
    const result=await User.findByIdAndUpdate(
        accountId,
        {
            $inc: {availableBalance: (-1)*transactionalMoney},  // current value +amount 
        },
        {
            new:true
        }
    )
    return result;
}

const realDebitAccount=async(accountId, transactionalMoney)=>{
    const result=await User.findByIdAndUpdate(
        accountId,
        {
            $inc: {accountBalance: (-1)*transactionalMoney},  // current value +amount 
        },
        {
            new:true
        }
    )
    return result;
}

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
    getWithDrawRequestInfo,
    realDebitAccount,
    deleteWithDrawRequest,
    getListWithDrawRequest
};