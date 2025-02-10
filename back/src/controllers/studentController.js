import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as studentService from '../services/studentService.js';
import { simulatedExamSchema } from '../utils/validationSchemas.js';
import * as studentRepository from '../repositories/studentRepository.js';

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

export const getAllSimulatedExamsById = asyncHandler(async (req, res) => {
  const { id } = req.params; // ID do simulado
  if (!id) {
    throw new AppError('ID do simulado não fornecido', 400);
  }
  const simulatedExam = await studentService.getAllSimulatedExamsById(id);
  if (!simulatedExam) {
    throw new AppError('Simulado não encontrado', 404);
  }
  res.status(200).json({
    success: true,
    data: simulatedExam
  });
});

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

export const updateSimulatedExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers, completed } = req.body;
  const userId = req.user.id;

  const updatedExam = await studentService.updateSimulatedExam(id, userId, {
    answers,
    completed
  });

  res.status(200).json({
    success: true,
    data: updatedExam
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
  const userId = req.user.id;
  const pdfData = await studentService.exportStudentData(userId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=student_data.pdf');
  res.status(200).send(pdfData);
});

export const getQuestionExplanation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const explanation = await studentService.getQuestionExplanation(id, userId);

  res.status(200).json({
    success: true,
    data: explanation
  });
});

export const createAiSimulatedExam = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { area, subjects, numberOfQuestions } = req.body;

  // Gerar questões com IA
  const questions = await generateSimulatedExam({
    area,
    subjects,
    numberOfQuestions
  });

  // Salvar questões no banco
  const savedQuestions = await Promise.all(
    questions.map(q => saveEnadeQuestion(q))
  );

  // Criar simulado com as questões geradas
  const simulado = await studentRepository.createSimulatedExam(userId, {
    title: `Simulado ENADE - ${area}`,
    questions: savedQuestions.map(q => q.id),
    timeLimit: numberOfQuestions * 3, // 3 minutos por questão
    type: 'ENADE_AI',
    area
  });

  res.status(201).json({
    success: true,
    data: simulado
  });
});

// Salvar questão no formato ENADE
const saveEnadeQuestion = async (questionData) => {
  try {
    return await db.questao.create({
      data: {
        enunciado: questionData.enunciado,
        suportes: questionData.suportes,
        comando: questionData.comando,
        alternativas: questionData.alternativas,
        competencias: questionData.competencias,
        nivel: questionData.nivel,
        topicos: questionData.topicos,
        referencias: questionData.referencias,
        area: questionData.area,
        tipo: 'ENADE_AI',
        dataCriacao: new Date()
      }
    });
  } catch (error) {
    throw new AppError('Erro ao salvar questão ENADE', 500);
  }
};
