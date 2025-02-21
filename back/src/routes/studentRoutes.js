import express from 'express';
import * as studentController from '../controllers/studentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/joiValidationMiddleware.js';
import { simulatedExamSchema, simulatedExamUpdateSchema, questionIdSchema, aiSimulatedExamSchema } from '../utils/validationSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Funcionalidades específicas para alunos
 */

// LISTAR PROVAS ENADE
/**
 * @swagger
 * /student/exams:
 *   get:
 *     summary: Lista provas ENADE com filtros opcionais
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Ano da prova ENADE
 *       - in: query
 *         name: knowledgeArea
 *         schema:
 *           type: string
 *         description: Área de conhecimento da prova ENADE
 *     responses:
 *       200:
 *         description: Provas ENADE listadas com sucesso
 *       401:
 *         description: Token inválido ou usuário não autorizado
 */
router.get('/exams', authMiddleware, studentController.listEnadeExams);

// BUSCAR QUESTÕES
/**
 * @swagger
 * /student/questions/search:
 *   post:
 *     summary: Busca questões específicas no banco de dados
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: Brasil
 *     responses:
 *       200:
 *         description: Questões encontradas com sucesso
 *       400:
 *         description: Termo de busca não fornecido
 */
router.post('/questions/search', authMiddleware, studentController.searchQuestions);

// CRIAR SIMULADO
/**
 * @swagger
 * /student/simulated-exams:
 *   post:
 *     summary: Cria um simulado personalizado
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               knowledgeArea:
 *                 type: string
 *                 example: Ciências Humanas
 *               numberOfQuestions:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Simulado criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/simulated-exams',
  authMiddleware,
  validateRequest(simulatedExamSchema),
  studentController.createAiSimulatedExam
);

router.get(
  '/simulated-exams',
  authMiddleware,
  studentController.getAllSimulatedExamsById
);

// ACESSAR SIMULADO
/**
 * @swagger
 * /student/simulated-exams/{id}:
 *   get:
 *     summary: Recupera um simulado específico pelo ID
 *     tags: [Student]
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
 *         description: Simulado recuperado com sucesso
 *       404:
 *         description: Simulado não encontrado
 */
router.get('/simulated-exam/:id', authMiddleware, studentController.getSimulatedExam);

/**
 * @swagger
 * /student/simulated-exams/{id}:
 *   put:
 *     summary: Atualiza um simulado existente
 *     tags: [Student]
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
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       format: uuid
 *                     selectedAnswer:
 *                       type: string
 *                     timeSpent:
 *                       type: number
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Simulado atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Simulado não encontrado
 */
router.put(
  '/simulated-exams/:id',
  authMiddleware,
  validateRequest(simulatedExamUpdateSchema),
  studentController.updateSimulatedExam
);

// OBTER EXPLICAÇÃO DE QUESTÃO
/**
 * @swagger
 * /student/questions/{id}/explanation:
 *   get:
 *     summary: Obtém a explicação detalhada de uma questão
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da questão
 *     responses:
 *       200:
 *         description: Explicação obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     explanation:
 *                       type: string
 *                     questionId:
 *                       type: string
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Questão não encontrada
 *       500:
 *         description: Erro ao gerar explicação
 */
router.get(
  '/questions/:id/explanation',
  authMiddleware,
  validateRequest(questionIdSchema),
  studentController.getQuestionExplanation
);

// VISUALIZAR ESTATÍSTICAS
/**
 * @swagger
 * /student/statistics:
 *   get:
 *     summary: Obtém estatísticas de desempenho do aluno
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *       404:
 *         description: Estatísticas não encontradas
 */
router.get('/statistics', authMiddleware, studentController.getStudentStatistics);

// EXPORTAR DADOS EM PDF
/**
 * @swagger
 * /student/export-data:
 *   get:
 *     summary: Exporta os dados do aluno em formato PDF
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arquivo PDF gerado com sucesso
 *       404:
 *         description: Dados do aluno não encontrados
 */
router.get('/export-data', authMiddleware, studentController.exportStudentData);

/**
 * @swagger
 * /student/simulated-exams/ai-enade:
 *   post:
 *     summary: Cria um simulado ENADE personalizado usando IA
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               area:
 *                 type: string
 *                 example: "Computação"
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Estruturas de Dados", "Algoritmos", "Banco de Dados"]
 *               numberOfQuestions:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 30
 *                 example: 10
 *     responses:
 *       201:
 *         description: Simulado ENADE criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/simulated-exams/ai-enade',
  authMiddleware,
  validateRequest(aiSimulatedExamSchema),
  studentController.createAiSimulatedExam
);

export default router;