const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hexagon';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/match', require('./routes/match'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/grievances', require('./routes/grievances'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HEXAGON API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to MongoDB and start server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB (Local/Cloud)');
  } catch (err) {
    console.log('⚠️ Local MongoDB connection failed. Starting In-Memory MongoDB Server for demo purposes...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to In-Memory MongoDB');
    
    // Auto-seed if using memory server
    console.log('🌱 Seeding in-memory database...');
    try {
      const seedData = require('./utils/seedData');
      await seedData(uri);
      console.log('✅ In-memory database seeded successfully');
    } catch (e) {
      console.log('⚠️ Seeding skipped or failed:', e.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 HEXAGON API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
