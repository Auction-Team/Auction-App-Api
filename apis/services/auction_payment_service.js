const TemporaryDebit  = require('../models/temporary_debit_model');
const {userService}=require('../services');
let shipFeeMatrix = { 'Quận 9': { 'Quận 9': 1, 'Quận 3': 2 }, 'Quận 3': { 'Quận 9': 2, 'Quận 3': 1 } };
let shipTimeMatrix={ 'Quận 9': { 'Quận 9': 1, 'Quận 3': 2 }, 'Quận 3': { 'Quận 9': 2, 'Quận 3': 1 } };
let autionFeeMatrix = [[0, 421.50, 843, 2107.49,4214.97,21074.85,99999999999999], [1.26, 2.11, 4.21,6.32,8.43,12.64]];
let defaultAuctionFee=3;
const createTemporyDebit=async ({
    productId,
    auctionMoney    
}, id) => {
    const receiver=await userService.getUserById(id);
    let auctionFee=caculateAuctionFee(auctionMoney);
    let shipFee=caculateShippingFee('Quận 9',receiver.district);
    console.log('Create WithDrawRequest with: '
    +'\nauctionFee: '+auctionFee
    +'\nshipFee'+shipFee);
    const newWithDrawRequest = new TemporaryDebit({
        product: productId,
        auctionMoney: auctionMoney,
        shipFee: shipFee,
        auctionFee: auctionFee,
        owner: id,
    });
    await temportDebitAccount(id,auctionMoney+shipFee+auctionFee);
    return newWithDrawRequest.save();
};

async function temportDebitAccount(accountId, debitAmount){
    const updatedUser=await User.findByIdAndUpdate(
        accountId,
        {
            $inc: {availableBalance: (-1)*debitAmount}  // current value +amount
        }
    )
    return updatedUser;
}

function caculateShippingFee(ownerDistrict,receiverDistrict){
    // let key1 = 'Quận 9';
    // let key2 = 'Quận 3';
    let shipFee;
    try{
        shipFee=shipFeeMatrix[ownerDistrict][receiverDistrict];
    }catch(ex){
        //out of control shipping
        shipFee=4.22;
    }finally{
        return shipFee;
    }
     
}
function caculateAuctionFee(auctionMoney){
    const dimensions = [ autionFeeMatrix.length, autionFeeMatrix[0].length ];
    if(dimensions[0]===dimensions[1]+1){
        for(var i=1;i<dimensions[0];i++){
            if(auctionMoney>autionFeeMatrix[0][i-1]&&auctionMoney<autionFeeMatrix[0][i]){
                return autionFeeMatrix[1][i-1];
            }
        }
    }else{
        return defaultAuctionFee;
    }
}

module.exports = {
    createTemporyDebit,
};