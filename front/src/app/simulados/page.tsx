'use client'

import { useState, useEffect } from 'react'
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
import { AreaAvaliacao } from '@/types'
import { SiteHeader } from '@/components/layout/site-header'
import { useToast } from '@/hooks/use-toast'
import StudentService from '@/lib/api/student'
import { getSimuladoStatus } from '@/utils/simulado'

type Simulado = {
  id: string
  titulo: string
  area: string
  qtdQuestoes: number
  finalizado: boolean
  dataInicio: string
  dataFim: string | null
  respostas: Array<{
    id: string
    alunoId: string
    questaoId: string
    alternativaSelecionada: number
    correta: boolean
    explicacao: string
    dataResposta: string
    tempoResposta: number
    simuladoId: string
  }>
}

export default function SimuladosPage() {
  const [simulados, setSimulados] = useState<Simulado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState<AreaAvaliacao | 'all'>('all')
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    area: '',
    questoes: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadSimulados()
  }, [])

  const loadSimulados = async () => {
    try {
      const response = await StudentService.getSimulados()
      if ((response as any).success) {
        setSimulados((response as any).data)
      } else {
        throw new Error('Falha ao carregar os simulados')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar simulados',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSimulado = async () => {
    if (!formData.area || !formData.questoes) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para criar o simulado'
      })
      return
    }

    setIsCreating(true)
    try {
      await StudentService.createSimulado({
        knowledgeArea: formData.area as AreaAvaliacao,
        numberOfQuestions: Number.parseInt(formData.questoes)
      })

      toast({
        title: 'Simulado criado!',
        description: 'Seu simulado foi criado com sucesso'
      })

      await loadSimulados()
      setFormData({ area: '', questoes: '' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar simulado',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const filteredSimulados = simulados.filter(
    simulado =>
      simulado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedArea === 'all' || simulado.area === selectedArea)
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-8 py-8">
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
                    <Select
                      value={formData.area}
                      onValueChange={value => setFormData(prev => ({ ...prev, area: value }))}
                    >
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
                      value={formData.questoes}
                      onChange={e => setFormData(prev => ({ ...prev, questoes: e.target.value }))}
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateSimulado} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                        Criando...
                      </>
                    ) : (
                      'Iniciar Simulado'
                    )}
                  </Button>
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

          {filteredSimulados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || selectedArea !== 'all'
                  ? 'Nenhum simulado encontrado com os filtros atuais'
                  : 'Nenhum simulado disponível ainda'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulados.map(simulado => (
                <SimuladoCard key={simulado.id} {...simulado} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SimuladoCard({
  id,
  titulo,
  area,
  qtdQuestoes,
  finalizado,
  dataInicio,
  dataFim,
  respostas
}: Simulado) {
  const router = useRouter()
  const status = getSimuladoStatus({
    finalizado,
    dataInicio,
    dataFim
  })

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
            <span>{new Date(dataInicio).toLocaleString()}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <BookOpen className="w-5 h-5 mr-2" />
            <span>{qtdQuestoes} questões</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <span>{respostas.length} respostas</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          className="w-full"
          variant={status === 'Finalizado' ? 'secondary' : 'default'}
          disabled={status === 'Finalizado'}
          onClick={handleClick}
        >
          {status === 'EmPreparacao'
            ? 'Iniciar'
            : status === 'EmAndamento'
            ? 'Continuar'
            : 'Visualizar Resultado'}
        </Button>
      </CardFooter>
    </Card>
  )
}

function StatusBadge({ status }: { status: 'EmPreparacao' | 'EmAndamento' | 'Finalizado' }) {
  const variants: Record<typeof status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    EmPreparacao: 'destructive',
    EmAndamento: 'default',
    Finalizado: 'secondary'
  }

  return (
    <Badge variant={variants[status]} className="mt-1">
      {status}
    </Badge>
  )
}
