// services/reportService.ts

import api from '@/lib/api'

export interface SubjectReportParams {
  area?: string
  subject?: string
  period?: string
  difficulty?: string
  turmaId?: string
}

export interface SubjectReportData {
  id: string
  subject: string
  area: string
  totalQuestions: number
  averageScore: number
  totalAttempts: number
  successRate: number
  averageTime: number
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  topicBreakdown: {
    topic: string
    questions: number
    correctAnswers: number
    percentage: number
  }[]
  performanceByPeriod: {
    period: string
    score: number
    attempts: number
  }[]
  commonErrors: {
    type: string
    frequency: number
    description: string
  }[]
  studentPerformance?: {
    studentId: string
    studentName: string
    score: number
    attempts: number
    lastAttempt: string
  }[]
}

export interface AreaSummaryData {
  area: string
  totalSubjects: number
  averageScore: number
  totalStudents: number
  totalQuestions: number
  completionRate: number
  strongestTopics: string[]
  weakestTopics: string[]
}

export interface SubjectComparisonData {
  subjects: {
    name: string
    metrics: {
      score: number
      time: number
      attempts: number
      difficulty: number
    }
  }[]
}

class ReportService {
  // Buscar relatórios por assunto
  async getSubjectReports(params: SubjectReportParams): Promise<SubjectReportData[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.area && params.area !== 'all') {
        queryParams.append('area', params.area)
      }
      if (params.subject && params.subject !== 'all') {
        queryParams.append('subject', params.subject)
      }
      if (params.period) {
        queryParams.append('period', params.period)
      }
      if (params.difficulty && params.difficulty !== 'all') {
        queryParams.append('difficulty', params.difficulty)
      }
      if (params.turmaId) {
        queryParams.append('turmaId', params.turmaId)
      }

      const response = await api.get(`/admin/reports/subjects?${queryParams.toString()}`)
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar relatórios por assunto:', error)
      throw error
    }
  }

  // Buscar resumo por área
  async getAreaSummaries(): Promise<AreaSummaryData[]> {
    try {
      const response = await api.get('/admin/reports/areas/summary')
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar resumo por área:', error)
      throw error
    }
  }

  // Buscar dados de comparação entre assuntos
  async getSubjectComparison(subjectIds: string[]): Promise<SubjectComparisonData> {
    try {
      const response = await api.post('/admin/reports/subjects/compare', {
        subjectIds
      })
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar comparação de assuntos:', error)
      throw error
    }
  }

  // Exportar relatório de assunto
  async exportSubjectReport(
    format: 'pdf' | 'excel',
    params: SubjectReportParams
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.area && params.area !== 'all') {
        queryParams.append('area', params.area)
      }
      if (params.subject && params.subject !== 'all') {
        queryParams.append('subject', params.subject)
      }
      if (params.period) {
        queryParams.append('period', params.period)
      }

      const response = await api.get(
        `/admin/reports/subjects/export/${format}?${queryParams.toString()}`,
        {
          responseType: 'blob'
        }
      )

      return response.data
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      throw error
    }
  }

  // Buscar estatísticas detalhadas de um assunto específico
  async getSubjectDetails(subjectId: string): Promise<any> {
    try {
      const response = await api.get(`/admin/reports/subjects/${subjectId}/details`)
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar detalhes do assunto:', error)
      throw error
    }
  }

  // Buscar questões mais difíceis por assunto
  async getDifficultQuestions(subjectId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await api.get(
        `/admin/reports/subjects/${subjectId}/difficult-questions?limit=${limit}`
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar questões difíceis:', error)
      throw error
    }
  }

  // Buscar recomendações de melhoria
  async getImprovementRecommendations(subjectId: string): Promise<any> {
    try {
      const response = await api.get(
        `/admin/reports/subjects/${subjectId}/recommendations`
      )
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error)
      throw error
    }
  }
}

export default new ReportService()