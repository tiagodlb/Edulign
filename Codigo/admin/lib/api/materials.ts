// admin/lib/api/materials.ts
import { getAuthToken } from '@/lib/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/eduling'

export interface Material {
  id: string
  titulo: string
  descricao?: string
  tipo: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENTO'
  url?: string
  arquivo?: string
  tamanho?: string
  turmaId: string
  dataCriacao: string
  dataAtualizacao: string
}

export interface MaterialUploadData {
  titulo: string
  descricao?: string
  tipo: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENTO'
  url?: string
  arquivo?: File
  tags?: string[]
  categoria?: string
}

export interface Turma {
  id: string
  nome: string
  codigo: string
  descricao?: string
  ativa: boolean
  dataCriacao: string
  _count?: {
    alunos: number
    simulados: number
    materiais: number
  }
}

class MaterialService {
  private async getHeaders(includeContentType = true) {
    const token = getAuthToken()
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json'
    }
    
    return headers
  }

  // Listar todas as turmas do professor
  async getTurmas(): Promise<Turma[]> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/professor/turmas`, {
        headers
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar turmas')
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
      throw error
    }
  }

  // Listar materiais de uma turma
  async getMaterials(turmaId: string, tipo?: string): Promise<Material[]> {
    try {
      const headers = await this.getHeaders()
      const params = new URLSearchParams()
      
      if (tipo && tipo !== 'all') {
        params.append('tipo', tipo.toUpperCase())
      }

      const url = `${API_BASE_URL}/professor/turmas/${turmaId}/materiais${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url, {
        headers
      })

      if (!response.ok) {
        throw new Error('Erro ao buscar materiais')
      }

      const data = await response.json()
      return data.data?.data || data.data || []
    } catch (error) {
      console.error('Erro ao buscar materiais:', error)
      throw error
    }
  }

  // Adicionar material a uma turma
  async uploadMaterial(turmaId: string, materialData: MaterialUploadData): Promise<Material> {
    try {
      if (materialData.arquivo) {
        // Se houver arquivo, usar FormData
        const formData = new FormData()
        formData.append('titulo', materialData.titulo)
        formData.append('tipo', materialData.tipo)
        
        if (materialData.descricao) {
          formData.append('descricao', materialData.descricao)
        }
        
        if (materialData.arquivo) {
          formData.append('arquivo', materialData.arquivo)
        }
        
        if (materialData.tags) {
          formData.append('tags', JSON.stringify(materialData.tags))
        }
        
        if (materialData.categoria) {
          formData.append('categoria', materialData.categoria)
        }

        const token = await getAuthToken()
        const response = await fetch(`${API_BASE_URL}/professor/turmas/${turmaId}/materiais`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Não incluir Content-Type para FormData
          },
          body: formData
        })

        if (!response.ok) {
          throw new Error('Erro ao fazer upload do material')
        }

        const data = await response.json()
        return data.data
      } else {
        // Se for apenas link, enviar como JSON
        const headers = await this.getHeaders()
        const response = await fetch(`${API_BASE_URL}/professor/turmas/${turmaId}/materiais`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            titulo: materialData.titulo,
            descricao: materialData.descricao,
            tipo: materialData.tipo,
            url: materialData.url
          })
        })

        if (!response.ok) {
          throw new Error('Erro ao adicionar material')
        }

        const data = await response.json()
        return data.data
      }
    } catch (error) {
      console.error('Erro ao adicionar material:', error)
      throw error
    }
  }

  // Remover material
  async deleteMaterial(turmaId: string, materialId: string): Promise<void> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/professor/turmas/${turmaId}/materiais/${materialId}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        throw new Error('Erro ao remover material')
      }
    } catch (error) {
      console.error('Erro ao remover material:', error)
      throw error
    }
  }

  // Download de material
  async downloadMaterial(materialId: string, filename: string): Promise<void> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/materials/${materialId}/download`, {
        headers
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer download do material')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao fazer download:', error)
      throw error
    }
  }

  // Visualizar material
  async viewMaterial(materialId: string): Promise<string> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${API_BASE_URL}/materials/${materialId}/view`, {
        headers
      })

      if (!response.ok) {
        throw new Error('Erro ao visualizar material')
      }

      const data = await response.json()
      return data.url || data.data
    } catch (error) {
      console.error('Erro ao visualizar material:', error)
      throw error
    }
  }
}

export const materialService = new MaterialService()