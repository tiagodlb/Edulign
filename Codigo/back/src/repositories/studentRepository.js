// repositories/studentRepository.js
import { db } from '../config/prisma.js'
import { AppError } from '../middleware/errorMiddleware.js'

/**
 * Lista provas ENADE com filtros opcionais
 */
export const findExams = async (year, knowledgeArea) => {
  try {
    const where = {}
    if (year) where.ano = parseInt(year)
    if (knowledgeArea) where.area = knowledgeArea

    const exams = await db.questao.findMany({
      where,
      orderBy: {
        ano: 'desc'
      },
      select: {
        id: true,
        enunciado: true,
        alternativas: true,
        respostaCorreta: true,
        area: true,
        ano: true,
      },
    })

    return exams
  } catch (error) {
    console.error('Error finding exams:', error)
    throw new AppError('Erro ao buscar provas ENADE', 500)
  }
}

/**
 * Busca questões específicas no banco de dados
 */
export const searchQuestions = async (query) => {
  try {
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
    })

    return questions
  } catch (error) {
    console.error('Error searching questions:', error)
    throw new AppError('Erro ao buscar questões', 500)
  }
}

/**
 * Seleciona questões aleatórias do banco de dados com critérios específicos
 */
export const getRandomQuestions = async (knowledgeArea, numberOfQuestions) => {
  try {
    // Primeiro, conte o total de questões disponíveis
    const count = await db.questao.count({
      where: {
        area: knowledgeArea,
      }
    })

    if (count < numberOfQuestions) {
      throw new AppError(`Não há questões suficientes na área ${knowledgeArea}. Disponíveis: ${count}`, 400)
    }

    // Buscar questões com ordenação aleatória usando Prisma nativo
    const questions = await db.questao.findMany({
      where: {
        area: knowledgeArea,
      },
      take: numberOfQuestions,
      orderBy: {
        dataCriacao: 'desc', // Podemos usar outras estratégias de ordenação se necessário
      },
      select: {
        id: true,
        enunciado: true,
        alternativas: true,
        respostaCorreta: true,
        area: true,
        ano: true,
      }
    })

    // Embaralhar as questões no JavaScript para garantir aleatoriedade
    return questions.sort(() => Math.random() - 0.5)
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('Error getting random questions:', error)
    throw new AppError('Erro ao buscar questões aleatórias', 500)
  }
}

/**
 * Cria um simulado
 */
export const createSimulatedExam = async (userId, questionIds) => {
  try {
    // First get the user with aluno relationship
    const user = await db.usuario.findUnique({
      where: {
        id: userId
      },
      include: {
        aluno: true
      }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!user.aluno) {
      throw new AppError('Usuário não está registrado como aluno', 404);
    }

    // Now create the simulado with the correct aluno ID
    const simulado = await db.simulado.create({
      data: {
        aluno: {
          connect: {
            id: user.aluno.id // Use the aluno ID from the relationship
          }
        },
        questoes: {
          connect: questionIds.map(id => ({ id }))
        },
        dataInicio: new Date(),
        qtdQuestoes: questionIds.length,
        finalizado: false
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
        },
        aluno: {
          include: {
            usuario: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    });

    return {
      id: simulado.id,
      titulo: `Simulado de ${simulado.aluno.usuario.nome}`,
      area: simulado.questoes[0]?.area || 'Não definida',
      duracao: '2 horas',
      questoes: simulado.questoes.length,
      finalizado: simulado.finalizado,
      dataInicio: simulado.dataInicio,
      dataFim: simulado.dataFim
    };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Aluno ou questões não encontrados', 404)
    }
    console.error('Error creating simulated exam:', error)
    throw new AppError('Erro ao criar simulado', 500)
  }
}

export const getAllSimulatedExamsById = async (studentId) => {
  try {
    const user = await db.usuario.findUnique({
      where: {
        id: studentId
      },
      include: {
        aluno: true
      }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (!user.aluno) {
      throw new AppError('Usuário não está registrado como aluno', 404);
    }

    const simulados = await db.simulado.findMany({
      where: {
        aluno: {
          id: user.aluno.id
        }
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
        },
        respostas: true,
        aluno: {
          include: {
            usuario: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    })

    if (simulados.length === 0) {
      return []
    }

    return simulados.map(simulado => ({
      id: simulado.id,
      titulo: `Simulado de ${simulado.aluno.usuario.nome}`,
      area: simulado.questoes[0]?.area || 'Não definida',
      qtdQuestoes: simulado.questoes.length,
      finalizado: simulado.finalizado,
      dataInicio: simulado.dataInicio,
      dataFim: simulado.dataFim,
      respostas: simulado.respostas
    }))
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('Error getting simulated exam:', error)
    throw new AppError('Erro ao buscar simulado', 500)
  }
}

/**
 * Recupera os simulados específico pelo ID do aluno
 */
export const getSimulatedExam = async (id, studentId) => {
  try {
    // First check if the simulado exists and belongs to the student
    const simulado = await db.simulado.findFirst({
      where: {
        id,
        aluno: {
          id: studentId
        }
      },
      include: {
        questoes: {
          select: {
            id: true,
            enunciado: true,
            alternativas: true,
            respostaCorreta: true,
            area: true,
            ano: true,
          }
        },
        respostas: {
          select: {
            id: true,
            alternativaSelecionada: true,
            correta: true,
            questaoId: true,
            explicacao: true,
            dataResposta: true,
            tempoResposta: true
          }
        }
      }
    })

    if (!simulado) {
      throw new AppError('Simulado não encontrado', 404)
    }

    // Log the raw data to see what we're getting
    console.log('Raw simulado data:', JSON.stringify(simulado, null, 2))

    // Ensure alternativas is always an array
    const processedSimulado = {
      ...simulado,
      questoes: simulado.questoes.map(questao => ({
        ...questao,
        alternativas: Array.isArray(questao.alternativas) ? questao.alternativas : []
      }))
    }

    return processedSimulado
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('Error getting simulated exam:', error)
    throw new AppError('Erro ao buscar simulado', 500)
  }
}

/**
 * Obtém estatísticas de desempenho do aluno
 */
export const getStudentStatistics = async (alunoId) => {
  try {
    const simulados = await db.simulado.findMany({
      where: {
        alunoId: alunoId, // Using alunoId directly now
      },
      include: {
        questoes: true,
        respostas: {
          where: {
            correta: true
          }
        }
      }
    });

    const totalSimulados = simulados.length;
    const totalQuestoes = simulados.reduce((acc, s) => acc + s.questoes.length, 0);
    const questoesCorretas = simulados.reduce((acc, s) => acc + s.respostas.length, 0);

    // Agrupar por área
    const porArea = simulados.reduce((acc, simulado) => {
      simulado.questoes.forEach(questao => {
        if (!acc[questao.area]) {
          acc[questao.area] = {
            total: 0,
            corretas: 0
          };
        }
        acc[questao.area].total++;
        if (simulado.respostas.some(r => r.questaoId === questao.id)) {
          acc[questao.area].corretas++;
        }
      });
      return acc;
    }, {});

    return {
      totalSimulados,
      totalQuestoes,
      questoesCorretas,
      mediaGeral: totalQuestoes ? (questoesCorretas / totalQuestoes) * 100 : 0,
      porArea: Object.fromEntries(
        Object.entries(porArea).map(([area, dados]) => [
          area,
          {
            ...dados,
            percentual: dados.total ? (dados.corretas / dados.total) * 100 : 0
          }
        ])
      )
    };
  } catch (error) {
    console.error('Error getting student statistics:', error);
    throw new AppError('Erro ao buscar estatísticas', 500);
  }
};

export const updateSimulatedExam = async (examId, updateData) => {
  try {
    const { answers, completed, dataFim } = updateData;

    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Update the simulado
      const updatedSimulado = await prisma.simulado.update({
        where: { id: examId },
        data: {
          finalizado: completed,
          dataFim
        }
      });

      // If there are answers, create or update them
      if (answers && answers.length > 0) {
        for (const answer of answers) {
          await prisma.resposta.upsert({
            where: {
              simuladoId_questaoId: {
                simuladoId: examId,
                questaoId: answer.questionId
              }
            },
            create: {
              simuladoId: examId,
              questaoId: answer.questionId,
              alternativaSelecionada: answer.selectedAnswer,
              tempoResposta: answer.timeSpent,
              dataResposta: new Date()
            },
            update: {
              alternativaSelecionada: answer.selectedAnswer,
              tempoResposta: answer.timeSpent,
              dataResposta: new Date()
            }
          });
        }
      }

      return updatedSimulado;
    });

    return result;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Simulado não encontrado', 404);
    }
    throw new AppError('Erro ao atualizar simulado', 500);
  }
};

export const getQuestionById = async (questionId) => {
  try {
    const question = await db.questao.findUnique({
      where: { id: questionId },
      include: {
        explanation: true
      }
    });

    return question;
  } catch (error) {
    throw new AppError('Erro ao buscar questão', 500);
  }
};

export const updateQuestionExplanation = async (questionId, content, generatedAt) => {
  try {
    const explanation = await db.explicacao.upsert({
      where: {
        questaoId: questionId
      },
      update: {
        content,
        generatedAt
      },
      create: {
        questaoId: questionId,
        content,
        generatedAt
      }
    });

    return explanation;
  } catch (error) {
    throw new AppError('Erro ao atualizar explicação', 500);
  }
};


export default {
  findExams,
  searchQuestions,
  getRandomQuestions,
  createSimulatedExam,
  getSimulatedExam,
  getStudentStatistics,
  updateSimulatedExam,
  updateQuestionExplanation
}