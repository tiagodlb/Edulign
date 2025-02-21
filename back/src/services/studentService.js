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
  try {
    const { area, numberOfQuestions, subjects } = params;

    // Validações iniciais
    if (!area || !numberOfQuestions || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      throw new AppError('Parâmetros inválidos para geração do simulado', 400);
    }

    const questions = [];
    const questionsPerSubject = Math.ceil(numberOfQuestions / subjects.length);

    for (const subject of subjects) {
      try {
        const subjectQuestions = await generateQuestionsForSubject(area, subject, questionsPerSubject);

        if (subjectQuestions && Array.isArray(subjectQuestions)) {
          questions.push(...subjectQuestions);
        }
      } catch (error) {
        console.error(`Erro ao gerar questões para o assunto ${subject}:`, error);
      }
    }

    if (questions.length === 0) {
      throw new AppError('Não foi possível gerar questões para o simulado', 500);
    }

    return questions.slice(0, numberOfQuestions);
  } catch (error) {
    console.error('Erro detalhado na geração do simulado:', error);
    throw new AppError(
      'Erro ao gerar simulado com IA: ' + (error.message || 'Erro desconhecido'),
      error.statusCode || 500
    );
  }
};

const generateQuestionsForSubject = async (area, subject, count) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criar questões no padrão ENADE para a área de ${area}. 
            Crie ${count} questões que avaliem as competências e habilidades definidas nas diretrizes do ENADE.
            Cada questão DEVE ter exatamente 5 alternativas, sendo apenas uma correta.
            Use o formato JSON especificado e garanta que as questões sigam o padrão ENADE.`
        },
        {
          role: "user",
          content: createEnadePrompt(area, subject, count)
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new AppError('Resposta inválida da IA', 500);
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Erro no parsing JSON:', error);
      console.error('Conteúdo recebido:', completion.choices[0].message.content);
      throw new AppError('Erro ao processar resposta da IA', 500);
    }

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new AppError('Formato de resposta inválido da IA', 500);
    }

    // Validar e corrigir cada questão
    const validQuestions = parsedResponse.questions.map(question => validateAndFixQuestion(question, area, subject));

    return validQuestions;
  } catch (error) {
    console.error('Erro na geração de questões:', error);
    throw error;
  }
};

const validateAndFixQuestion = (question, area, subject) => {
  const defaultAlternative = {
    texto: 'Nenhuma das alternativas anteriores',
    correta: false,
    justificativa: 'Alternativa padrão'
  };

  // Garantir que temos os campos obrigatórios
  const validatedQuestion = {
    enunciado: question.enunciado || 'Questão sem enunciado',
    comando: question.comando || 'Analise a questão e escolha a alternativa correta:',
    alternativas: [],
    area: area,
    tipo: 'ENADE_AI',
    nivel: question.nivel || 'medio',
    topicos: question.topicos || [subject],
    competencias: question.competencias || ['Competência geral'],
    referencias: question.referencias || ['Bibliografia padrão']
  };

  // Garantir exatamente 5 alternativas
  if (Array.isArray(question.alternativas)) {
    validatedQuestion.alternativas = question.alternativas
      .slice(0, 5)
      .map(alt => ({
        texto: alt.texto || 'Alternativa sem texto',
        correta: Boolean(alt.correta),
        justificativa: alt.justificativa || 'Sem justificativa fornecida'
      }));
  }

  // Completar até 5 alternativas se necessário
  while (validatedQuestion.alternativas.length < 5) {
    validatedQuestion.alternativas.push({
      ...defaultAlternative,
      texto: `Alternativa ${validatedQuestion.alternativas.length + 1}`,
    });
  }

  // Garantir que exatamente uma alternativa está correta
  const correctCount = validatedQuestion.alternativas.filter(alt => alt.correta).length;
  if (correctCount !== 1) {
    // Se não houver nenhuma ou houver múltiplas alternativas corretas,
    // marca a primeira como correta e as demais como incorretas
    validatedQuestion.alternativas = validatedQuestion.alternativas.map((alt, index) => ({
      ...alt,
      correta: index === 0
    }));
  }

  return validatedQuestion;
};

const createEnadePrompt = (area, subject, count) => {
  return `
  Crie ${count} questões no padrão ENADE para a área de ${area}, sobre o tema ${subject}.
  
  Requisitos obrigatórios:
  1. CADA QUESTÃO DEVE TER EXATAMENTE 5 ALTERNATIVAS
  2. APENAS UMA ALTERNATIVA DEVE SER CORRETA
  3. Siga estritamente este formato JSON:
  {
    "questions": [
      {
        "enunciado": "texto detalhado do enunciado",
        "comando": "comando da questão",
        "alternativas": [
          {
            "texto": "texto da alternativa",
            "correta": true/false,
            "justificativa": "explicação desta alternativa"
          }
          // ... total de 5 alternativas
        ],
        "nivel": "facil/medio/dificil",
        "topicos": ["tópicos abordados"],
        "competencias": ["competências avaliadas"],
        "referencias": ["referências bibliográficas"]
      }
    ]
  }

  Diretrizes adicionais:
  - Use contextualização relevante e atual
  - Avalie competências específicas da área
  - Alternativas incorretas devem ser plausíveis
  - Inclua justificativa para cada alternativa
  - Use referências acadêmicas atualizadas
  `;
};