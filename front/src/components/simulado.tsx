"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Flag,
  PauseCircle,
  PlayCircle,
  Bot,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSimulado } from "@/hooks/use-simulado";
import { formatTime } from "@/utils/formatTime";
import { Badge } from "./ui/badge";
import { toast } from "@/hooks/use-toast";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface Support {
  id: string;
  tipo: string;
  conteudo: string;
}

interface Question {
  id: string;
  question: string;
  command: string;
  options: QuestionOption[];
  area: string;
  level: string;
  topics: string[];
  competencies: string[];
  references: string[];
  supports: Support[];
}

interface Response {
  id: string;
  questaoId: string;
  alternativaId: string;
  correta: boolean;
  tempoResposta: number;
}

interface SimuladoProps {
  questions: Question[];
  timeLimit: number;
  responses: Response[];
  simuladoId: string;
  onComplete: (
    answers: Array<{
      questaoId: string;
      alternativaId: string;
      tempoResposta: number;
    }>
  ) => Promise<void>;
  isFinished: boolean;
}

export function Simulado({
  questions,
  timeLimit,
  responses,
  simuladoId,
  onComplete,
  isFinished,
}: Readonly<SimuladoProps>) {
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
    totalPages,
    startTime,
    getFormattedAnswers,
  } = useSimulado(questions, timeLimit, responses);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{ [key: string]: string }>(
    {}
  );
  const [loadingAI, setLoadingAI] = useState<{ [key: string]: boolean }>({});
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const score = responses.filter((response) => response.correta).length;
  const totalQuestions = questions.length;
  const totalTime = timeLimit * 60; // Convert to seconds
  const timeSpent = responses.reduce(
    (total, response) => total + response.tempoResposta,
    0
  );

  // Initialize answers from responses
  useEffect(() => {
    if (responses?.length > 0) {
      handleAnswerSelect(
        responses.map((response) => ({
          questionId: response.questaoId,
          selectedAnswer: response.alternativaId,
          timeSpent: response.tempoResposta,
          isCorrect: response.correta,
        }))
      );
    }
  }, [responses]);

  // Handle finished state
  useEffect(() => {
    if (isFinished) {
      setShowResults(true);
    }
  }, [isFinished, setShowResults]);

  const handleComplete = async () => {
    setLoadingSubmit(true);
    try {
      const formattedAnswers = getFormattedAnswers();
      await onComplete(formattedAnswers);
      setShowResults(true);
    } catch (error) {
      console.error("Error completing simulado:", error);
      toast({
        variant: "destructive",
        title: "Erro ao finalizar simulado",
        description:
          "Ocorreu um erro ao salvar suas respostas. Tente novamente.",
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleGetExplanation = async (questionId: string) => {
    if (aiExplanation[questionId]) return;
  
    setLoadingAI(prev => ({ ...prev, [questionId]: true }));
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) throw new Error('Question not found');
  
      const response = await fetch(`/api/generate/${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: {
            id: question.id,
            enunciado: question.question,
            comando: question.command,
            alternativas: question.options.map(opt => ({
              id: opt.id,
              texto: opt.text,
              correta: opt.isCorrect,
              justificativa: opt.explanation
            }))
          }
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to get AI explanation');
      }
  
      const data = await response.json();
      if (data.explanation) {
        setAiExplanation(prev => ({ ...prev, [questionId]: data.explanation }));
      } else {
        throw new Error('No explanation received');
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar explicação',
        description: 'Não foi possível gerar a explicação. Tente novamente mais tarde.'
      });
    } finally {
      setLoadingAI(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const renderQuestion = (question: Question, index: number) => (
    <div key={question.id} className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">Questão {index + 1}</h2>
          <div className="flex gap-2 text-sm text-muted-foreground mt-1">
            <Badge variant="outline">{question.area}</Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFlagQuestion(question.id)}
          className={
            userAnswers.find((ua) => ua.questionId === question.id)?.isFlagged
              ? "text-yellow-500"
              : ""
          }
        >
          <Flag className="mr-2 h-4 w-4" />
          {userAnswers.find((ua) => ua.questionId === question.id)?.isFlagged
            ? "Marcada"
            : "Marcar"}
        </Button>
      </div>

      {question.supports.length > 0 && (
        <div className="space-y-4 bg-muted p-4 rounded-lg">
          {question.supports.map((support) => (
            <div key={support.id}>
              {support.tipo === "texto" && <p>{support.conteudo}</p>}
              {support.tipo === "imagem" && (
                <img
                  src={support.conteudo || "/placeholder.svg"}
                  alt="Material de apoio"
                  className="max-w-full h-auto"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-lg">{question.question}</p>
        <p className="font-medium">{question.command}</p>
      </div>

      <RadioGroup
        onValueChange={(value) => handleAnswerSelect(question.id, value)}
        value={
          userAnswers.find((ua) => ua.questionId === question.id)
            ?.selectedAnswer || ""
        }
      >
        {question.options.map((option) => (
          <div
            key={option.id}
            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent"
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-grow cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {isReviewing && (
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Referências: {question.references.join(", ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Competências: {question.competencies.join(", ")}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="summary">Resumo</TabsTrigger>
        <TabsTrigger value="detailed">Detalhado</TabsTrigger>
      </TabsList>

      <TabsContent value="summary">
        <div className="space-y-6 pt-4">
          <h2 className="text-3xl font-semibold">Resumo do Simulado</h2>
          <div className="space-y-4">
            <Progress
              value={(score / totalQuestions) * 100}
              className="w-full h-4"
            />
            <div className="flex justify-between text-sm">
              <span>Acertos: {score}</span>
              <span>Total: {totalQuestions}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tempo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Média por Questão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.round(timeSpent / totalQuestions)}s
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="detailed">
        <ScrollArea className="h-[60vh]">
          {questions.map((question, index) => {
            const userAnswer = userAnswers.find(
              (ua) => ua.questionId === question.id
            );
            const selectedOption = question.options.find(
              (opt) => opt.id === userAnswer?.selectedAnswer
            );
            const correctOption = question.options.find((opt) => opt.isCorrect);

            return (
              <div key={question.id} className="mb-8 p-4 border rounded-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">
                      Questão {index + 1}
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{question.area}</Badge>
                    </div>
                  </div>

                  {question.supports?.length > 0 && (
                    <div className="space-y-4 bg-muted p-4 rounded-lg">
                      {question.supports.map((support) => (
                        <div key={support.id}>
                          {support.tipo === "texto" && (
                            <p>{support.conteudo}</p>
                          )}
                          {support.tipo === "imagem" && (
                            <img
                              src={support.conteudo}
                              alt="Material de apoio"
                              className="max-w-full h-auto"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p>{question.question}</p>
                    {question.command && (
                      <p className="font-medium">{question.command}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedOption && (
                      <div
                        className={`p-3 rounded-lg ${
                          selectedOption.isCorrect
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        <p className="font-medium">Sua resposta:</p>
                        <p>{selectedOption.text}</p>
                      </div>
                    )}

                    {correctOption && !selectedOption?.isCorrect && (
                      <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <p className="font-medium">Resposta correta:</p>
                        <p>{correctOption.text}</p>
                      </div>
                    )}

                    {selectedOption && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="font-medium">Explicação:</p>
                        <p>{selectedOption.explanation}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-sm text-muted-foreground">
                    {question.references?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          Referências: {question.references.join(", ")}
                        </span>
                      </div>
                    )}
                    {question.competencies?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>
                          Competências: {question.competencies.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleGetExplanation(question.id)}
                    disabled={loadingAI[question.id]}
                  >
                    {loadingAI[question.id] ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                        Gerando explicação...
                      </div>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" />
                        Gerar explicação detalhada
                      </>
                    )}
                  </Button>

                  {aiExplanation[question.id] && (
                    <Alert>
                      <Bot className="h-4 w-4" />
                      <AlertTitle>Explicação Detalhada</AlertTitle>
                      <AlertDescription>
                        {aiExplanation[question.id]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  const currentQuestions = useMemo(() => {
    const startIndex = currentPage * questionsPerPage;
    return questions.slice(startIndex, startIndex + questionsPerPage);
  }, [currentPage, questions, questionsPerPage]);

  if (showResults || isReviewing) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>
            Simulado
            <Badge variant="secondary" className="ml-2">
              {isReviewing ? "Revisão" : "Resultados"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Updated this line to pass user answers */}
          {renderResults(questions, userAnswers)}
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between p-6">
          {showResults && !isReviewing && (
            <Button variant="outline" onClick={() => setIsReviewing(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Revisar Questões
            </Button>
          )}
          {isReviewing && (
            <div className="w-full flex justify-center">
              <Button onClick={() => setIsReviewing(false)}>
                Voltar aos Resultados
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle>
              Simulado
              <Badge variant="default" className="ml-2">
                Em Andamento
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentPage + 1} de {totalPages} páginas •{" "}
              {userAnswers.filter((a) => a.selectedAnswer).length} de{" "}
              {questions.length} respondidas
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTimer}>
              {isTimerPaused ? <PlayCircle /> : <PauseCircle />}
            </Button>
          </div>
        </div>

        <Progress
          value={
            ((currentPage * questionsPerPage + currentQuestions.length) /
              questions.length) *
            100
          }
          className="mt-4"
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          {currentQuestions.map((q, index) =>
            renderQuestion(q, currentPage * questionsPerPage + index)
          )}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between p-6">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        {currentPage === totalPages - 1 ? (
          <Button
            onClick={() => setShowFinishDialog(true)}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                Finalizando...
              </>
            ) : (
              <>
                Finalizar Simulado
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNextPage}>
            Próxima
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>

      {isTimerPaused && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-[90%] max-w-md">
            <CardHeader>
              <CardTitle>Simulado Pausado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                O tempo está pausado. Clique no botão abaixo para continuar.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={toggleTimer} className="w-full">
                <PlayCircle className="mr-2 h-4 w-4" />
                Continuar Simulado
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {showFinishDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-[90%] max-w-md">
            <CardHeader>
              <CardTitle>Finalizar Simulado?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Você respondeu{" "}
                {userAnswers.filter((a) => a.selectedAnswer).length} de{" "}
                {questions.length} questões.
                {userAnswers.filter((a) => a.selectedAnswer).length <
                  questions.length &&
                  " Tem certeza que deseja finalizar sem responder todas as questões?"}
              </p>
              {userAnswers.filter((a) => a.isFlagged).length > 0 && (
                <Alert className="mt-4">
                  <Flag className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Você tem {userAnswers.filter((a) => a.isFlagged).length}{" "}
                    questões marcadas para revisão.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFinishDialog(false)}
              >
                Continuar Respondendo
              </Button>
              <Button onClick={handleComplete} disabled={loadingSubmit}>
                {loadingSubmit ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                    Finalizando...
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Card>
  );
}
