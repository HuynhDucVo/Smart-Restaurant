const express = require('express');
const router = express.Router();
const OrderHistory = require('../models/OrderHistory');

// Get all order history
router.get('/', async (req, res) => {
    try {
        const orders = await OrderHistory.find().sort({ paymentDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ errorMsg: 'Failed to fetch order history' });
    }
});

// Update tip for a specific order
router.patch('/:orderId/tip', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { tip } = req.body;
        
        // Allow null, 0, or positive numbers
        if (tip !== null && (tip === undefined || tip < 0)) {
            return res.status(400).json({ errorMsg: 'Invalid tip amount' });
        }

        const order = await OrderHistory.findByIdAndUpdate(
            orderId,
            { tip: tip === null ? null : parseFloat(tip) },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ errorMsg: 'Order not found' });
        }

        res.json({ message: 'Tip updated successfully', order });
    } catch (error) {
        console.error('Error updating tip:', error);
        res.status(500).json({ errorMsg: 'Failed to update tip' });
    }
});

module.exports = router;

