import { asyncHandler, AppError } from '../middleware/errorMiddleware.js';
import * as authService from '../services/userService.js';

const createAuthResponse = (data = null, message = '') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

/**
 * Handles user registration
 * This controller validates the registration data and creates a new user account.
 * It includes proper error handling for common registration issues like duplicate emails.
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new AppError(
      'Todos os campos são obrigatórios para registro',
      400,
      'validation'
    );
  }

  const user = await authService.register(req.body);

  res.status(201).json(createAuthResponse(
    { id: user.id, email: user.email, name: user.nome },
    'Usuário cadastrado com sucesso'
  ));
});

/**
 * Handles user authentication
 * This controller validates login credentials and generates an authentication token.
 * It provides specific error messages for different authentication failure scenarios.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(
      'Email e senha são obrigatórios',
      400,
      'validation'
    );
  }

  const result = await authService.login(email, password);

  res.setHeader('Authorization', `Bearer ${result.token}`);

  res.json(createAuthResponse(
    {
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.nome,
        isAdmin: result.user.administrador
      }
    },
    'Login realizado com sucesso'
  ));
});

/**
 * Retrieves the authenticated user's profile
 * This controller uses the authenticated user's ID from the request object
 * (added by the auth middleware) to fetch the user's profile information.
 */
export const getProfile = asyncHandler(async (req, res) => {
  // Ensure we have a user ID from the auth middleware
  if (!req.user?.id) {
    throw new AppError(
      'Usuário não autenticado',
      401
    );
  }

  const profile = await authService.getProfile(req.user.id);

  if (!profile) {
    throw new AppError(
      'Perfil não encontrado',
      404
    );
  }

  res.json(createAuthResponse(
    {
      id: profile.id,
      email: profile.email,
      name: profile.nome,
      isAdmin: profile.administrador,
      createdAt: profile.createdAt
    },
    'Perfil recuperado com sucesso'
  ));
});

/**
 * Refreshes the user's authentication token
 * This controller provides a way to get a new token without requiring
 * the user to log in again, as long as their current token is still valid.
 */
export const refreshToken = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw new AppError(
      'Token de atualização inválido',
      401
    );
  }

  const newToken = await authService.refreshUserToken(req.user.id);

  res.json(createAuthResponse(
    { token: newToken },
    'Token atualizado com sucesso'
  ));
});

/**
 * Logs out the current user
 * This controller handles the user logout process, which might include
 * token invalidation or any other cleanup needed.
 */
export const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await authService.logout(req.user.id);
  }

  res.json(createAuthResponse(
    null,
    'Logout realizado com sucesso'
  ));
});