import bcrypt from 'bcrypt';
import { AppError } from '../middleware/errorMiddleware.js';
import * as adminRepository from '../repositories/adminRepository.js';
import * as userRepository from '../repositories/userRepository.js';

const SALT_ROUNDS = 12;

// ==================== SERVIÇOS DE USUÁRIOS ====================

/**
 * Retrieves all users from the system with optional filtering and pagination
 */
export const listUsers = async (options = {}) => {
    try {
        const users = await adminRepository.findAllUsers(options);

        if (!users.data || users.data.length === 0) {
            return {
                data: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    currentPage: options.page || 1,
                    perPage: options.limit || 10
                }
            };
        }

        return users;
    } catch (error) {
        throw new AppError(
            'Erro ao listar usuários: ' + error.message,
            500
        );
    }
};

/**
 * Creates a new administrator user in the system
 */
export const createAdmin = async ({ email, password, name }) => {
    if (!email || !password || !name) {
        throw new AppError(
            'Todos os campos são obrigatórios para criar um administrador',
            400,
            'validation'
        );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError(
            'Formato de email inválido',
            400,
            'email'
        );
    }

    if (password.length < 8) {
        throw new AppError(
            'A senha deve ter no mínimo 8 caracteres',
            400,
            'password'
        );
    }

    try {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError(
                'Este email já está cadastrado no sistema',
                409,
                'email'
            );
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const admin = await adminRepository.createAdmin({
            email,
            senha: hashedPassword,
            nome: name
        });

        const { senha, ...safeAdminData } = admin;
        return safeAdminData;

    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError(
            'Erro ao criar administrador: ' + error.message,
            500
        );
    }
};

/**
 * Updates a user's information while maintaining data integrity
 */
export const updateUser = async (id, { email, name, password, role, status }) => {
    if (!id) {
        throw new AppError(
            'ID do usuário é obrigatório',
            400,
            'validation'
        );
    }

    try {
        const updates = {};

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new AppError(
                    'Formato de email inválido',
                    400,
                    'email'
                );
            }
            updates.email = email;
        }

        if (name) {
            updates.nome = name;
        }

        if (password) {
            if (password.length < 8) {
                throw new AppError(
                    'A senha deve ter no mínimo 8 caracteres',
                    400,
                    'password'
                );
            }
            updates.senha = await bcrypt.hash(password, SALT_ROUNDS);
        }

        if (role) {
            if (!['student', 'professor', 'admin'].includes(role)) {
                throw new AppError(
                    'Papel inválido. Deve ser: student, professor ou admin',
                    400,
                    'role'
                );
            }
            updates.role = role;
        }

        if (status) {
            if (!['active', 'inactive'].includes(status)) {
                throw new AppError(
                    'Status inválido. Deve ser: active ou inactive',
                    400,
                    'status'
                );
            }
            updates.ativo = status === 'active';
        }

        const updatedUser = await adminRepository.updateUser(id, updates);

        const { senha, ...safeUserData } = updatedUser;
        return safeUserData;

    } catch (error) {
        throw new AppError(
            'Erro ao atualizar usuário: ' + error.message,
            error.status || 500
        );
    }
};

/**
 * Deactivates a user account (soft delete)
 */
export const deleteUser = async (id) => {
    if (!id) {
        throw new AppError(
            'ID do usuário é obrigatório',
            400,
            'validation'
        );
    }

    try {
        return await adminRepository.deleteUser(id);
    } catch (error) {
        throw new AppError(
            'Erro ao desativar usuário: ' + error.message,
            error.status || 500
        );
    }
};

// ==================== SERVIÇOS DE QUESTÕES ====================

/**
 * Lists questions with filtering and pagination
 */
export const listQuestion = async (options = {}) => {
    try {
        const questions = await adminRepository.findAllQuestions(options);

        if (!questions.data || questions.data.length === 0) {
            return {
                data: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    currentPage: options.page || 1,
                    perPage: options.limit || 10
                }
            };
        }

        return questions;
    } catch (error) {
        throw new AppError(
            'Erro ao listar questões: ' + error.message,
            500
        );
    }
};

/**
 * Gets a question by its ID
 */
export const getQuestionById = async (id) => {
    if (!id) {
        throw new AppError(
            'ID da questão é obrigatório',
            400,
            'validation'
        );
    }

    try {
        const question = await adminRepository.findQuestionById(id);
        
        if (!question) {
            throw new AppError(
                'Questão não encontrada',
                404
            );
        }

        return question;
    } catch (error) {
        throw new AppError(
            'Erro ao buscar questão: ' + error.message,
            error.status || 500
        );
    }
};

/**
 * Creates a new question in the system
 */
export const createQuestion = async (questionData) => {
    const requiredFields = ['enunciado', 'alternativas', 'respostaCorreta', 'area', 'ano'];
    for (const field of requiredFields) {
        if (!questionData[field]) {
            throw new AppError(
                `O campo ${field} é obrigatório`,
                400,
                field
            );
        }
    }

    if (!Array.isArray(questionData.alternativas) || questionData.alternativas.length < 2) {
        throw new AppError(
            'A questão deve ter pelo menos duas alternativas',
            400,
            'alternativas'
        );
    }

    if (questionData.respostaCorreta >= questionData.alternativas.length) {
        throw new AppError(
            'O índice da resposta correta é inválido',
            400,
            'respostaCorreta'
        );
    }

    try {
        return await adminRepository.createQuestion(questionData);
    } catch (error) {
        throw new AppError(
            'Erro ao criar questão: ' + error.message,
            error.status || 500
        );
    }
};

/**
 * Updates a question's information
 */
export const updateQuestion = async (id, updateData) => {
    if (!id) {
        throw new AppError(
            'ID da questão é obrigatório',
            400,
            'validation'
        );
    }

    try {
        // Validar dados se foram fornecidos
        if (updateData.alternativas) {
            if (!Array.isArray(updateData.alternativas) || updateData.alternativas.length < 2) {
                throw new AppError(
                    'A questão deve ter pelo menos duas alternativas',
                    400,
                    'alternativas'
                );
            }
        }

        if (updateData.respostaCorreta !== undefined) {
            const alternativas = updateData.alternativas || await adminRepository.getQuestionAlternatives(id);
            if (updateData.respostaCorreta >= alternativas.length) {
                throw new AppError(
                    'O índice da resposta correta é inválido',
                    400,
                    'respostaCorreta'
                );
            }
        }

        const updatedQuestion = await adminRepository.updateQuestion(id, updateData);
        
        if (!updatedQuestion) {
            throw new AppError(
                'Questão não encontrada',
                404
            );
        }

        return updatedQuestion;
    } catch (error) {
        throw new AppError(
            'Erro ao atualizar questão: ' + error.message,
            error.status || 500
        );
    }
};

/**
 * Deletes a question (soft delete)
 */
export const deleteQuestion = async (id) => {
    if (!id) {
        throw new AppError(
            'ID da questão é obrigatório',
            400,
            'validation'
        );
    }

    try {
        return await adminRepository.deleteQuestion(id);
    } catch (error) {
        throw new AppError(
            'Erro ao excluir questão: ' + error.message,
            error.status || 500
        );
    }
};

// ==================== SERVIÇOS DE RESPOSTAS DA IA ====================

/**
 * Reviews an AI response with admin feedback
 */
export const reviewResponse = async ({ responseId, revisedResponse, feedback, approved, reviewerId }) => {
    if (!responseId || !revisedResponse || !reviewerId) {
        throw new AppError(
            'responseId, revisedResponse e reviewerId são obrigatórios',
            400,
            'validation'
        );
    }

    try {
        const reviewData = {
            responseId,
            revisedResponse,
            feedback: feedback || '',
            approved: approved !== undefined ? approved : true,
            reviewerId,
            reviewedAt: new Date()
        };

        const result = await adminRepository.reviewResponse(reviewData);
        
        if (!result) {
            throw new AppError(
                'Resposta não encontrada para revisão',
                404
            );
        }

        return result;
    } catch (error) {
        throw new AppError(
            'Erro ao revisar resposta: ' + error.message,
            error.status || 500
        );
    }
};

/**
 * Deletes an AI response
 */
export const deleteResponse = async (id) => {
    if (!id) {
        throw new AppError(
            'ID da resposta é obrigatório',
            400,
            'validation'
        );
    }

    try {
        return await adminRepository.deleteResponse(id);
    } catch (error) {
        throw new AppError(
            'Erro ao excluir resposta: ' + error.message,
            error.status || 500
        );
    }
};

/**
 * Lists pending responses for review
 */
export const listPendingResponses = async (options = {}) => {
    try {
        const responses = await adminRepository.findPendingResponses(options);

        if (!responses.data || responses.data.length === 0) {
            return {
                data: [],
                pagination: {
                    total: 0,
                    pages: 0,
                    currentPage: options.page || 1,
                    perPage: options.limit || 10
                }
            };
        }

        return responses;
    } catch (error) {
        throw new AppError(
            'Erro ao listar respostas pendentes: ' + error.message,
            500
        );
    }
};

/**
 * Bulk approve/reject responses
 */
export const bulkApproveResponses = async ({ responseIds, approved, feedback, reviewerId }) => {
    if (!Array.isArray(responseIds) || responseIds.length === 0) {
        throw new AppError(
            'responseIds deve ser um array não vazio',
            400,
            'validation'
        );
    }

    if (typeof approved !== 'boolean') {
        throw new AppError(
            'approved deve ser um valor boolean',
            400,
            'validation'
        );
    }

    if (!reviewerId) {
        throw new AppError(
            'reviewerId é obrigatório',
            400,
            'validation'
        );
    }

    try {
        const result = await adminRepository.bulkUpdateResponses({
            responseIds,
            approved,
            feedback: feedback || '',
            reviewerId,
            reviewedAt: new Date()
        });

        return {
            processed: result.count || 0,
            approved,
            totalRequested: responseIds.length
        };
    } catch (error) {
        throw new AppError(
            'Erro ao processar respostas em lote: ' + error.message,
            error.status || 500
        );
    }
};

// ==================== SERVIÇOS DE ESTATÍSTICAS ====================

/**
 * Gets system statistics
 */
export const getSystemStatistics = async (period = 'month') => {
    try {
        const stats = await adminRepository.getSystemStats(period);
        
        return {
            period,
            users: {
                total: stats.totalUsers || 0,
                active: stats.activeUsers || 0,
                newThisPeriod: stats.newUsers || 0
            },
            questions: {
                total: stats.totalQuestions || 0,
                newThisPeriod: stats.newQuestions || 0,
                byArea: stats.questionsByArea || []
            },
            responses: {
                totalPending: stats.pendingResponses || 0,
                totalReviewed: stats.reviewedResponses || 0,
                approvalRate: stats.approvalRate || 0
            },
            activity: {
                simuladosCompleted: stats.simuladosCompleted || 0,
                avgScore: stats.avgScore || 0,
                peakUsageHour: stats.peakUsageHour || 0
            }
        };
    } catch (error) {
        throw new AppError(
            'Erro ao obter estatísticas do sistema: ' + error.message,
            500
        );
    }
};

/**
 * Generates activity report
 */
export const getActivityReport = async ({ startDate, endDate, type = 'all' }) => {
    if (!startDate || !endDate) {
        throw new AppError(
            'startDate e endDate são obrigatórios',
            400,
            'validation'
        );
    }

    if (startDate >= endDate) {
        throw new AppError(
            'startDate deve ser anterior a endDate',
            400,
            'validation'
        );
    }

    try {
        const reportData = await adminRepository.getActivityReport({
            startDate,
            endDate,
            type
        });

        return {
            period: {
                start: startDate,
                end: endDate,
                type
            },
            summary: {
                totalEvents: reportData.totalEvents || 0,
                uniqueUsers: reportData.uniqueUsers || 0,
                peakDay: reportData.peakDay || null
            },
            breakdown: {
                byDate: reportData.eventsByDate || [],
                byType: reportData.eventsByType || [],
                byUser: reportData.topActiveUsers || []
            }
        };
    } catch (error) {
        throw new AppError(
            'Erro ao gerar relatório de atividades: ' + error.message,
            500
        );
    }
};