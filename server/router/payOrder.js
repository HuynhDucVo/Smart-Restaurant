const express = require('express');
const router = express.Router(); 
const Order = require('../models/Orders');
const OrderHistory = require('../models/OrderHistory');
const DineInTable = require('../models/DineInTable');

router.post('/', async (req, res) => {
    try {
        const { tableNumber, orderId } = req.body;

        // If tableNumber present, pay dine-in; otherwise pay takeaway by orderId
        let currentOrder;
        if (tableNumber) {
            // Find the current order for this table
            currentOrder = await Order.findOne({ tableNumber: Number(tableNumber) });
            if (!currentOrder) {
                return res.status(404).json({ errorMsg: 'No order found for this table' });
            }
        } else if (orderId) {
            currentOrder = await Order.findById(orderId);
            if (!currentOrder) {
                return res.status(404).json({ errorMsg: 'No order found for this id' });
            }
        } else {
            return res.status(400).json({ errorMsg: 'tableNumber or orderId is required' });
        }

        // Create order history entry
        const orderHistoryEntry = await OrderHistory.create({
            tableNumber: currentOrder.tableNumber,
            customerName: currentOrder.customerName,
            orderType: currentOrder.orderType,
            items: currentOrder.items,
            totalAmount: currentOrder.totalAmount,
            orderDate: currentOrder.orderDate,
            paymentDate: new Date(),
            employeeId: currentOrder.employeeId,
            employeeName: currentOrder.employeeName
        });

        if (!orderHistoryEntry) {
            return res.status(500).json({ errorMsg: 'Failed to create order history entry' });
        }

        // Remove the order from Orders collection
        let deletedOrder;
        if (tableNumber) {
            deletedOrder = await Order.findOneAndDelete({ tableNumber: Number(tableNumber) });
        } else {
            deletedOrder = await Order.findByIdAndDelete(orderId);
        }
        
        if (!deletedOrder) {
            return res.status(500).json({ errorMsg: 'Failed to remove order' });
        }

        // Update table status to Available for dine-in only
        let updatedTable;
        if (tableNumber) {
            updatedTable = await DineInTable.findOneAndUpdate(
                { tableNumber: Number(tableNumber) },
                { tableStatus: 'Available' },
                { new: true }
            );
            if (!updatedTable) {
                return res.status(500).json({ errorMsg: 'Failed to update table status' });
            }
        }

        console.log(`Order for table ${tableNumber} paid successfully and moved to history`);
        
        return res.status(200).json({ 
            msg: 'Order paid successfully', 
            orderHistory: orderHistoryEntry,
            tableStatus: updatedTable ? updatedTable.tableStatus : undefined
        });

    }
    catch(error) {
        console.error('Error in payOrder route:', error);
        return res.status(500).json({ errorMsg: 'Internal server error' });
    }
});

module.exports = router;