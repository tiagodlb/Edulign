import { db } from '../config/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

const userSelectFields = {
    id: true,
    email: true,
    nome: true,
    administrador: true,
    dataCriacao: true,  // Corrigido para usar dataCriacao
    ativo: true
};

/**
 * Retrieves all active users from the database with pagination support
 * @param {Object} options - Query options for filtering and pagination
 * @param {number} options.page - The page number to retrieve
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Optional search term for filtering users
 * @returns {Promise<Array>} Array of active users with pagination metadata
 */
export const findAllUsers = async (options = { page: 1, limit: 10 }) => {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const where = {
        ativo: true,
        ...(search && {
            OR: [
                { nome: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const [users, total] = await Promise.all([
        db.usuario.findMany({
            where,
            select: userSelectFields,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        db.usuario.count({ where })
    ]);

    if (!users.length && total > 0) {
        throw new AppError('Nenhum usuário encontrado na página especificada', 404);
    }

    return {
        data: users,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            perPage: limit
        }
    };
};

/**
 * Creates a new administrator user with associated privileges
 * @param {Object} data - The administrator data
 * @param {string} data.email - Administrator's email
 * @param {string} data.nome - Administrator's name
 * @param {string} data.senha - Administrator's password (will be hashed)
 * @returns {Promise<Object>} Created administrator user with their role
 */
export const createAdmin = async (data) => {
        try {
            const existingUser = await db.usuario.findUnique({
                where: { email: data.email }
            });
    
            if (existingUser) {
                throw new AppError('Este email já está cadastrado no sistema', 409, 'email');
            }
    
            const admin = await db.usuario.create({
                data: {
                    ...data,
                    administrador: true,
                    admin: {
                        create: {}
                    }
                },
                select: {
                    ...userSelectFields,
                    admin: {
                        select: {
                            id: true
                        }
                    }
                }
            });

        if (!admin) {
            throw new AppError('Erro ao criar conta de administrador', 500);
        }

        return admin;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError('Este email já está cadastrado no sistema', 409, 'email');
        }
        throw new AppError('Erro ao criar administrador: ' + error.message, 500);
    }
};

/**
 * Safely deactivates a user in the system (soft delete)
 * @param {string} id - The ID of the user to deactivate
 * @returns {Promise<Object>} The deactivated user's data
 */
export const deleteUser = async (id) => {
    try {
        const user = await db.usuario.update({
            where: { id },
            data: { ativo : false },
            select: userSelectFields
        });

        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }

        return user;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError('Usuário não encontrado no sistema', 404);
        }
        throw new AppError('Erro ao desativar usuário: ' + error.message, 500);
    }
};

/**
 * Updates user information with safety checks
 * @param {string} id - The ID of the user to update
 * @param {Object} data - The data to update
 * @returns {Promise<Object>} Updated user information
 */
export const updateUser = async (id, data) => {
    try {
        const { id: userId, createdAt, administrador, senha, ...safeData } = data;

        const user = await db.usuario.update({
            where: { id },
            data: safeData,
            select: userSelectFields
        });

        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }

        return user;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError('Usuário não encontrado no sistema', 404);
        }
        if (error.code === 'P2002') {
            throw new AppError('Este email já está em uso por outro usuário', 409, 'email');
        }
        throw new AppError('Erro ao atualizar informações do usuário: ' + error.message, 500);
    }
};

/**
 * Creates a new question in the system
 * @param {Object} data - The question data
 * @param {string} data.enunciado - The question text
 * @param {Array<string>} data.alternativas - Array of possible answers
 * @param {number} data.respostaCorreta - Index of the correct answer
 * @param {string} data.area - Subject area of the question
 * @param {number} data.ano - Year of the question
 * @returns {Promise<Object>} Created question with author information
 */
export const createQuestion = async (data) => {
    try {
        const question = await db.questao.create({
            data,
            select: {
                id: true,
                enunciado: true,
                alternativas: true,
                respostaCorreta: true,
                area: true,
                ano: true,
                dataCriacao: true,
                autor: {
                    select: {
                        id: true,
                        usuario: {
                            select: {
                                nome: true
                            }
                        }
                    }
                }
            }
        });

        if (!question) {
            throw new AppError('Erro ao criar questão', 500);
        }

        return question;
    } catch (error) {
        if (error.code === 'P2003') {
            throw new AppError('Autor especificado não existe no sistema', 404, 'autorId');
        }
        if (error.code === 'P2002') {
            throw new AppError('Questão duplicada encontrada', 409);
        }
        throw new AppError('Erro ao criar questão: ' + error.message, 500);
    }
};

const questionSelectFields = {
    id: true,
    enunciado: true,
    alternativas: true,
    respostaCorreta: true,
    area: true,
    ano: true,
    dataCriacao: true,
    autor: {
        select: {
            id: true,
            usuario: {
                select: {
                    nome: true
                }
            }
        }
    }
};

/**
 * Safely deletes a question from the system (soft delete)
 * @param {string} id - The ID of the question to delete
 * @returns {Promise<Object>} The deleted question data
 */
export const deleteQuestion = async (id) => {
    try {
        const question = await db.questao.update({
            where: { id },
            data: { ativo: false },
            select: questionSelectFields
        });

        if (!question) {
            throw new AppError('Questão não encontrada', 404);
        }

        return question;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError('Questão não encontrada no sistema', 404);
        }
        throw new AppError('Erro ao excluir questão: ' + error.message, 500);
    }
};

/**
 * Updates question information with safety checks
 * @param {string} id - The ID of the question to update
 * @param {Object} data - The data to update
 * @returns {Promise<Object>} Updated question information
 */
export const updateQuestion = async (id, data) => {
    try {
        const { id: questionId, dataCriacao, autor, ...safeData } = data;

        const question = await db.questao.update({
            where: { id },
            data: safeData,
            select: questionSelectFields
        });

        if (!question) {
            throw new AppError('Questão não encontrada', 404);
        }

        return question;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError('Questão não encontrada no sistema', 404);
        }
        if (error.code === 'P2002') {
            throw new AppError('Questão duplicada encontrada', 409);
        }
        throw new AppError('Erro ao atualizar questão: ' + error.message, 500);
    }
};

/**
 * Lists all active questions with pagination support
 * @param {Object} options - Query options for filtering and pagination
 * @param {number} options.page - The page number to retrieve
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Optional search term for filtering questions
 * @returns {Promise<Array>} Array of active questions with pagination metadata
 */
export const listQuestions = async (options = { page: 1, limit: 10 }) => {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const where = {
        ativo: true,
        ...(search && {
            OR: [
                { enunciado: { contains: search, mode: 'insensitive' } },
                { area: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const [questions, total] = await Promise.all([
        db.questao.findMany({
            where,
            select: questionSelectFields,
            orderBy: { dataCriacao: 'desc' },
            skip,
            take: limit
        }),
        db.questao.count({ where })
    ]);

    if (!questions.length && total > 0) {
        throw new AppError('Nenhuma questão encontrada na página especificada', 404);
    }

    return {
        data: questions,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            perPage: limit
        }
    };
};

