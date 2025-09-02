// admin/lib/api/question-upload.ts
import { getAuthToken } from '@/lib/auth'
import { adminService } from './admin'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4333/eduling'

// ==================== INTERFACES ====================

export interface QuestionUploadData {
  enunciado: string
  comando?: string
  alternativas: string[]
  respostaCorreta: number
  area: string
  ano: number
  tipo?: 'ENADE' | 'CUSTOM'
  nivel?: 'FACIL' | 'MEDIO' | 'DIFICIL'
  observacoes?: string
}

export interface UploadResult {
  success: boolean
  total: number
  created: number
  errors: Array<{
    row: number
    error: string
    data?: any
  }>
}

export interface ImportTemplate {
  headers: string[]
  example: Record<string, any>
  rules: string[]
}

// ==================== QUESTION UPLOAD SERVICE ====================

class QuestionUploadService {
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

  // ==================== TEMPLATE E VALIDAÇÃO ====================

  /**
   * Retorna o template para importação de questões
   */
  getImportTemplate(): ImportTemplate {
    return {
      headers: [
        'enunciado',
        'comando',
        'alternativa_a',
        'alternativa_b',
        'alternativa_c',
        'alternativa_d',
        'alternativa_e',
        'resposta_correta',
        'area',
        'ano',
        'tipo',
        'nivel',
        'observacoes'
      ],
      example: {
        enunciado: 'Qual é a capital do Brasil?',
        comando: 'Assinale a alternativa correta:',
        alternativa_a: 'São Paulo',
        alternativa_b: 'Rio de Janeiro',
        alternativa_c: 'Brasília',
        alternativa_d: 'Salvador',
        alternativa_e: 'Belo Horizonte',
        resposta_correta: 'C',
        area: 'Geografia',
        ano: 2024,
        tipo: 'CUSTOM',
        nivel: 'FACIL',
        observacoes: 'Questão básica sobre capitais'
      },
      rules: [
        'Enunciado é obrigatório',
        'Pelo menos 2 alternativas são obrigatórias',
        'Resposta correta deve ser A, B, C, D ou E',
        'Área é obrigatória',
        'Ano deve ser um número válido',
        'Tipo pode ser: ENADE ou CUSTOM (padrão)',
        'Nível pode ser: FACIL, MEDIO ou DIFICIL (padrão: MEDIO)',
        'Alternativas vazias serão ignoradas'
      ]
    }
  }

  /**
   * Gera e baixa um arquivo CSV template
   */
  downloadTemplate(): void {
    const template = this.getImportTemplate()
    const csvContent = this.generateCSVTemplate(template)
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'template-questoes.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  private generateCSVTemplate(template: ImportTemplate): string {
    const headers = template.headers.join(',')
    const example = template.headers.map(header => {
      const value = template.example[header] || ''
      return `"${value}"`
    }).join(',')
    
    return `${headers}\n${example}`
  }

  // ==================== VALIDAÇÃO ====================

  /**
   * Valida os dados de uma questão antes do upload
   */
  validateQuestionData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validar enunciado
    if (!data.enunciado || data.enunciado.trim() === '') {
      errors.push('Enunciado é obrigatório')
    }

    // Validar alternativas
    const alternativas = this.extractAlternatives(data)
    if (alternativas.length < 2) {
      errors.push('Pelo menos 2 alternativas são obrigatórias')
    }

    // Validar resposta correta
    const respostaCorreta = this.parseRespostaCorreta(data.resposta_correta)
    if (respostaCorreta === -1 || respostaCorreta >= alternativas.length) {
      errors.push('Resposta correta inválida')
    }

    // Validar área
    if (!data.area || data.area.trim() === '') {
      errors.push('Área é obrigatória')
    }

    // Validar ano
    const ano = parseInt(data.ano)
    if (isNaN(ano) || ano < 2000 || ano > new Date().getFullYear() + 10) {
      errors.push('Ano deve ser um número válido entre 2000 e ' + (new Date().getFullYear() + 10))
    }

    // Validar tipo (opcional)
    if (data.tipo && !['ENADE', 'CUSTOM'].includes(data.tipo.toUpperCase())) {
      errors.push('Tipo deve ser ENADE ou CUSTOM')
    }

    // Validar nível (opcional)
    if (data.nivel && !['FACIL', 'MEDIO', 'DIFICIL'].includes(data.nivel.toUpperCase())) {
      errors.push('Nível deve ser FACIL, MEDIO ou DIFICIL')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private extractAlternatives(data: any): string[] {
    const alternativas: string[] = []
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    
    for (const letter of letters) {
      const alt = data[`alternativa_${letter}`]
      if (alt && alt.trim() !== '') {
        alternativas.push(alt.trim())
      }
    }
    
    return alternativas
  }

  private parseRespostaCorreta(resposta: any): number {
    if (typeof resposta === 'number') return resposta
    
    const str = String(resposta).toUpperCase().trim()
    const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9 }
    
    return letterToIndex[str] !== undefined ? letterToIndex[str] : -1
  }

  // ==================== UPLOAD E PROCESSAMENTO ====================

  /**
   * Processa arquivo CSV e converte para array de questões
   */
  async parseCSVFile(file: File): Promise<QuestionUploadData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string
          const questions = this.parseCSVContent(csv)
          resolve(questions)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file, 'utf-8')
    })
  }

  private parseCSVContent(csv: string): QuestionUploadData[] {
    const lines = csv.split('\n').filter(line => line.trim() !== '')
    if (lines.length < 2) throw new Error('Arquivo CSV deve conter pelo menos o cabeçalho e uma linha de dados')
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const questions: QuestionUploadData[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      const rowData = this.createRowObject(headers, values)
      
      const question = this.convertRowToQuestion(rowData)
      if (question) {
        questions.push(question)
      }
    }
    
    return questions
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
        inQuotes = false
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  private createRowObject(headers: string[], values: string[]): any {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    return obj
  }

  private convertRowToQuestion(data: any): QuestionUploadData | null {
    try {
      const alternativas = this.extractAlternatives(data)
      const respostaCorreta = this.parseRespostaCorreta(data.resposta_correta)
      
      if (alternativas.length === 0 || respostaCorreta === -1) {
        return null
      }
      
      return {
        enunciado: data.enunciado?.trim() || '',
        comando: data.comando?.trim() || '',
        alternativas,
        respostaCorreta,
        area: data.area?.trim() || '',
        ano: parseInt(data.ano) || new Date().getFullYear(),
        tipo: (data.tipo?.toUpperCase() === 'ENADE' ? 'ENADE' : 'CUSTOM') as 'ENADE' | 'CUSTOM',
        nivel: (data.nivel?.toUpperCase() || 'MEDIO') as 'FACIL' | 'MEDIO' | 'DIFICIL',
        observacoes: data.observacoes?.trim() || ''
      }
    } catch (error) {
      return null
    }
  }

  // ==================== UPLOAD PARA API ====================

  /**
   * Faz upload de questões em lote
   */
  async uploadQuestions(questions: QuestionUploadData[], batchSize: number = 10): Promise<UploadResult> {
    const result: UploadResult = {
      success: true,
      total: questions.length,
      created: 0,
      errors: []
    }

    // Processar em lotes para não sobrecarregar a API
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize)
      
      for (let j = 0; j < batch.length; j++) {
        const question = batch[j]
        const rowIndex = i + j + 1
        
        try {
          // Validar antes de enviar
          const validation = this.validateQuestionData(question)
          if (!validation.valid) {
            result.errors.push({
              row: rowIndex,
              error: validation.errors.join(', '),
              data: question
            })
            continue
          }

          // Enviar para API
          await adminService.createQuestion(question)
          result.created++
          
        } catch (error: any) {
          result.errors.push({
            row: rowIndex,
            error: error.message || 'Erro desconhecido',
            data: question
          })
        }
      }
      
      // Pequena pausa entre lotes para não sobrecarregar
      if (i + batchSize < questions.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    result.success = result.errors.length === 0
    return result
  }

  // ==================== EXPORT DE QUESTÕES ====================

  /**
   * Exporta questões para CSV
   */
  async exportQuestions(filters?: any): Promise<void> {
    try {
      // Buscar todas as questões (sem paginação para export)
      const response = await adminService.getQuestions({
        ...filters,
        limit: 10000 // Limite alto para pegar todas
      })

      if (response.data.length === 0) {
        throw new Error('Nenhuma questão encontrada para exportar')
      }

      const csvContent = this.convertQuestionsToCSV(response.data)
      this.downloadCSV(csvContent, 'questoes-exportadas.csv')
      
    } catch (error) {
      console.error('Erro ao exportar questões:', error)
      throw error
    }
  }

  private convertQuestionsToCSV(questions: any[]): string {
    const template = this.getImportTemplate()
    const headers = template.headers.join(',')
    
    const rows = questions.map(q => {
      const row = [
        `"${q.enunciado || ''}"`,
        `"${q.comando || ''}"`,
        `"${q.alternativas[0]?.texto || ''}"`,
        `"${q.alternativas[1]?.texto || ''}"`,
        `"${q.alternativas[2]?.texto || ''}"`,
        `"${q.alternativas[3]?.texto || ''}"`,
        `"${q.alternativas[4]?.texto || ''}"`,
        String.fromCharCode(65 + q.respostaCorreta), // A, B, C, D, E
        `"${q.area || ''}"`,
        q.ano || '',
        q.tipo || 'CUSTOM',
        q.nivel || 'MEDIO',
        `"${q.observacoes || ''}"`
      ]
      return row.join(',')
    })
    
    return [headers, ...rows].join('\n')
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob(['\uFEFF' + content], { 
      type: 'text/csv;charset=utf-8;' 
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ==================== UTILS ====================

  /**
   * Formata resultado do upload para exibição
   */
  formatUploadResult(result: UploadResult): {
    summary: string
    details: string[]
  } {
    const summary = result.success
      ? `✅ Upload concluído com sucesso! ${result.created}/${result.total} questões criadas.`
      : `⚠️ Upload concluído com erros. ${result.created}/${result.total} questões criadas.`

    const details: string[] = []
    
    if (result.errors.length > 0) {
      details.push(`\n❌ Erros encontrados (${result.errors.length}):`)
      result.errors.forEach(error => {
        details.push(`• Linha ${error.row}: ${error.error}`)
      })
    }

    return { summary, details }
  }
}

// ==================== EXPORT ====================

export const questionUploadService = new QuestionUploadService()
export default questionUploadService