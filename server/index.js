const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const DineInTable = require('./models/DineInTable'); 

async function seedTables() {
  try {
    const count = await DineInTable.countDocuments();
    if (count === 0) {
      // Create an array of 20 tables
      const tables = [];
      for (let i = 1; i <= 20; i++) {
        tables.push({ tableNumber: i });
      }

      await DineInTable.insertMany(tables);
      console.log('✅ 20 tables seeded successfully');
    } else {
      console.log('Tables already exist, skipping seeding');
    }
  } catch (err) {
    console.error('Error seeding tables:', err);
  }
}

const URL = process.env.MONGO_URI;
mongoose.connect(URL, {
    useNewUrlParser: true,    
    useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

seedTables(); 

const PORT = process.env.PORT || 5000;

const registerRouter = require('./router/register');
const loginRouter = require('./router/login');
const dineOrderRouter = require('./router/dineOrder');
const takeawayOrderRouter = require('./router/takeawayOrder');
const payOrderRouter = require('./router/payOrder');
const orderHistoryRouter = require('./router/orderHistory');
const reportRouter = require('./router/report');
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/dinein-order', dineOrderRouter);
app.use('/takeaway-order', takeawayOrderRouter);
app.use('/pay-order', payOrderRouter);
app.use('/order-history', orderHistoryRouter);
app.use('/report', reportRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
