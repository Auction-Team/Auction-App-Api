const Product = require('../models/product_model');
const Invoice = require('../models/invoice_model');
const mongoose = require('mongoose');

const createInvoice = async (productId, buyerId, total, amount) => {
    const isValidProductId = mongoose.Types.ObjectId.isValid(productId);
    if (isValidProductId) {
        const productIdMongo = mongoose.Types.ObjectId(productId);
        const buyerIdMongo = mongoose.Types.ObjectId(buyerId);
        const productById = await Product.findById(productIdMongo);
        if (productById) {
            const invoice = new Invoice({
                product: productById._id,
                buyer: buyerIdMongo,
                total: total || 0,
                amount: amount || 0,
            });
            await invoice.save();
            return invoice;
        } else console.log('Product not found');
    } else console.log('Product id mongo not invalid ');

};

module.exports = {
    createInvoice
}