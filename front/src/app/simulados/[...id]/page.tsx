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
      },
      {
        id: 3,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 4,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 5,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 6,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 7,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 8,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 9,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 10,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 11,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 12,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },

      {
        id: 13,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 14,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 15,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 16,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 17,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 18,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 19,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 20,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 21,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 22,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 23,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 24,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 25,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 26,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 27,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 28,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 29,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 30,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 31,
        question: 'Qual é a capital do Brasil?',
        options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
        correctAnswer: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960.'
      },
      {
        id: 32,
        question: "Quem escreveu 'Dom Casmurro'?",
        options: ['José de Alencar', 'Machado de Assis', 'Clarice Lispector', 'Jorge Amado'],
        correctAnswer: 'Machado de Assis',
        explanation: 'Dom Casmurro é uma obra de Machado de Assis, publicada em 1899.'
      },
      {
        id: 33,
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
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-8">
          {simulado.titulo}
        </h1>
        <Simulado questions={simulado.questions} timeLimit={240} />{' '}
        {/* Assuming 4 hours = 240 minutes */}
      </main>
    </div>
  )
}
