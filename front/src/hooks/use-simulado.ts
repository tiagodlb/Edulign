import { useState, useEffect, useCallback } from 'react'
import type { Question } from '@/types'

interface UserAnswer {
  questionId: number
  selectedAnswer: string
  isFlagged: boolean
}

export function useSimulado(questions: Question[], timeLimit: number) {
  const [currentPage, setCurrentPage] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(
    questions.map(q => ({ questionId: q.id, selectedAnswer: '', isFlagged: false }))
  )
  const [showResults, setShowResults] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
  const [isTimerPaused, setIsTimerPaused] = useState(false)

  const questionsPerPage = 10
  const totalPages = Math.ceil(questions.length / questionsPerPage)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!isTimerPaused && !showResults) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setShowResults(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isTimerPaused, showResults])

  const handleAnswerSelect = useCallback((questionId: number, answer: string) => {
    setUserAnswers(prev =>
      prev.map(ua => (ua.questionId === questionId ? { ...ua, selectedAnswer: answer } : ua))
    )
  }, [])

  const handleFlagQuestion = useCallback((questionId: number) => {
    setUserAnswers(prev =>
      prev.map(ua => (ua.questionId === questionId ? { ...ua, isFlagged: !ua.isFlagged } : ua))
    )
  }, [])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
    } else {
      setShowResults(true)
    }
  }, [currentPage, totalPages])

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  const calculateScore = useCallback(() => {
    return userAnswers.reduce((score, ua) => {
      const question = questions.find(q => q.id === ua.questionId)
      return score + (ua.selectedAnswer === question?.correctAnswer ? 1 : 0)
    }, 0)
  }, [questions, userAnswers])

  const toggleTimer = useCallback(() => {
    setIsTimerPaused(prev => !prev)
  }, [])

  return {
    currentPage,
    setCurrentPage,
    userAnswers,
    showResults,
    setShowResults,
    isReviewing,
    setIsReviewing,
    timeRemaining,
    isTimerPaused,
    handleAnswerSelect,
    handleFlagQuestion,
    handleNextPage,
    handlePreviousPage,
    calculateScore,
    toggleTimer,
    questionsPerPage,
    totalPages
  }
}
