import { db } from '../config/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Lista provas ENADE com filtros opcionais
 */
export const findExams = async (year, knowledgeArea) => {
  const where = {};
  if (year) where.ano = year;
  if (knowledgeArea) where.area = knowledgeArea;

  const exams = await db.questao.findMany({
    where,
    select: {
      id: true,
      enunciado: true,
      alternativas: true,
      respostaCorreta: true,
      area: true,
      ano: true,
    },
  });

  return exams;
};

/**
 * Busca questões específicas no banco de dados
 */
export const searchQuestions = async (query) => {
  const questions = await db.questao.findMany({
    where: {
      OR: [
        { enunciado: { contains: query, mode: 'insensitive' } },
        { area: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      enunciado: true,
      alternativas: true,
      respostaCorreta: true,
      area: true,
      ano: true,
    },
  });

  return questions;
};

/**
 * Seleciona questões aleatórias do banco de dados
 */
export const getRandomQuestions = async (knowledgeArea, limit) => {
  const questions = await db.questao.findMany({
    where: { area: knowledgeArea },
    take: limit,
    orderBy: { dataCriacao: 'desc' },
  });

  return questions;
};

/**
 * Cria um simulado no banco de dados
 */
export const createSimulatedExam = async (userId, questionIds) => {
  const simulatedExam = await db.simulado.create({
    data: {
      aluno: { connect: { usuarioId: userId } },
      questoes: { connect: questionIds.map(id => ({ id })) },
      qtdQuestoes: questionIds.length,
      dataInicio: new Date(),
    },
    include: {
      questoes: true,
    },
  });

  return simulatedExam;
};

/**
 * Recupera um simulado específico pelo ID
 */
export const getSimulatedExam = async (id) => {
  const simulatedExam = await db.simulado.findUnique({
    where: { id },
    include: {
      questoes: true,
    },
  });

  return simulatedExam;
};

/**
 * Obtém uma questão específica pelo ID
 */
export const getQuestionById = async (id) => {
  const question = await db.questao.findUnique({
    where: { id },
    include: {
      explicacao: true,
    },
  });

  return question;
};

/**
 * Atualiza a explicação de uma questão
 */
export const updateQuestionExplanation = async (id, explanation) => {
  await db.explicacaoIA.upsert({
    where: { questaoId: id },
    update: { explicacao },
    create: { questaoId: id, explicacao },
  });
};

/**
 * Obtém estatísticas de desempenho do aluno
 */
export const getStudentStatistics = async (userId) => {
  const statistics = await db.resposta.aggregate({
    _count: true,
    _avg: { correta: true },
    where: { aluno: { usuarioId: userId } },
  });

  return {
    totalRespostas: statistics._count,
    mediaAcertos: statistics._avg.correta || 0,
  };
};