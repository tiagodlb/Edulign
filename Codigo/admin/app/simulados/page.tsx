'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search,
  Plus,
  FileText,
  Clock,
  Users,
  PlayCircle,
  PauseCircle,
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Timer,
  Target,
  BookOpen,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

interface Simulado {
  id: string
  titulo: string
  descricao: string
  turma: {
    id: string
    nome: string
    codigo: string
  }
  professor: {
    id: string
    nome: string
  }
  status: 'rascunho' | 'ativo' | 'finalizado' | 'agendado'
  tipo: 'prova' | 'exercicio' | 'quiz' | 'avaliacao'
  totalQuestoes: number
  duracaoMinutos: number
  dataInicio?: string
  dataFim?: string
  dataCriacao: string
  tentativasPermitidas: number
  totalParticipantes: number
  mediaNotas: number
  configuracoes: {
    embaralharQuestoes: boolean
    mostrarResultado: boolean
    permitirRevisao: boolean
  }
}

interface Turma {
  id: string
  nome: string
  codigo: string
}

export default function SimuladosPage() {
  const { user } = useAuth()
  const [simulados, setSimulados] = useState<Simulado[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedTipo, setSelectedTipo] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [createForm, setCreateForm] = useState({
    titulo: '',
    descricao: '',
    turmaId: '',
    tipo: 'prova' as Simulado['tipo'],
    duracaoMinutos: 60,
    tentativasPermitidas: 1,
    dataInicio: '',
    dataFim: '',
    embaralharQuestoes: true,
    mostrarResultado: true,
    permitirRevisao: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const mockSimulados: Simulado[] = [
        {
          id: '1',
          titulo: 'Prova P1 - Algoritmos',
          descricao: 'Avaliação sobre conceitos fundamentais de algoritmos e estruturas de dados',
          turma: { id: '1', nome: 'Algoritmos e Estrutura de Dados', codigo: 'AED2024' },
          professor: { id: '1', nome: 'Prof. João Silva' },
          status: 'ativo',
          tipo: 'prova',
          totalQuestoes: 15,
          duracaoMinutos: 90,
          dataInicio: '2024-02-10T08:00:00',
          dataFim: '2024-02-10T18:00:00',
          dataCriacao: '2024-02-08T10:30:00',
          tentativasPermitidas: 1,
          totalParticipantes: 28,
          mediaNotas: 7.5,
          configuracoes: {
            embaralharQuestoes: true,
            mostrarResultado: false,
            permitirRevisao: true
          }
        },
        {
          id: '2',
          titulo: 'Quiz - Estruturas Condicionais',
          descricao: 'Exercícios rápidos sobre if, else e switch case',
          turma: { id: '1', nome: 'Algoritmos e Estrutura de Dados', codigo: 'AED2024' },
          professor: { id: '1', nome: 'Prof. João Silva' },
          status: 'finalizado',
          tipo: 'quiz',
          totalQuestoes: 8,
          duracaoMinutos: 30,
          dataInicio: '2024-02-05T14:00:00',
          dataFim: '2024-02-05T16:00:00',
          dataCriacao: '2024-02-04T16:45:00',
          tentativasPermitidas: 2,
          totalParticipantes: 26,
          mediaNotas: 8.2,
          configuracoes: {
            embaralharQuestoes: true,
            mostrarResultado: true,
            permitirRevisao: true
          }
        },
        {
          id: '3',
          titulo: 'Avaliação - Engenharia de Software',
          descricao: 'Prova sobre metodologias ágeis e ciclo de vida do software',
          turma: { id: '2', nome: 'Engenharia de Software - 2024.2', codigo: 'ENG2024' },
          professor: { id: '1', nome: 'Prof. João Silva' },
          status: 'agendado',
          tipo: 'avaliacao',
          totalQuestoes: 20,
          duracaoMinutos: 120,
          dataInicio: '2024-02-15T08:00:00',
          dataFim: '2024-02-15T18:00:00',
          dataCriacao: '2024-02-07T14:15:00',
          tentativasPermitidas: 1,
          totalParticipantes: 0,
          mediaNotas: 0,
          configuracoes: {
            embaralharQuestoes: false,
            mostrarResultado: false,
            permitirRevisao: false
          }
        },
        {
          id: '4',
          titulo: 'Exercícios - Loops e Funções',
          descricao: 'Práticas sobre estruturas de repetição e funções',
          turma: { id: '2', nome: 'Engenharia de Software - 2024.2', codigo: 'ENG2024' },
          professor: { id: '1', nome: 'Prof. João Silva' },
          status: 'rascunho',
          tipo: 'exercicio',
          totalQuestoes: 12,
          duracaoMinutos: 45,
          dataCriacao: '2024-02-08T11:00:00',
          tentativasPermitidas: 3,
          totalParticipantes: 0,
          mediaNotas: 0,
          configuracoes: {
            embaralharQuestoes: true,
            mostrarResultado: true,
            permitirRevisao: true
          }
        }
      ]

      const mockTurmas: Turma[] = [
        { id: '1', nome: 'Algoritmos e Estrutura de Dados', codigo: 'AED2024' },
        { id: '2', nome: 'Engenharia de Software - 2024.2', codigo: 'ENG2024' },
        { id: '3', nome: 'Banco de Dados Avançado', codigo: 'BDA2024' }
      ]

      setSimulados(mockSimulados)
      setTurmas(mockTurmas)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Simulado['status']) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'agendado': return 'bg-blue-100 text-blue-800'
      case 'finalizado': return 'bg-gray-100 text-gray-800'
      case 'rascunho': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Simulado['status']) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'agendado': return 'Agendado'
      case 'finalizado': return 'Finalizado'
      case 'rascunho': return 'Rascunho'
      default: return status
    }
  }

  const getTipoIcon = (tipo: Simulado['tipo']) => {
    switch (tipo) {
      case 'prova': return <FileText className="h-4 w-4" />
      case 'quiz': return <Target className="h-4 w-4" />
      case 'exercicio': return <BookOpen className="h-4 w-4" />
      case 'avaliacao': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredSimulados = simulados.filter(simulado => {
    const matchesSearch = simulado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         simulado.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTurma = selectedTurma === 'all' || simulado.turma.id === selectedTurma
    const matchesStatus = selectedStatus === 'all' || simulado.status === selectedStatus
    const matchesTipo = selectedTipo === 'all' || simulado.tipo === selectedTipo

    return matchesSearch && matchesTurma && matchesStatus && matchesTipo
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.titulo || !createForm.turmaId) {
      alert('Por favor, preencha os campos obrigatórios')
      return
    }

    try {
      console.log('Creating simulado:', createForm)
      
      setIsCreateOpen(false)
      setCreateForm({
        titulo: '',
        descricao: '',
        turmaId: '',
        tipo: 'prova',
        duracaoMinutos: 60,
        tentativasPermitidas: 1,
        dataInicio: '',
        dataFim: '',
        embaralharQuestoes: true,
        mostrarResultado: true,
        permitirRevisao: false
      })
      
      await loadData()
    } catch (error) {
      console.error('Erro ao criar simulado:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Simulados</h2>
          <p className="text-muted-foreground">
            Gerencie provas, quizzes e exercícios para suas turmas
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Simulado</DialogTitle>
              <DialogDescription>
                Configure um novo simulado para sua turma
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={createForm.titulo}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Prova P1 - Algoritmos"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={createForm.descricao}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Breve descrição do simulado..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="turma">Turma *</Label>
                    <Select 
                      value={createForm.turmaId} 
                      onValueChange={(value) => setCreateForm(prev => ({ ...prev, turmaId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.nome} ({turma.codigo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select 
                      value={createForm.tipo} 
                      onValueChange={(value: Simulado['tipo']) => setCreateForm(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="exercicio">Exercício</SelectItem>
                        <SelectItem value="avaliacao">Avaliação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duracao">Duração (minutos)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      value={createForm.duracaoMinutos}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, duracaoMinutos: parseInt(e.target.value) }))}
                      min="5"
                      max="300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tentativas">Tentativas Permitidas</Label>
                    <Input
                      id="tentativas"
                      type="number"
                      value={createForm.tentativasPermitidas}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, tentativasPermitidas: parseInt(e.target.value) }))}
                      min="1"
                      max="5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data/Hora Início</Label>
                    <Input
                      id="dataInicio"
                      type="datetime-local"
                      value={createForm.dataInicio}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, dataInicio: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataFim">Data/Hora Fim</Label>
                    <Input
                      id="dataFim"
                      type="datetime-local"
                      value={createForm.dataFim}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, dataFim: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Configurações</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={createForm.embaralharQuestoes}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, embaralharQuestoes: e.target.checked }))}
                      />
                      <span className="text-sm">Embaralhar questões</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={createForm.mostrarResultado}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, mostrarResultado: e.target.checked }))}
                      />
                      <span className="text-sm">Mostrar resultado imediatamente</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={createForm.permitirRevisao}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, permitirRevisao: e.target.checked }))}
                      />
                      <span className="text-sm">Permitir revisão após finalização</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Simulado
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Simulados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulados.length}</div>
            <p className="text-xs text-muted-foreground">
              {simulados.filter(s => s.status === 'ativo').length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulados.reduce((acc, s) => acc + s.totalParticipantes, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de participações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(simulados.filter(s => s.mediaNotas > 0).reduce((acc, s) => acc + s.mediaNotas, 0) / 
                simulados.filter(s => s.mediaNotas > 0).length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Notas dos simulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulados.filter(s => s.status === 'agendado').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Para os próximos dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar simulados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todas as turmas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="agendado">Agendados</SelectItem>
                <SelectItem value="finalizado">Finalizados</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="prova">Provas</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
                <SelectItem value="exercicio">Exercícios</SelectItem>
                <SelectItem value="avaliacao">Avaliações</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Simulados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSimulados.map((simulado) => (
          <Card key={simulado.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTipoIcon(simulado.tipo)}
                  <span className="text-sm text-muted-foreground capitalize">{simulado.tipo}</span>
                </div>
                <Badge className={getStatusColor(simulado.status)}>
                  {getStatusLabel(simulado.status)}
                </Badge>
              </div>
              <CardTitle className="text-lg">{simulado.titulo}</CardTitle>
              <CardDescription className="line-clamp-2">
                {simulado.descricao}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{simulado.turma.codigo}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{simulado.totalQuestoes}</div>
                  <div className="text-xs text-muted-foreground">Questões</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{simulado.duracaoMinutos}min</div>
                  <div className="text-xs text-muted-foreground">Duração</div>
                </div>
              </div>

              {simulado.status !== 'rascunho' && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-600">{simulado.totalParticipantes}</div>
                    <div className="text-xs text-muted-foreground">Participantes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{simulado.mediaNotas.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Média</div>
                  </div>
                </div>
              )}

              {(simulado.dataInicio || simulado.dataFim) && (
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {simulado.dataInicio && new Date(simulado.dataInicio).toLocaleDateString('pt-BR')}
                  </div>
                  {simulado.dataInicio && simulado.dataFim && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(simulado.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(simulado.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/simulados/${simulado.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    {simulado.status === 'rascunho' ? 'Editar' : 'Ver Detalhes'}
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSimulados.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum simulado encontrado</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedTurma !== 'all' || selectedStatus !== 'all' || selectedTipo !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro simulado'
              }
            </p>
            {!searchTerm && selectedTurma === 'all' && selectedStatus === 'all' && selectedTipo === 'all' && (
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Simulado
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}