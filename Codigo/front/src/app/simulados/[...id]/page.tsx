'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { SiteHeader } from '../../../components/layout/site-header'
import { Simulado } from '../../../components/simulado'
import { useToast } from '../../../hooks/use-toast'
import StudentService from '../../../lib/api/student'

// Types
interface Alternativa {
  id: string
  texto: string
  correta: boolean
  justificativa: string
  questaoId: string
}

interface Suporte {
  id: string
  tipo: string
  conteudo: string
  questaoId: string
}

interface Questao {
  id: string
  enunciado: string
  comando: string
  area: string
  tipo: string
  nivel: string
  alternativas: Alternativa[]
  suportes: Suporte[]
  topicos: string[]
  competencias: string[]
  referencias: string[]
  dataCriacao: string
  ano: number | null
  cadastradoPorId: string | null
}

interface Resposta {
  id: string
  alunoId: string
  questaoId: string
  alternativaId: string
  correta: boolean
  dataResposta: string
  tempoResposta: number
  simuladoId: string
  alternativa: Alternativa
}

interface SimuladoResponse {
  id: string
  titulo: string
  tipo: 'NORMAL' | 'ENADE_AI'
  area: string
  tempoLimite: number
  alunoId: string
  qtdQuestoes: number
  dataInicio: string
  dataFim: string | null
  finalizado: boolean
  questoes: Questao[]
  respostas: Resposta[]
}

function SimuladoNotFound() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2" />
            Simulado não encontrado
          </CardTitle>
          <CardDescription>
            Não foi possível encontrar o simulado solicitado. Ele pode ter sido removido ou o ID
            fornecido é inválido.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Verifique se o ID do simulado está correto e tente novamente.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/simulados')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lista de simulados
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SimuladoPage() {
  const [simulado, setSimulado] = useState<SimuladoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadSimulado()
  }, [])

  const loadSimulado = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await StudentService.getSimuladoById(id as string)
      if (response.success) {
        setSimulado(response.data)
      } else {
        throw new Error('Failed to load simulado')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar simulado',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      })
      router.push('/simulados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (
    answers: Array<{ questionId: string; selectedAnswer: string; timeSpent: number }>
  ) => {
    if (!simulado) return
    setIsSubmitting(true)
    try {
      await StudentService.updateSimulado(simulado.id, {
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          timeSpent: answer.timeSpent
        })),
        completed: true
      })
      toast({
        title: 'Simulado finalizado!',
        description: 'Suas respostas foram salvas com sucesso'
      })
      await loadSimulado()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar respostas',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  if (!simulado) {
    return <SimuladoNotFound />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="scroll-m-20 text-2xl sm:text-3xl font-extrabold tracking-tight lg:text-4xl break-words">
                {simulado.titulo}
              </h1>
              {simulado.tipo === 'ENADE_AI' && (
                <Badge variant="secondary" className="text-xs">
                  IA
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mt-2">
              <span>{simulado.area}</span>
              <span className="hidden sm:inline">•</span>
              <span>{simulado.qtdQuestoes} questões</span>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{simulado.tempoLimite} minutos</span>
              </div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-0 w-full sm:w-auto text-left sm:text-right">
            {simulado.finalizado ? 'Finalizado em ' : 'Iniciado em '}
            {new Date(simulado.dataInicio).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        <Simulado
          questions={simulado.questoes.map(q => ({
            id: q.id,
            question: q.enunciado,
            command: q.comando,
            options: q.alternativas.map(alt => ({
              id: alt.id,
              text: alt.texto,
              isCorrect: alt.correta,
              explanation: alt.justificativa
            })),
            area: q.area,
            level: q.nivel,
            topics: q.topicos,
            competencies: q.competencias,
            references: q.referencias,
            supports: q.suportes
          }))}
          timeLimit={simulado.tempoLimite * 60}
          responses={simulado.respostas}
          simuladoId={simulado.id}
          onComplete={handleComplete}
          isFinished={simulado.finalizado}
        />

        {isSubmitting && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
              <p className="text-lg font-medium">Salvando respostas...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
