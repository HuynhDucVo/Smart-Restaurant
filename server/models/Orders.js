const moongoose = require('mongoose');

const orderSchema = moongoose.Schema({
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
    employeeId: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    }
});

const Order = moongoose.model('Order', orderSchema);
module.exports = Order;
    