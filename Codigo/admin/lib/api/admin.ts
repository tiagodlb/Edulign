// admin/lib/api/admin.ts
import { getAuthToken } from '@/lib/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4333/eduling'

// ==================== INTERFACES ====================

export interface User {
  id: string
  nome: string
  email: string
  role: 'student' | 'professor' | 'admin'
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export interface Question {
  id: string
  enunciado: string
  comando?: string
  alternativas: Array<{
    id: string
    letra: string
    texto: string
    correta: boolean
  }>
  respostaCorreta: number
  area: string
  ano: number
  tipo: 'ENADE' | 'CUSTOM'
  nivel: 'FACIL' | 'MEDIO' | 'DIFICIL'
  dataCriacao: string
  dataAtualizacao: string
}

export interface AIResponse {
  id: string
  responseId: string
  originalResponse: string
  revisedResponse?: string
  feedback?: string
  approved?: boolean
  status: 'PENDING' | 'REVIEWED'
  type: 'QUESTION' | 'EXPLANATION' | 'HINT'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  dataCriacao: string
  reviewedAt?: string
  questao?: {
    enunciado: string
    area: string
  }
}

export interface SystemStats {
  period: string
  users: {
    total: number
    active: number
    newThisPeriod: number
  }
  questions: {
    total: number
    newThisPeriod: number
    byArea: Array<{ area: string; count: number }>
  }
  responses: {
    totalPending: number
    totalReviewed: number
    approvalRate: number
  }
  activity: {
    simuladosCompleted: number
    avgScore: number
    peakUsageHour: number
  }
}

export interface ActivityReport {
  period: {
    start: string
    end: string
    type: string
  }
  summary: {
    totalEvents: number
    uniqueUsers: number
    peakDay: string | null
  }
  breakdown: {
    byDate: Array<{ date: string; events: number }>
    byType: Array<{ type: string; count: number }>
    byUser: Array<{ user: string; activity: number }>
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    pages: number
    currentPage: number
    perPage: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ==================== ADMIN SERVICE ====================

class AdminService {
  private async getHeaders(includeContentType = true): Promise<HeadersInit> {
    const token = getAuthToken()
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json'
    }
    
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
      throw new Error(error.message || `Erro HTTP: ${response.status}`)
    }
    
    return await response.json()
  }

  // ==================== USUÁRIOS ====================

  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }): Promise<PaginatedResponse<User>> {
    try {
      const headers = await this.getHeaders()
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.role) searchParams.append('role', params.role)
      if (params?.status) searchParams.append('status', params.status)

      const response = await fetch(
        `${API_BASE_URL}/admin/users${searchParams.toString() ? '?' + searchParams.toString() : ''}`,
        { headers }
      )

      return await this.handleResponse<PaginatedResponse<User>>(response)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      throw error
    }
  }

  async createAdmin(userData: {
    email: string
    password: string
    name: string
  }): Promise<{ success: boolean; message: string; data: User }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      throw error
    }
  }

  async updateUser(id: string, userData: {
    email?: string
    name?: string
    password?: string
    role?: string
    status?: string
  }): Promise<{ success: boolean; message: string; data: User }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw error
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      throw error
    }
  }

  // ==================== QUESTÕES ====================

  async getQuestions(params?: {
    page?: number
    limit?: number
    area?: string
    ano?: number
    search?: string
    type?: string
  }): Promise<PaginatedResponse<Question>> {
    try {
      const headers = await this.getHeaders()
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.area) searchParams.append('area', params.area)
      if (params?.ano) searchParams.append('ano', params.ano.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.type) searchParams.append('type', params.type)

      const response = await fetch(
        `${API_BASE_URL}/admin/questions${searchParams.toString() ? '?' + searchParams.toString() : ''}`,
        { headers }
      )

      return await this.handleResponse<PaginatedResponse<Question>>(response)
    } catch (error) {
      console.error('Erro ao buscar questões:', error)
      throw error
    }
  }

  async getQuestion(id: string): Promise<{ success: boolean; data: Question }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
        headers
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao buscar questão:', error)
      throw error
    }
  }

  async createQuestion(questionData: {
    enunciado: string
    comando?: string
    alternativas: string[]
    respostaCorreta: number
    area: string
    ano: number
    tipo?: string
    nivel?: string
  }): Promise<{ success: boolean; message: string; data: Question }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/questions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(questionData)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao criar questão:', error)
      throw error
    }
  }

  async updateQuestion(id: string, questionData: Partial<{
    enunciado: string
    comando: string
    alternativas: string[]
    respostaCorreta: number
    area: string
    ano: number
    tipo: string
    nivel: string
  }>): Promise<{ success: boolean; message: string; data: Question }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(questionData)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao atualizar questão:', error)
      throw error
    }
  }

  async deleteQuestion(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
        method: 'DELETE',
        headers
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao excluir questão:', error)
      throw error
    }
  }

  // ==================== RESPOSTAS IA ====================

  async getPendingResponses(params?: {
    page?: number
    limit?: number
    type?: string
    priority?: string
  }): Promise<PaginatedResponse<AIResponse>> {
    try {
      const headers = await this.getHeaders()
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.type) searchParams.append('type', params.type)
      if (params?.priority) searchParams.append('priority', params.priority)

      const response = await fetch(
        `${API_BASE_URL}/admin/responses/pending${searchParams.toString() ? '?' + searchParams.toString() : ''}`,
        { headers }
      )

      return await this.handleResponse<PaginatedResponse<AIResponse>>(response)
    } catch (error) {
      console.error('Erro ao buscar respostas pendentes:', error)
      throw error
    }
  }

  async reviewResponse(reviewData: {
    responseId: string
    revisedResponse: string
    feedback?: string
    approved?: boolean
  }): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/review-response`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(reviewData)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao revisar resposta:', error)
      throw error
    }
  }

  async bulkApproveResponses(bulkData: {
    responseIds: string[]
    approved: boolean
    feedback?: string
  }): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/responses/bulk-approve`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bulkData)
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao processar respostas em lote:', error)
      throw error
    }
  }

  async deleteResponse(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/delete-response/${id}`, {
        method: 'DELETE',
        headers
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao excluir resposta:', error)
      throw error
    }
  }

  // ==================== ESTATÍSTICAS ====================

  async getSystemStatistics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{ success: boolean; data: SystemStats }> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/admin/statistics/system?period=${period}`, {
        headers
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  async getActivityReport(params: {
    startDate: string
    endDate: string
    type?: string
  }): Promise<{ success: boolean; data: ActivityReport }> {
    try {
      const headers = await this.getHeaders()
      const searchParams = new URLSearchParams()
      searchParams.append('startDate', params.startDate)
      searchParams.append('endDate', params.endDate)
      if (params.type) searchParams.append('type', params.type)

      const response = await fetch(
        `${API_BASE_URL}/admin/reports/activity?${searchParams.toString()}`,
        { headers }
      )

      return await this.handleResponse(response)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      throw error
    }
  }
}

// ==================== EXPORT ====================

export const adminService = new AdminService()

// Export individual functions for easier usage
export default adminService