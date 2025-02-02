'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { type Simulado, StatusCiclo, AreaAvaliacao } from '@/types'
import { SiteHeader } from '@/components/layout/site-header'

const simuladosMock: Simulado[] = [
  {
    id: 1,
    titulo: 'Simulado ENADE 2024.1',
    area: AreaAvaliacao.Exatas,
    status: StatusCiclo.EmPreparacao,
    duracao: '4 horas',
    questoes: 40
  },
  {
    id: 2,
    titulo: 'Simulado ENADE 2024.2',
    area: AreaAvaliacao.Saude,
    status: StatusCiclo.EmAndamento,
    duracao: '4 horas',
    questoes: 35
  },
  {
    id: 3,
    titulo: 'Simulado ENADE 2023.2',
    area: AreaAvaliacao.Tecnologia,
    status: StatusCiclo.Finalizado,
    duracao: '4 horas',
    questoes: 45
  }
]

export default function SimuladosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState<AreaAvaliacao | 'all'>('all')

  const filteredSimulados = simuladosMock.filter(
    simulado =>
      simulado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedArea === 'all' || simulado.area === selectedArea)
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold">Simulados</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Iniciar Simulado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Iniciar Novo Simulado</DialogTitle>
                  <DialogDescription>
                    Configure as opções do seu novo simulado aqui.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="area" className="text-right">
                      Área
                    </Label>
                    <Select>
                      <SelectTrigger id="area" className="col-span-3">
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AreaAvaliacao).map(area => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="questoes" className="text-right">
                      Questões
                    </Label>
                    <Input
                      id="questoes"
                      type="number"
                      className="col-span-3"
                      placeholder="Número de questões"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Iniciar Simulado</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar simulados..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={selectedArea}
              onValueChange={(value: AreaAvaliacao | 'all') => setSelectedArea(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {Object.values(AreaAvaliacao).map(area => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulados.map(simulado => (
              <SimuladoCard key={simulado.id} {...simulado} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function SimuladoCard({ id, titulo, area, status, duracao, questoes }: Simulado) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/simulados/${id}`)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-grow pt-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{titulo}</h3>
            <p className="text-muted-foreground">{area}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-5 h-5 mr-2" />
            <span>{duracao}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <BookOpen className="w-5 h-5 mr-2" />
            <span>{questoes} questões</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          className="w-full"
          variant={status === StatusCiclo.Finalizado ? 'secondary' : 'default'}
          disabled={status === StatusCiclo.Finalizado}
          onClick={handleClick}
        >
          {status === StatusCiclo.EmPreparacao
            ? 'Iniciar'
            : status === StatusCiclo.EmAndamento
            ? 'Continuar'
            : 'Visualizar Resultado'}
        </Button>
      </CardFooter>
    </Card>
  )
}

function StatusBadge({ status }: { status: StatusCiclo }) {
  const variants: Record<StatusCiclo, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [StatusCiclo.EmPreparacao]: 'destructive',
    [StatusCiclo.EmAndamento]: 'default',
    [StatusCiclo.Finalizado]: 'secondary'
  }

  return <Badge variant={variants[status]}>{status}</Badge>
}
