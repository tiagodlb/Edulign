import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js'; // Middleware para verificar se o usuário é administrador
import validateRequest from '../middleware/joiValidationMiddleware.js';
import { userSchema, questionSchema } from '../utils/validationSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Funcionalidades específicas para administradores
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Token inválido ou usuário não autorizado
 */
router.get('/users', authMiddleware, adminMiddleware, adminController.listUsers);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Cadastra um novo administrador ou aluno
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@edulign.com
 *               password:
 *                 type: string
 *                 example: Senha123!
 *               name:
 *                 type: string
 *                 example: Admin
 *               role:
 *                 type: string
 *                 enum: [student, admin]
 *                 example: admin
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/users', 
  authMiddleware, 
  adminMiddleware, 
  validateRequest(userSchema), 
  adminController.createUser
);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Exclui um usuário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/users/:id', 
  authMiddleware, 
  adminMiddleware, 
  adminController.deleteUser
);

/**
 * @swagger
 * /admin/questions:
 *   post:
 *     summary: Adiciona uma nova questão
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: Qual é a capital do Brasil?
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Brasília, São Paulo, Rio de Janeiro]
 *               correctAnswer:
 *                 type: string
 *                 example: Brasília
 *     responses:
 *       201:
 *         description: Questão criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/questions', 
  authMiddleware, 
  adminMiddleware, 
  validateRequest(questionSchema), 
  adminController.createQuestion
);

/**
 * @swagger
 * /admin/review-response:
 *   put:
 *     summary: Revisa uma resposta da IA
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responseId:
 *                 type: integer
 *                 example: 123
 *               revisedResponse:
 *                 type: string
 *                 example: A capital do Brasil é Brasília.
 *     responses:
 *       200:
 *         description: Resposta revisada com sucesso
 *       404:
 *         description: Resposta não encontrada
 */
router.put('/review-response', 
  authMiddleware, 
  adminMiddleware, 
  adminController.reviewResponse
);

export default router;
