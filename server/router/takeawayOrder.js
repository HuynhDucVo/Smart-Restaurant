const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');

// Get a specific takeaway order by id, or list all orders
router.get('/', async (req, res) => {
    try {
        const { orderId } = req.query;
        if (orderId) {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ errorMsg: 'Takeaway order not found' });
            }
            return res.json(order);
        }
        const orders = await Order.find({ orderType: { $regex: /^Takeaway/i } });
        return res.json(orders);
    } catch (error) {
        console.error('Error in takeawayOrder GET:', error);
        return res.status(500).json({ errorMsg: 'Internal server error' });
    }
});

// Create or update takeaway order
router.post('/', async (req, res) => {
    try {
        const { orderId, orderType, items, totalAmount, orderDate, customerName, employeeId, employeeName } = req.body;

        if (!orderType || !items || items.length === 0 || totalAmount == null) {
            return res.status(400).json({ errorMsg: 'Invalid order data' });
        }

        if (orderId) {
            const updated = await Order.findByIdAndUpdate(
                orderId,
                { orderType, items, totalAmount, orderDate: orderDate ? new Date(orderDate) : new Date(), customerName, employeeId, employeeName },
                { new: true }
            );
            if (!updated) {
                return res.status(404).json({ errorMsg: 'Order not found for update' });
            }
            return res.status(200).json({ msg: 'Order updated successfully', order: updated });
        }

        const created = await Order.create({ orderType, items, totalAmount, orderDate: orderDate ? new Date(orderDate) : new Date(), customerName, employeeId, employeeName });
        return res.status(201).json({ msg: 'Order created successfully', order: created });
    } catch (error) {
        console.error('Error in takeawayOrder POST:', error);
        return res.status(500).json({ errorMsg: 'Internal server error' });
    }
});

module.exports = router;


