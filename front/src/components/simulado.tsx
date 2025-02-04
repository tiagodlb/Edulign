'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Flag,
  PauseCircle,
  PlayCircle,
  Bot
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { Question } from '@/types'
import { useSimulado } from '@/hooks/use-simulado'
import { formatTime } from '@/utils/formatTime'
import { Badge } from './ui/badge'

interface SimuladoProps {
  questions: Question[]
  timeLimit: number
}

export function Simulado({ questions, timeLimit }: Readonly<SimuladoProps>) {
  const {
    currentPage,
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
  } = useSimulado(questions, timeLimit)

  const [aiResponses, setAiResponses] = useState<{ [key: number]: string }>({})
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({})
  const [aiErrors, setAiErrors] = useState<{ [key: number]: string }>({})

  const handleGenerateAIResponse = async (questionId: number, question: string) => {
    setLoadingAI(prev => ({ ...prev, [questionId]: true }))
    setAiErrors(prev => ({ ...prev, [questionId]: '' }))
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: question })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      setAiResponses(prev => ({ ...prev, [questionId]: data.text }))
    } catch (error) {
      console.error('Error generating AI response:', error)
      setAiErrors(prev => ({
        ...prev,
        [questionId]:
          error instanceof Error
            ? error.message
            : 'Falha ao gerar resposta da IA. Por favor, tente novamente mais tarde.'
      }))
    } finally {
      setLoadingAI(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const renderQuestion = (question: Question, index: number) => (
    <div key={question.id} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight mt-2">
          Questão {index + 1}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFlagQuestion(question.id)}
          className={
            userAnswers.find(ua => ua.questionId === question.id)?.isFlagged
              ? 'text-yellow-500'
              : 'text-gray-500'
          }
        >
          <Flag className="mr-2 h-4 w-4" />
          {userAnswers.find(ua => ua.questionId === question.id)?.isFlagged
            ? 'Desmarcar'
            : 'Marcar'}
        </Button>
      </div>
      <p className="text-lg font-semibold">{question.question}</p>
      <RadioGroup
        onValueChange={value => handleAnswerSelect(question.id, value)}
        value={userAnswers.find(ua => ua.questionId === question.id)?.selectedAnswer ?? ''}
        className="border-b pb-2"
      >
        {question.options.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className="flex items-center space-x-2 p-2 rounded hover:bg-accent"
          >
            <RadioGroupItem value={option} id={`q${question.id}-option-${optionIndex}`} />
            <Label htmlFor={`q${question.id}-option-${optionIndex}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )

  const renderResults = () => (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="summary">Resumo</TabsTrigger>
        <TabsTrigger value="detailed">Detalhado</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        <div className="space-y-6 pt-4">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Resumo do Simulado
          </h2>
          <p className="text-lg leading-7 [&:not(:first-child)]:mt-6">
            Sua pontuação: {calculateScore()} de {questions.length}
          </p>
          <Progress value={(calculateScore() / questions.length) * 100} className="w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Questões Corretas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-500">{calculateScore()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Questões Incorretas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-500">
                  {questions.length - calculateScore()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="detailed">
        <ScrollArea className="h-[60vh]">
          {questions.map((q, index) => (
            <div key={q.id} className="mb-6 p-4 border rounded">
              <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
                Questão {index + 1}: {q.question}
              </h3>
              <p
                className={`mb-2 ${
                  userAnswers.find(ua => ua.questionId === q.id)?.selectedAnswer === q.correctAnswer
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                Sua resposta:{' '}
                {userAnswers.find(ua => ua.questionId === q.id)?.selectedAnswer ?? 'Não respondida'}
              </p>
              {userAnswers.find(ua => ua.questionId === q.id)?.selectedAnswer !==
                q.correctAnswer && (
                <p className="text-green-600 mb-2">Resposta correta: {q.correctAnswer}</p>
              )}
              <p className="text-sm text-muted-foreground">{q.explanation}</p>
              <div className="mt-4">
                <Button
                  onClick={() => handleGenerateAIResponse(q.id, q.question)}
                  disabled={loadingAI[q.id]}
                >
                  {loadingAI[q.id] ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Gerar resposta da IA
                    </>
                  )}
                </Button>
                {aiResponses[q.id] && (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <p className="font-semibold leading-none">Resposta da IA:</p>
                    <p>{aiResponses[q.id]}</p>
                  </div>
                )}
                {aiErrors[q.id] && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{aiErrors[q.id]}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )

  const currentQuestions = useMemo(() => {
    const startIndex = currentPage * questionsPerPage
    return questions.slice(startIndex, startIndex + questionsPerPage)
  }, [currentPage, questions, questionsPerPage])

  const progressPercentage = useMemo(() => {
    return ((currentPage * questionsPerPage + currentQuestions.length) / questions.length) * 100
  }, [currentPage, currentQuestions.length, questions.length, questionsPerPage])

  const answeredQuestions = useMemo(() => {
    return userAnswers.filter(ua => ua.selectedAnswer !== '').length
  }, [userAnswers])

  return (
    <Card className="w-full mx-auto rounded-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            <div className="flex justify-between items-start">
              Simulado
              <Badge variant={showResults ? 'secondary' : 'destructive'} className="ml-2 mt-1">
                {showResults ? 'Resultados' : isReviewing ? 'Revisão' : 'Em Andamento'}
              </Badge>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-4">
            {!showResults && (
              <>
                <div className="flex items-center text-orange-500">
                  <Clock className="mr-2" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleTimer}>
                  {isTimerPaused ? <PlayCircle /> : <PauseCircle />}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!showResults && !isReviewing && (
          <div className="mb-4 space-y-2">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="font-medium leading-none">
                Página: {currentPage + 1} de {totalPages}
              </span>
              <span>
                Respondidas: {answeredQuestions} de {questions.length}
              </span>
            </div>
          </div>
        )}
        {showResults ? (
          renderResults()
        ) : isReviewing ? (
          <ScrollArea className="h-[60vh]">
            {questions.map((q, index) => renderQuestion(q, index))}
          </ScrollArea>
        ) : (
          currentQuestions.map((q, index) =>
            renderQuestion(q, index + currentPage * questionsPerPage)
          )
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between mt-4">
        {!showResults && !isReviewing && (
          <>
            <Button onClick={handlePreviousPage} disabled={currentPage === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button onClick={handleNextPage}>
              {currentPage === totalPages - 1 ? 'Finalizar' : 'Próxima'}{' '}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
        {showResults && (
          <>
            <Button onClick={() => setIsReviewing(true)}>
              <RotateCcw className="mr-2 h-4 w-4" /> Revisar Questões
            </Button>
            <Button onClick={() => window.location.reload()}>Reiniciar Simulado</Button>
          </>
        )}
        {isReviewing && (
          <Button onClick={() => setIsReviewing(false)}>Voltar aos Resultados</Button>
        )}
      </CardFooter>
    </Card>
  )
}
