'use client'

import { useParams, useRouter } from 'next/navigation'
import { AreaAvaliacao, StatusCiclo, type SimuladoDetailed } from '@/types'
import { Simulado } from '@/components/simulado'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'

const simuladosMock: SimuladoDetailed[] = [
  {
    id: 1,
    titulo: 'Simulado ENADE 2024.1 - 1',
    area: AreaAvaliacao.Exatas,
    status: StatusCiclo.EmPreparacao,
    duracao: '4 horas',
    questoes: 40,
    questions: [
      {
        id: 1,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 2,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      }
      // Add more questions as needed
    ]
  }
  // Add more simulados as needed
]

function SimuladoNotFound() {
  const router = useRouter()

  return (
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
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a lista de simulados
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function SimuladoPage() {
  const params = useParams()
  const id = Number(params.id)

  const simulado = simuladosMock.find(s => s.id === id)

  if (!simulado) {
    return <SimuladoNotFound />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{simulado.titulo}</h1>
        <Simulado questions={simulado.questions} timeLimit={240} />{' '}
        {/* Assuming 4 hours = 240 minutes */}
      </main>
    </div>
  )
}
