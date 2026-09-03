const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, category, gender, age, businessStage, sector, location, annualIncome, aadhaarHash, educationLevel, isStreetVendor, hasVendingCertificate } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      email, password, name, role: role || 'applicant',
      category, gender, age, businessStage, sector, location,
      annualIncome, aadhaarHash, educationLevel, isStreetVendor, hasVendingCertificate
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        category: user.category, gender: user.gender, age: user.age,
        businessStage: user.businessStage, sector: user.sector,
        location: user.location, annualIncome: user.annualIncome,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        category: user.category, gender: user.gender, age: user.age,
        businessStage: user.businessStage, sector: user.sector,
        location: user.location, annualIncome: user.annualIncome,
        educationLevel: user.educationLevel,
        isStreetVendor: user.isStreetVendor,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// PUT /api/auth/profile — update profile for re-matching
router.put('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.email;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

module.exports = router;
