const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const { protect } = require('../middleware/auth');

// GET /api/schemes — list all active schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find({ isActive: true }).sort({ name: 1 });
    res.json({ schemes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schemes', error: error.message });
  }
});

// GET /api/schemes/:id — get single scheme with full details
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json({ scheme });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch scheme', error: error.message });
  }
});

module.exports = router;
