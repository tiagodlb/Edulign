import { AppError } from '../middleware/errorMiddleware.js';
import * as studentRepository from '../repositories/studentRepository.js';
import { fetchExplanationFromAI } from '../utils/aiUtils.js';
import { generatePDF } from '../utils/pdfUtils.js';

/**
 * Lista provas ENADE com filtros opcionais
 */
export const listEnadeExams = async (year, knowledgeArea) => {
  try {
    const exams = await studentRepository.findExams(year, knowledgeArea);
    return exams;
  } catch (error) {
    throw new AppError('Erro ao listar provas ENADE: ' + error.message, 500);
  }
};

/**
 * Busca questões específicas no banco de dados
 */
export const searchQuestions = async (query) => {
  try {
    if (!query) {
      throw new AppError('Termo de busca não fornecido', 400);
    }

    const questions = await studentRepository.searchQuestions(query);
    return questions;
  } catch (error) {
    throw new AppError('Erro ao buscar questões: ' + error.message, error.status || 500);
  }
};

/**
 * Cria um simulado personalizado
 */
export const createSimulatedExam = async (userId, knowledgeArea, numberOfQuestions) => {
  try {
    // Seleciona questões aleatórias do banco de dados
    const questions = await studentRepository.getRandomQuestions(knowledgeArea, numberOfQuestions);

    if (questions.length < numberOfQuestions) {
      throw new AppError('Não há questões suficientes para criar o simulado', 400);
    }

    // Cria o simulado no banco de dados
    const simulatedExam = await studentRepository.createSimulatedExam(userId, questions.map(q => q.id));
    return simulatedExam;
  } catch (error) {
    throw new AppError('Erro ao criar simulado: ' + error.message, error.status || 500);
  }
};

/**
 * Recupera um simulado específico pelo ID
 */
export const getSimulatedExam = async (id) => {
  try {
    const simulatedExam = await studentRepository.getSimulatedExam(id);
    if (!simulatedExam) {
      throw new AppError('Simulado não encontrado', 404);
    }

    return simulatedExam;
  } catch (error) {
    throw new AppError('Erro ao recuperar simulado: ' + error.message, error.status || 500);
  }
};

/**
 * Obtém a explicação detalhada de uma questão
 */
export const getQuestionExplanation = async (questionId) => {
  try {
    const question = await studentRepository.getQuestionById(questionId);
    if (!question) {
      throw new AppError('Questão não encontrada', 404);
    }

    // Se a explicação já existe, retorna-a
    if (question.explicacao) {
      return question.explicacao.explicacao;
    }

    // Caso contrário, gera a explicação via IA
    const aiExplanation = await fetchExplanationFromAI(question.enunciado);
    await studentRepository.updateQuestionExplanation(questionId, aiExplanation);

    return aiExplanation;
  } catch (error) {
    throw new AppError('Erro ao obter explicação da questão: ' + error.message, error.status || 500);
  }
};

/**
 * Obtém estatísticas de desempenho do aluno
 */
export const getStudentStatistics = async (userId) => {
  try {
    const statistics = await studentRepository.getStudentStatistics(userId);
    return statistics;
  } catch (error) {
    throw new AppError('Erro ao obter estatísticas: ' + error.message, error.status || 500);
  }
};

/**
 * Exporta os dados do aluno em formato PDF
 */
export const exportStudentData = async (userId) => {
  try {
    const statistics = await studentRepository.getStudentStatistics(userId);
    const pdfData = generatePDF(statistics);
    return pdfData;
  } catch (error) {
    throw new AppError('Erro ao exportar dados do aluno: ' + error.message, error.status || 500);
  }
};