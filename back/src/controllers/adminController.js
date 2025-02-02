import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as adminService from '../services/adminService.js';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
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

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await adminService.createQuestion(req.body);
  res.status(201).json({
    success: true,
    message: 'Questão criada com sucesso',
    data: question
  });
});

export const listQuestion = asyncHandler(async (req, res) => {
  const users = await adminService.listQuestion;
  res.status(200).json({
    success: true,
    data: users
  });
});

export const reviewResponse = asyncHandler(async (req, res) => {
  const { responseId, revisedResponse } = req.body;

  if (!responseId || !revisedResponse) {
    throw new AppError('Dados incompletos para revisão', 400);
  }

  await adminService.reviewResponse(responseId, revisedResponse);
  res.status(200).json({
    success: true,
    message: 'Resposta revisada com sucesso'
  });
});