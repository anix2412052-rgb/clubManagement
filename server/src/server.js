import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart College Event & Club Management API is up and running!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler for unknown API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

// Start Server after connecting to database

const startServer = async () => {
  try {
    // Check whether this API is already running on the configured port
    try {
      const response = await fetch(
        `http://127.0.0.1:${PORT}/api/health`,
        { signal: AbortSignal.timeout(2000) }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.status === 'ok') {
          console.log(
            `✅ CampusHub API is already running on http://localhost:${PORT}`
          );
          return;
        }
      }
    } catch {
      // No responding API found; continue with normal startup
    }

    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `❌ Port ${PORT} is occupied by another process.`
        );
        console.error(
          'Stop the other process or configure a different PORT.'
        );
      } else {
        console.error('Server startup error:', err.message);
      }

      process.exitCode = 1;
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exitCode = 1;
  }
};

startServer();