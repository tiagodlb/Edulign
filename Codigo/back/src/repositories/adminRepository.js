import { db } from '../config/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

// ==================== REPOSITORY DE USUÁRIOS ====================

/**
 * Finds all users with filtering and pagination
 */
export const findAllUsers = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        role = '',
        status = 'all'
    } = options;

    try {
        const skip = (page - 1) * limit;
        
        const whereClause = {
            AND: []
        };

        // Filtro por busca (nome ou email)
        if (search) {
            whereClause.AND.push({
                OR: [
                    { nome: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        // Filtro por papel
        if (role && role !== '') {
            if (role === 'admin') {
                whereClause.AND.push({ admin: { isNot: null } });
            } else if (role === 'professor') {
                whereClause.AND.push({ professor: { isNot: null } });
            } else if (role === 'student') {
                whereClause.AND.push({ aluno: { isNot: null } });
            }
        }

        // Filtro por status
        if (status !== 'all') {
            whereClause.AND.push({
                ativo: status === 'active'
            });
        }

        // Se não há filtros, remove o AND vazio
        const finalWhereClause = whereClause.AND.length > 0 ? whereClause : {};

        // Buscar usuários
        const [users, totalCount] = await Promise.all([
            db.usuario.findMany({
                where: finalWhereClause,
                skip,
                take: limit,
                include: {
                    admin: true,
                    professor: true,
                    aluno: true
                },
                orderBy: { dataCriacao: 'desc' }
            }),
            db.usuario.count({
                where: finalWhereClause
            })
        ]);

        // Formatar dados dos usuários
        const formattedUsers = users.map(user => {
            let userRole = 'student'; // padrão
            if (user.admin) userRole = 'admin';
            else if (user.professor) userRole = 'professor';

            return {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: userRole,
                ativo: user.ativo,
                dataCriacao: user.dataCriacao,
                dataAtualizacao: user.dataAtualizacao
            };
        });

        return {
            data: formattedUsers,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                currentPage: page,
                perPage: limit,
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        throw new AppError('Erro ao buscar usuários: ' + error.message, 500);
    }
};

/**
 * Creates a new admin user
 */
export const createAdmin = async ({ email, senha, nome }) => {
    try {
        const result = await db.$transaction(async (prisma) => {
            // Criar usuário
            const usuario = await prisma.usuario.create({
                data: {
                    email,
                    senha,
                    nome,
                    ativo: true
                }
            });

            // Criar registro de admin
            const admin = await prisma.admin.create({
                data: {
                    usuarioId: usuario.id
                }
            });

            return { ...usuario, admin };
        });

        return result;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError('Email já existe', 409);
        }
        throw new AppError('Erro ao criar admin: ' + error.message, 500);
    }
};

/**
 * Updates a user's information
 */
export const updateUser = async (id, updates) => {
    try {
        const updatedUser = await db.usuario.update({
            where: { id },
            data: {
                ...updates,
                dataAtualizacao: new Date()
            },
            include: {
                admin: true,
                professor: true,
                aluno: true
            }
        });

        return updatedUser;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError('Usuário não encontrado', 404);
        }
        if (error.code === 'P2002') {
            throw new AppError('Email já existe', 409);
        }
        throw new AppError('Erro ao atualizar usuário: ' + error.message, 500);
    }
};

/**
 * Soft delete a user
 */
export const deleteUser = async (id) => {
    try {
        const deletedUser = await db.usuario.update({
            where: { id },
            data: {
                ativo: false,
                dataAtualizacao: new Date()
            }
        });

        return deletedUser;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError('Usuário não encontrado', 404);
        }
        throw new AppError('Erro ao excluir usuário: ' + error.message, 500);
    }
};

// ==================== REPOSITORY DE QUESTÕES ====================

/**
 * Finds all questions with filtering and pagination
 */
export const findAllQuestions = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        area = '',
        ano = null,
        search = '',
        type = 'all'
    } = options;

    try {
        const skip = (page - 1) * limit;
        
        const whereClause = {
            AND: []
        };

        // Filtro por área
        if (area && area !== '') {
            whereClause.AND.push({
                area: { contains: area, mode: 'insensitive' }
            });
        }

        // Filtro por ano
        if (ano) {
            whereClause.AND.push({ ano });
        }

        // Filtro por busca no enunciado
        if (search) {
            whereClause.AND.push({
                enunciado: { contains: search, mode: 'insensitive' }
            });
        }

        // Filtro por tipo (se aplicável)
        if (type !== 'all') {
            if (type === 'enade') {
                whereClause.AND.push({ tipo: 'ENADE' });
            } else if (type === 'custom') {
                whereClause.AND.push({ tipo: 'CUSTOM' });
            }
        }

        const finalWhereClause = whereClause.AND.length > 0 ? whereClause : {};

        const [questions, totalCount] = await Promise.all([
            db.questao.findMany({
                where: finalWhereClause,
                skip,
                take: limit,
                include: {
                    alternativas: true
                },
                orderBy: { dataCriacao: 'desc' }
            }),
            db.questao.count({
                where: finalWhereClause
            })
        ]);

        return {
            data: questions,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                currentPage: page,
                perPage: limit,
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        };
    } catch (error) {
        throw new AppError('Erro ao buscar questões: ' + error.message, 500);
    }
};

/**
 * Finds a question by ID
 */
export const findQuestionById = async (id) => {
    try {
        const question = await db.questao.findUnique({
            where: { id },
            include: {
                alternativas: true,
                suportes: true
            }
        });

        return question;
    } catch (error) {
        throw new AppError('Erro ao buscar questão: ' + error.message, 500);
    }
};

/**
 * Creates a new question
 */
export const createQuestion = async (questionData) => {
    try {
        const result = await db.$transaction(async (prisma) => {
            // Criar questão
            const questao = await prisma.questao.create({
                data: {
                    enunciado: questionData.enunciado,
                    comando: questionData.comando || '',
                    area: questionData.area,
                    ano: questionData.ano,
                    tipo: questionData.tipo || 'CUSTOM',
                    nivel: questionData.nivel || 'MEDIO',
                    respostaCorreta: questionData.respostaCorreta
                }
            });

            // Criar alternativas
            if (questionData.alternativas && questionData.alternativas.length > 0) {
                const alternativasData = questionData.alternativas.map((alt, index) => ({
                    questaoId: questao.id,
                    letra: String.fromCharCode(65 + index), // A, B, C, D, E
                    texto: alt,
                    correta: index === questionData.respostaCorreta
                }));

                await prisma.alternativa.createMany({
                    data: alternativasData
                });
            }

            // Buscar questão completa com alternativas
            return await prisma.questao.findUnique({
                where: { id: questao.id },
                include: {
                    alternativas: true
                }
            });
        });

        return result;
    } catch (error) {
        throw new AppError('Erro ao criar questão: ' + error.message, 500);
    }
};

/**
 * Updates a question
 */
export const updateQuestion = async (id, updateData) => {
    try {
        const result = await db.$transaction(async (prisma) => {
            // Atualizar questão
            const questao = await prisma.questao.update({
                where: { id },
                data: {
                    ...updateData,
                    dataAtualizacao: new Date()
                }
            });

            // Se alternativas foram fornecidas, atualizar
            if (updateData.alternativas) {
                // Remover alternativas existentes
                await prisma.alternativa.deleteMany({
                    where: { questaoId: id }
                });

                // Criar novas alternativas
                const alternativasData = updateData.alternativas.map((alt, index) => ({
                    questaoId: id,
                    letra: String.fromCharCode(65 + index),
                    texto: alt,
                    correta: index === (updateData.respostaCorreta || questao.respostaCorreta)
                }));

                await prisma.alternativa.createMany({
                    data: alternativasData
                });
            }

            // Retornar questão atualizada
            return await prisma.questao.findUnique({
                where: { id },
                include: {
                    alternativas: true
                }
            });
        });

        return result;
    } catch (error) {
        if (error.code === 'P2025') {
            return null; // Questão não encontrada
        }
        throw new AppError('Erro ao atualizar questão: ' + error.message, 500);
    }
};

/**
 * Gets question alternatives for validation
 */
export const getQuestionAlternatives = async (id) => {
    try {
        const question = await db.questao.findUnique({
            where: { id },
            include: {
                alternativas: true
            }
        });

        return question ? question.alternativas.map(alt => alt.texto) : [];
    } catch (error) {
        throw new AppError('Erro ao buscar alternativas: ' + error.message, 500);
    }
};

/**
 * Soft delete a question
 */
export const deleteQuestion = async (id) => {
    try {
        const deletedQuestion = await db.questao.update({
            where: { id },
            data: {
                ativo: false,
                dataAtualizacao: new Date()
            }
        });

        return deletedQuestion;
    } catch (error) {
        if (error.code === 'P2025') {
            return null;
        }
        throw new AppError('Erro ao excluir questão: ' + error.message, 500);
    }
};

// ==================== REPOSITORY DE RESPOSTAS DA IA ====================

/**
 * Reviews an AI response
 */
export const reviewResponse = async (reviewData) => {
    try {
        const updatedResponse = await db.iaResponse.update({
            where: { id: reviewData.responseId },
            data: {
                revisedResponse: reviewData.revisedResponse,
                feedback: reviewData.feedback,
                approved: reviewData.approved,
                reviewerId: reviewData.reviewerId,
                reviewedAt: reviewData.reviewedAt,
                status: 'REVIEWED'
            }
        });

        return updatedResponse;
    } catch (error) {
        if (error.code === 'P2025') {
            return null;
        }
        throw new AppError('Erro ao revisar resposta: ' + error.message, 500);
    }
};

/**
 * Deletes an AI response
 */
export const deleteResponse = async (id) => {
    try {
        const deletedResponse = await db.iaResponse.delete({
            where: { id }
        });

        return deletedResponse;
    } catch (error) {
        if (error.code === 'P2025') {
            return null;
        }
        throw new AppError('Erro ao excluir resposta: ' + error.message, 500);
    }
};

/**
 * Finds pending responses for review
 */
export const findPendingResponses = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        type = 'all',
        priority = 'all'
    } = options;

    try {
        const skip = (page - 1) * limit;
        
        const whereClause = {
            status: 'PENDING'
        };

        if (type !== 'all') {
            whereClause.type = type.toUpperCase();
        }

        if (priority !== 'all') {
            whereClause.priority = priority.toUpperCase();
        }

        const [responses, totalCount] = await Promise.all([
            db.iaResponse.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    questao: {
                        select: {
                            enunciado: true,
                            area: true
                        }
                    }
                },
                orderBy: { dataCriacao: 'desc' }
            }),
            db.iaResponse.count({
                where: whereClause
            })
        ]);

        return {
            data: responses,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                currentPage: page,
                perPage: limit
            }
        };
    } catch (error) {
        throw new AppError('Erro ao buscar respostas pendentes: ' + error.message, 500);
    }
};

/**
 * Bulk update responses
 */
export const bulkUpdateResponses = async (updateData) => {
    try {
        const result = await db.iaResponse.updateMany({
            where: {
                id: { in: updateData.responseIds }
            },
            data: {
                approved: updateData.approved,
                feedback: updateData.feedback,
                reviewerId: updateData.reviewerId,
                reviewedAt: updateData.reviewedAt,
                status: 'REVIEWED'
            }
        });

        return result;
    } catch (error) {
        throw new AppError('Erro ao atualizar respostas em lote: ' + error.message, 500);
    }
};

// ==================== REPOSITORY DE ESTATÍSTICAS ====================

/**
 * Gets system statistics
 */
export const getSystemStats = async (period) => {
    try {
        // Calcular datas baseado no período
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default: // month
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Executar queries em paralelo
        const [
            totalUsers,
            activeUsers,
            newUsers,
            totalQuestions,
            newQuestions,
            questionsByArea,
            pendingResponses,
            reviewedResponses,
            simuladosCompleted
        ] = await Promise.all([
            db.usuario.count(),
            db.usuario.count({ where: { ativo: true } }),
            db.usuario.count({ where: { dataCriacao: { gte: startDate } } }),
            db.questao.count({ where: { ativo: true } }),
            db.questao.count({ where: { dataCriacao: { gte: startDate } } }),
            db.questao.groupBy({
                by: ['area'],
                _count: { area: true },
                where: { ativo: true }
            }),
            db.iaResponse.count({ where: { status: 'PENDING' } }),
            db.iaResponse.count({ where: { status: 'REVIEWED' } }),
            db.respostaAluno.count({
                where: { 
                    dataResposta: { gte: startDate },
                    simulado: { concluido: true }
                }
            })
        ]);

        // Calcular taxa de aprovação
        const totalReviewed = reviewedResponses || 1; // Evitar divisão por zero
        const approvedResponses = await db.iaResponse.count({
            where: { 
                status: 'REVIEWED',
                approved: true 
            }
        });
        const approvalRate = (approvedResponses / totalReviewed) * 100;

        return {
            totalUsers,
            activeUsers,
            newUsers,
            totalQuestions,
            newQuestions,
            questionsByArea: questionsByArea.map(item => ({
                area: item.area,
                count: item._count.area
            })),
            pendingResponses,
            reviewedResponses,
            approvalRate,
            simuladosCompleted
        };
    } catch (error) {
        throw new AppError('Erro ao obter estatísticas: ' + error.message, 500);
    }
};

/**
 * Gets activity report
 */
export const getActivityReport = async ({ startDate, endDate, type }) => {
    try {
        // Base query conditions
        const dateCondition = {
            gte: startDate,
            lte: endDate
        };

        let reportData = {
            totalEvents: 0,
            uniqueUsers: 0,
            eventsByDate: [],
            eventsByType: [],
            topActiveUsers: []
        };

        if (type === 'all' || type === 'users') {
            // Atividade de usuários
            const userActivity = await db.usuario.findMany({
                where: { dataCriacao: dateCondition },
                select: {
                    dataCriacao: true,
                    nome: true,
                    email: true
                },
                orderBy: { dataCriacao: 'desc' }
            });

            reportData.totalEvents += userActivity.length;
        }

        if (type === 'all' || type === 'questions') {
            // Atividade de questões
            const questionActivity = await db.questao.findMany({
                where: { dataCriacao: dateCondition },
                select: { dataCriacao: true, area: true }
            });

            reportData.totalEvents += questionActivity.length;
        }

        if (type === 'all' || type === 'responses') {
            // Atividade de respostas
            const responseActivity = await db.iaResponse.findMany({
                where: { dataCriacao: dateCondition },
                select: { dataCriacao: true, type: true }
            });

            reportData.totalEvents += responseActivity.length;
        }

        // Usuários únicos ativos no período
        const uniqueUsers = await db.usuario.count({
            where: {
                OR: [
                    { dataCriacao: dateCondition },
                    { dataAtualizacao: dateCondition }
                ]
            }
        });

        reportData.uniqueUsers = uniqueUsers;

        return reportData;
    } catch (error) {
        throw new AppError('Erro ao gerar relatório: ' + error.message, 500);
    }
};