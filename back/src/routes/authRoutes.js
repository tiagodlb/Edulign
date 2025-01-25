import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/joiValidationMiddleware.js';
import { registerSchema, loginSchema } from '../utils/validationSchemas.js';

const router = express.Router();

router.post('/register', 
  validateRequest(registerSchema), 
  authController.register
);

router.post('/login', 
  validateRequest(loginSchema), 
  authController.login
);

router.get('/profile', 
  authMiddleware, 
  authController.getProfile
);

export default router;