import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import validateRequest from '../middleware/joiValidationMiddleware.js';
import { adminSchema, questionSchema } from '../utils/validationSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Funcionalidades específicas para administradores
 */

// CRUD DE USUÁRIOS 
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
router.get('/users',
  authMiddleware,
  adminMiddleware,
  adminController.listUsers
);

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
  validateRequest(adminSchema),
  adminController.createAdmin  // Changed from createUser to createAdmin to match controller
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
 *           type: string
 *           format: uuid
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

// CRUD DE QUESTION
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
 *               enunciado:
 *                 type: string
 *                 example: Qual é a capital do Brasil?
 *               alternativas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Brasília, São Paulo, Rio de Janeiro]
 *               respostaCorreta:
 *                 type: integer
 *                 example: 0
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
 * /admin/questions/{id}:
 *   delete:
 *     summary: Exclui uma questão
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Questão excluída com sucesso
 *       404:
 *         description: Questão não encontrada
 */
router.delete('/questions/:id',
  authMiddleware,
  adminMiddleware,
  adminController.deleteQuestion
);

/**
 * @swagger
 * /admin/questions/{id}:
 *   put:
 *     summary: Atualiza uma questão existente
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enunciado:
 *                 type: string
 *                 example: Qual é a capital do Brasil?
 *               alternativas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Brasília, São Paulo, Rio de Janeiro]
 *               respostaCorreta:
 *                 type: integer
 *                 example: 0
 *               area:
 *                 type: string
 *                 example: Geografia
 *               ano:
 *                 type: integer
 *                 example: 2024
 *     responses:
 *       200:
 *         description: Questão atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Questão não encontrada
 */
router.put('/questions/:id',
  authMiddleware,
  adminMiddleware,
  validateRequest(questionSchema),
  adminController.updateQuestion
);

// CRUD DE IA RESPONSE
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
 *                 type: string
 *                 format: uuid
 *               revisedResponse:
 *                 type: string
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


/**
 * @swagger
 * /admin/delete-response/{id}:
 *   delete:
 *     summary: Exclui uma resposta
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resposta excluída com sucesso
 *       404:
 *         description: Resposta não encontrada
 */
router.delete('/delete-response/:id', 
  authMiddleware,
  adminMiddleware,
  adminController.deleteResponse
);

export default router;