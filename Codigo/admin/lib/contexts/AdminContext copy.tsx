// 'use client'

// import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
// import { adminService, type User, type Question, type AIResponse, type SystemStats } from '@/lib/api/admin'

// // ==================== TYPES ====================

// export interface AdminState {
//   // Users
//   users: {
//     data: User[]
//     loading: boolean
//     pagination: {
//       total: number
//       pages: number
//       currentPage: number
//       perPage: number
//     }
//     filters: {
//       search: string
//       role: string
//       status: string
//     }
//   }

//   // Questions
//   questions: {
//     data: Question[]
//     loading: boolean
//     pagination: {
//       total: number
//       pages: number
//       currentPage: number
//       perPage: number
//     }
//     filters: {
//       search: string
//       area: string
//       ano: string
//       type: string
//     }
//   }

//   // AI Responses
//   aiResponses: {
//     data: AIResponse[]
//     loading: boolean
//     pagination: {
//       total: number
//       pages: number
//       currentPage: number
//       perPage: number
//     }
//     filters: {
//       type: string
//       priority: string
//     }
//   }

//   // Statistics
//   statistics: {
//     data: SystemStats | null
//     loading: boolean
//     lastUpdated: Date | null
//   }

//   // UI State
//   ui: {
//     sidebarOpen: boolean
//     currentView: 'dashboard' | 'users' | 'questions' | 'ai-responses' | 'statistics'
//     notifications: Array<{
//       id: string
//       type: 'success' | 'error' | 'warning' | 'info'
//       message: string
//       timestamp: Date
//     }>
//   }
// }

// type AdminAction =
//   // User actions
//   | { type: 'SET_USERS_LOADING'; payload: boolean }
//   | { type: 'SET_USERS_DATA'; payload: { data: User[]; pagination: any } }
//   | { type: 'SET_USERS_FILTERS'; payload: Partial<AdminState['users']['filters']> }
//   | { type: 'ADD_USER'; payload: User }
//   | { type: 'UPDATE_USER'; payload: { id: string; user: Partial<User> } }
//   | { type: 'REMOVE_USER'; payload: string }

//   // Question actions
//   | { type: 'SET_QUESTIONS_LOADING'; payload: boolean }
//   | { type: 'SET_QUESTIONS_DATA'; payload: { data: Question[]; pagination: any } }
//   | { type: 'SET_QUESTIONS_FILTERS'; payload: Partial<AdminState['questions']['filters']> }
//   | { type: 'ADD_QUESTION'; payload: Question }
//   | { type: 'UPDATE_QUESTION'; payload: { id: string; question: Partial<Question> } }
//   | { type: 'REMOVE_QUESTION'; payload: string }

//   // AI Response actions
//   | { type: 'SET_AI_RESPONSES_LOADING'; payload: boolean }
//   | { type: 'SET_AI_RESPONSES_DATA'; payload: { data: AIResponse[]; pagination: any } }
//   | { type: 'SET_AI_RESPONSES_FILTERS'; payload: Partial<AdminState['aiResponses']['filters']> }
//   | { type: 'UPDATE_AI_RESPONSE'; payload: { id: string; response: Partial<AIResponse> } }
//   | { type: 'REMOVE_AI_RESPONSE'; payload: string }

//   // Statistics actions
//   | { type: 'SET_STATISTICS_LOADING'; payload: boolean }
//   | { type: 'SET_STATISTICS_DATA'; payload: SystemStats }

//   // UI actions
//   | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
//   | { type: 'SET_CURRENT_VIEW'; payload: AdminState['ui']['currentView'] }
//   | { type: 'ADD_NOTIFICATION'; payload: { type: 'success' | 'error' | 'warning' | 'info'; message: string } }
//   | { type: 'REMOVE_NOTIFICATION'; payload: string }
//   | { type: 'CLEAR_NOTIFICATIONS' }

// // ==================== INITIAL STATE ====================

// const initialState: AdminState = {
//   users: {
//     data: [],
//     loading: false,
//     pagination: {
//       total: 0,
//       pages: 0,
//       currentPage: 1,
//       perPage: 10
//     },
//     filters: {
//       search: '',
//       role: '',
//       status: 'all'
//     }
//   },
//   questions: {
//     data: [],
//     loading: false,
//     pagination: {
//       total: 0,
//       pages: 0,
//       currentPage: 1,
//       perPage: 10
//     },
//     filters: {
//       search: '',
//       area: '',
//       ano: '',
//       type: 'all'
//     }
//   },
//   aiResponses: {
//     data: [],
//     loading: false,
//     pagination: {
//       total: 0,
//       pages: 0,
//       currentPage: 1,
//       perPage: 10
//     },
//     filters: {
//       type: 'all',
//       priority: 'all'
//     }
//   },
//   statistics: {
//     data: null,
//     loading: false,
//     lastUpdated: null
//   },
//   ui: {
//     sidebarOpen: false,
//     currentView: 'dashboard',
//     notifications: []
//   }
// }

// // ==================== REDUCER ====================

// function adminReducer(state: AdminState, action: AdminAction): AdminState {
//   switch (action.type) {
//     // User cases
//     case 'SET_USERS_LOADING':
//       return {
//         ...state,
//         users: { ...state.users, loading: action.payload }
//       }

//     case 'SET_USERS_DATA':
//       return {
//         ...state,
//         users: {
//           ...state.users,
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           loading: false
//         }
//       }

//     case 'SET_USERS_FILTERS':
//       return {
//         ...state,
//         users: {
//           ...state.users,
//           filters: { ...state.users.filters, ...action.payload },
//           pagination: { ...state.users.pagination, currentPage: 1 }
//         }
//       }

//     case 'ADD_USER':
//       return {
//         ...state,
//         users: {
//           ...state.users,
//           data: [action.payload, ...state.users.data],
//           pagination: {
//             ...state.users.pagination,
//             total: state.users.pagination.total + 1
//           }
//         }
//       }

//     case 'UPDATE_USER':
//       return {
//         ...state,
//         users: {
//           ...state.users,
//           data: state.users.data.map(user =>
//             user.id === action.payload.id ? { ...user, ...action.payload.user } : user
//           )
//         }
//       }

//     case 'REMOVE_USER':
//       return {
//         ...state,
//         users: {
//           ...state.users,
//           data: state.users.data.filter(user => user.id !== action.payload),
//           pagination: {
//             ...state.users.pagination,
//             total: Math.max(0, state.users.pagination.total - 1)
//           }
//         }
//       }

//     // Question cases
//     case 'SET_QUESTIONS_LOADING':
//       return {
//         ...state,
//         questions: { ...state.questions, loading: action.payload }
//       }

//     case 'SET_QUESTIONS_DATA':
//       return {
//         ...state,
//         questions: {
//           ...state.questions,
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           loading: false
//         }
//       }

//     case 'SET_QUESTIONS_FILTERS':
//       return {
//         ...state,
//         questions: {
//           ...state.questions,
//           filters: { ...state.questions.filters, ...action.payload },
//           pagination: { ...state.questions.pagination, currentPage: 1 }
//         }
//       }

//     case 'ADD_QUESTION':
//       return {
//         ...state,
//         questions: {
//           ...state.questions,
//           data: [action.payload, ...state.questions.data],
//           pagination: {
//             ...state.questions.pagination,
//             total: state.questions.pagination.total + 1
//           }
//         }
//       }

//     case 'UPDATE_QUESTION':
//       return {
//         ...state,
//         questions: {
//           ...state.questions,
//           data: state.questions.data.map(question =>
//             question.id === action.payload.id ? { ...question, ...action.payload.question } : question
//           )
//         }
//       }

//     case 'REMOVE_QUESTION':
//       return {
//         ...state,
//         questions: {
//           ...state.questions,
//           data: state.questions.data.filter(question => question.id !== action.payload),
//           pagination: {
//             ...state.questions.pagination,
//             total: Math.max(0, state.questions.pagination.total - 1)
//           }
//         }
//       }

//     // AI Response cases
//     case 'SET_AI_RESPONSES_LOADING':
//       return {
//         ...state,
//         aiResponses: { ...state.aiResponses, loading: action.payload }
//       }

//     case 'SET_AI_RESPONSES_DATA':
//       return {
//         ...state,
//         aiResponses: {
//           ...state.aiResponses,
//           data: action.payload.data,
//           pagination: action.payload.pagination,
//           loading: false
//         }
//       }

//     case 'SET_AI_RESPONSES_FILTERS':
//       return {
//         ...state,
//         aiResponses: {
//           ...state.aiResponses,
//           filters: { ...state.aiResponses.filters, ...action.payload },
//           pagination: { ...state.aiResponses.pagination, currentPage: 1 }
//         }
//       }

//     case 'UPDATE_AI_RESPONSE':
//       return {
//         ...state,
//         aiResponses: {
//           ...state.aiResponses,
//           data: state.aiResponses.data.map(response =>
//             response.id === action.payload.id ? { ...response, ...action.payload.response } : response
//           )
//         }
//       }

//     case 'REMOVE_AI_RESPONSE':
//       return {
//         ...state,
//         aiResponses: {
//           ...state.aiResponses,
//           data: state.aiResponses.data.filter(response => response.id !== action.payload),
//           pagination: {
//             ...state.aiResponses.pagination,
//             total: Math.max(0, state.aiResponses.pagination.total - 1)
//           }
//         }
//       }

//     // Statistics cases
//     case 'SET_STATISTICS_LOADING':
//       return {
//         ...state,
//         statistics: { ...state.statistics, loading: action.payload }
//       }

//     case 'SET_STATISTICS_DATA':
//       return {
//         ...state,
//         statistics: {
//           data: action.payload,
//           loading: false,
//           lastUpdated: new Date()
//         }
//       }

//     // UI cases
//     case 'SET_SIDEBAR_OPEN':
//       return {
//         ...state,
//         ui: { ...state.ui, sidebarOpen: action.payload }
//       }

//     case 'SET_CURRENT_VIEW':
//       return {
//         ...state,
//         ui: { ...state.ui, currentView: action.payload }
//       }

//     case 'ADD_NOTIFICATION':
//       return {
//         ...state,
//         ui: {
//           ...state.ui,
//           notifications: [
//             ...state.ui.notifications,
//             {
//               id: Date.now().toString(),
//               type: action.payload.type,
//               message: action.payload.message,
//               timestamp: new Date()
//             }
//           ]
//         }
//       }

//     case 'REMOVE_NOTIFICATION':
//       return {
//         ...state,
//         ui: {
//           ...state.ui,
//           notifications: state.ui.notifications.filter(n => n.id !== action.payload)
//         }
//       }

//     case 'CLEAR_NOTIFICATIONS':
//       return {
//         ...state,
//         ui: { ...state.ui, notifications: [] }
//       }

//     default:
//       return state
//   }
// }

// // ==================== CONTEXT ====================

// interface AdminContextValue {
//   state: AdminState
//   dispatch: React.Dispatch<AdminAction>

//   // User actions
//   loadUsers: () => Promise<void>
//   createUser: (userData: any) => Promise<void>
//   updateUser: (id: string, userData: any) => Promise<void>
//   deleteUser: (id: string) => Promise<void>
//   setUsersFilters: (filters: Partial<AdminState['users']['filters']>) => void

//   // Question actions
//   loadQuestions: () => Promise<void>
//   createQuestion: (questionData: any) => Promise<void>
//   updateQuestion: (id: string, questionData: any) => Promise<void>
//   deleteQuestion: (id: string) => Promise<void>
//   setQuestionsFilters: (filters: Partial<AdminState['questions']['filters']>) => void

//   // AI Response actions
//   loadAIResponses: () => Promise<void>
//   reviewAIResponse: (responseId: string, reviewData: any) => Promise<void>
//   setAIResponsesFilters: (filters: Partial<AdminState['aiResponses']['filters']>) => void

//   // Statistics actions
//   loadStatistics: (period?: string) => Promise<void>

//   // UI actions
//   addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void
//   removeNotification: (id: string) => void
//   clearNotifications: () => void
// }

// const AdminContext = createContext<AdminContextValue | undefined>(undefined)

// // ==================== PROVIDER ====================

// interface AdminProviderProps {
//   children: ReactNode
// }

// export function AdminProvider({ children }: AdminProviderProps) {
//   const [state, dispatch] = useReducer(adminReducer, initialState)

//   // ==================== USER ACTIONS ====================

//   const loadUsers = async () => {
//     dispatch({ type: 'SET_USERS_LOADING', payload: true })
//     try {
//       const response = await adminService.getUsers({
//         page: state.users.pagination.currentPage,
//         limit: state.users.pagination.perPage,
//         ...state.users.filters,
//         status: state.users.filters.status !== 'all' ? state.users.filters.status : undefined
//       })

//       dispatch({
//         type: 'SET_USERS_DATA',
//         payload: {
//           data: response.data,
//           pagination: response.pagination
//         }
//       })
//     } catch (error) {
//       dispatch({ type: 'SET_USERS_LOADING', payload: false })
//       addNotification('error', 'Falha ao carregar usuários')
//     }
//   }

//   const createUser = async (userData: any) => {
//     try {
//       const response = await adminService.createAdmin(userData)
//       dispatch({ type: 'ADD_USER', payload: response.data })
//       addNotification('success', 'Usuário criado com sucesso')
//     } catch (error: any) {
//       addNotification('error', error.message || 'Falha ao criar usuário')
//       throw error
//     }
//   }

//   const updateUser = async (id: string, userData: any) => {
//     try {
//       const response = await adminService.updateUser(id, userData)
//       dispatch({ type: 'UPDATE_USER', payload: { id, user: response.data } })
//       addNotification('success', 'Usuário atualizado com sucesso')
//     } catch (error: any) {
//       addNotification('error', error.message || 'Falha ao atualizar usuário')
//       throw error
//     }
//   }

//   const deleteUser = async (id: string) => {
//     try {
//       await adminService.deleteUser(id)
//       dispatch({ type: 'REMOVE_USER', payload: id })
//       addNotification('success', 'Usuário removido com sucesso')
//     } catch (error: any) {
//       addNotification('error', error.message || 'Falha ao remover usuário')
//       throw error
//     }
//   }

//   const setUsersFilters = (filters: Partial<AdminState['users']['filters']>) => {
//     dispatch({ type: 'SET_USERS_FILTERS', payload: filters })
//   }

//   // ==================== QUESTION ACTIONS ====================

//   const loadQuestions = async () => {
//     dispatch({ type: 'SET_QUESTIONS_LOADING', payload: true })
//     try {
//       const response = await adminService.getQuestions({
//         page: state.questions.pagination.currentPage,
//         limit: state.questions.pagination.perPage,
//         ...state.questions.filters,
//         ano: state.questions.filters.ano ? parseInt(state.questions.filters.ano) : undefined,
//         type: state.questions.filters.type !== 'all' ? state.questions.filters.type : undefined
//       })

//       dispatch({
//         type: 'SET_QUESTIONS_DATA',
//         payload: {
//           data: response.data,
//           pagination: response.pagination
//         }
//       })
//     } catch (error) {
//       dispatch({ type: 'SET_QUESTIONS_LOADING', payload: false })
//       addNotification('error', 'Falha ao carregar questões')
//     }
//   }

//   const createQuestion = async (questionData: any) => {
//     try {
//       const response = await adminService.createQuestion(questionData)
//       dispatch({ type: 'ADD_QUESTION', payload: response.data })
//       addNotification('success', 'Questão criada com sucesso')
//     } catch (error: any) {
//       addNotification('error', error.message || 'Falha ao criar questão')
//       throw error
//     }
//   }

//   const updateQuestion = async (id: string, questionData: any) => {
//     try {
//       const response = await adminService.updateQuestion(id, questionData)
//       dispatch({ type: 'UPDATE_QUESTION', payload: { id, question: response.data } })
//       addNotification('success', 'Questão atualizada com sucesso')
//     } catch (error: any) {
//       addNotification('error', error.message || 'Falha ao atualizar questão')
//       throw error
//     }
//   }

//   const deleteQuestion = async (id: string) => {
//     try {
//       await adminService.deleteQuestion(id)
//       dispatch({ type: 'REMOVE_QUESTION', payload: id })
//       addNotification('success', 'Questão removida com sucesso')
//     } catch (error: any) {
//       addNotification('error', error.message || 'Falha ao remover questão')
//       throw error
//     }
//   }

//   const setQuestionsFilters = (filters: Partial<AdminState['questions']['filters']>) => {
//     dispatch({ type: 'SET_QUESTIONS_FILTERS', payload: filters })
//   }

//   // ==================== AI RESPONSE ACTIONS ====================

//   const loadAIResponses = async () => {
//     dispatch({ type: 'SET_AI_RESPONSES_LOADING', payload: true })
//     try {
//       const response = await adminService.getPendingResponses({
//         page: state.aiResponses.pagination.currentPage,
//         limit: state.aiResponses.pagination.perPage,
//         ...state.aiResponses.filters,
//         type: state.aiResponses.filters.type !== 'all' ? state.aiResponses.filters.type : undefined,
//         priority: state.aiResponses.filters.priority !== 'all' ? state.aiResponses.filters.priority : undefined
//       })

//       dispatch({
//         type: 'SET_AI_RESPONSES_DATA',
//         payload: {
//           data: response.data,
//           pagination: response.pagination
//         }
//       })
//     } catch (error) {
//       dispatch({ type: 'SET_AI_RESPONSES_LOADING', payload: false })
//       addNotification('error', 'Falha ao carregar respostas IA')
//     }
//   }

//   const reviewAIResponse = async (responseId: string, reviewData: any) => {
//     try {
//       await adminService.reviewResponse({ responseId, ...reviewData })
//       dispatch({
//         type: 'UPDATE_AI_RESPONSE',
//         payload: {
//           id: responseId,
//           response: { status: 'REVIEWED', ...reviewData }
//         }
//       })
//       addNotification('success', 'Resposta revisada com sucesso')
//     } catch (error: any) {
//       addNotification('error', error.message || 'Falha ao revisar resposta')
//       throw error
//     }
//   }

//   const setAIResponsesFilters = (filters: Partial<AdminState['aiResponses']['filters']>) => {
//     dispatch({ type: 'SET_AI_RESPONSES_FILTERS', payload: filters })
//   }

//   // ==================== STATISTICS ACTIONS ====================

//   const loadStatistics = async (period: string = 'month') => {
//     dispatch({ type: 'SET_STATISTICS_LOADING', payload: true })
//     try {
//       const response = await adminService.getSystemStatistics(period as any)
//       dispatch({ type: 'SET_STATISTICS_DATA', payload: response.data })
//     } catch (error) {
//       dispatch({ type: 'SET_STATISTICS_LOADING', payload: false })
//       addNotification('error', 'Falha ao carregar estatísticas')
//     }
//   }

//   // ==================== UI ACTIONS ====================

//   const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
//     dispatch({ type: 'ADD_NOTIFICATION', payload: { type, message } })

//     // Auto remove notification after 5 seconds
//     setTimeout(() => {
//       dispatch({ type: 'REMOVE_NOTIFICATION', payload: Date.now().toString() })
//     }, 5000)
//   }

//   const removeNotification = (id: string) => {
//     dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
//   }

//   const clearNotifications = () => {
//     dispatch({ type: 'CLEAR_NOTIFICATIONS' })
//   }

//   // ==================== CONTEXT VALUE ====================

//   const contextValue: AdminContextValue = {
//     state,
//     dispatch,

//     // User actions
//     loadUsers,
//     createUser,
//     updateUser,
//     deleteUser,
//     setUsersFilters,

//     // Question actions
//     loadQuestions,
//     createQuestion,
//     updateQuestion,
//     deleteQuestion,
//     setQuestionsFilters,

//     // AI Response actions
//     loadAIResponses,
//     reviewAIResponse,
//     setAIResponsesFilters,

//     // Statistics actions
//     loadStatistics,

//     // UI actions
//     addNotification,
//     removeNotification,
//     clearNotifications
//   }

//   // Auto-cleanup old notifications
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date()
//       const oldNotifications = state.ui.notifications.filter(
//         n => now.getTime() - n.timestamp.getTime() > 10000 // Remove notifications older than 10 seconds
//       )

//       if (oldNotifications.length > 0) {
//         oldNotifications.forEach(n => removeNotification(n.id))
//       }
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [state.ui.notifications])

//   return (
//     <AdminContext.Provider value={contextValue}>
//       {children}
//     </AdminContext.Provider>
//   )
// }

// // ==================== HOOK ====================

// export function useAdmin() {
//   const context = useContext(AdminContext)
//   if (context === undefined) {
//     throw new Error('useAdmin must be used within an AdminProvider')
//   }
//   return context
// }

// export default AdminContext
'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'

// ==================== TIPAGEM ====================

export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'professor' | 'admin'
}

export interface Question {
  id: string
  title: string
}

export interface AIResponse {
  id: string
  status: 'PENDING' | 'REVIEWED'
}

export interface SystemStats {
  users: {
    total: number
    active: number
    newThisPeriod: number
  }
  questions: {
    total: number
    newThisPeriod: number
    byArea?: { area: string; count: number }[]
  }
  responses: {
    total: number
    totalPending: number
    approvalRate: number
  }
}

export interface AdminState {
  users: { data: User[]; loading: boolean }
  questions: { data: Question[]; loading: boolean }
  aiResponses: {
    data: AIResponse[]
    loading: boolean
    pagination: { total: number; pages: number; currentPage: number; perPage: number }
  }
  statistics: { data: SystemStats | null; loading: boolean }
  ui: { sidebarOpen: boolean; currentView: string; notifications: any[] }
}

interface AdminContextValue {
  state: AdminState
  dispatch: React.Dispatch<any>
  loadUsers: () => void
  loadQuestions: () => void
  loadAIResponses: () => void
  loadStatistics: (period?: 'day' | 'week' | 'month' | 'year') => Promise<void>
  addNotification: (type: string, message: string) => void
}

// ==================== MOCK ====================

const mockState: AdminState = {
  users: {
    data: [{ id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' }],
    loading: false
  },
  questions: {
    data: [{ id: '1', title: 'Qual é a capital do Brasil?' }],
    loading: false
  },
  aiResponses: {
    data: [{ id: '1', status: 'PENDING' }],
    loading: false,
    pagination: {
      total: 1,
      pages: 1,
      currentPage: 1,
      perPage: 10
    }
  },
  statistics: {
    data: null,
    loading: false
  },
  ui: {
    sidebarOpen: false,
    currentView: 'dashboard',
    notifications: []
  }
}

// ==================== CONTEXT ====================

const AdminContext = createContext<AdminContextValue>({
  state: mockState,
  dispatch: () => {},
  loadUsers: () => {},
  loadQuestions: () => {},
  loadAIResponses: () => {},
  loadStatistics: async () => {},
  addNotification: (type, message) => console.log(`[Notification] ${type}: ${message}`)
})

// ==================== PROVIDER ====================

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AdminState>(mockState)

  const loadStatistics = async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    setState(prev => ({ ...prev, statistics: { ...prev.statistics, loading: true } }))

    try {
      // Aqui você buscaria via API real, mas por enquanto vamos simular
      const stats: SystemStats = {
        users: {
          total: 150,
          active: 120,
          newThisPeriod: 10
        },
        questions: {
          total: 300,
          newThisPeriod: 15,
          byArea: [
            { area: 'Matemática', count: 100 },
            { area: 'História', count: 80 },
            { area: 'Geografia', count: 120 }
          ]
        },
        responses: {
          total: 200,
          totalPending: 5,
          approvalRate: 92.5
        }
      }

      setState(prev => ({
        ...prev,
        statistics: { data: stats, loading: false }
      }))
    } catch (err) {
      console.error('Erro ao carregar estatísticas', err)
      setState(prev => ({ ...prev, statistics: { ...prev.statistics, loading: false } }))
    }
  }

  return (
    <AdminContext.Provider
      value={{
        state,
        dispatch: () => {},
        loadUsers: () => {},
        loadQuestions: () => {},
        loadAIResponses: () => {},
        loadStatistics,
        addNotification: (type, message) => console.log(`[Notification] ${type}: ${message}`)
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

// ==================== HOOK ====================

export const useAdmin = () => useContext(AdminContext)

export default AdminContext
