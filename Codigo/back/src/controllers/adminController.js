import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as adminService from '../services/adminService.js';

// ==================== CONTROLLERS DE USUÁRIOS ====================

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status } = req.query;
  
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search: search || '',
    role: role || '',
    status: status || 'all'
  };

  const users = await adminService.listUsers(options);
  res.status(200).json({
    success: true,
    data: users
  });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const admin = await adminService.createAdmin(req.body);
  res.status(201).json({
    success: true,
    message: 'Administrador criado com sucesso',
    data: admin
  });
});

// IMPLEMENTAÇÃO FALTANTE: updateUser
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, name, password, role, status } = req.body;

  if (!id) {
    throw new AppError('ID do usuário não fornecido', 400);
  }

  // Validar se pelo menos um campo foi fornecido para atualização
  if (!email && !name && !password && !role && !status) {
    throw new AppError('Pelo menos um campo deve ser fornecido para atualização', 400);
  }

  const updatedUser = await adminService.updateUser(id, {
    email,
    name,
    password,
    role,
    status
  });

  res.status(200).json({
    success: true,
    message: 'Usuário atualizado com sucesso',
    data: updatedUser
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('ID do usuário não fornecido', 400);
  }

  const user = await adminService.deleteUser(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Usuário excluído com sucesso'
  });
});

// ==================== CONTROLLERS DE QUESTÕES ====================

// IMPLEMENTAÇÃO MELHORADA: listQuestion (com filtros e paginação)
export const listQuestion = asyncHandler(async (req, res) => {
  const { page, limit, area, ano, search, type } = req.query;
  
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    area: area || '',
    ano: ano ? parseInt(ano) : null,
    search: search || '',
    type: type || 'all'
  };

  const questions = await adminService.listQuestion(options);
  res.status(200).json({
    success: true,
    data: questions
  });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await adminService.createQuestion(req.body);
  res.status(201).json({
    success: true,
    message: 'Questão criada com sucesso',
    data: question
  });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    throw new AppError('ID da questão não fornecido', 400);
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('Dados para atualização não fornecidos', 400);
  }

  const updatedQuestion = await adminService.updateQuestion(id, updateData);
  if (!updatedQuestion) {
    throw new AppError('Questão não encontrada', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Questão atualizada com sucesso',
    data: updatedQuestion
  });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('ID da questão não fornecido', 400);
  }

  const question = await adminService.deleteQuestion(id);
  if (!question) {
    throw new AppError('Questão não encontrada', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Questão excluída com sucesso'
  });
});

// NOVA IMPLEMENTAÇÃO: Obter questão por ID
export const getQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('ID da questão não fornecido', 400);
  }

  const question = await adminService.getQuestionById(id);
  if (!question) {
    throw new AppError('Questão não encontrada', 404);
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

// ==================== CONTROLLERS DE RESPOSTAS DA IA ====================

// IMPLEMENTAÇÃO MELHORADA: reviewResponse
export const reviewResponse = asyncHandler(async (req, res) => {
  const { responseId, revisedResponse, feedback, approved } = req.body;
  const reviewerId = req.user.id; // ID do admin que está fazendo a revisão

  if (!responseId || !revisedResponse) {
    throw new AppError('responseId e revisedResponse são obrigatórios', 400);
  }

  const reviewData = {
    responseId,
    revisedResponse,
    feedback: feedback || '',
    approved: approved !== undefined ? approved : true,
    reviewerId
  };

  const result = await adminService.reviewResponse(reviewData);
  
  res.status(200).json({
    success: true,
    message: 'Resposta revisada com sucesso',
    data: result
  });
});

export const deleteResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('ID da resposta não fornecido', 400);
  }

  const response = await adminService.deleteResponse(id);
  if (!response) {
    throw new AppError('Resposta não encontrada', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Resposta excluída com sucesso'
  });
});

// NOVA IMPLEMENTAÇÃO: Listar respostas pendentes de revisão
export const listPendingResponses = asyncHandler(async (req, res) => {
  const { page, limit, type, priority } = req.query;
  
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    type: type || 'all',
    priority: priority || 'all',
    status: 'pending' // Apenas respostas pendentes
  };

  const responses = await adminService.listPendingResponses(options);
  
  res.status(200).json({
    success: true,
    data: responses
  });
});

// NOVA IMPLEMENTAÇÃO: Aprovar resposta em lote
export const bulkApproveResponses = asyncHandler(async (req, res) => {
  const { responseIds, approved, feedback } = req.body;
  const reviewerId = req.user.id;

  if (!Array.isArray(responseIds) || responseIds.length === 0) {
    throw new AppError('responseIds deve ser um array não vazio', 400);
  }

  if (typeof approved !== 'boolean') {
    throw new AppError('approved deve ser um valor boolean', 400);
  }

  const result = await adminService.bulkApproveResponses({
    responseIds,
    approved,
    feedback: feedback || '',
    reviewerId
  });

  res.status(200).json({
    success: true,
    message: `${result.processed} respostas processadas com sucesso`,
    data: result
  });
});

// ==================== CONTROLLERS DE ESTATÍSTICAS ====================

// NOVA IMPLEMENTAÇÃO: Estatísticas do sistema
export const getSystemStatistics = asyncHandler(async (req, res) => {
  const { period } = req.query; // 'day', 'week', 'month', 'year'
  
  const statistics = await adminService.getSystemStatistics(period || 'month');
  
  res.status(200).json({
    success: true,
    data: statistics
  });
});

// NOVA IMPLEMENTAÇÃO: Relatório de atividades
export const getActivityReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;
  
  if (!startDate || !endDate) {
    throw new AppError('startDate e endDate são obrigatórios', 400);
  }

  const report = await adminService.getActivityReport({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type: type || 'all'
  });

  res.status(200).json({
    success: true,
    data: report
  });
});