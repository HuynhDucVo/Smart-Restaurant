const mongoose = require('mongoose');

const orderHistorySchema = mongoose.Schema({
    tableNumber: {
        type: Number
    },
    customerName: {
        type: String
    },
    orderType: {
        type: String,   
        required: true,
    }, 
    items: [{
        itemName: {
            type: String,   
            required: true,
        },
        quantity: { 
            type: Number,   
            required: true,
            min: 1
        },
        price: {
            type: Number,   
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,   
        required: true,
        min: 0
    },
    orderDate: {
        type: Date,   
        default: Date.now
    },
    paymentDate: {
        type: Date,   
        default: Date.now
    },
    tip: {
        type: Number,
        min: 0
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    }
});

const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);
module.exports = OrderHistory;