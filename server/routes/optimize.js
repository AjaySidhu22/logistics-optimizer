// E:\logistics-optimizer\server\routes\optimize.js

const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const { optimizeRoute } = require('../services/routeOptimizer');
const { getTrafficPrediction } = require('../services/geminiService');

// POST optimize route
router.post('/', async (req, res) => {
  try {
    const { vehicleId, deliveryIds } = req.body;

    if (!vehicleId || !deliveryIds || deliveryIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'vehicleId and deliveryIds are required' 
      });
    }

    // Fetch vehicle and deliveries
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

    const deliveries = await Delivery.find({ _id: { $in: deliveryIds } });
    if (deliveries.length === 0) {
      return res.status(404).json({ success: false, error: 'No deliveries found' });
    }

    // Run optimization
    const optimized = optimizeRoute(vehicle, deliveries);

    // Get AI traffic prediction
    let aiSuggestion = '';
    try {
      aiSuggestion = await getTrafficPrediction(optimized, vehicle);
    } catch (aiErr) {
      aiSuggestion = 'AI traffic analysis unavailable at this time.';
    }

    // Save route to DB
    const route = new Route({
      vehicleId: vehicle._id,
      deliveries: optimized.sequence.map((stop, idx) => ({
        deliveryId: stop.delivery._id,
        sequence: idx + 1,
        estimatedArrival: stop.estimatedArrival,
        distanceFromPrev: stop.distanceFromPrev
      })),
      totalDistance: optimized.totalDistance,
      totalTime: optimized.totalTime,
      waypoints: optimized.waypoints,
      aiTrafficSuggestion: aiSuggestion,
      status: 'planned'
    });

    await route.save();

    res.json({
      success: true,
      data: {
        route,
        optimizedSequence: optimized.sequence,
        totalDistance: optimized.totalDistance,
        totalTime: optimized.totalTime,
        waypoints: optimized.waypoints,
        aiSuggestion
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single route
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('vehicleId');
    if (!route) return res.status(404).json({ success: false, error: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;