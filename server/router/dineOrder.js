const express = require('express');
const router = express.Router();
const dineinTable = require('../models/DineInTable');
const dineOrder = require('../models/Orders');

router.get('/', async (req, res) => {
    try{
        const { tableNumber, source } = req.query;
        
        if (tableNumber) {
            // Get order for specific table
            const order = await dineOrder.findOne({ tableNumber: Number(tableNumber) });
            if (!order) {
                return res.status(404).json({ errorMsg: 'No order found for this table' });
            }
            return res.json([order]); // Return as array for consistency
        }
        
        // Check if request is from order.jsx (needs actual orders) or dinein.jsx (needs table status)
        if (source === 'orders') {
            // Get only dine-in orders (exclude takeaway) - for order.jsx
            const orders = await dineOrder.find({ orderType: { $regex: /^Dine-in/i } });
            if (!orders || orders.length === 0) {
                return res.status(404).json({ errorMsg: 'No dine-in orders found' });
            }
            res.json(orders);
        } else {
            // Get all tables with status (default behavior) - for dinein.jsx
            const tables = await dineinTable.find();
            if (!tables || tables.length === 0) {
                return res.status(404).json({ errorMsg: 'No dine-in tables found' });
            }
            res.json(tables);
        }

    }
    catch(error) {
        console.error('Error in dineOrder route:', error);
        res.status(500).json({ errorMsg: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try{
        const orderData = req.body;
        if (!orderData || !orderData.tableNumber || !orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ errorMsg: 'Invalid order data' });
        }
        
        // Validate employee info
        if (!orderData.employeeId || !orderData.employeeName) {
            return res.status(400).json({ errorMsg: 'Employee information is required' });
        }

        // Check for existing order with proper syntax
        const existingOrder = await dineOrder.findOne({ tableNumber: orderData.tableNumber });

        if (existingOrder) {
            // Update existing order
            const updatedOrder = await dineOrder.findOneAndUpdate(
                { tableNumber: orderData.tableNumber }, 
                { 
                    items: orderData.items, 
                    totalAmount: orderData.totalAmount, 
                    orderDate: new Date(),
                    employeeId: orderData.employeeId,
                    employeeName: orderData.employeeName
                }, 
                { new: true }
            );
            
            if (!updatedOrder) {
                return res.status(500).json({ errorMsg: 'Failed to update order' });
            }
            
            // Update the dine-in table status to 'Occupied'
            const tableNumber = Number(orderData.tableNumber);
            await dineinTable.findOneAndUpdate(
                { tableNumber: tableNumber },
                { tableStatus: 'Occupied' },
                { new: true }
            );
            
            return res.status(200).json({ msg: 'Order updated successfully', order: updatedOrder });
        }

        // Create new order if none exists
        const newOrder = await dineOrder.create(orderData);
        if (!newOrder) {
            return res.status(500).json({ errorMsg: 'Failed to create order' });
        }

        // Update the dine-in table status to 'Occupied'
        const tableNumber = Number(orderData.tableNumber);
        await dineinTable.findOneAndUpdate(
            { tableNumber: tableNumber },
            { tableStatus: 'Occupied' },
            { new: true }
        );
        res.status(201).json({ msg: 'Order created successfully', order: newOrder });
    }
    catch(error) {
        console.error('Error in dineOrder route:', error);
        res.status(500).json({ errorMsg: 'Internal server error' });
    }
});

router.put('/', async (req, res) => {
    try {
        const { tableNumber, tableStatus, forceUpdate } = req.body;
        if (!tableNumber || !tableStatus) {
            return res.status(400).json({ errorMsg: 'Invalid request data' });
        }
        
        let newStatus = tableStatus;
        
        // If forceUpdate is true, allow direct status update (for back button when cart is empty)
        if (!forceUpdate) {
            // Original logic for normal status updates
            newStatus = (tableStatus === 'Available')? 'Pending' : tableStatus;
            if (tableStatus === 'Occupied') {
                const existingTable = await dineOrder.findOne({tableNumber});
                if (!existingTable) {
                    newStatus = 'Available';
                }
            }
        }

        const updatedOrder = await dineinTable.findOneAndUpdate(
            { tableNumber },
            { tableStatus: newStatus },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ errorMsg: 'Table not found' });
        }

        res.json({ msg: 'Table status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating table status:', error);
        res.status(500).json({ errorMsg: 'Internal server error' });
    }
});

// // Add dedicated endpoint for updating order items
// router.put('/:tableNumber', async (req, res) => {
//     try {
//         const { tableNumber } = req.params;
//         const { items, totalAmount } = req.body;
        
//         if (!items || items.length === 0) {
//             return res.status(400).json({ errorMsg: 'Items are required for order update' });
//         }

//         const existingOrder = await dineOrder.findOne({ tableNumber: Number(tableNumber) });
        
//         if (!existingOrder) {
//             return res.status(404).json({ errorMsg: 'Order not found for this table' });
//         }

//         const updatedOrder = await dineOrder.findOneAndUpdate(
//             { tableNumber: Number(tableNumber) },
//             { 
//                 items: items,
//                 totalAmount: totalAmount || existingOrder.totalAmount,
//                 orderDate: new Date()
//             },
//             { new: true }
//         );

//         if (!updatedOrder) {
//             return res.status(500).json({ errorMsg: 'Failed to update order' });
//         }

//         res.json({ msg: 'Order updated successfully', order: updatedOrder });
//     } catch (error) {
//         console.error('Error updating order:', error);
//         res.status(500).json({ errorMsg: 'Internal server error' });
//     }
// });



module.exports = router;