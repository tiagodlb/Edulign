import jwt from 'jsonwebtoken';
import { AppError } from './errorMiddleware.js';

/**
 * Authentication middleware that verifies JWT tokens and manages user sessions.
 * This middleware extracts the JWT token from the Authorization header,
 * verifies its authenticity and expiration, and attaches the decoded user
 * information to the request object for use in subsequent route handlers.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // Check if the Authorization header exists and has the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Token de autenticação não fornecido ou em formato inválido',
        401,
        'authentication'
      );
    }

    // Extract the token from the header
    const token = authHeader.replace('Bearer ', '');

    // Set security headers to prevent XSS and other security issues
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    try {
      // Verify the token and decode its payload
      const decoded = jwt.verify(token, process.env['JWT_SECRET']);

      // Check if the token is about to expire (within 5 minutes)
      const tokenExp = decoded.exp * 1000; // Convert to milliseconds
      const fiveMinutes = 5 * 60 * 1000;
      const isExpiringSoon = tokenExp - Date.now() <= fiveMinutes;

      if (isExpiringSoon) {
        // Add a header to indicate the token needs refresh
        res.setHeader('X-Token-Expiring-Soon', 'true');
      }

      // Attach the decoded user information to the request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        isAdmin: decoded.admin,
        tokenExp: decoded.exp
      };

      if (process.env['NODE_ENV'] === 'development') {
        console.log('Authentication successful:', {
          userId: decoded.id,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }

      next();

    } catch (jwtError) {
      // Handle different types of JWT errors with specific messages
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError(
          'Sua sessão expirou. Por favor, faça login novamente',
          401,
          'authentication'
        );
      }

      if (jwtError.name === 'JsonWebTokenError') {
        throw new AppError(
          'Token de autenticação inválido',
          401,
          'authentication'
        );
      }

      // Handle any other JWT-related errors
      throw new AppError(
        'Erro na autenticação: ' + jwtError.message,
        401,
        'authentication'
      );
    }

  } catch (error) {
    // If it's already an AppError, pass it along
    if (error instanceof AppError) {
      next(error);
      return;
    }

    // Handle any unexpected errors
    next(new AppError(
      'Erro inesperado durante autenticação',
      500,
      'authentication'
    ));
  }
};

/**
 * Helper function to extract and validate a token
 * This can be used independently of the middleware if needed
 */
export const validateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET']);
    return {
      valid: true,
      decoded,
      expiringSoon: (decoded.exp * 1000) - Date.now() <= 5 * 60 * 1000
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

export default authMiddleware;