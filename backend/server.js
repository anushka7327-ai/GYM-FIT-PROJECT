const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Parse CLIENT_URL from environment variable (supports comma-separated origins)
const rawClientUrl = process.env.CLIENT_URL || '';
const configuredOrigins = rawClientUrl
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Default development origins
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

// Production-ready CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health checks)
      if (!origin) return callback(null, true);

      // Check if origin matches configured CLIENT_URL(s)
      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if origin matches Vercel deployments (*.vercel.app)
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Allow local development origins
      if (devOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In non-production or if CLIENT_URL is explicitly wildcard, allow all
      if (process.env.NODE_ENV !== 'production' || process.env.CLIENT_URL === '*') {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Request origin "${origin}" not allowed by CLIENT_URL: ${rawClientUrl}`);
      callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint (for Render health probes and uptime monitoring)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    app: 'GymFit API',
    database: dbStatusMap[dbState] || 'unknown',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/routines', require('./routes/routineRoutes'));
app.use('/api/workout-logs', require('./routes/workoutLogRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve frontend static build if available (unified full-stack mode)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  console.log(`Serving unified frontend from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // If backend is running standalone (e.g. Render backend with separate Vercel frontend)
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      app: 'GymFit API (Production)',
      environment: process.env.NODE_ENV || 'production',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        plans: '/api/plans',
        subscriptions: '/api/subscriptions',
        routines: '/api/routines',
        workoutLogs: '/api/workout-logs',
        analytics: '/api/analytics',
      },
    });
  });

  // 404 handler for API routes
  app.use((req, res, next) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` GymFit Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` CORS Allowed: ${rawClientUrl || 'Local + *.vercel.app'}`);
  console.log(` Health Probe: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

// Graceful shutdown handling for Render
const handleGracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Closing HTTP server gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed. Disconnecting from database...');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    } catch (e) {}
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});
