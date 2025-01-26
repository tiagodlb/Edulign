import { db } from '../config/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';

const userSelectFields = {
    id: true,
    email: true,
    nome: true,
    administrador: true,
    dataCriacao: true,
    ativo: true
};

/**
 * Retrieves all active users from the database with pagination and search support
 * @param {Object} options - Query options for filtering and pagination
 * @param {number} options.page - Current page number (default: 1)
 * @param {number} options.limit - Number of items per page (default: 10)
 * @param {string} options.search - Optional search term to filter users
 * @returns {Promise<Object>} Object containing users array and pagination metadata
 */
export const findAllUsers = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = ''
    } = options;

    try {
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

        if (page > 1 && !users.length && total > 0) {
            throw new AppError('Página solicitada não contém registros', 404);
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
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError(
            'Erro ao buscar usuários: ' + error.message,
            500
        );
    }
};

/**
 * Creates a new administrator user with their associated profile
 * @param {Object} data - The administrator's information
 * @param {string} data.email - Administrator's email address
 * @param {string} data.nome - Administrator's full name
 * @param {string} data.senha - Administrator's password (will be hashed)
 * @returns {Promise<Object>} The created administrator user with their profile
 */
export const createAdmin = async (data) => {
    try {
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
            throw new AppError(
                'Este email já está cadastrado no sistema',
                409,
                'email'
            );
        }
        throw new AppError(
            'Erro ao criar administrador: ' + error.message,
            500
        );
    }
};

/**
 * Deactivates a user account (soft delete)
 * @param {string} id - The ID of the user to deactivate
 * @returns {Promise<Object>} The deactivated user's information
 */
export const deleteUser = async (id) => {
    try {
        const user = await db.usuario.update({
            where: { id },
            data: { ativo: false },
            select: userSelectFields
        });

        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }

        return user;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError(
                'Usuário não encontrado no sistema',
                404,
                'id'
            );
        }
        throw new AppError(
            'Erro ao desativar usuário: ' + error.message,
            500
        );
    }
};

/**
 * Updates a user's information while protecting sensitive fields
 * @param {string} id - The ID of the user to update
 * @param {Object} data - The data to update
 * @returns {Promise<Object>} The updated user information
 */
export const updateUser = async (id, data) => {
    try {
        const {
            id: userId,
            createdAt,
            administrador,
            senha,
            ...updateData
        } = data;

        const updatedUser = await db.usuario.update({
            where: { id },
            data: updateData,
            select: userSelectFields
        });

        if (!updatedUser) {
            throw new AppError('Usuário não encontrado', 404);
        }

        return updatedUser;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError(
                'Usuário não encontrado no sistema',
                404,
                'id'
            );
        }
        if (error.code === 'P2002') {
            throw new AppError(
                'Este email já está em uso por outro usuário',
                409,
                'email'
            );
        }
        throw new AppError(
            'Erro ao atualizar informações do usuário: ' + error.message,
            500
        );
    }
};

/**
 * Creates a new question in the system
 * @param {Object} data - The question data
 * @param {string} data.enunciado - The question text
 * @param {string[]} data.alternativas - Array of possible answers
 * @param {number} data.respostaCorreta - Index of the correct answer
 * @param {string} data.area - Subject area
 * @param {number} data.ano - Year of the question
 * @returns {Promise<Object>} The created question with author information
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
            throw new AppError(
                'O autor especificado não existe no sistema',
                404,
                'autorId'
            );
        }
        throw new AppError(
            'Erro ao criar questão: ' + error.message,
            500
        );
    }
};

/**
 * Finds a user by their email address
 * @param {string} email - The email address to search for
 * @returns {Promise<Object|null>} The user object if found, null otherwise
 */
export const findByEmail = async (email) => {
    try {
        const user = await db.usuario.findUnique({
            where: { email },
            select: {
                ...userSelectFields,
                senha: true,  // Include password for authentication
                aluno: {
                    select: {
                        id: true
                    }
                },
                admin: {
                    select: {
                        id: true
                    }
                }
            }
        });

        return user;
    } catch (error) {
        throw new AppError(
            'Erro ao buscar usuário por email',
            500
        );
    }
};


/**
 * Creates a new regular user account
 * @param {Object} data - User data including email, senha (password), and nome (name)
 * @returns {Promise<Object>} The created user object
 */
export const create = async (data) => {
    try {
        const user = await db.usuario.create({
            data: {
                email: data.email,
                nome: data.nome,
                senha: data.senha,
                aluno: {
                    create: {} // Creates the associated student record
                }
            },
            select: {
                ...userSelectFields,
                aluno: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!user) {
            throw new AppError('Erro ao criar conta de usuário', 500);
        }

        return user;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError(
                'Este email já está cadastrado no sistema',
                409,
                'email'
            );
        }
        throw new AppError(
            'Erro ao criar usuário',
            500
        );
    }
};

/**
 * Finds a user by their ID
 * @param {string} id - The user's ID
 * @returns {Promise<Object|null>} The user object if found, null otherwise
 */
export const findById = async (id) => {
    try {
        const user = await db.usuario.findUnique({
            where: { id },
            select: {
                ...userSelectFields,
                aluno: {
                    select: {
                        id: true
                    }
                },
                admin: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }

        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError(
            'Erro ao buscar usuário',
            500
        );
    }
};