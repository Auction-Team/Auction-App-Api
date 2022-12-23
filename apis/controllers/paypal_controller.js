const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const CustomError = require('../utils/custom-error');
const paypal = require('paypal-rest-sdk');
const { reconcileService,userService, withdrawService } = require('../services');
const { randomUUID } = require('crypto'); 

const depositTitle='Deposit money into the system';
const withDrawTitle='Withdraw money from the system';
const inwardType='IN';
const outwardType='OUT';
const base = "https://api-m.sandbox.paypal.com";

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET,
});

const createPayment = catchAsync(async (req, res, next) => {
    let transactionalMoney=req.body.transactionalMoney;
    console.log('Money: '+transactionalMoney);
    const create_payment_json = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal',
        },
        'redirect_urls': {
            'return_url': process.env.FE_DOMAIN+'/dashboard/reconcile/success',
            'cancel_url': process.env.FE_DOMAIN+'/dashboard/reconcile/cancel',
        },
        'transactions': [{
            'item_list': {
                'items': [{
                    'name': depositTitle,
                    'sku': '000',
                    'price': transactionalMoney.toString(),
                    'currency': 'USD',
                    'quantity': 1,
                }],
            },
            'amount': {
                'currency': 'USD',
                'total': transactionalMoney.toString(),
            },
            'description': 'Deposit money into the system with Paypal.',
        }],
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    //res.redirect(payment.links[i].href);
                    //return payment.links[i].href;
                    res.status(httpStatus.OK).send({link: 
                        payment.links[i].href
                    })
                }
            }

        }
    });
});

const successPayment = catchAsync(async (req, res, next) => {
    const payerId = req.body.PayerID;
    const paymentId = req.body.paymentId;
    const accountId=req.user.id;
    const transactionalMoney=req.body.transactionalMoney;

    const execute_payment_json = {
        'payer_id': payerId,
        'transactions': [{
            'amount': {
                'currency': 'USD',
                'total': transactionalMoney.toString(),
            },
        }],
    };
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            //throw error;
            return next(new CustomError(httpStatus.BAD_REQUEST, ''));
           
        } else {
            console.log(payment);
            var rid=randomUUID()+new Date().toISOString().replace(/:/g, '-');
            //res.send('Nạp tiền thành công');
            reconcileService.increaseMoney(accountId,transactionalMoney);
            reconcileService.createReconcile(rid,depositTitle,transactionalMoney,'USD',inwardType,accountId);
            return res.status(httpStatus.OK).send({success: true});
        }
    });
});

//Don't need it (NMĐ)
const cancelPayment = catchAsync(async (req, res, next) => {
    res.send('Transaction has been canceled');
});

const getAllTransaction=catchAsync(async (req, res, next) => {
    const reconcileList=await reconcileService.getAllReconcile(req.user.id);
    return res.status(httpStatus.OK).json({
        success: true,
        reconcileList
    })
});

const getAllWithDrawRequest=catchAsync(async (req, res, next) => {
    const adminId=req.user.id;
    const adminAccount= await userService.getUserById(adminId);
    if(adminAccount==null ||(adminAccount!=null&& adminAccount.role!='admin')){
        return res.status(403);
    }
    const requestList=await withdrawService.getAllWithDraw();
    return res.status(httpStatus.OK).json({
        success: true,
        requestList
    })
});

const createWithdraw=catchAsync(async (req, res, next) => {
    try {
        const newWithdraw = await withdrawService.createWithDrawRequest({...req.body},req.user.id);
        if(newWithdraw=='DONT_HAVE_ENOUGH_MONEY'){
            return res.status(400).json({ success: false, message: 'You do not have enough money' });
        }
        console.log("Add new withdraw request finished")
        console.log(newWithdraw)
        return res.status(httpStatus.OK).send({withdraw: {
            ...newWithdraw._doc
        }})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
})
const withdrawMoney=catchAsync(async (req, res, next) => {
    // const accountId=req.user.id;
    const adminId=req.user.id;
    const adminAccount= await userService.getUserById(adminId);
    if(adminAccount==null ||(adminAccount!=null&& adminAccount.role!='admin')){
        return res.status(403);
    }
    const {withdrawId}=req.body;
    const withdrawRequest=await withdrawService.getWithDrawRequestInfo(withdrawId);
    if(withdrawRequest==null){
        return res.status(400).json({ success: false, message: 'Request withdraw not found'});
    }
    const accountId=withdrawRequest.user;
    const transactionalMoney=withdrawRequest.transactionalMoney;
    const emailPaypal = withdrawRequest.emailPaypal;
    const account=await userService.getUserById(accountId);
    console.log('email receive address:'+account.email);
    if(account==null){
        res.status(400).json({ success: false, message: 'Account is not found' });
    }
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id" : randomUUID()
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        application_context: {
            "user_action":"PAY_NOW",
            "return_url": process.env.FE_ADMIN_DOMAIN+"/dashboard/reconcile/success?withdrawId="+withdrawId,
            "cancel_url": process.env.FE_ADMIN_DOMAIN+"/dashboard/reconcile/cancel"
        },
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: transactionalMoney.toString(),
            },
            payee: {
                email_address: emailPaypal
            }
          },
        ],
        payment_source: {
            paypal: {
                payer:{
                    name: { given_name: 'Auction', surname: 'Company' },
                    email_address: 'nhanphanphoi01@gmail.com',
                    payer_id: '4JNHA9ASFU7T6',
                    address: { country_code: 'US' }
                }
            }
        }
      }),
    })
    // .then(result => {
    //     //Here body is not ready yet, throw promise
    //     if (!result.ok) throw result;
    //     console.log('Result: '+result.json());
    //     return result.json();
    // })
    // .then(result => {
    //     //Successful request processing
    //     // console.log(result);
    //     for (let i = 0; i < payment.links.length; i++) {
    //         if (payment.links[i].rel === 'approval_url') {
    //             res.redirect(payment.links[i].href);
    //         }
    //     }
    // }).catch(error => {
    //     //Here is still promise
    //     console.log(error);
    //     error.json().then((body) => {
    //         //Here is already the payload from API
    //         console.log(body);
    //         res.status(500).json({ success: false, message: 'Server error' });
    
    //     });
    // })
    const data = await response.json();
    console.log(data);
    if(data!=null){
        //update order id to withdraw request
        await withdrawService.updateOrderForWithDraw(withdrawId,data.id);
        for (let i = 0; i < data.links.length; i++) {
            if (data.links[i].rel === 'payer-action') {
                    //res.redirect(data.links[i].href);
                    //return datdata.links[i].hrefa;
                    res.status(httpStatus.OK).send({link: 
                        data.links[i].href
                    })
                }
        }
    }else{
        return next(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Payment error'));
    }
});
  
const capturePaymentOrder=catchAsync(async (req, res, next) => {
    const { withdrawId } = req.body;
    const adminId=req.user.id;
    const withdrawRequest=await withdrawService.getWithDrawRequestInfo(withdrawId);
    const adminAccount= await userService.getUserById(adminId);
    if(adminAccount==null ||(adminAccount!=null&& adminAccount.role!='admin')){
        return res.status(403);
    }
    if(withdrawRequest==null){
        return res.status(400).json({ success: false, message: 'Request withdraw not found'});
    }
    const orderId=withdrawRequest.orderId;
    const accessToken = await generateAccessToken();
    console.log('Order id: '+orderId +'\naccessToken:'+accessToken);
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    //TODO: if success - minus account balance and create reconcile
    console.log(data);
    //return data;
    if(data==null){
        return res.status(500).json({ success: false, message: 'Error when deposit money'});
    }else{
        if(data.status=='COMPLETED'){
            await withdrawService.realDebitAccount(withdrawRequest.user,withdrawRequest.transactionalMoney);
            await withdrawService.deleteWithDrawRequest(withdrawId);
            var rid=randomUUID()+new Date().toISOString().replace(/:/g, '-');
            await reconcileService.createReconcile(rid,withDrawTitle,withdrawRequest.transactionalMoney,'USD',outwardType,withdrawRequest.user);
            
            return res.status(httpStatus.OK).send({success: true});
        }else{
            return res.status(httpStatus.OK).send({success: false});
        }
        
    }
  })
  
  async function generateAccessToken() {
    const response = await fetch(base + "/v1/oauth2/token", {
      method: "post",
      body: "grant_type=client_credentials",
      headers: {
        Authorization:
          "Basic " + Buffer.from(process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET).toString("base64"),
      },
    });
    const data = await response.json();
    return data.access_token;
  }

module.exports = {
    createPayment,
    successPayment,
    cancelPayment,
    getAllTransaction,
    withdrawMoney,
    capturePaymentOrder,
    createWithdraw,
    getAllWithDrawRequest
};