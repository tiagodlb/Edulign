import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorMiddleware.js';
import * as userRepository from '../repositories/userRepository.js';

const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 8;
const JWT_EXPIRES_IN = '2h';

/**
 * Validates email format using a regular expression
 * This helps ensure we only accept properly formatted email addresses
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength using multiple criteria
 * We check for minimum length and required character types to ensure security
 */
const isValidPassword = (password) => {
    if (password.length < PASSWORD_MIN_LENGTH) return false;

    // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

/**
 * Registers a new user in the system
 * This function handles the complete user registration process, including:
 * - Input validation
 * - Password hashing
 * - Duplicate email checking
 * - User creation
 */
export const register = async ({ email, password, name }) => {
    if (!email || !password || !name) {
        throw new AppError(
            'Todos os campos são obrigatórios',
            400,
            'validation'
        );
    }

    if (!isValidEmail(email)) {
        throw new AppError(
            'Formato de email inválido',
            400,
            'email'
        );
    }

    if (!isValidPassword(password)) {
        throw new AppError(
            'A senha deve ter pelo menos 8 caracteres e conter letras maiúsculas, minúsculas, números e caracteres especiais',
            400,
            'password'
        );
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw new AppError(
            'Este email já está cadastrado no sistema',
            409,
            'email'
        );
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.create({
        email,
        senha: hashedPassword,
        nome: name
    });

    const { senha, ...safeUser } = user;
    return safeUser;
};

/**
 * Authenticates a user and generates a JWT token
 * This function handles the complete login process, including:
 * - Credential verification
 * - Password comparison
 * - Token generation
 */
export const login = async (email, password) => {
    if (!email || !password) {
        throw new AppError(
            'Email e senha são obrigatórios',
            400,
            'validation'
        );
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new AppError(
            'Credenciais inválidas',
            401,
            'authentication'
        );
    }

    if (!user.ativo) {
        throw new AppError(
            'Esta conta está desativada',
            403,
            'authentication'
        );
    }

    const isMatch = await bcrypt.compare(password, user.senha);
    if (!isMatch) {
        throw new AppError(
            'Credenciais inválidas',
            401,
            'authentication'
        );
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            admin: user.administrador
        },
        process.env['JWT_SECRET'],
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );

    const { senha, ...safeUser } = user;
    return { token, user: safeUser };
};

/**
 * Retrieves a user's profile information
 * This function fetches user details while protecting sensitive information
 */
export const getProfile = async (id) => {
    if (!id) {
        throw new AppError(
            'ID do usuário é obrigatório',
            400,
            'validation'
        );
    }

    const user = await userRepository.findById(id);
    if (!user) {
        throw new AppError(
            'Usuário não encontrado',
            404,
            'notFound'
        );
    }

    const { senha, ...safeUser } = user;
    return safeUser;
};

/**
 * Refreshes a user's authentication token
 * This function generates a new token for a valid user session
 */
export const refreshUserToken = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user || !user.ativo) {
        throw new AppError(
            'Usuário não encontrado ou inativo',
            404,
            'authentication'
        );
    }

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            admin: user.administrador
        },
        process.env['JWT_SECRET'],
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );
};

/**
 * Handles user logout operations
 * This function can be expanded to handle token invalidation or session cleanup
 */
export const logout = async (userId) => {
    // Add any necessary logout logic here
    // For example, you might want to:
    // - Add the current token to a blacklist
    // - Clear user sessions
    // - Log the logout event
    return true;
};