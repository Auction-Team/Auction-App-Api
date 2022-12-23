const TemporaryDebit  = require('../models/temporary_debit_model');
const {userService, invoiceService, productService, reconcileService}=require('../services');
const User = require('../models/user_model');
const Product = require('../models/product_model');
const { randomUUID } = require('crypto'); 
var ObjectId = require('mongodb').ObjectID;
let shipFeeMatrix = { 'Quận 9': { 'Quận 1': 1.632, 'Quận 2': 1.376, 'Quận 3': 1.68, 'Quận 4':1.808, 'Quận 5':2.032,'Quận 6':2.456,'Quận 7':2.016,'Quận 8':2.808,'Quận 9':0,'Quận 10':1.96,'Quận 11':2.048,'Quận 12':1.856,'Quận Tân Bình':1.896,'Quận Phú Nhuận': 1.728, 'Quận Gò Vấp':1.68,'Quận Bình Thạch':1.312,'Quận Bình Tân':2.488,'Quận Tân Phú':2.672,'Quận Thủ Đức':0.736} };
let shipTimeMatrix={ 'Quận 9': { 'Quận 9': 1, 'Quận 3': 2 }, 'Quận 3': { 'Quận 9': 2, 'Quận 3': 1 } };
let autionFeeMatrix = [[0, 421.50, 843, 2107.49,4214.97,21074.85,99999999999999], [1.26, 2.11, 4.21,6.32,8.43,12.64]];
let autionOwnerFeeMatrix = [[0, 845.67, 2114.16, 42283.30,422833.00,845666.00,99999999999999], [2, 5, 1.5,0.2,0.15,0.1], [0,0,105.71,708.25,1469.34,2103.59]];
let defaultAuctionFee=3;
let defaultOwnerFee=500;
const createTemporyDebit=async ({
    productId,
    auctionMoney
}, id) => {
    const receiver=await userService.getUserById(id);
    let auctionFee=caculateAuctionFee(auctionMoney);
    let shipFee=caculateShippingFee('Quận 9',receiver.district);
    console.log('Create TemporyDebit with: '
    +'\nauctionFee: '+auctionFee
    +'\nshipFee: '+shipFee);
    console.log('Total fee: '+auctionMoney+shipFee+auctionFee);
    const newWithDrawRequest = new TemporaryDebit({
        product: productId,
        auctionMoney: auctionMoney,
        shipFee: shipFee,
        auctionFee: auctionFee,
        owner: id,
    });
    if(receiver.availableBalance>auctionMoney+shipFee+auctionFee){
        await temportDebitAccount(receiver._id,auctionMoney+shipFee+auctionFee);
        return newWithDrawRequest.save();
    }else{
        return 'NOT_ENOUGH_AVAILABLE_MONEY';
    }
};

const updateTemporyDebit=async ({
    productId,
    auctionMoney
}, id) => {
    const receiver=await userService.getUserById(id);
    let auctionFee=caculateAuctionFee(auctionMoney);
    let shipFee=caculateShippingFee('Quận 9',receiver.district);
    console.log('Update TemporaryDebit with: '
    +'\nauctionFee: '+auctionFee
    +'\nshipFee: '+shipFee);
    console.log('Total fee: '+auctionMoney+shipFee+auctionFee);
   
    if(await calculateNewFeeAvailable(id,productId, auctionMoney+shipFee+auctionFee)){
        await deleteTemporaryDebitAndRestoreMoney(id, productId);
        const newWithDrawRequest = new TemporaryDebit({
            product: productId,
            auctionMoney: auctionMoney,
            shipFee: shipFee,
            auctionFee: auctionFee,
            owner: id,
        });
        await temportDebitAccount(id,auctionMoney+shipFee+auctionFee);
        const result=await newWithDrawRequest.save();
        return result;
    }else{
        return 'NOT_ENOUGH_AVAILABLE_MONEY';
    }
};

const deleteAllTemporyByProduct=async (productId) => {
    const winnerDebit=await getBidWinner(productId);
    console.log('list: '+winnerDebit);
    if(!winnerDebit.length){
        return 'NO_USER_PARTICIPANT_TO_AUCTION';
    }
    console.log('winner: '+winnerDebit[0]);
    await winnerDebit[0].remove();
    const secondWinner=await getSecondWinner(productId,winnerDebit[0].auctionMoney);
    console.log(secondWinner);
    const finalAuctionMoney=secondWinner.length==0?winnerDebit[0].auctionMoney:secondWinner[0].auctionMoney;
    const finalPriceForWinner=finalAuctionMoney+winnerDebit[0].auctionFee+winnerDebit[0].shipFee;
    await transferProductForWinner(productId,winnerDebit[0]._id.toString(),winnerDebit[0].auctionMoney,finalAuctionMoney,finalPriceForWinner);
    const temporyDebitList=await getAllTemporyDebitByProduct(productId);
    const temp = await temporyDebitList.forEach(async (item) => {
        await deleteTemporaryDebitAndRestoreMoney(item);
    });
    return temp;
};


const transferProductForWinner=async (productId, winnerId,initialWinnerPrice, finalAuctionMoney,finalPriceForWinner)=>{
    const product=await productService.getProductById(productId);
    const result = await Promise.all([chargeWinner(winnerId,product,initialWinnerPrice,finalPriceForWinner),
    changeOwnerOfProductToWinner(product,winnerId,finalAuctionMoney),
    invoiceService.createInvoice(productId,winnerId,finalPriceForWinner,1)]);
    return result;
}

async function chargeWinner(winnerId,product,initialWinnerPrice,finalPriceForWinner){
    console.log(winnerId);
    const user=await userService.getUserById(winnerId);
    console.log('user winner info: '+user);
    const result=await updateWinner(winnerId,initialWinnerPrice,finalPriceForWinner);
    var rid=randomUUID()+new Date().toISOString().replace(/:/g, '-');
    await reconcileService.createReconcile(rid,'Paying the auction for the product '+product.auctionName,finalPriceForWinner,'USD','OUT',winnerId);
    return result;
}

async function updateWinner(winnerId,initialWinnerPrice,finalPriceForWinner){
    await User.findByIdAndUpdate(
        winnerId,
        {
            $inc: {accountBalance: (-1)*finalPriceForWinner},  // current value +amount
            $inc: {availableBalance: initialWinnerPrice-finalPriceForWinner},  // current value +amount
        },
        {
            new:true
        }
    )
} 

async function changeOwnerOfProductToWinner(product, winnerId, finalPriceForWinner){
    const action='Receive money from the auction floor of product '+product.auctionName;
    const ownerMoney=await calculateOwnerMoney(finalPriceForWinner);
    console.log('Owner money: '+ownerMoney);
    
    await User.findByIdAndUpdate(
        product.owner,
        {
            $inc: {accountBalance: ownerMoney+0.00}  // current value +amount
        },
        {
            new:true
        }
    )
    const updatedOwner= await User.findByIdAndUpdate(
        product.owner,
        {
            $inc: {availableBalance: ownerMoney+0.00}  // current value +amount
        },
        {
            new:true
        }
    )
    console.log('new owner: '+updatedOwner);
    var rid=randomUUID()+new Date().toISOString().replace(/:/g, '-');
    await reconcileService.createReconcile(rid,action,ownerMoney,'USD','IN',product.owner);
    await Product.findByIdAndUpdate(
        product._id,
        {
            owner:winnerId
        },
        {
            new:true
        }
    )
}

async function calculateOwnerMoney(finalPriceForWinner){
    const dimensions = [ autionOwnerFeeMatrix.length, autionOwnerFeeMatrix[0].length,autionOwnerFeeMatrix[1].length ];
    if(dimensions[0]===dimensions[1]+1&&dimensions[0]===dimensions[2]+1){
        for(var i=1;i<dimensions[0];i++){
            if(finalPriceForWinner>autionFeeMatrix[0][i-1]&&auctionMoney<autionFeeMatrix[0][i]){
                return autionFeeMatrix[1][i-1]+autionFeeMatrix[2][i-1]*finalPriceForWinner;
            }
        }
    }else{
        return finalPriceForWinner-3*finalPriceForWinner/100;
    }
    
}

async function getBidWinner(productId){
    return await TemporaryDebit.find({product:productId}).sort({auctionMoney:-1,createdDate:-1}).limit(1);
}
async function getSecondWinner(productId, winnerPrice){
    const listTop1= await TemporaryDebit.find({product:productId,auctionMoney:winnerPrice}).sort({auctionMoney:-1,createdDate:-1});
    const sizeTop1=listTop1.length;
    return await TemporaryDebit.find({product:productId}).sort({auctionMoney:-1,createdDate:-1}).limit(1).skip(sizeTop1);
}
async function getAllTemporyDebitByProduct(productId){
    const temporyDebitList=await TemporaryDebit.find({product:productId});
    console.log('Temporry Debit List:'+ temporyDebitList);
    return temporyDebitList;
}

async function deleteTemporaryDebitAndRestoreMoney(accountId, productId){
    const oldTemporyDebit= await getTemporyDebitByAccountAndProduct(accountId, productId);
    const oldPrice= oldTemporyDebit.auctionMoney+oldTemporyDebit.shipFee+oldTemporyDebit.auctionFee;
    await oldTemporyDebit.remove();
    const result = await restoreDebitAccount(accountId,oldPrice);
    return result;
}

async function calculateNewFeeAvailable (accountId, productId, newAuctionMoney){
    const receiver=await userService.getUserById(accountId);
    const oldTemporyDebit=await getTemporyDebitByAccountAndProduct(accountId,productId);
    const oldBid=oldTemporyDebit!=null?oldTemporyDebit.auctionMoney+oldTemporyDebit.shipFee+oldTemporyDebit.auctionFee:0;
    if(receiver.availableBalance+oldBid>newAuctionMoney){
        return true;
    }else{
        return false;
    }
}

async function getTemporyDebitByAccountAndProduct(accountId, productId){
    const temporyDebit=await TemporaryDebit.findOne({owner:accountId,product:productId});

    console.log('Old Temporry Debit:'+ temporyDebit);
    return temporyDebit;
}



async function temportDebitAccount(accountId, debitAmount){
    const updatedUser=await User.findByIdAndUpdate(
        accountId,
        {
            $inc: {availableBalance: (-1)*debitAmount}  // current value +amount
        },
        {new: true}
    )
    return updatedUser;
}

async function restoreDebitAccount(accountId, restoreAmount){
    const updatedUser=await User.findByIdAndUpdate(
        accountId,
        {
            $inc: {availableBalance: restoreAmount}  // current value +amount
        },
        {new: true}
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
        shipFee=5;
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
    updateTemporyDebit,
    getTemporyDebitByAccountAndProduct,
    deleteAllTemporyByProduct
};