// admin/lib/api/turmas.ts
import { getAuthToken } from '@/lib/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/eduling'

export interface Professor {
  id: string
  usuario: {
    id: string
    nome: string
    email: string
  }
  principal: boolean
}

export interface Turma {
  id: string
  nome: string
  codigo: string
  descricao?: string
  ativa: boolean
  dataCriacao: string
  dataAtualizacao: string
  professores?: Professor[]
  _count?: {
    alunos: number
    simulados: number
    materiais: number
  }
}

export interface CreateTurmaData {
  nome: string
  descricao?: string
}

export interface UpdateTurmaData {
  nome?: string
  descricao?: string
  ativa?: boolean
}

export interface Aluno {
  id: string
  usuario: {
    id: string
    nome: string
    email: string
  }
  matricula: string
  dataIngresso: string
  _count?: {
    simulados: number
    respostas: number
  }
}

export interface TurmaStats {
  totalAlunos: number
  totalSimulados: number
  totalMateriais: number
  participacaoMedia: number
  taxaConclusao: number
  mediaGeral: number
  alunosAtivos: number
  simuladosCompletos: number
  materiaisRecentes: number
}

class TurmaService {
  private async getHeaders() {
    const token = getAuthToken()
    
    if (!token) {
      console.warn('⚠️ Token não encontrado! Usuário pode não estar autenticado.')
    } else {
      console.log('✅ Token encontrado:', token.substring(0, 20) + '...')
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  // Listar todas as turmas do professor
  async getTurmas(): Promise<Turma[]> {
    try {
      const headers = await this.getHeaders()
      const url = `${API_BASE_URL}/professor/turmas`
      
      console.log('🔍 Buscando turmas em:', url)
      console.log('📋 Headers:', headers)
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })

      console.log('📊 Status da resposta:', response.status, response.statusText)

      // Log detalhado do erro
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url
        })
        
        // Tentar fazer parse do erro se for JSON
        let errorMessage = `Erro ao buscar turmas: ${response.status} ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          // Não é JSON, usar texto simples
        }
        
        // Mensagens específicas por código de erro
        if (response.status === 401) {
          throw new Error('Não autorizado. Por favor, faça login novamente.')
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Você precisa ter permissão de professor.')
        } else if (response.status === 404) {
          throw new Error('Endpoint não encontrado. Verifique se o backend está rodando.')
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ Dados recebidos:', data)
      
      return data.data || []
    } catch (error) {
      console.error('❌ Erro ao buscar turmas:', error)
      
      // Se for erro de rede
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Erro de conexão. Verifique se o servidor backend está rodando em http://localhost:3000')
      }
      
      throw error
    }
  }

  // Criar nova turma
  async createTurma(turmaData: CreateTurmaData): Promise<Turma> {
    try {
      const headers = await this.getHeaders()
      const url = `${API_BASE_URL}/professor/turmas`
      
      console.log('🔍 Criando turma em:', url)
      console.log('📋 Dados:', turmaData)
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(turmaData)
      })

      console.log('📊 Status da resposta:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na criação:', errorText)
        
        let errorMessage = 'Erro ao criar turma'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          // Não é JSON
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ Turma criada:', data)
      
      return data.data
    } catch (error) {
      console.error('❌ Erro ao criar turma:', error)
      throw error
    }
  }

  // Atualizar turma
  async updateTurma(turmaId: string, turmaData: UpdateTurmaData): Promise<Turma> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/professor/turmas/${turmaId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(turmaData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar turma')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Erro ao atualizar turma:', error)
      throw error
    }
  }

  // Excluir turma
  async deleteTurma(turmaId: string): Promise<void> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/professor/turmas/${turmaId}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao excluir turma')
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
      throw error
    }
  }

  // Arquivar/Desarquivar turma
  async toggleTurmaStatus(turmaId: string, ativa: boolean): Promise<Turma> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/professor/turmas/${turmaId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ativa })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao alterar status da turma')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      throw error
    }
  }

  // Listar alunos de uma turma
  async getAlunosTurma(turmaId: string, page = 1, limit = 20, search?: string): Promise<{
    data: Aluno[]
    pagination: {
      total: number
      pages: number
      currentPage: number
      perPage: number
    }
  }> {
    try {
      const headers = await this.getHeaders()
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (search) params.append('search', search)

      const response = await fetch(
        `${API_BASE_URL}/professor/turmas/${turmaId}/alunos?${params.toString()}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar alunos')
      }

      const data = await response.json()
      return {
        data: data.data || [],
        pagination: data.pagination || {
          total: 0,
          pages: 0,
          currentPage: 1,
          perPage: limit
        }
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
      throw error
    }
  }

  // Remover aluno da turma
  async removeAluno(turmaId: string, alunoId: string): Promise<void> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(
        `${API_BASE_URL}/professor/turmas/${turmaId}/alunos/${alunoId}`,
        {
          method: 'DELETE',
          headers
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao remover aluno')
      }
    } catch (error) {
      console.error('Erro ao remover aluno:', error)
      throw error
    }
  }

  // Obter estatísticas da turma
  async getTurmaStats(turmaId: string): Promise<TurmaStats> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(
        `${API_BASE_URL}/professor/turmas/${turmaId}/estatisticas`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      // Retornar estatísticas vazias como fallback
      return {
        totalAlunos: 0,
        totalSimulados: 0,
        totalMateriais: 0,
        participacaoMedia: 0,
        taxaConclusao: 0,
        mediaGeral: 0,
        alunosAtivos: 0,
        simuladosCompletos: 0,
        materiaisRecentes: 0
      }
    }
  }

  // Adicionar outro professor à turma
  async addProfessor(turmaId: string, email: string): Promise<Professor> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(
        `${API_BASE_URL}/professor/turmas/${turmaId}/professores`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ email })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao adicionar professor')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Erro ao adicionar professor:', error)
      throw error
    }
  }

  // Remover professor da turma
  async removeProfessor(turmaId: string, professorId: string): Promise<void> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(
        `${API_BASE_URL}/professor/turmas/${turmaId}/professores/${professorId}`,
        {
          method: 'DELETE',
          headers
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao remover professor')
      }
    } catch (error) {
      console.error('Erro ao remover professor:', error)
      throw error
    }
  }

  // Gerar relatório da turma
  async generateReport(turmaId: string, formato: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(
        `${API_BASE_URL}/professor/turmas/${turmaId}/relatorio?formato=${formato}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório')
      }

      return await response.blob()
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      throw error
    }
  }
}

// Criar uma versão MOCK do serviço para testes sem backend
class MockTurmaService extends TurmaService {
  private mockTurmas: Turma[] = [
    {
      id: '1',
      nome: 'Engenharia de Software - 2024.2',
      codigo: 'ENG2024',
      descricao: 'Disciplina focada em metodologias ágeis e desenvolvimento de software',
      ativa: true,
      dataCriacao: '2024-01-15T10:00:00',
      dataAtualizacao: '2024-01-15T10:00:00',
      _count: {
        alunos: 32,
        simulados: 2,
        materiais: 15
      }
    },
    {
      id: '2',
      nome: 'Algoritmos e Estrutura de Dados',
      codigo: 'AED2024',
      descricao: 'Fundamentos de algoritmos, estruturas de dados e complexidade',
      ativa: true,
      dataCriacao: '2024-01-15T10:00:00',
      dataAtualizacao: '2024-01-15T10:00:00',
      _count: {
        alunos: 27,
        simulados: 3,
        materiais: 8
      }
    }
  ]

  async getTurmas(): Promise<Turma[]> {
    console.log('🎭 Usando dados MOCK de turmas')
    return Promise.resolve(this.mockTurmas)
  }

  async createTurma(turmaData: CreateTurmaData): Promise<Turma> {
    const novaTurma: Turma = {
      id: String(Date.now()),
      nome: turmaData.nome,
      descricao: turmaData.descricao,
      codigo: 'MOCK' + Date.now().toString().slice(-4),
      ativa: true,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      _count: {
        alunos: 0,
        simulados: 0,
        materiais: 0
      }
    }
    
    this.mockTurmas.push(novaTurma)
    return Promise.resolve(novaTurma)
  }

  async updateTurma(turmaId: string, turmaData: UpdateTurmaData): Promise<Turma> {
    const index = this.mockTurmas.findIndex(t => t.id === turmaId)
    if (index !== -1) {
      this.mockTurmas[index] = {
        ...this.mockTurmas[index],
        ...turmaData,
        dataAtualizacao: new Date().toISOString()
      }
      return Promise.resolve(this.mockTurmas[index])
    }
    throw new Error('Turma não encontrada')
  }

  async deleteTurma(turmaId: string): Promise<void> {
    this.mockTurmas = this.mockTurmas.filter(t => t.id !== turmaId)
    return Promise.resolve()
  }
}

// Detectar se deve usar mock ou API real
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

// Exportar o serviço apropriado
export const turmaService = USE_MOCK ? new MockTurmaService() : new TurmaService()

// Exportar também a versão específica se necessário
export const mockTurmaService = new MockTurmaService()
export const apiTurmaService = new TurmaService()