// E:\logistics-optimizer\server\models\Delivery.js

const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  customerName: {
    type: String,
    required: true
  },
  packageWeight: {
    type: Number,
    default: 1
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  timeWindow: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);