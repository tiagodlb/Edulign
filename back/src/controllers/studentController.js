// controllers/studentController.js
import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as studentService from '../services/studentService.js';
import { simulatedExamSchema, aiSimulatedExamSchema } from '../utils/validationSchemas.js';
import * as studentRepository from '../repositories/studentRepository.js';
import { db } from '../config/prisma.js';

// ENADE Exams Controller
export const listEnadeExams = asyncHandler(async (req, res) => {
  const { year, knowledgeArea } = req.query;
  const exams = await studentService.listEnadeExams(year, knowledgeArea);
  res.status(200).json({ success: true, data: exams });
});

export const searchQuestions = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query) throw new AppError('Termo de busca não fornecido', 400);

  const questions = await studentService.searchQuestions(query);
  res.status(200).json({ success: true, data: questions });
});

// AI Simulated Exam Controllers
export const createAiSimulatedExam = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { area, subjects, numberOfQuestions } = req.body;

  try {
    // Get aluno record first
    const aluno = await db.aluno.findFirst({
      where: { usuarioId: userId }
    });

    if (!aluno) {
      throw new AppError('Usuário não está registrado como aluno', 404);
    }

    // Generate questions using AI outside of transaction
    const questions = await studentService.generateSimulatedExam({
      area,
      subjects,
      numberOfQuestions
    });

    // Save questions and create simulado in a transaction with increased timeout
    const savedData = await db.$transaction(async (prisma) => {
      // Save each question
      const savedQuestions = await Promise.all(
        questions.map(async (question) => {
          return await saveEnadeQuestion(prisma, question, area);
        })
      );

      // Create simulado
      const simulado = await prisma.simulado.create({
        data: {
          titulo: `Simulado ENADE - ${area}`,
          tipo: 'ENADE_AI',
          area: area,
          tempoLimite: numberOfQuestions * 3,
          alunoId: aluno.id,
          qtdQuestoes: savedQuestions.length,
          dataInicio: new Date(),
          finalizado: false,
          questoes: {
            connect: savedQuestions.map(q => ({ id: q.id }))
          }
        },
        include: {
          questoes: {
            include: {
              alternativas: true,
              suportes: true
            }
          }
        }
      });

      return { simulado, questions: savedQuestions };
    }, {
      timeout: 30000 // 30 seconds timeout
    });

    res.status(201).json({
      success: true,
      data: {
        id: savedData.simulado.id,
        titulo: savedData.simulado.titulo,
        area: savedData.simulado.area,
        tempoLimite: savedData.simulado.tempoLimite,
        qtdQuestoes: savedData.simulado.qtdQuestoes,
        questoes: savedData.simulado.questoes.map(q => ({
          id: q.id,
          enunciado: q.enunciado,
          comando: q.comando,
          alternativas: q.alternativas,
          suportes: q.suportes,
          nivel: q.nivel
        }))
      }
    });
  } catch (error) {
    console.error('Erro detalhado:', error);
    throw new AppError(
      'Erro ao criar simulado: ' + (error.message || 'Erro desconhecido'),
      error.statusCode || 500
    );
  }
});

export const getAllSimulatedExamsById = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const aluno = await db.aluno.findFirst({
    where: { usuarioId: userId }
  });

  if (!aluno) {
    throw new AppError('Usuário não está registrado como aluno', 404);
  }

  const simulados = await db.simulado.findMany({
    where: {
      alunoId: aluno.id
    },
    include: {
      questoes: {
        include: {
          alternativas: true,
          suportes: true
        }
      },
      respostas: {
        include: {
          alternativa: true
        }
      }
    },
    orderBy: {
      dataInicio: 'desc'
    }
  });

  res.status(200).json({
    success: true,
    data: simulados
  });
});

export const getSimulatedExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const aluno = await db.aluno.findFirst({
    where: { usuarioId: userId }
  });

  if (!aluno) {
    throw new AppError('Usuário não está registrado como aluno', 404);
  }

  const simulado = await db.simulado.findFirst({
    where: {
      id,
      alunoId: aluno.id
    },
    include: {
      questoes: {
        include: {
          alternativas: true,
          suportes: true
        }
      },
      respostas: {
        include: {
          alternativa: true
        }
      }
    }
  });

  if (!simulado) {
    throw new AppError('Simulado não encontrado', 404);
  }

  res.status(200).json({
    success: true,
    data: simulado
  });
});

export const updateSimulatedExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers, completed } = req.body;
  const userId = req.user.id;

  // Get aluno record
  const aluno = await db.aluno.findFirst({
    where: { usuarioId: userId }
  });

  if (!aluno) {
    throw new AppError('Usuário não está registrado como aluno', 404);
  }

  // Verify simulado ownership
  const simulado = await db.simulado.findFirst({
    where: {
      id,
      alunoId: aluno.id
    },
    include: {
      questoes: {
        include: {
          alternativas: true
        }
      }
    }
  });

  if (!simulado) {
    throw new AppError('Simulado não encontrado ou acesso não autorizado', 404);
  }

  const updatedSimulado = await db.$transaction(async (prisma) => {
    // Process answers
    if (answers && Array.isArray(answers)) {
      await Promise.all(
        answers.map(async (answer) => {
          // Find correct alternativa
          const questao = simulado.questoes.find(q => q.id === answer.questionId);
          if (!questao) {
            throw new AppError(`Questão ${answer.questionId} não encontrada`, 400);
          }

          const alternativa = questao.alternativas.find(alt => alt.id === answer.selectedAnswer);
          if (!alternativa) {
            throw new AppError(`Alternativa ${answer.selectedAnswer} não encontrada`, 400);
          }

          return prisma.resposta.upsert({
            where: {
              simuladoId_questaoId: {
                simuladoId: id,
                questaoId: answer.questionId
              }
            },
            create: {
              alunoId: aluno.id,
              questaoId: answer.questionId,
              alternativaId: answer.selectedAnswer,
              simuladoId: id,
              correta: alternativa.correta,
              tempoResposta: Math.round(answer.timeSpent)
            },
            update: {
              alternativaId: answer.selectedAnswer,
              correta: alternativa.correta,
              tempoResposta: Math.round(answer.timeSpent)
            }
          });
        })
      );
    }

    // Update simulado if completed
    if (completed) {
      await prisma.simulado.update({
        where: { id },
        data: {
          finalizado: true,
          dataFim: new Date()
        }
      });
    }

    return prisma.simulado.findUnique({
      where: { id },
      include: {
        questoes: {
          include: {
            alternativas: true
          }
        },
        respostas: {
          include: {
            alternativa: true
          }
        }
      }
    });
  });

  res.status(200).json({
    success: true,
    data: updatedSimulado
  });
});

// Helper Functions
const saveEnadeQuestion = async (prisma, questionData, area) => {
  try {
    validateQuestionData(questionData);

    return await prisma.questao.create({
      data: {
        enunciado: questionData.enunciado,
        comando: questionData.comando,
        area: area,
        tipo: 'ENADE_AI',
        nivel: questionData.nivel || 'medio',
        alternativas: {
          create: questionData.alternativas.map(alt => ({
            texto: alt.texto,
            correta: alt.correta,
            justificativa: alt.justificativa
          }))
        },
        suportes: questionData.suportes ? {
          create: questionData.suportes.map(sup => ({
            tipo: sup.tipo,
            conteudo: sup.conteudo
          }))
        } : undefined,
        topicos: questionData.topicos || [],
        competencias: questionData.competencias || [],
        referencias: questionData.referencias || [],
        dataCriacao: new Date()
      },
      include: {
        alternativas: true,
        suportes: true
      }
    });
  } catch (error) {
    console.error('Erro ao salvar questão:', error);
    throw new AppError('Erro ao salvar questão ENADE: ' + error.message, 500);
  }
};

const validateQuestionData = (questionData) => {
  const requiredFields = ['enunciado', 'comando', 'alternativas'];
  for (const field of requiredFields) {
    if (!questionData[field]) {
      throw new AppError(`Campo obrigatório ausente: ${field}`, 400);
    }
  }

  if (!Array.isArray(questionData.alternativas) || questionData.alternativas.length !== 5) {
    throw new AppError('A questão deve ter exatamente 5 alternativas', 400);
  }

  const correctAnswers = questionData.alternativas.filter(alt => alt.correta);
  if (correctAnswers.length !== 1) {
    throw new AppError('A questão deve ter exatamente uma alternativa correta', 400);
  }

  questionData.alternativas.forEach((alt, index) => {
    if (!alt.texto || typeof alt.correta !== 'boolean') {
      throw new AppError(`Alternativa ${index + 1} inválida`, 400);
    }
  });
};

// Statistics and Export Controllers
export const getStudentStatistics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const aluno = await db.aluno.findFirst({
    where: { usuarioId: userId }
  });

  if (!aluno) {
    throw new AppError('Usuário não está registrado como aluno', 404);
  }

  const statistics = await studentService.getStudentStatistics(aluno.id);
  res.status(200).json({ success: true, data: statistics });
});

export const getQuestionExplanation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const aluno = await db.aluno.findFirst({
    where: { usuarioId: userId }
  });

  if (!aluno) {
    throw new AppError('Usuário não está registrado como aluno', 404);
  }

  const explanation = await studentService.getQuestionExplanation(id, aluno.id);
  res.status(200).json({ success: true, data: explanation });
});

export const exportStudentData = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const aluno = await db.aluno.findFirst({
    where: { usuarioId: userId }
  });

  if (!aluno) {
    throw new AppError('Usuário não está registrado como aluno', 404);
  }

  const pdfData = await studentService.exportStudentData(aluno.id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=student_data.pdf');
  res.status(200).send(pdfData);
});