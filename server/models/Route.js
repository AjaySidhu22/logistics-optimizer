const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  deliveries: [{
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery'
    },
    sequence: Number,
    estimatedArrival: String,
    distanceFromPrev: Number
  }],
  totalDistance: {
    type: Number,
    default: 0
  },
  totalTime: {
    type: Number,
    default: 0
  },
  optimizedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  aiTrafficSuggestion: {
    type: String,
    default: ''
  },
  waypoints: [{
    lat: Number,
    lng: Number,
    address: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);