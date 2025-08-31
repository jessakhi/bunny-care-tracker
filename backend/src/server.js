const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const logsRouter = require('./routes/logs');
const eventsRouter = require('./routes/events');
const dashboardRouter = require('./routes/dashboard'); // ✅ singular

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Hide tech stack header
app.disable('x-powered-by');

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'bunny-care-tracker-backend', ts: new Date().toISOString() });
});

// Routes
app.use('/api/logs', logsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/dashboard', dashboardRouter);

// Boot
async function startServer() {
  const { MONGO_URI, PORT } = process.env;
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }
  const port = Number(PORT) || 5000;

  try {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('MongoDB connection error:', err));

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
