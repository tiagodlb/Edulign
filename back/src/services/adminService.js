import bcrypt from 'bcrypt';
import { AppError } from '../middleware/errorMiddleware.js';
import * as adminRepository from '../repositories/adminRepository.js';
import * as userRepository from '../repositories/userRepository.js';

const SALT_ROUNDS = 12;

/**
 * Retrieves all users from the system with optional filtering and pagination
 * This function serves as the main way to list and search through users
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
 * This function handles both the user creation and admin role assignment
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
 * Deactivates a user account (soft delete)
 * This preserves the user's data while preventing them from accessing the system
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

/**
 * Updates a user's information while maintaining data integrity
 * This function handles both regular updates and password changes
 */
export const updateUser = async (id, { email, name, password }) => {
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
 * Creates a new question in the system
 * This function handles the creation of questions and their association with an admin
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