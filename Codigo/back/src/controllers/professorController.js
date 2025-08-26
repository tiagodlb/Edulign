import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as professorService from '../services/professorService.js';
import { db } from '../config/prisma.js';

// ========== TURMAS ==========

// Listar todas as turmas do professor
export const listarTurmas = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Buscar o professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const turmas = await professorService.listarTurmasProfessor(professor.id);
  
  res.status(200).json({ 
    success: true, 
    data: turmas 
  });
});

// Criar nova turma
export const criarTurma = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { nome, descricao } = req.body;

  if (!nome) {
    throw new AppError('Nome da turma é obrigatório', 400);
  }

  // Buscar o professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const turma = await professorService.criarTurma(professor.id, {
    nome,
    descricao
  });

  res.status(201).json({ 
    success: true, 
    data: turma,
    message: 'Turma criada com sucesso' 
  });
});

// Atualizar turma
export const atualizarTurma = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { nome, descricao, ativa } = req.body;

  // Verificar se o professor tem acesso à turma
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, id);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  const turmaAtualizada = await professorService.atualizarTurma(id, {
    nome,
    descricao,
    ativa
  });

  res.status(200).json({ 
    success: true, 
    data: turmaAtualizada,
    message: 'Turma atualizada com sucesso' 
  });
});

// Excluir turma
export const excluirTurma = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // Verificar se o professor tem acesso e é o professor principal
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const isPrincipal = await professorService.verificarProfessorPrincipal(professor.id, id);
  if (!isPrincipal) {
    throw new AppError('Apenas o professor principal pode excluir a turma', 403);
  }

  await professorService.excluirTurma(id);

  res.status(200).json({ 
    success: true, 
    message: 'Turma excluída com sucesso' 
  });
});

// ========== ALUNOS DA TURMA ==========

// Listar alunos de uma turma
export const listarAlunosTurma = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { page = 1, limit = 20, search } = req.query;

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, id);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  const alunos = await professorService.listarAlunosTurma(id, {
    page: parseInt(page),
    limit: parseInt(limit),
    search
  });

  res.status(200).json({ 
    success: true, 
    data: alunos.data,
    pagination: alunos.pagination
  });
});

// Remover aluno da turma
export const removerAluno = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { turmaId, alunoId } = req.params;

  // Verificar se o professor tem acesso à turma
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  await professorService.removerAlunoDaTurma(turmaId, alunoId);

  res.status(200).json({ 
    success: true, 
    message: 'Aluno removido da turma com sucesso' 
  });
});

// ========== SIMULADOS DA TURMA ==========

// Criar simulado para turma
export const criarSimuladoTurma = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: turmaId } = req.params;
  const { 
    titulo, 
    tipo, 
    area, 
    tempoLimite, 
    questoes,
    dataLiberacao,
    dataEncerramento 
  } = req.body;

  // Validações
  if (!titulo || !tipo || !area || !tempoLimite || !questoes || questoes.length === 0) {
    throw new AppError('Dados incompletos para criar o simulado', 400);
  }

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  const simulado = await professorService.criarSimuladoParaTurma({
    turmaId,
    titulo,
    tipo,
    area,
    tempoLimite,
    questoes,
    dataLiberacao: new Date(dataLiberacao),
    dataEncerramento: dataEncerramento ? new Date(dataEncerramento) : null
  });

  res.status(201).json({ 
    success: true, 
    data: simulado,
    message: 'Simulado criado com sucesso para a turma'
  });
});

// Listar simulados da turma
export const listarSimuladosTurma = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: turmaId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  const simulados = await professorService.listarSimuladosTurma(turmaId, {
    status,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.status(200).json({ 
    success: true, 
    data: simulados.data,
    pagination: simulados.pagination
  });
});

// ========== ESTATÍSTICAS E RELATÓRIOS ==========

// Obter estatísticas da turma
export const obterEstatisticasTurma = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: turmaId } = req.params;

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  const estatisticas = await professorService.obterEstatisticasTurma(turmaId);

  res.status(200).json({ 
    success: true, 
    data: estatisticas
  });
});

// Obter desempenho dos alunos em um simulado
export const obterDesempenhoSimulado = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { turmaId, simuladoId } = req.params;

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  const desempenho = await professorService.obterDesempenhoSimulado(turmaId, simuladoId);

  res.status(200).json({ 
    success: true, 
    data: desempenho
  });
});

// ========== GERENCIAMENTO DE PROFESSORES ==========

// Adicionar outro professor à turma
export const adicionarProfessor = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: turmaId } = req.params;
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email do professor é obrigatório', 400);
  }

  // Verificar se o professor atual é o principal
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const isPrincipal = await professorService.verificarProfessorPrincipal(professor.id, turmaId);
  if (!isPrincipal) {
    throw new AppError('Apenas o professor principal pode adicionar outros professores', 403);
  }

  const novoProfessor = await professorService.adicionarProfessorTurma(turmaId, email);

  res.status(200).json({ 
    success: true, 
    data: novoProfessor,
    message: 'Professor adicionado à turma com sucesso'
  });
});

// Remover professor da turma
export const removerProfessor = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { turmaId, professorId } = req.params;

  // Verificar se o professor atual é o principal
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const isPrincipal = await professorService.verificarProfessorPrincipal(professor.id, turmaId);
  if (!isPrincipal) {
    throw new AppError('Apenas o professor principal pode remover outros professores', 403);
  }

  // Não permitir remover o próprio professor principal
  if (professor.id === professorId) {
    throw new AppError('O professor principal não pode ser removido', 400);
  }

  await professorService.removerProfessorTurma(turmaId, professorId);

  res.status(200).json({ 
    success: true, 
    message: 'Professor removido da turma com sucesso'
  });
});

export const adicionarMaterial = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: turmaId } = req.params;
  const { titulo, descricao, tipo, url, tags, categoria } = req.body;
  const arquivo = req.file; // Arquivo enviado via multer

  // Validações
  if (!titulo || !tipo) {
    throw new AppError('Título e tipo do material são obrigatórios', 400);
  }

  // Validar tipo
  const tiposValidos = ['PDF', 'VIDEO', 'LINK', 'DOCUMENTO'];
  if (!tiposValidos.includes(tipo)) {
    throw new AppError('Tipo de material inválido', 400);
  }

  // Se for link, precisa ter URL
  if (tipo === 'LINK' && !url) {
    throw new AppError('URL é obrigatória para materiais do tipo LINK', 400);
  }

  // Se não for link, precisa ter arquivo
  if (tipo !== 'LINK' && !arquivo) {
    throw new AppError('Arquivo é obrigatório para este tipo de material', 400);
  }

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  // Preparar dados do material
  const materialData = {
    titulo,
    descricao: descricao || null,
    tipo,
    url: url || null,
    arquivo: arquivo ? arquivo.path : null, // Caminho do arquivo salvo
    tamanho: arquivo ? `${(arquivo.size / (1024 * 1024)).toFixed(2)} MB` : null,
    tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
    categoria: categoria || 'Geral'
  };

  // Adicionar material via service
  const material = await professorService.adicionarMaterial(turmaId, materialData);

  res.status(201).json({ 
    success: true, 
    data: material,
    message: 'Material adicionado com sucesso'
  });
});

// Listar materiais da turma (VERSÃO ATUALIZADA)
export const listarMateriais = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id: turmaId } = req.params;
  const { tipo, page = 1, limit = 20, search } = req.query;

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  // Buscar materiais com filtros
  const materiais = await professorService.listarMateriaisTurma(turmaId, {
    tipo,
    search,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  // Formatar resposta incluindo informações adicionais
  const materiaisFormatados = materiais.data.map(material => ({
    id: material.id,
    titulo: material.titulo,
    descricao: material.descricao,
    tipo: material.tipo,
    url: material.url,
    arquivo: material.arquivo,
    tamanho: material.tamanho,
    tags: material.tags || [],
    categoria: material.categoria || 'Geral',
    turmaId: material.turmaId,
    dataCriacao: material.dataCriacao,
    dataAtualizacao: material.dataAtualizacao
  }));

  res.status(200).json({ 
    success: true, 
    data: {
      data: materiaisFormatados,
      pagination: materiais.pagination
    }
  });
});

// Remover material da turma (mantém a mesma)
export const removerMaterial = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { turmaId, materialId } = req.params;

  // Verificar acesso do professor
  const professor = await db.professor.findFirst({
    where: { usuarioId: userId }
  });

  if (!professor) {
    throw new AppError('Professor não encontrado', 404);
  }

  const hasAccess = await professorService.verificarAcessoTurma(professor.id, turmaId);
  if (!hasAccess) {
    throw new AppError('Acesso negado a esta turma', 403);
  }

  // Buscar material para deletar arquivo se existir
  const material = await db.materialTurma.findUnique({
    where: { id: materialId }
  });

  if (!material) {
    throw new AppError('Material não encontrado', 404);
  }

  // Se tiver arquivo físico, deletar
  if (material.arquivo) {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    const filePath = path.join(process.cwd(), material.arquivo);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      // Continuar mesmo se não conseguir deletar o arquivo
    }
  }

  // Remover do banco de dados
  await professorService.removerMaterial(materialId);

  res.status(200).json({ 
    success: true, 
    message: 'Material removido com sucesso'
  });
});