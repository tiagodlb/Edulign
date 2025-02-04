import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as studentService from '../services/studentService.js';

// CONTROLLER PARA ACESSO DE PROVAS ENADE
export const listEnadeExams = asyncHandler(async (req, res) => {
  const { year, knowledgeArea } = req.query; // Filtros opcionais: ano e área de conhecimento
  const exams = await studentService.listEnadeExams(year, knowledgeArea);
  res.status(200).json({
    success: true,
    data: exams
  });
});

export const searchQuestions = asyncHandler(async (req, res) => {
  const { query } = req.body; // Termo de busca fornecido pelo aluno
  if (!query) {
    throw new AppError('Termo de busca não fornecido', 400);
  }
  const questions = await studentService.searchQuestions(query);
  res.status(200).json({
    success: true,
    data: questions
  });
});

// CONTROLLER PARA SIMULADOS PERSONALIZADOS
export const createSimulatedExam = async (req, res) => {
  try {
    // Valida os dados da requisição
    const { error, value } = simulatedExamSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    // Extrai os valores validados (aplica o valor padrão se necessário)
    const { knowledgeArea, numberOfQuestions } = value;

    // Verifica se há questões suficientes no banco de dados
    const questions = await studentRepository.getRandomQuestions(knowledgeArea, numberOfQuestions);

    if (questions.length < numberOfQuestions) {
      throw new AppError('Não há questões suficientes para criar o simulado', 400);
    }

    // Cria o simulado no banco de dados
    const simulatedExam = await studentRepository.createSimulatedExam(
      req.user.id, // ID do aluno autenticado
      questions.map(q => q.id)
    );

    res.status(201).json({
      success: true,
      message: 'Simulado criado com sucesso',
      data: simulatedExam
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSimulatedExam = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID do simulado
  if (!id) {
    throw new AppError('ID do simulado não fornecido', 400);
  }
  const simulatedExam = await studentService.getSimulatedExam(id);
  if (!simulatedExam) {
    throw new AppError('Simulado não encontrado', 404);
  }
  res.status(200).json({
    success: true,
    data: simulatedExam
  });
});

export const getQuestionExplanation = asyncHandler(async (req, res) => {
  const { questionId } = req.params; // ID da questão
  if (!questionId) {
    throw new AppError('ID da questão não fornecido', 400);
  }
  const explanation = await studentService.getQuestionExplanation(questionId);
  res.status(200).json({
    success: true,
    data: explanation
  });
});

// CONTROLLER PARA ESTATÍSTICAS E EXPORTAÇÃO DE DADOS
export const getStudentStatistics = asyncHandler(async (req, res) => {
  const userId = req.user.id; // ID do aluno autenticado
  const statistics = await studentService.getStudentStatistics(userId);
  res.status(200).json({
    success: true,
    data: statistics
  });
});

export const exportStudentData = asyncHandler(async (req, res) => {
  const userId = req.user.id; // ID do aluno autenticado
  const pdfData = await studentService.exportStudentData(userId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=student_data.pdf');
  res.status(200).send(pdfData);
});