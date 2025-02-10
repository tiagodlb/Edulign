import { AppError } from '../middleware/errorMiddleware.js';
import * as studentRepository from '../repositories/studentRepository.js';
import { fetchExplanationFromAI } from '../utils/aiUtils.js';
import { generatePDF } from '../utils/pdfUtils.js';
import { OpenAI } from 'openai';

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
export const getAllSimulatedExamsById = async (id) => {
  try {
    const simulatedExam = await studentRepository.getAllSimulatedExamsById(id);
    if (!simulatedExam) {
      throw new AppError('Simulado não encontrado', 404);
    }

    return simulatedExam;
  } catch (error) {
    throw new AppError('Erro ao recuperar simulado: ' + error.message, error.status || 500);
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

export const getQuestionExplanation = async (questionId, userId) => {
  try {
    // Verify if the user has access to this question
    const hasAccess = await verifyQuestionAccess(questionId, userId);
    if (!hasAccess) {
      throw new AppError('Não autorizado a acessar esta questão', 403);
    }

    // Get the question and its explanation
    const questionData = await studentRepository.getQuestionById(questionId);
    if (!questionData) {
      throw new AppError('Questão não encontrada', 404);
    }

    // If explanation exists and is not outdated, return it
    if (questionData.explanation && !isExplanationOutdated(questionData.explanation.generatedAt)) {
      return {
        explanation: questionData.explanation.content,
        questionId: questionId,
        generatedAt: questionData.explanation.generatedAt
      };
    }

    // Generate new explanation if none exists or is outdated
    const aiExplanation = await fetchExplanationFromAI(questionData.enunciado, questionData.alternativas);

    // Store the new explanation
    const updatedExplanation = await studentRepository.updateQuestionExplanation(
      questionId,
      aiExplanation,
      new Date()
    );

    return {
      explanation: aiExplanation,
      questionId: questionId,
      generatedAt: updatedExplanation.generatedAt
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Erro ao obter explicação da questão: ' + error.message, 500);
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateSimulatedExam = async (params) => {
  const { area, numberOfQuestions, subjects } = params;

  try {
    const questions = [];

    // Dividir as questões entre os assuntos selecionados
    const questionsPerSubject = Math.ceil(numberOfQuestions / subjects.length);

    for (const subject of subjects) {
      const subjectQuestions = await generateQuestionsForSubject(area, subject, questionsPerSubject);
      questions.push(...subjectQuestions);
    }

    return questions;
  } catch (error) {
    console.error('Erro ao gerar simulado:', error);
    throw new AppError('Erro ao gerar simulado com IA', 500);
  }
};

const generateQuestionsForSubject = async (area, subject, count) => {
  const prompt = createEnadePrompt(area, subject);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Você é um especialista em criar questões no padrão ENADE para a área de ${area}. 
        Gere questões que avaliem as competências e habilidades definidas nas diretrizes do ENADE.
        Foque em questões que exijam pensamento crítico e aplicação prática do conhecimento.
        Use o formato JSON especificado e garanta que as questões sigam o padrão ENADE.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" }
  });

  const questionsData = JSON.parse(completion.choices[0].message.content);
  return questionsData.questions;
};

export const createEnadePrompt = (area, subject) => {
  return `
  Gere ${count} questões no padrão ENADE para a área de ${area}, sobre o tema ${subject}.
  
  As questões devem seguir este formato JSON:
  {
    "questions": [
      {
        "enunciado": "texto do enunciado com contextualização",
        "suportes": [
          {
            "tipo": "texto/imagem/tabela/grafico",
            "conteudo": "conteúdo do material de apoio"
          }
        ],
        "comando": "comando da questão",
        "alternativas": [
          {
            "texto": "texto da alternativa",
            "correta": true/false,
            "justificativa": "explicação da alternativa"
          }
        ],
        "competencias": ["lista de competências avaliadas"],
        "nivel": "facil/medio/dificil",
        "topicos": ["tópicos abordados"],
        "referencias": ["referências bibliográficas"]
      }
    ]
  }

  Requisitos:
  1. Siga estritamente o padrão de questões ENADE
  2. Use contextualização relevante e atual
  3. Inclua materiais de apoio quando apropriado
  4. Avalie competências específicas da área
  5. Garanta que as alternativas incorretas sejam plausíveis
  6. Forneça justificativa para todas as alternativas
  7. Use referências acadêmicas atualizadas
  `;
};