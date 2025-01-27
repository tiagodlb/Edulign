import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import setupSwagger from './config/swagger.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { db } from './config/prisma.js';

const app = express();

// Security configuration
const corsOptions = {
  origin: process.env['CORS_ORIGIN'] || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env['NODE_ENV'] === 'production' ? 100 : 1000, // Limit each IP
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware setup with detailed explanations
app.use(helmet()); // Adds various HTTP headers for security
app.use(cors(corsOptions)); // Configure CORS with our options
app.use(compression()); // Compress response bodies for better performance
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Request logging in development environment
if (process.env['NODE_ENV'] !== 'production') {
  app.use(morgan('dev'));
}

// Apply rate limiting to all routes
app.use(limiter);

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV']
  });
});

// Configure Swagger documentation
setupSwagger(app);

// API routes with version prefix
const API_PREFIX = '/eduling';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Handle 404 errors for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Server initialization with graceful shutdown
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`
🚀 Server is running in ${process.env.NODE_ENV} mode
📡 Listening on port ${process.env.PORT || 3000}
📚 API Documentation: http://localhost:${process.env.PORT || 3000}/api-docs
  `);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close the HTTP server
  server.close(async () => {
    console.log('HTTP server closed.');

    try {
      // Disconnect from database
      await db.$disconnect();
      console.log('Database connection closed.');

      console.log('Graceful shutdown completed.');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Setup signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('Uncaught Exception');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('Unhandled Rejection');
});

export default app;