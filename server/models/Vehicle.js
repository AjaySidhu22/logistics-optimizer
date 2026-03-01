// E:\logistics-optimizer\server\models\Vehicle.js

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  plateNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 100
  },
  currentLocation: {
    lat: { type: Number, default: 28.6139 }, // Default: New Delhi
    lng: { type: Number, default: 77.2090 }
  },
  status: {
    type: String,
    enum: ['available', 'on-route', 'maintenance'],
    default: 'available'
  },
  driverName: {
    type: String,
    default: ''
  },
  speed: {
    type: Number,
    default: 40 // km/h average speed
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);