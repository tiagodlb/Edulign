import bcrypt from 'bcrypt';
import * as adminRepository from '../repositories/adminRepository.js';
import * as userRepository from '../repositories/userRepository.js';

export const listUsers = () => {
    return adminRepository.findAllUsers();
};

export const createAdmin = async ({ email, password, name }) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw Object({ status: 400, message: 'Usuário já cadastrado', field: 'email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    return adminRepository.createAdmin({
        email,
        senha: hashedPassword,
        nome: name
    });
};

export const deleteUser = (id) => {
    return adminRepository.deleteUser(id);
};

export const updateUser = async (id, { email, name, password, admin }) => {
    const updates = { email, nome: name };

    if (password) {
        updates.senha = await bcrypt.hash(password, 12);
    }

    return adminRepository.updateUser(id, updates);
};

export const createQuestion = (questionData) => {
    return adminRepository.createQuestion(questionData);
};