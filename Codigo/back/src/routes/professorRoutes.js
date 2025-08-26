import express from 'express';
import * as professorController from '../controllers/professorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import professorMiddleware from '../middleware/professorMiddleware.js';

const router = express.Router();

// Turmas
router.get('/turmas', authMiddleware, professorMiddleware, professorController.listarTurmas);
router.post('/turmas', authMiddleware, professorMiddleware, professorController.criarTurma);
router.put('/turmas/:id', authMiddleware, professorMiddleware, professorController.atualizarTurma);
router.delete('/turmas/:id', authMiddleware, professorMiddleware, professorController.excluirTurma);

// Alunos da turma
router.get('/turmas/:id/alunos', authMiddleware, professorMiddleware, professorController.listarAlunosTurma);
router.delete('/turmas/:turmaId/alunos/:alunoId', authMiddleware, professorMiddleware, professorController.removerAluno);

// Simulados da turma
router.post('/turmas/:id/simulados', authMiddleware, professorMiddleware, professorController.criarSimuladoTurma);
router.get('/turmas/:id/simulados', authMiddleware, professorMiddleware, professorController.listarSimuladosTurma);

// Materiais
router.post('/turmas/:id/materiais', authMiddleware, professorMiddleware, professorController.adicionarMaterial);
router.get('/turmas/:id/materiais', authMiddleware, professorMiddleware, professorController.listarMateriais);

export default router;