'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/site-header'
import { Simulado } from '@/components/simulado'
import { useToast } from '@/hooks/use-toast'
import StudentService from '@/lib/api/student'

type SimuladoResponse = {
  id: string
  alunoId: string
  qtdQuestoes: number
  dataInicio: string
  dataFim: string | null
  finalizado: boolean
  questoes: Array<{
    id: string
    enunciado: string
    alternativas: string[]
    area: string
    ano: number
  }>
  respostas: Array<any> // You might want to define a more specific type for respostas
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
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-8">
          Simulado
        </h1>
        <Simulado
          questions={simulado.questoes.map(q => ({
            id: q.id,
            question: q.enunciado,
            options: q.alternativas,
            correctAnswer: '', // This information is not provided in the API response
            explanation: '' // This information is not provided in the API response
          }))}
          timeLimit={240} // You might want to calculate this based on qtdQuestoes or add it to the API response
        />
      </main>
    </div>
  )
}
