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
  login: (email: string, password: string) => Promise<boolean>
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
    // Carregar usuário salvo no localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
    }

    // Validar token
    const initAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            const validatedUser = { ...data.data, token }
            setUser(validatedUser)
            localStorage.setItem('user', JSON.stringify(validatedUser))
          } else {
            clearAuthToken()
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Erro ao validar token:', error)
          clearAuthToken()
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao fazer login')
      }

      const data = await response.json()

      // Salvar token e usuário no localStorage
      setAuthToken(data.token, true)
      const userData = { ...data.data, token: data.token }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

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
