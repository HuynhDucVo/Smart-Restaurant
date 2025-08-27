const express = require('express');
const router = express.Router();
const OrderHistory = require('../models/OrderHistory');

// Debug endpoint to check date handling
router.get('/debug-date', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.json({ error: 'No date provided' });
    }

    // Parse the date string
    const [year, month, day] = date.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    
    // Create UTC dates
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // Get all orders to see what dates exist
    const allOrders = await OrderHistory.find().sort({ paymentDate: -1 }).limit(10);
    
    res.json({
      inputDate: date,
      parsedDate: parsedDate,
      startDateUTC: startDate,
      endDateUTC: endDate,
      sampleOrders: allOrders.map(o => ({
        id: o._id,
        paymentDate: o.paymentDate,
        orderDate: o.orderDate,
        totalAmount: o.totalAmount
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales report
router.get('/', async (req, res) => {
  try {
    let { date } = req.query;

    // Default to today
    if (!date) {
      date = new Date();
    } else {
      // Parse the date string and create a proper Date object
      // This ensures we get the exact date selected, not affected by timezone
      const [year, month, day] = date.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed in JavaScript
    }

    // Set start and end of the selected date using UTC to avoid timezone issues
    const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));

    console.log('Selected date:', date);
    console.log('Start date (UTC):', startDate);
    console.log('End date (UTC):', endDate);

    // Query orders for the selected date
    const orders = await OrderHistory.find({
      paymentDate: { $gte: startDate, $lte: endDate }
    });

    console.log('Found orders:', orders.length);

    // Summaries
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalTips = orders.reduce((sum, o) => sum + (o.tip || 0), 0);
    const orderCount = orders.length;

    // Group by orderType
    const byType = {};
    orders.forEach(o => {
      const type = o.orderType || "Unknown";
      if (!byType[type]) {
        byType[type] = { count: 0, sales: 0 };
      }
      byType[type].count += 1;
      byType[type].sales += o.totalAmount;
    });

    res.json({
      selectedDate: date,
      startDate,
      endDate,
      totalSales,
      totalTips,
      orderCount,
      breakdown: byType,
      orders
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ errorMsg: "Failed to generate report" });
  }
});

module.exports = router;
