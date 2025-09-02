'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// ==================== TYPES ====================

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'professor' | 'admin'
  avatar?: string
  ativo: boolean
  dataCriacao: string
  permissions?: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  loginError: string | null
  sessionExpiry: Date | null
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; expiresIn?: number } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'REFRESH_TOKEN'; payload: { token: string; expiresIn?: number } }

// ==================== CONSTANTS ====================

const TOKEN_KEY = 'edulign_admin_token'
const USER_KEY = 'edulign_admin_user'
const REFRESH_KEY = 'edulign_admin_refresh'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4333/eduling'

// ==================== INITIAL STATE ====================

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  loginError: null,
  sessionExpiry: null
}

// ==================== REDUCER ====================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'LOGIN_SUCCESS':
      const expiryDate = action.payload.expiresIn 
        ? new Date(Date.now() + action.payload.expiresIn * 1000)
        : null

      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        loginError: null,
        sessionExpiry: expiryDate
      }
    
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        loginError: action.payload,
        sessionExpiry: null
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        loginError: null,
        sessionExpiry: null
      }
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        loginError: null
      }
    
    case 'REFRESH_TOKEN':
      const newExpiryDate = action.payload.expiresIn 
        ? new Date(Date.now() + action.payload.expiresIn * 1000)
        : null

      return {
        ...state,
        token: action.payload.token,
        sessionExpiry: newExpiryDate
      }

    default:
      return state
  }
}

// ==================== AUTH SERVICE ====================

class AuthService {
  static async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken?: string; expiresIn?: number }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro de login' }))
      throw new Error(error.message || 'Credenciais inválidas')
    }

    const data = await response.json()
    return data.data
  }

  static async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn?: number }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
    })

    if (!response.ok) {
      throw new Error('Falha ao renovar token')
    }

    const data = await response.json()
    return data.data
  }

  static async logout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
    } catch (error) {
      // Ignore logout errors on server side
      console.warn('Erro ao fazer logout no servidor:', error)
    }
  }

  static async validateToken(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error('Token inválido')
    }

    const data = await response.json()
    return data.data
  }
}

// ==================== CONTEXT ====================

interface AuthContextValue {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
  refreshToken: () => Promise<void>
  
  // Permission helpers
  hasRole: (role: 'student' | 'professor' | 'admin') => boolean
  hasPermission: (permission: string) => boolean
  isAdmin: boolean
  isProfessor: boolean
  isStudent: boolean
  
  // Token helpers
  getAuthToken: () => string | null
  isTokenExpired: () => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ==================== STORAGE HELPERS ====================

const storage = {
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },
  
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(REFRESH_KEY)
    }
  }
}

// ==================== PROVIDER ====================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ==================== CORE AUTH METHODS ====================

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await AuthService.login(email, password)
      
      // Store in localStorage
      storage.setItem(TOKEN_KEY, response.token)
      storage.setItem(USER_KEY, JSON.stringify(response.user))
      if (response.refreshToken) {
        storage.setItem(REFRESH_KEY, response.refreshToken)
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          expiresIn: response.expiresIn
        }
      })
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message || 'Erro de login'
      })
      throw error
    }
  }

  const logout = async () => {
    if (state.token) {
      try {
        await AuthService.logout(state.token)
      } catch (error) {
        // Continue with logout even if server call fails
      }
    }

    storage.clear()
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData }
      storage.setItem(USER_KEY, JSON.stringify(updatedUser))
      dispatch({ type: 'UPDATE_USER', payload: userData })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const refreshToken = async () => {
    const refreshTokenValue = storage.getItem(REFRESH_KEY)
    if (!refreshTokenValue) {
      throw new Error('Nenhum refresh token disponível')
    }

    try {
      const response = await AuthService.refreshToken(refreshTokenValue)
      storage.setItem(TOKEN_KEY, response.token)
      
      dispatch({
        type: 'REFRESH_TOKEN',
        payload: {
          token: response.token,
          expiresIn: response.expiresIn
        }
      })
    } catch (error) {
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }

  // ==================== PERMISSION HELPERS ====================

  const hasRole = (role: 'student' | 'professor' | 'admin'): boolean => {
    return state.user?.role === role
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false
    
    // Admins have all permissions
    if (state.user.role === 'admin') return true
    
    // Check specific permissions if they exist
    return state.user.permissions?.includes(permission) || false
  }

  const isAdmin = hasRole('admin')
  const isProfessor = hasRole('professor')
  const isStudent = hasRole('student')

  // ==================== TOKEN HELPERS ====================

  const getAuthToken = (): string | null => {
    return state.token
  }

  const isTokenExpired = (): boolean => {
    if (!state.sessionExpiry) return false
    return new Date() >= state.sessionExpiry
  }

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    const initializeAuth = async () => {
      const token = storage.getItem(TOKEN_KEY)
      const userStr = storage.getItem(USER_KEY)

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          
          // Validate token with server
          const validatedUser = await AuthService.validateToken(token)
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: validatedUser,
              token
            }
          })
        } catch (error) {
          // Invalid token, clear storage
          storage.clear()
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initializeAuth()
  }, [])

  // ==================== AUTO TOKEN REFRESH ====================

  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return

    const checkTokenExpiry = () => {
      const timeUntilExpiry = state.sessionExpiry!.getTime() - Date.now()
      
      // Refresh token 5 minutes before expiry
      if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshToken().catch(() => {
          // If refresh fails, we'll be logged out
        })
      } else if (timeUntilExpiry <= 0) {
        // Token has expired
        logout()
      }
    }

    // Check immediately and then every minute
    checkTokenExpiry()
    const interval = setInterval(checkTokenExpiry, 60 * 1000)

    return () => clearInterval(interval)
  }, [state.isAuthenticated, state.sessionExpiry])

  // ==================== CONTEXT VALUE ====================

  const contextValue: AuthContextValue = {
    state,
    login,
    logout,
    updateUser,
    clearError,
    refreshToken,
    
    // Permission helpers
    hasRole,
    hasPermission,
    isAdmin,
    isProfessor,
    isStudent,
    
    // Token helpers
    getAuthToken,
    isTokenExpired
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// ==================== HOOK ====================

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ==================== EXPORT HELPER ====================

export function getAuthToken(): string | null {
  return storage.getItem(TOKEN_KEY)
}

export default AuthContext