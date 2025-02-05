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
 * Seleciona questões aleatórias do banco de dados com critérios específicos
 * @param {Object} criteria - Critérios para seleção de questões
 * @param {string} criteria.knowledgeArea - Área de conhecimento
 * @param {number} criteria.year - Ano opcional
 * @param {number} criteria.limit - Número de questões desejadas
 * @returns {Promise<Array>} Array of questions
 */
export const getRandomQuestions = async (criteria) => {
  const { knowledgeArea, year, limit } = criteria;
  
  // Construir where clause baseado nos critérios
  const where = {
    ativo: true,
    area: knowledgeArea,
    ...(year && { ano: year })
  };

  // Primeiro, conte o total de questões disponíveis
  const totalQuestions = await db.questao.count({ where });

  if (totalQuestions < limit) {
    throw new AppError(`Apenas ${totalQuestions} questões disponíveis para os critérios selecionados`, 400);
  }

  // Buscar questões com ordenação aleatória
  const questions = await db.$queryRaw`
    SELECT 
      id, 
      enunciado, 
      alternativas, 
      respostaCorreta,
      area,
      ano
    FROM "Questao"
    WHERE area = ${knowledgeArea}
    ${year ? db.sql`AND ano = ${year}` : db.sql``}
    AND ativo = true
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;

  return questions;
};

/**
 * Cria um simulado personalizado com questões aleatórias
 * @param {Object} data - Dados para criação do simulado
 * @param {string} data.userId - ID do usuário
 * @param {string} data.knowledgeArea - Área de conhecimento
 * @param {number} data.numberOfQuestions - Número de questões
 * @param {number} data.year - Ano opcional
 * @returns {Promise<Object>} Simulado criado
 */
export const createCustomSimulatedExam = async (data) => {
  const { userId, knowledgeArea, numberOfQuestions, year } = data;

  // Buscar questões aleatórias
  const questions = await getRandomQuestions({
    knowledgeArea,
    year,
    limit: numberOfQuestions
  });

  // Criar o simulado com as questões selecionadas
  const simulatedExam = await db.simulado.create({
    data: {
      aluno: { 
        connect: { usuarioId: userId } 
      },
      questoes: { 
        connect: questions.map(q => ({ id: q.id })) 
      },
      qtdQuestoes: questions.length,
      dataInicio: new Date(),
      area: knowledgeArea,
      ...(year && { ano: year }),
      status: 'EM_ANDAMENTO'
    },
    include: {
      questoes: {
        select: {
          id: true,
          enunciado: true,
          alternativas: true,
          area: true,
          ano: true
        }
      }
    }
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