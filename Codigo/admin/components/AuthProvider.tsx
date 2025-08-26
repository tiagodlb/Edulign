'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/auth'

type User = {
  id?: string
  nome?: string
  email?: string
  tipo?: 'ADMIN' | 'PROFESSOR' | 'ALUNO'
  token?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/eduling'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há um token salvo e validá-lo
    const initAuth = async () => {
      const token = getAuthToken()
      
      if (token) {
        try {
          // Validar token com o backend
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser({
              ...data.data,
              token
            })
          } else {
            // Token inválido, limpar
            clearAuthToken()
          }
        } catch (error) {
          console.error('Erro ao validar token:', error)
          clearAuthToken()
        }
      }
      
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao fazer login')
      }

      const data = await response.json()
      
      // Salvar token
      setAuthToken(data.token, rememberMe)
      
      // Salvar dados do usuário
      const userData = {
        ...data.data,
        token: data.token
      }
      
      setUser(userData)
      
      // Salvar no localStorage para persistência
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData))
      }
      
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    }
  }

  const logout = () => {
    clearAuthToken()
    setUser(null)
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}