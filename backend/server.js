const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'احجزلي Dz API (Ihjizli Dz)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/services', require('./src/routes/serviceRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/subscriptions', require('./src/routes/subscriptionRoutes'));
app.use('/api/settings', require('./src/routes/settingsRoutes'));
app.use('/api/financials', require('./src/routes/financialRoutes'));
app.use('/api/favorites', require('./src/routes/favoriteRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(` احجزلي Dz Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;

