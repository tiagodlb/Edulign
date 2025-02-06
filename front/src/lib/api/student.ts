import axios from 'axios'
import { AuthService } from './auth'
import { AreaAvaliacao } from '@/types'

interface CreateSimuladoParams {
  knowledgeArea: AreaAvaliacao
  numberOfQuestions: number
}

// API Response Interfaces
interface SimuladoResponse {
  success: boolean
  message: string
  data: {
    simulado: {
      id: number
      titulo: string
      area: AreaAvaliacao
      duracao: string
      questoes: number
    }
  }
}

interface SimuladosResponse {
  success: boolean
  message: string
  data: {
    simulados: Array<{
      id: number
      titulo: string
      area: AreaAvaliacao
      duracao: string
      questoes: number
    }>
  }
}

interface ExamsResponse {
  success: boolean
  message: string
  data: Array<{
    id: number
    enunciado: string
    alternativas: string[]
    area: AreaAvaliacao
    ano: number
  }>
}

interface QuestionsResponse {
  success: boolean
  message: string
  data: Array<{
    id: number
    enunciado: string
    alternativas: string[]
    area: AreaAvaliacao
    ano: number
  }>
}

interface StatisticsResponse {
  success: boolean
  message: string
  data: {
    totalSimulados: number
    mediaGeral: number
    porArea: {
      [key in AreaAvaliacao]?: {
        total: number
        corretas: number
        percentual: number
      }
    }
  }
}

class StudentError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message)
    this.name = 'StudentError'
  }
}

export class StudentService {
  private static api = AuthService.getApi()

  // List ENADE Exams
  static async listEnadeExams(year?: number, area?: AreaAvaliacao) {
    try {
      const response = await this.api.get<ExamsResponse>('/student/exams', {
        params: { year, knowledgeArea: area }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao listar provas')
      }

      return response.data.data
    } catch (error) {
      this.handleError(error, 'Erro ao listar provas ENADE')
    }
  }

  // Search Questions
  static async searchQuestions(query: string) {
    try {
      const response = await this.api.post<QuestionsResponse>('/student/questions/search', {
        query
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar questões')
      }

      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new StudentError('Termo de busca não fornecido', 'INVALID_QUERY', 400)
      }
      this.handleError(error, 'Erro ao buscar questões')
    }
  }

  // Create Simulated Exam
  static async createSimulado(params: CreateSimuladoParams) {
    console.log(params)
    try {
      const response = await this.api.post<SimuladoResponse>('/student/simulated-exams', {
        knowledgeArea: params.knowledgeArea,
        numberOfQuestions: params.numberOfQuestions
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao criar simulado')
      }

      return response.data.data.simulado
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new StudentError(
            error.response.data?.message || 'Dados inválidos para criar o simulado',
            'INVALID_DATA',
            400
          )
        }
        if (error.response?.status === 404) {
          throw new StudentError(
            'Não há questões suficientes para criar o simulado',
            'INSUFFICIENT_QUESTIONS',
            404
          )
        }
      }
      this.handleError(error, 'Erro ao criar simulado')
    }
  }

  // Get All Simulados
  static async getSimulados() {
    try {
      const userJson = localStorage.getItem('auth_user')
      if (!userJson) {
        throw new Error('Usuário não autenticado')
      }

      const user = JSON.parse(userJson)
      const userId = user.id

      const response = await this.api.get<SimuladosResponse>(`/student/simulated-exams/${userId}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar simulados')
      }

      console.log(response.data)

      return response.data
    } catch (error) {
      this.handleError(error, 'Erro ao buscar simulados')
    }
  }

  // Get Specific Simulado
  static async getSimuladoById(id: string) {
    try {
      const response = await this.api.get<SimuladoResponse>(`/student/simulated-exam/${id}`)
      console.log(`/student/simulated-exam/${id}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar simulado')
      }

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new StudentError('Simulado não encontrado', 'NOT_FOUND', 404)
      }
      this.handleError(error, 'Erro ao buscar simulado')
    }
  }

  // Get Question Explanation
  static async getQuestionExplanation(id: number) {
    try {
      const response = await this.api.get<{ success: boolean; message: string; data: string }>(
        `/student/questions/${id}/explanation`
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar explicação')
      }

      return response.data.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new StudentError('Explicação não encontrada', 'NOT_FOUND', 404)
      }
      this.handleError(error, 'Erro ao buscar explicação')
    }
  }

  // Get Student Statistics
  static async getStatistics() {
    try {
      const response = await this.api.get<StatisticsResponse>('/student/statistics')

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar estatísticas')
      }

      return response.data.data
    } catch (error) {
      this.handleError(error, 'Erro ao buscar estatísticas')
    }
  }

  // Export Student Data
  static async exportData(): Promise<Blob> {
    try {
      const response = await this.api.get('/student/export-data', {
        responseType: 'blob'
      })
      return new Blob([response.data], { type: 'application/pdf' })
    } catch (error) {
      this.handleError(error, 'Erro ao exportar dados')
    }
  }

  private static handleError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || defaultMessage
      const status = error.response?.status

      switch (status) {
        case 401:
          throw new StudentError('Não autorizado', 'UNAUTHORIZED', status)
        case 403:
          throw new StudentError('Acesso negado', 'FORBIDDEN', status)
        case 404:
          throw new StudentError('Recurso não encontrado', 'NOT_FOUND', status)
        case 400:
          throw new StudentError(errorMessage, 'INVALID_DATA', status)
        case 429:
          throw new StudentError(
            'Muitas requisições. Tente novamente mais tarde.',
            'RATE_LIMIT',
            status
          )
        default:
          throw new StudentError(errorMessage, 'REQUEST_ERROR', status)
      }
    }
    throw new StudentError(defaultMessage, 'UNEXPECTED_ERROR')
  }
}

export default StudentService
