import axios from 'axios'
import { AuthService } from './auth'
import { AreaAvaliacao } from '@/types'

// Interfaces
interface Alternativa {
  id: string
  texto: string
  correta: boolean
  justificativa: string
  questaoId: string
}

interface Questao {
  id: string
  enunciado: string
  comando: string
  area: string
  tipo: string
  nivel: string
  alternativas: Alternativa[]
  suportes: Array<{
    id: string
    tipo: string
    conteudo: string
  }>
  topicos: string[]
  competencias: string[]
  referencias: string[]
  dataCriacao: string
}

interface Simulado {
  id: string
  titulo: string
  tipo: 'NORMAL' | 'ENADE_AI'
  area: string
  tempoLimite: number
  qtdQuestoes: number
  dataInicio: string
  dataFim: string | null
  finalizado: boolean
  questoes: Questao[]
  respostas: Array<{
    id: string
    alunoId: string
    questaoId: string
    alternativaId: string
    correta: boolean
    dataResposta: string
    tempoResposta: number
    simuladoId: string
  }>
}

interface CreateSimuladoParams {
  knowledgeArea: AreaAvaliacao
  numberOfQuestions: number
}

interface CreateAiSimuladoParams {
  area: AreaAvaliacao
  subjects: string[]
  numberOfQuestions: number
}

interface SimuladoUpdateParams {
  answers: Array<{
    questionId: string
    selectedAnswer: string
    timeSpent: number
  }>
  completed: boolean
}

// API Response Types
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
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
      const response = await this.api.get<ApiResponse<Questao[]>>('/student/simulated-exams', {
        params: { year, knowledgeArea: area }
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao listar provas')
      }

      return response.data
    } catch (error) {
      this.handleError(error, 'Erro ao listar provas ENADE')
    }
  }

  // Search Questions
  static async searchQuestions(query: string) {
    try {
      const response = await this.api.post<ApiResponse<Questao[]>>('/student/questions/search', {
        query
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar questões')
      }

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new StudentError('Termo de busca não fornecido', 'INVALID_QUERY', 400)
      }
      this.handleError(error, 'Erro ao buscar questões')
    }
  }

  // Create Regular Simulated Exam
  static async createSimulado(params: CreateSimuladoParams) {
    try {
      const response = await this.api.post<ApiResponse<Simulado>>(
        '/student/simulated-exams',
        params
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao criar simulado')
      }

      return response.data
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

  // Create AI ENADE Simulated Exam
  static async createAiSimulado(params: CreateAiSimuladoParams) {
    try {
      const response = await this.api.post<ApiResponse<Simulado>>(
        '/student/simulated-exams/ai-enade',
        params
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao criar simulado ENADE')
      }

      return response.data
    } catch (error) {
      this.handleError(error, 'Erro ao criar simulado ENADE')
    }
  }

  // Get All Simulados
  static async getSimulados() {
    try {
      const response = await this.api.get<ApiResponse<Simulado[]>>('/student/simulated-exams')

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar simulados')
      }

      return response.data
    } catch (error) {
      this.handleError(error, 'Erro ao buscar simulados')
    }
  }

  // Get Specific Simulado
  static async getSimuladoById(id: string) {
    try {
      const response = await this.api.get<ApiResponse<Simulado>>(`/student/simulated-exam/${id}`)
      console.log('/student/simulated-exam/${id}')
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

  // Update Simulado
  static async updateSimulado(id: string, data: SimuladoUpdateParams) {
    try {
      const response = await this.api.put(`/student/simulated-exams/${id}`, data)
      return response.data
    } catch (error) {
      this.handleError(error, 'Erro ao atualizar simulado')
    }
  }

  // Get Question Explanation
  static async getQuestionExplanation(id: string) {
    try {
      const response = await this.api.get<
        ApiResponse<{
          explanation: string
          questionId: string
          generatedAt: string
        }>
      >(`/student/questions/${id}/explanation`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar explicação')
      }

      return response.data
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
      const response = await this.api.get<
        ApiResponse<{
          totalSimulados: number
          totalQuestoes: number
          questoesCorretas: number
          mediaGeral: number
          porArea: Record<
            string,
            {
              total: number
              corretas: number
              percentual: number
            }
          >
        }>
      >('/student/statistics')

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao buscar estatísticas')
      }

      return response.data
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
