import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/joiValidationMiddleware.js';
import { registerSchema, loginSchema } from '../utils/validationSchemas.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nome completo do usuário
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário (será usado para login)
 *           example: joao@exemplo.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           description: Senha (mínimo 8 caracteres, deve incluir maiúsculas, minúsculas, números e caracteres especiais)
 *           example: Senha@123
 *     
 *     LoginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email cadastrado do usuário
 *           example: joao@exemplo.com
 *         password:
 *           type: string
 *           format: password
 *           description: Senha do usuário
 *           example: Senha@123
 *     
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         isAdmin:
 *           type: boolean
 *           description: Indica se o usuário é administrador
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação da conta
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT de autenticação
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints para autenticação e gerenciamento de usuários
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário no sistema
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuário cadastrado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Dados inválidos ou campos faltando
 *       409:
 *         description: Email já cadastrado
 */
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza a autenticação do usuário
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR...
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Credenciais inválidas
 *       429:
 *         description: Muitas tentativas de login
 */
router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  authController.login
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Perfil recuperado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Não autorizado
 */
router.get(
  '/profile',
  authMiddleware,
  authController.getProfile
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Atualiza o token de autenticação
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token atualizado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR...
 *       401:
 *         description: Token inválido ou expirado
 */
router.post(
  '/refresh-token',
  authMiddleware,
  authController.refreshToken
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realiza o logout do usuário
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

export default router;