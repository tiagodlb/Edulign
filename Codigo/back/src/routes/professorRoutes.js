// back/src/routes/professorRoutes.js
import express from 'express';
import * as professorController from '../controllers/professorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import professorMiddleware from '../middleware/professorMiddleware.js';
import { uploadSingle } from '../config/upload.js';

const router = express.Router();

// Todas as rotas requerem autenticação e papel de professor
router.use(authMiddleware, professorMiddleware);

// ========== TURMAS ==========
router.get('/turmas', professorController.listarTurmas);
router.post('/turmas', professorController.criarTurma);
router.put('/turmas/:id', professorController.atualizarTurma);
router.delete('/turmas/:id', professorController.excluirTurma);

// ========== ALUNOS DA TURMA ==========
router.get('/turmas/:id/alunos', professorController.listarAlunosTurma);
router.delete('/turmas/:turmaId/alunos/:alunoId', professorController.removerAluno);

// ========== SIMULADOS DA TURMA ==========
router.post('/turmas/:id/simulados', professorController.criarSimuladoTurma);
router.get('/turmas/:id/simulados', professorController.listarSimuladosTurma);
router.get('/turmas/:turmaId/simulados/:simuladoId', professorController.obterDesempenhoSimulado);

// ========== MATERIAIS DA TURMA ==========
// Rota com upload de arquivo
router.post('/turmas/:id/materiais', 
  uploadSingle('arquivo'), // Middleware de upload
  professorController.adicionarMaterial
);

// Rota sem upload (apenas links)
router.get('/turmas/:id/materiais', professorController.listarMateriais);
router.delete('/turmas/:turmaId/materiais/:materialId', professorController.removerMaterial);

// ========== DOWNLOAD E VISUALIZAÇÃO DE MATERIAIS ==========
router.get('/materials/:materialId/download', async (req, res) => {
  try {
    const { materialId } = req.params;
    
    // Buscar material no banco
    const material = await db.materialTurma.findUnique({
      where: { id: materialId }
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material não encontrado'
      });
    }
    
    // Se for um link, redirecionar
    if (material.tipo === 'LINK' && material.url) {
      return res.redirect(material.url);
    }
    
    // Se for arquivo, fazer download
    if (material.arquivo) {
      const filePath = path.join(__dirname, '../../', material.arquivo);
      return res.download(filePath, material.titulo);
    }
    
    res.status(400).json({
      success: false,
      message: 'Material sem arquivo ou URL'
    });
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer download do material'
    });
  }
});

router.get('/materials/:materialId/view', async (req, res) => {
  try {
    const { materialId } = req.params;
    
    // Buscar material no banco
    const material = await db.materialTurma.findUnique({
      where: { id: materialId }
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material não encontrado'
      });
    }
    
    // Se for um link, retornar a URL
    if (material.tipo === 'LINK' && material.url) {
      return res.json({
        success: true,
        url: material.url
      });
    }
    
    // Se for arquivo, retornar URL para visualização
    if (material.arquivo) {
      const fileUrl = `${process.env.APP_URL || 'http://localhost:3000'}/${material.arquivo}`;
      return res.json({
        success: true,
        url: fileUrl
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Material sem arquivo ou URL'
    });
  } catch (error) {
    console.error('Erro na visualização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao visualizar material'
    });
  }
});

// ========== ESTATÍSTICAS ==========
router.get('/turmas/:id/estatisticas', professorController.obterEstatisticasTurma);

// ========== GERENCIAMENTO DE PROFESSORES ==========
router.post('/turmas/:id/professores', professorController.adicionarProfessor);
router.delete('/turmas/:turmaId/professores/:professorId', professorController.removerProfessor);

export default router;