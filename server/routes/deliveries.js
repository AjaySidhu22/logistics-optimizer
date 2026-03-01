// E:\logistics-optimizer\server\routes\deliveries.js

const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');

// GET all deliveries
router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.json({ success: true, data: deliveries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single delivery
router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create delivery
router.post('/', async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();
    res.status(201).json({ success: true, data: delivery });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update delivery
router.put('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE delivery
router.delete('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, error: 'Delivery not found' });
    res.json({ success: true, message: 'Delivery deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE all deliveries
router.delete('/', async (req, res) => {
  try {
    await Delivery.deleteMany({});
    res.json({ success: true, message: 'All deliveries cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;