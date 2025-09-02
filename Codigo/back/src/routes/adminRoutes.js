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

// ==================== ROTAS DE USUÁRIOS ====================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lista todos os usuários com filtros e paginação
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, professor, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
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
 *     summary: Cadastra um novo administrador
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
 *     responses:
 *       201:
 *         description: Administrador cadastrado com sucesso
 */
router.post('/users',
  authMiddleware,
  adminMiddleware,
  validateRequest(adminSchema),
  adminController.createAdmin
);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Atualiza dados de um usuário
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
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, professor, admin]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
router.put('/users/:id',
  authMiddleware,
  adminMiddleware,
  adminController.updateUser
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
 */
router.delete('/users/:id',
  authMiddleware,
  adminMiddleware,
  adminController.deleteUser
);

// ==================== ROTAS DE QUESTÕES ====================

/**
 * @swagger
 * /admin/questions:
 *   get:
 *     summary: Lista todas as questões com filtros e paginação
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [enade, custom, all]
 *     responses:
 *       200:
 *         description: Lista de questões retornada com sucesso
 */
router.get('/questions',
  authMiddleware,
  adminMiddleware,
  adminController.listQuestion
);

/**
 * @swagger
 * /admin/questions/{id}:
 *   get:
 *     summary: Obtém uma questão específica por ID
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
 *         description: Questão retornada com sucesso
 *       404:
 *         description: Questão não encontrada
 */
router.get('/questions/:id',
  authMiddleware,
  adminMiddleware,
  adminController.getQuestion
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
 *       201:
 *         description: Questão criada com sucesso
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
 *               alternativas:
 *                 type: array
 *                 items:
 *                   type: string
 *               respostaCorreta:
 *                 type: integer
 *               area:
 *                 type: string
 *               ano:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Questão atualizada com sucesso
 */
router.put('/questions/:id',
  authMiddleware,
  adminMiddleware,
  validateRequest(questionSchema),
  adminController.updateQuestion
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
 */
router.delete('/questions/:id',
  authMiddleware,
  adminMiddleware,
  adminController.deleteQuestion
);

// ==================== ROTAS DE RESPOSTAS DA IA ====================

/**
 * @swagger
 * /admin/responses/pending:
 *   get:
 *     summary: Lista respostas da IA pendentes de revisão
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [question, explanation, hint, all]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low, all]
 *     responses:
 *       200:
 *         description: Lista de respostas pendentes retornada com sucesso
 */
router.get('/responses/pending',
  authMiddleware,
  adminMiddleware,
  adminController.listPendingResponses
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
 *                 type: string
 *                 format: uuid
 *               revisedResponse:
 *                 type: string
 *               feedback:
 *                 type: string
 *               approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Resposta revisada com sucesso
 */
router.put('/review-response',
  authMiddleware,
  adminMiddleware,
  adminController.reviewResponse
);

/**
 * @swagger
 * /admin/responses/bulk-approve:
 *   put:
 *     summary: Aprova ou rejeita respostas em lote
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
 *               responseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               approved:
 *                 type: boolean
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respostas processadas com sucesso
 */
router.put('/responses/bulk-approve',
  authMiddleware,
  adminMiddleware,
  adminController.bulkApproveResponses
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
 */
router.delete('/delete-response/:id', 
  authMiddleware,
  adminMiddleware,
  adminController.deleteResponse
);

// ==================== ROTAS DE ESTATÍSTICAS ====================

/**
 * @swagger
 * /admin/statistics/system:
 *   get:
 *     summary: Obtém estatísticas gerais do sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Estatísticas do sistema retornadas com sucesso
 */
router.get('/statistics/system',
  authMiddleware,
  adminMiddleware,
  adminController.getSystemStatistics
);

/**
 * @swagger
 * /admin/reports/activity:
 *   get:
 *     summary: Gera relatório de atividades
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [users, questions, responses, all]
 *           default: all
 *     responses:
 *       200:
 *         description: Relatório de atividades gerado com sucesso
 */
router.get('/reports/activity',
  authMiddleware,
  adminMiddleware,
  adminController.getActivityReport
);

export default router;