export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Seja Bem-vindo!",
  LOGIN_ERROR: "Um erro ocorreu durante a autenticação",
  REGISTER_SUCCESS: "Conta criada com sucesso!",
  REGISTER_ERROR: "Um erro ocorreu durante o registro",
  LOADING: "Processando...",
  LOGIN_BUTTON: "Entrar",
  REGISTER_BUTTON: "Registrar",
  WELCOME_TITLE: "Bem vindo ao Edulign",
  WELCOME_SUBTITLE: "Por favor, entre os dados da sua conta",
  REGISTER_TITLE: "Crie sua conta no Edulign",
  REGISTER_SUBTITLE: "Preencha os dados para criar sua conta",
  FORGOT_PASSWORD_BUTTON: "Enviar email"
} as const;

export const AUTH_COOKIE_CONFIG = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  MAX_AGE: 30 * 24 * 60 * 60, // 30 dias em segundos
  OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
} as const;

