const mongoose = require('mongoose');

const dineinTables = mongoose.Schema({
    tableNumber: {
        type: Number
    },
    tableStatus: {
        type: String, 
        default: 'Available'
    }
});

const DineInTable = mongoose.model('DineInTable', dineinTables);
module.exports = DineInTable;