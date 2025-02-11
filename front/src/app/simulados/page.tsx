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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AreaAvaliacao } from '@/types'
import { SiteHeader } from '@/components/layout/site-header'
import { useToast } from '@/hooks/use-toast'
import StudentService from '@/lib/api/student'
import { getSimuladoStatus } from '@/utils/simulado'

interface Alternativa {
  id: string
  texto: string
  correta: boolean
  justificativa: string
  questaoId: string
}

interface Questao {
  id: string
  enunciado: string
  comando: string
  alternativas: Alternativa[]
  area: string
  tipo: string
  nivel: string
  topicos: string[]
  competencias: string[]
  referencias: string[]
  dataCriacao: string
}

interface Simulado {
  id: string
  titulo: string
  tipo: 'NORMAL' | 'ENADE_AI'
  area: string
  tempoLimite: number
  qtdQuestoes: number
  dataInicio: string
  dataFim: string | null
  finalizado: boolean
  questoes: Questao[]
  respostas: Array<{
    id: string
    alunoId: string
    questaoId: string
    alternativaId: string
    correta: boolean
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
  const [activeTab, setActiveTab] = useState('normal')
  const [formData, setFormData] = useState({
    normal: {
      area: '',
      questoes: ''
    },
    enade: {
      area: '',
      subjects: [''],
      numberOfQuestions: ''
    }
  })

  const { toast } = useToast()

  useEffect(() => {
    loadSimulados()
  }, [])

  const loadSimulados = async () => {
    try {
      const response = await StudentService.getSimulados()
      if (response.success) {
        setSimulados(response.data)
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
    if (activeTab === 'normal') {
      if (!formData.normal.area || !formData.normal.questoes) {
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
          knowledgeArea: formData.normal.area as AreaAvaliacao,
          numberOfQuestions: Number.parseInt(formData.normal.questoes)
        })

        toast({
          title: 'Simulado criado!',
          description: 'Seu simulado foi criado com sucesso'
        })

        await loadSimulados()
        setFormData(prev => ({ ...prev, normal: { area: '', questoes: '' } }))
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar simulado',
          description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
        })
      } finally {
        setIsCreating(false)
      }
    } else {
      if (
        !formData.enade.area ||
        !formData.enade.subjects[0] ||
        !formData.enade.numberOfQuestions
      ) {
        toast({
          variant: 'destructive',
          title: 'Campos obrigatórios',
          description: 'Preencha todos os campos para criar o simulado ENADE'
        })
        return
      }

      setIsCreating(true)
      try {
        await StudentService.createAiSimulado({
          area: formData.enade.area as AreaAvaliacao,
          subjects: formData.enade.subjects,
          numberOfQuestions: Number.parseInt(formData.enade.numberOfQuestions)
        })

        toast({
          title: 'Simulado ENADE criado!',
          description: 'Seu simulado ENADE foi criado com sucesso'
        })

        await loadSimulados()
        setFormData(prev => ({
          ...prev,
          enade: { area: '', subjects: [''], numberOfQuestions: '' }
        }))
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar simulado ENADE',
          description: error instanceof Error ? error.message : 'Tente novamente mais tarde'
        })
      } finally {
        setIsCreating(false)
      }
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
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="normal">Normal</TabsTrigger>
                    <TabsTrigger value="enade">ENADE (IA)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="normal">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="area" className="text-right">
                          Área
                        </Label>
                        <Select
                          value={formData.normal.area}
                          onValueChange={value =>
                            setFormData(prev => ({
                              ...prev,
                              normal: { ...prev.normal, area: value }
                            }))
                          }
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
                          value={formData.normal.questoes}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              normal: { ...prev.normal, questoes: e.target.value }
                            }))
                          }
                          min="1"
                          max="50"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="enade">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="enade-area" className="text-right">
                          Área
                        </Label>
                        <Select
                          value={formData.enade.area}
                          onValueChange={value =>
                            setFormData(prev => ({
                              ...prev,
                              enade: { ...prev.enade, area: value }
                            }))
                          }
                        >
                          <SelectTrigger id="enade-area" className="col-span-3">
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
                        <Label htmlFor="subjects" className="text-right">
                          Assuntos
                        </Label>
                        <Input
                          id="subjects"
                          className="col-span-3"
                          placeholder="Ex: Algoritmos, Estruturas de Dados"
                          value={formData.enade.subjects.join(', ')}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              enade: {
                                ...prev.enade,
                                subjects: e.target.value.split(',').map(s => s.trim())
                              }
                            }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="enade-questoes" className="text-right">
                          Questões
                        </Label>
                        <Input
                          id="enade-questoes"
                          type="number"
                          className="col-span-3"
                          placeholder="Número de questões"
                          value={formData.enade.numberOfQuestions}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              enade: { ...prev.enade, numberOfQuestions: e.target.value }
                            }))
                          }
                          min="5"
                          max="30"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
  tipo,
  area,
  tempoLimite,
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

  // Calculate progress
  const progress = (respostas.length / qtdQuestoes) * 100
  const correctAnswers = respostas.filter(r => r.correta).length

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-grow pt-6 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-semibold leading-none">{titulo}</h3>
            <div className="flex items-center gap-2 shrink-0">
              {tipo === 'ENADE_AI' && (
                <Badge variant="secondary" className="px-2 py-0.5 text-xs font-medium">
                  IA
                </Badge>
              )}
              <StatusBadge status={status} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{area}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 shrink-0" />
            <span>
              {new Date(dataInicio).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 mr-2 shrink-0" />
            <span>
              {qtdQuestoes} questões • {tempoLimite} min
            </span>
          </div>
          {respostas.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso</span>
                <span>
                  {respostas.length}/{qtdQuestoes} ({Math.round(progress)}%)
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {finalizado && (
                <div className="text-sm text-muted-foreground">
                  Acertos: {correctAnswers} de {qtdQuestoes} (
                  {Math.round((correctAnswers / qtdQuestoes) * 100)}%)
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          className="w-full"
          variant={status === 'Finalizado' ? 'secondary' : 'default'}
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
    EmPreparacao: 'default',
    EmAndamento: 'default',
    Finalizado: 'secondary'
  }

  const labels: Record<typeof status, string> = {
    EmPreparacao: 'Não iniciado',
    EmAndamento: 'Em andamento',
    Finalizado: 'Finalizado'
  }

  return (
    <Badge variant={variants[status]} className="mt-1">
      {labels[status]}
    </Badge>
  )
}
