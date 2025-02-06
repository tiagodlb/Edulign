import axios, { AxiosError, AxiosInstance } from 'axios'
import { jwtDecode } from 'jwt-decode'

// Types and Interfaces
interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  name: string
  email: string
  password: string
  area: string
}

interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  area?: string
  createdAt: string
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

interface JwtPayload {
  exp: number
  userId: string
}

class AuthError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AuthService {
  private static api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/eduling',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly USER_KEY = 'auth_user'
  private static readonly REFRESH_INTERVAL = 60000 // 1 minute
  private static tokenRefreshTimeout: NodeJS.Timeout | null = null

  // Initialize auth state and interceptors
  static {
    const token = this.getToken()
    if (token) {
      this.setAuthHeader(token)
      this.setupTokenRefresh(token)
    }

    // Response interceptor for handling token refresh
    this.api.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest.headers['retry']
        ) {
          try {
            originalRequest.headers['retry'] = 'true'
            const newToken = await this.refreshToken()
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            return this.api(originalRequest)
          } catch (refreshError) {
            console.log(refreshError)
            await this.logout()
            throw new AuthError(
              'Sessão expirada. Por favor, faça login novamente.',
              'SESSION_EXPIRED',
              401
            )
          }
        }
        throw error
      }
    )
  }

  // Authentication Methods
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', credentials)
      const { token, user } = response.data.data
      this.setSession(token, user)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new AuthError('Este email já está em uso.', 'EMAIL_IN_USE', 409)
        }
        throw new AuthError(
          error.response?.data?.message || 'Erro ao registrar usuário',
          'REGISTRATION_ERROR',
          error.response?.status
        )
      }
      throw new AuthError('Erro inesperado ao registrar', 'UNEXPECTED_ERROR')
    }
  }

  static async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', {
        email,
        password
      })

      const { token, user } = response.data.data
      this.setSession(token, user)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new AuthError(
            'Muitas tentativas de login. Tente novamente mais tarde.',
            'RATE_LIMIT_EXCEEDED',
            429
          )
        }
        if (error.response?.status === 401) {
          throw new AuthError('Email ou senha incorretos.', 'INVALID_CREDENTIALS', 401)
        }
        throw new AuthError(
          error.response?.data?.message || 'Erro ao fazer login',
          'LOGIN_ERROR',
          error.response?.status
        )
      }
      throw new AuthError('Erro inesperado ao fazer login', 'UNEXPECTED_ERROR')
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = this.getToken()
      if (token) {
        await this.api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      this.clearSession()
      window.location.href = '/login'
    }
  }

  static async refreshToken(): Promise<string> {
    try {
      const response = await this.api.post<{ data: { token: string } }>('/auth/refresh-token')
      const newToken = response.data.data.token
      this.setToken(newToken)
      this.setupTokenRefresh(newToken)
      return newToken
    } catch (error) {
      this.clearSession()
      throw error
    }
  }

  // Session Management
  private static setSession(token: string, user: User): void {
    this.setToken(token)
    this.setUser(user)
    this.setAuthHeader(token)
    this.setupTokenRefresh(token)
  }

  private static clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    delete this.api.defaults.headers.common['Authorization']
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout)
      this.tokenRefreshTimeout = null
    }
  }

  private static setupTokenRefresh(token: string): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout)
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token)
      const expiresIn = decoded.exp * 1000 - Date.now()
      const refreshTime = expiresIn - this.REFRESH_INTERVAL

      if (refreshTime > 0) {
        this.tokenRefreshTimeout = setTimeout(() => this.refreshToken(), refreshTime)
      } else {
        this.clearSession()
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error)
      this.clearSession()
    }
  }

  // Storage Management
  private static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  private static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch {
      this.clearSession()
      return null
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const decoded = jwtDecode<JwtPayload>(token)
      return decoded.exp * 1000 > Date.now()
    } catch {
      this.clearSession()
      return false
    }
  }

  // HTTP Headers
  static setAuthHeader(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  static getApi(): AxiosInstance {
    return this.api
  }
}

export default AuthService.getApi()
