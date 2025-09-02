// admin/lib/utils/admin-utils.ts

import { format, formatDistanceToNow, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Re-export the general cn utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== DATE & TIME UTILITIES ====================

export const dateUtils = {
  /**
   * Formata uma data para exibição amigável
   */
  formatDate: (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (!isValid(dateObj)) return 'Data inválida'
      return format(dateObj, formatStr, { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  },

  /**
   * Formata data e hora para exibição
   */
  formatDateTime: (date: string | Date): string => {
    return dateUtils.formatDate(date, 'dd/MM/yyyy HH:mm')
  },

  /**
   * Retorna tempo relativo (ex: "há 2 horas")
   */
  timeAgo: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (!isValid(dateObj)) return 'Data inválida'
      return formatDistanceToNow(dateObj, { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data inválida'
    }
  },

  /**
   * Verifica se uma data está dentro de um período específico
   */
  isWithinPeriod: (
    date: string | Date, 
    period: 'today' | 'week' | 'month' | 'year'
  ): boolean => {
    const now = new Date()
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (!isValid(dateObj)) return false
    
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
    
    switch (period) {
      case 'today':
        return diffInDays < 1
      case 'week':
        return diffInDays < 7
      case 'month':
        return diffInDays < 30
      case 'year':
        return diffInDays < 365
      default:
        return false
    }
  }
}

// ==================== NUMBER & STATISTICS UTILITIES ====================

export const numberUtils = {
  /**
   * Formata números para exibição (com separadores de milhares)
   */
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num)
  },

  /**
   * Formata percentuais
   */
  formatPercentage: (num: number, decimals: number = 1): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }).format(num / 100)
  },

  /**
   * Calcula crescimento percentual
   */
  calculateGrowth: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  },

  /**
   * Formata crescimento com sinal
   */
  formatGrowth: (growth: number, decimals: number = 1): string => {
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(decimals)}%`
  },

  /**
   * Abrevia números grandes (1.2K, 1.2M, etc.)
   */
  abbreviateNumber: (num: number): string => {
    if (num < 1000) return num.toString()
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'
    return (num / 1000000000).toFixed(1) + 'B'
  },

  /**
   * Calcula média
   */
  average: (numbers: number[]): number => {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  },

  /**
   * Encontra mediana
   */
  median: (numbers: number[]): number => {
    if (numbers.length === 0) return 0
    const sorted = [...numbers].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle]
  }
}

// ==================== STRING UTILITIES ====================

export const stringUtils = {
  /**
   * Trunca texto com reticências
   */
  truncate: (text: string, length: number): string => {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
  },

  /**
   * Capitaliza primeira letra
   */
  capitalize: (text: string): string => {
    if (!text) return text
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  /**
   * Converte para slug (URL friendly)
   */
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
  },

  /**
   * Remove tags HTML
   */
  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '')
  },

  /**
   * Converte quebras de linha em HTML
   */
  nl2br: (text: string): string => {
    return text.replace(/\r?\n/g, '<br />')
  },

  /**
   * Gera string aleatória
   */
  randomString: (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

// ==================== COLOR UTILITIES ====================

export const colorUtils = {
  /**
   * Gera cor baseada no hash de uma string
   */
  stringToColor: (str: string): string => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const hue = hash % 360
    return `hsl(${hue}, 70%, 50%)`
  },

  /**
   * Retorna cor para status
   */
  getStatusColor: (status: string): string => {
    const statusColors: Record<string, string> = {
      active: 'green',
      inactive: 'gray',
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
      success: 'green',
      error: 'red',
      warning: 'yellow',
      info: 'blue'
    }
    
    return statusColors[status.toLowerCase()] || 'gray'
  },

  /**
   * Retorna variante do Badge baseada no status
   */
  getStatusVariant: (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      pending: 'outline',
      approved: 'default',
      rejected: 'destructive',
      success: 'default',
      error: 'destructive',
      warning: 'outline'
    }
    
    return statusVariants[status.toLowerCase()] || 'secondary'
  }
}

// ==================== FILE UTILITIES ====================

export const fileUtils = {
  /**
   * Formata tamanho de arquivo
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  },

  /**
   * Obtém extensão do arquivo
   */
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  },

  /**
   * Verifica se o arquivo é uma imagem
   */
  isImage: (filename: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    return imageExtensions.includes(fileUtils.getFileExtension(filename))
  },

  /**
   * Gera nome de arquivo único
   */
  generateUniqueFilename: (originalFilename: string): string => {
    const ext = fileUtils.getFileExtension(originalFilename)
    const timestamp = Date.now()
    const random = stringUtils.randomString(4)
    return `${timestamp}_${random}.${ext}`
  }
}

// ==================== VALIDATION UTILITIES ====================

export const validationUtils = {
  /**
   * Valida email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Valida URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Valida senha forte
   */
  isStrongPassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Deve ter pelo menos 8 caracteres')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Deve conter pelo menos uma letra minúscula')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Deve conter pelo menos uma letra maiúscula')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Deve conter pelo menos um número')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Deve conter pelo menos um caractere especial')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * Valida CPF (brasileiro)
   */
  isValidCPF: (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '')
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false
    }
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cpf.charAt(10))) return false
    
    return true
  }
}

// ==================== ARRAY UTILITIES ====================

export const arrayUtils = {
  /**
   * Remove duplicatas de array
   */
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)]
  },

  /**
   * Agrupa array por propriedade
   */
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  /**
   * Ordena array por propriedade
   */
  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  },

  /**
   * Pagina array
   */
  paginate: <T>(array: T[], page: number, limit: number): T[] => {
    const startIndex = (page - 1) * limit
    return array.slice(startIndex, startIndex + limit)
  },

  /**
   * Embaralha array
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

// ==================== LOCAL STORAGE UTILITIES ====================

export const storageUtils = {
  /**
   * Salva no localStorage com tratamento de erro
   */
  setItem: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  /**
   * Lê do localStorage com valor padrão
   */
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined') return defaultValue
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  /**
   * Remove do localStorage
   */
  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  /**
   * Limpa localStorage com prefixo
   */
  clearByPrefix: (prefix: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix))
      keys.forEach(key => localStorage.removeItem(key))
      return true
    } catch {
      return false
    }
  }
}

// ==================== EXPORT UTILITIES ====================

export const exportUtils = {
  /**
   * Exporta dados como CSV
   */
  exportToCSV: (data: any[], filename: string): void => {
    if (data.length === 0) return
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        }).join(',')
      )
    ].join('\n')
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  /**
   * Exporta dados como JSON
   */
  exportToJSON: (data: any, filename: string): void => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// ==================== DEBOUNCE & THROTTLE ====================

export const performanceUtils = {
  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}