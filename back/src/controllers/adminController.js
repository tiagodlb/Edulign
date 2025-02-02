import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as adminService from '../services/adminService.js';

// CONTROLER USER 
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

// CONTROLLER QUESTION  
export const createQuestion = asyncHandler(async (req, res) => {
  const question = await adminService.createQuestion(req.body);
  res.status(201).json({
    success: true,
    message: 'Questão criada com sucesso',
    data: question
  });
});

export const listQuestion = asyncHandler(async (req, res) => {
  const questions = await adminService.listQuestion(); // Invocar a função
  res.status(200).json({
    success: true,
    data: questions
  });
});
// CONTROLER RESPONSE
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
