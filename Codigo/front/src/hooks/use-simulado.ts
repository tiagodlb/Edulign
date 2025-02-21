import { useState, useEffect, useCallback } from 'react'
import type { Question } from '../types'

interface UserAnswer {
  questionId: string // Changed from number to string
  selectedAnswer: string
  timeSpent: number // Added this field
  isFlagged: boolean
}

export function useSimulado(questions: Question[], timeLimit: number) {
  const [currentPage, setCurrentPage] = useState(0)
  const [startTimes, setStartTimes] = useState<Record<string, number>>({})
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(
    questions.map(q => ({
      questionId: q.id,
      selectedAnswer: '',
      timeSpent: 0,
      isFlagged: false
    }))
  )
  const [showResults, setShowResults] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const questionsPerPage = 10
  const totalPages = Math.ceil(questions.length / questionsPerPage)

  // Initialize start times for current page questions
  useEffect(() => {
    const now = Date.now()
    const currentQuestions = questions.slice(
      currentPage * questionsPerPage,
      (currentPage + 1) * questionsPerPage
    )
    setStartTimes(prev => {
      const newTimes = { ...prev }
      currentQuestions.forEach(q => {
        if (!newTimes[q.id]) {
          newTimes[q.id] = now
        }
      })
      return newTimes
    })
  }, [currentPage, questions, questionsPerPage])

  // Timer effect
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

  const handleAnswerSelect = useCallback(
    (questionId: string, answer: string) => {
      const now = Date.now()
      setUserAnswers(prev =>
        prev.map(ua => {
          if (ua.questionId === questionId) {
            const startTime = startTimes[questionId] || now
            return {
              ...ua,
              selectedAnswer: answer,
              timeSpent: Math.round((now - startTime) / 1000) // Convert to seconds
            }
          }
          return ua
        })
      )
      // Update start time for next answer
      setStartTimes(prev => ({ ...prev, [questionId]: now }))
    },
    [startTimes]
  )

  const getFormattedAnswers = useCallback(() => {
    return userAnswers.map(ua => ({
      questionId: ua.questionId,
      selectedAnswer: ua.selectedAnswer,
      timeSpent: Math.max(ua.timeSpent, 0) // Ensure positive number
    }))
  }, [userAnswers])

  const handleFlagQuestion = useCallback((questionId: string) => {
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
    totalPages,
    getFormattedAnswers // Added this function
  }
}
