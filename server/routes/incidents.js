const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const authMiddleware = require('../middleware/auth');

// Get all incidents (no auth required for now)
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ reportedAt: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new incident (no auth required for now)
router.post('/', async (req, res) => {
  const { title, description, location, severity, address } = req.body;
  const incident = new Incident({
    title,
    description,
    location,
    severity,
    address: address || ''
  });

  try {
    const newIncident = await incident.save();
    
    // Emit to all connected clients
    if (global.io) {
      global.io.emit('newIncident', newIncident);
    }
    
    res.status(201).json(newIncident);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update incident status (admin/volunteer only)
router.patch('/:id/status', authMiddleware(['admin', 'volunteer']), async (req, res) => {
  try {
    const { status } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Emit update to all clients
    if (global.io) {
      global.io.emit('incidentUpdated', incident);
    }
    
    res.json(incident);
  } catch (err) {
    console.error('Error updating incident:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete incident (admin only)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Emit deletion to all clients
    if (global.io) {
      global.io.emit('incidentDeleted', req.params.id);
    }
    
    res.json({ message: 'Incident deleted successfully' });
  } catch (err) {
    console.error('Error deleting incident:', err);
    res.status(400).json({ message: err.message });
  }
});

router.get('/assigned', authMiddleware(['volunteer', 'admin']), async (req, res) => {
  try {
    // Example: assuming incidents have an assignedTo field with user id
    const userId = req.user.id;
    const assignedIncidents = await Incident.find({ assignedTo: userId }).sort({ reportedAt: -1 });
    res.json(assignedIncidents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign incident to a volunteer (admin only)
router.patch('/:id/assign', authMiddleware(['admin']), async (req, res) => {
  const { volunteerId } = req.body;
  try {
    if (!volunteerId) return res.status(400).json({ message: 'volunteerId required' });

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { assignedTo: volunteerId, status: 'In Progress' }, // optionally update status
      { new: true }
    );
    if (!incident) return res.status(404).json({ message: 'Incident not found' });

    if (global.io) global.io.emit('incidentUpdated', incident);

    res.json(incident);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post('/:id/request-assignment', authMiddleware(['volunteer']), async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const incidentId = req.params.id;

    // Here you would store a request in DB, or notify admin; For demo:
    // Emit event to admins or save to a collection for admin review

    if (global.io) {
      global.io.emit('assignmentRequest', { incidentId, volunteerId });
    }

    res.status(200).json({ message: 'Assignment request sent to admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
