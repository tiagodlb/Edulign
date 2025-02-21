export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface SimuladoProps {
  questions: Question[]
  timeLimit: number // in minutes
}

export interface UserAnswer {
  questionId: number
  selectedAnswer: string
  isFlagged: boolean
}
