// import mongoose from 'mongoose';
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: String,
  address: String,
  email: String,
  items: [String],
  orderedDate: { type: Date, default: Date.now }
});

module.exports  = mongoose.model('Order', orderSchema);

