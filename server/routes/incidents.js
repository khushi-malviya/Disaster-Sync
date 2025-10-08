const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new incident
router.post('/', async (req, res) => {
  const { title, description, location, severity } = req.body;
  const incident = new Incident({
    title,
    description,
    location,
    severity,
  });

  try {
    const newIncident = await incident.save();
    res.status(201).json(newIncident);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }

  const newIncident = await incident.save();
  io.emit('newIncident', newIncident); // Broadcast to all clients
  res.status(201).json(newIncident);
});

module.exports = router;
