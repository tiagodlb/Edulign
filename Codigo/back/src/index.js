// back/src/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import professorRoutes from './routes/professorRoutes.js';
import setupSwagger from './config/swagger.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { db } from './config/prisma.js';

const app = express();

// Security configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};

// Rate limiting configuration
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  message: 'Too many requests from this IP, please try again later',
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 500,
  message: 'Too many requests from this IP, please try again later',
});

const professorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 800,
  message: 'Too many requests from this IP, please try again later',
});

// Middleware setup
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Support for file uploads
app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Swagger documentation
setupSwagger(app);

// API routes with version prefix
const API_PREFIX = '/eduling';
app.use(`${API_PREFIX}/auth`, publicLimiter, authRoutes);
app.use(`${API_PREFIX}/admin`, adminLimiter, adminRoutes);
app.use(`${API_PREFIX}/student`, publicLimiter, studentRoutes);
app.use(`${API_PREFIX}/professor`, professorLimiter, professorRoutes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Server initialization
const server = app.listen(process.env.PORT || 4333, () => {
  console.log(`
🚀 Server is running in ${process.env.NODE_ENV} mode
📡 Listening on port ${process.env.PORT || 4333}
📚 API Documentation: http://localhost:${process.env.PORT || 4333}/api-docs
  `);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await db.$disconnect();
      console.log('Database connection closed.');
      console.log('Graceful shutdown completed.');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
