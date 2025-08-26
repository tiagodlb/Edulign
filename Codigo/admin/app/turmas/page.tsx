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
import { useToast } from '@/hooks/use-toast'
import { 
  Search,
  Plus,
  Users,
  FileText,
  BookOpen,
  Settings,
  Eye,
  Edit,
  Trash2,
  School,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  Copy,
  Archive,
  ArchiveRestore,
  UserPlus,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { turmaService, type Turma } from '@/lib/api/turmas'
import { useRouter } from 'next/navigation'

interface TurmaDisplay extends Turma {
  status?: 'ativa' | 'arquivada'
  totalAlunos?: number
  simuladosAtivos?: number
  totalMateriais?: number
  cor?: string
  semestre?: string
  ano?: number
}

export default function TurmasPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [turmas, setTurmas] = useState<TurmaDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSemestre, setSelectedSemestre] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTurma, setEditingTurma] = useState<TurmaDisplay | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form states
  const [createForm, setCreateForm] = useState({
    nome: '',
    descricao: '',
    cor: '#3b82f6'
  })

  const [editForm, setEditForm] = useState({
    nome: '',
    descricao: '',
    ativa: true
  })

  useEffect(() => {
    loadTurmas()
  }, [])

  const loadTurmas = async () => {
    try {
      setIsLoading(true)
      const data = await turmaService.getTurmas()
      
      // Enriquecer dados para display
      const turmasEnriquecidas: TurmaDisplay[] = data.map(turma => ({
        ...turma,
        status: turma.ativa ? 'ativa' : 'arquivada',
        totalAlunos: turma._count?.alunos || 0,
        simuladosAtivos: turma._count?.simulados || 0,
        totalMateriais: turma._count?.materiais || 0,
        cor: getColorByCodigo(turma.codigo),
        semestre: extractSemestre(turma.dataCriacao),
        ano: new Date(turma.dataCriacao).getFullYear()
      }))
      
      setTurmas(turmasEnriquecidas)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
      toast({
        title: 'Erro ao carregar turmas',
        description: 'Não foi possível carregar as turmas. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.nome) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, preencha o nome da turma',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsCreating(true)
      
      const novaTurma = await turmaService.createTurma({
        nome: createForm.nome,
        descricao: createForm.descricao || undefined
      })
      
      toast({
        title: 'Turma criada',
        description: `A turma ${novaTurma.nome} foi criada com sucesso. Código: ${novaTurma.codigo}`
      })
      
      // Copiar código para clipboard
      await navigator.clipboard.writeText(novaTurma.codigo)
      toast({
        title: 'Código copiado!',
        description: `O código ${novaTurma.codigo} foi copiado para a área de transferência`
      })
      
      setIsCreateOpen(false)
      setCreateForm({
        nome: '',
        descricao: '',
        cor: '#3b82f6'
      })
      
      await loadTurmas()
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      toast({
        title: 'Erro ao criar turma',
        description: 'Não foi possível criar a turma. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = async (turma: TurmaDisplay) => {
    setEditingTurma(turma)
    setEditForm({
      nome: turma.nome,
      descricao: turma.descricao || '',
      ativa: turma.ativa
    })
  }

  const handleUpdate = async () => {
    if (!editingTurma) return

    try {
      await turmaService.updateTurma(editingTurma.id, {
        nome: editForm.nome || undefined,
        descricao: editForm.descricao || undefined,
        ativa: editForm.ativa
      })
      
      toast({
        title: 'Turma atualizada',
        description: 'As informações da turma foram atualizadas com sucesso'
      })
      
      setEditingTurma(null)
      await loadTurmas()
    } catch (error) {
      console.error('Erro ao atualizar turma:', error)
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar a turma. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (turmaId: string, turmaNome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a turma "${turmaNome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      setDeletingId(turmaId)
      await turmaService.deleteTurma(turmaId)
      
      toast({
        title: 'Turma excluída',
        description: 'A turma foi excluída com sucesso'
      })
      
      await loadTurmas()
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a turma. Verifique se não há alunos ou materiais vinculados.',
        variant: 'destructive'
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (turma: TurmaDisplay) => {
    const novoStatus = !turma.ativa
    const acao = novoStatus ? 'reativar' : 'arquivar'
    
    try {
      await turmaService.toggleTurmaStatus(turma.id, novoStatus)
      
      toast({
        title: `Turma ${novoStatus ? 'reativada' : 'arquivada'}`,
        description: `A turma ${turma.nome} foi ${novoStatus ? 'reativada' : 'arquivada'} com sucesso`
      })
      
      await loadTurmas()
    } catch (error) {
      console.error(`Erro ao ${acao} turma:`, error)
      toast({
        title: `Erro ao ${acao}`,
        description: `Não foi possível ${acao} a turma. Tente novamente.`,
        variant: 'destructive'
      })
    }
  }

  const copyTurmaCode = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo)
      toast({
        title: 'Código copiado!',
        description: `O código ${codigo} foi copiado para a área de transferência`
      })
    } catch (error) {
      console.error('Erro ao copiar código:', error)
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o código',
        variant: 'destructive'
      })
    }
  }

  const navigateToTurmaDetails = (turmaId: string) => {
    router.push(`/turmas/${turmaId}`)
  }

  // Funções auxiliares
  const getColorByCodigo = (codigo: string): string => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    const hash = codigo.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const extractSemestre = (data: string): string => {
    const date = new Date(data)
    const year = date.getFullYear()
    const month = date.getMonth()
    const semestre = month < 6 ? 1 : 2
    return `${year}.${semestre}`
  }

  const getStatusColor = (status: 'ativa' | 'arquivada') => {
    return status === 'ativa' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }

  const getStatusLabel = (status: 'ativa' | 'arquivada') => {
    return status === 'ativa' ? 'Ativa' : 'Arquivada'
  }

  // Filtrar turmas
  const filteredTurmas = turmas.filter(turma => {
    const matchesSearch = turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (turma.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesStatus = selectedStatus === 'all' || turma.status === selectedStatus
    const matchesSemestre = selectedSemestre === 'all' || turma.semestre === selectedSemestre

    return matchesSearch && matchesStatus && matchesSemestre
  })

  const semestres = [...new Set(turmas.map(t => t.semestre).filter(Boolean))]
  
  // Estatísticas
  const stats = {
    total: turmas.length,
    ativas: turmas.filter(t => t.status === 'ativa').length,
    totalAlunos: turmas.reduce((acc, t) => acc + (t.totalAlunos || 0), 0),
    totalSimulados: turmas.reduce((acc, t) => acc + (t.simuladosAtivos || 0), 0),
    totalMateriais: turmas.reduce((acc, t) => acc + (t.totalMateriais || 0), 0)
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
          <h2 className="text-3xl font-bold tracking-tight">Turmas</h2>
          <p className="text-muted-foreground">
            Gerencie suas turmas e acompanhe o progresso dos alunos
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Turma</DialogTitle>
              <DialogDescription>
                Crie uma nova turma para organizar seus alunos e materiais
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Turma *</Label>
                  <Input
                    id="nome"
                    value={createForm.nome}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Algoritmos e Estrutura de Dados"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={createForm.descricao}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Breve descrição da turma..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cor">Cor da Turma</Label>
                  <div className="flex gap-2 mt-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${createForm.cor === cor ? 'border-gray-800 dark:border-gray-200' : 'border-gray-300 dark:border-gray-600'} transition-all hover:scale-110`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setCreateForm(prev => ({ ...prev, cor }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Turma
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ativas} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlunos}</div>
            <p className="text-xs text-muted-foreground">
              Em todas as turmas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulados Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSimulados}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMateriais}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.ativas / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Turmas ativas
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
                  placeholder="Buscar turmas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativa">Ativas</SelectItem>
                <SelectItem value="arquivada">Arquivadas</SelectItem>
              </SelectContent>
            </Select>

            {semestres.length > 0 && (
              <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Semestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {semestres.map((semestre) => (
                    <SelectItem key={semestre} value={semestre!}>
                      {semestre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Turmas */}
      {filteredTurmas.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTurmas.map((turma) => (
            <Card 
              key={turma.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateToTurmaDetails(turma.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: turma.cor }}
                  />
                  <Badge className={getStatusColor(turma.status!)}>
                    {getStatusLabel(turma.status!)}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{turma.nome}</CardTitle>
                {turma.descricao && (
                  <CardDescription className="line-clamp-2">
                    {turma.descricao}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                    {turma.codigo}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyTurmaCode(turma.codigo)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-bold">{turma.totalAlunos}</p>
                    <p className="text-xs text-muted-foreground">Alunos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{turma.simuladosAtivos}</p>
                    <p className="text-xs text-muted-foreground">Simulados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{turma.totalMateriais}</p>
                    <p className="text-xs text-muted-foreground">Materiais</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(turma.dataCriacao).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {turma.semestre && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {turma.semestre}
                    </span>
                  )}
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigateToTurmaDetails(turma.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(turma)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(turma)}
                  >
                    {turma.ativa ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <ArchiveRestore className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {turma._count?.alunos === 0 && turma._count?.materiais === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(turma.id, turma.nome)}
                      disabled={deletingId === turma.id}
                    >
                      {deletingId === turma.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {turmas.length === 0 ? (
              <>
                <School className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma turma cadastrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie sua primeira turma para começar a organizar seus alunos e conteúdos.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Turma
                </Button>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
                <p className="text-muted-foreground text-center">
                  Tente ajustar os filtros de busca ou crie uma nova turma.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Edição */}
      <Dialog open={!!editingTurma} onOpenChange={() => setEditingTurma(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
            <DialogDescription>
              Atualize as informações da turma
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome</Label>
              <Input
                id="edit-nome"
                value={editForm.nome}
                onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={editForm.descricao}
                onChange={(e) => setEditForm(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-ativa"
                checked={editForm.ativa}
                onChange={(e) => setEditForm(prev => ({ ...prev, ativa: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-ativa">Turma ativa</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingTurma(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}