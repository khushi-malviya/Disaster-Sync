require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DisasterSync API is running!',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/incidents', 
      '/api/users',
      '/api/alerts'
    ]
  });
});

module.exports = app;
