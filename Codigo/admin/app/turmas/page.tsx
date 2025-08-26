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
  Copy
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

interface Turma {
  id: string
  nome: string
  codigo: string
  descricao: string
  professor: {
    id: string
    nome: string
  }
  totalAlunos: number
  simuladosAtivos: number
  totalMateriais: number
  dataCriacao: string
  status: 'ativa' | 'arquivada' | 'rascunho'
  cor: string
  semestre: string
  ano: number
}

export default function TurmasPage() {
  const { user } = useAuth()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSemestre, setSelectedSemestre] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Form states
  const [createForm, setCreateForm] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    semestre: '',
    ano: new Date().getFullYear(),
    cor: '#3b82f6'
  })

  useEffect(() => {
    loadTurmas()
  }, [])

  const loadTurmas = async () => {
    try {
      // Simular dados
      const mockTurmas: Turma[] = [
        {
          id: '1',
          nome: 'Engenharia de Software - 2024.2',
          codigo: 'ENG2024',
          descricao: 'Disciplina focada em metodologias ágeis e desenvolvimento de software',
          professor: { id: '1', nome: 'Prof. João Silva' },
          totalAlunos: 32,
          simuladosAtivos: 2,
          totalMateriais: 15,
          dataCriacao: '2024-01-15T10:00:00',
          status: 'ativa',
          cor: '#3b82f6',
          semestre: '2024.2',
          ano: 2024
        },
        {
          id: '2',
          nome: 'Algoritmos e Estrutura de Dados',
          codigo: 'AED2024',
          descricao: 'Fundamentos de algoritmos, estruturas de dados e complexidade',
          professor: { id: '1', nome: 'Prof. João Silva' },
          totalAlunos: 28,
          simuladosAtivos: 1,
          totalMateriais: 22,
          dataCriacao: '2024-01-15T10:00:00',
          status: 'ativa',
          cor: '#10b981',
          semestre: '2024.2',
          ano: 2024
        },
        {
          id: '3',
          nome: 'Banco de Dados Avançado',
          codigo: 'BDA2024',
          descricao: 'Técnicas avançadas em bancos de dados relacionais e NoSQL',
          professor: { id: '1', nome: 'Prof. João Silva' },
          totalAlunos: 27,
          simuladosAtivos: 0,
          totalMateriais: 8,
          dataCriacao: '2024-01-15T10:00:00',
          status: 'ativa',
          cor: '#f59e0b',
          semestre: '2024.2',
          ano: 2024
        },
        {
          id: '4',
          nome: 'Programação Web - 2024.1',
          codigo: 'WEB2024',
          descricao: 'Desenvolvimento de aplicações web modernas',
          professor: { id: '1', nome: 'Prof. João Silva' },
          totalAlunos: 35,
          simuladosAtivos: 0,
          totalMateriais: 30,
          dataCriacao: '2023-08-15T10:00:00',
          status: 'arquivada',
          cor: '#8b5cf6',
          semestre: '2024.1',
          ano: 2024
        }
      ]

      setTurmas(mockTurmas)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Turma['status']) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800'
      case 'arquivada':
        return 'bg-gray-100 text-gray-800'
      case 'rascunho':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Turma['status']) => {
    switch (status) {
      case 'ativa':
        return 'Ativa'
      case 'arquivada':
        return 'Arquivada'
      case 'rascunho':
        return 'Rascunho'
      default:
        return status
    }
  }

  const filteredTurmas = turmas.filter(turma => {
    const matchesSearch = turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         turma.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || turma.status === selectedStatus
    const matchesSemestre = selectedSemestre === 'all' || turma.semestre === selectedSemestre

    return matchesSearch && matchesStatus && matchesSemestre
  })

  const semestres = [...new Set(turmas.map(t => t.semestre))]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.nome || !createForm.codigo) {
      alert('Por favor, preencha os campos obrigatórios')
      return
    }

    try {
      // Aqui você faria a criação real
      console.log('Creating turma:', createForm)
      
      setIsCreateOpen(false)
      setCreateForm({
        nome: '',
        codigo: '',
        descricao: '',
        semestre: '',
        ano: new Date().getFullYear(),
        cor: '#3b82f6'
      })
      
      await loadTurmas()
    } catch (error) {
      console.error('Erro ao criar turma:', error)
    }
  }

  const copyTurmaCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo)
    // Aqui você poderia mostrar um toast de sucesso
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
                  <Label htmlFor="codigo">Código da Turma *</Label>
                  <Input
                    id="codigo"
                    value={createForm.codigo}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                    placeholder="Ex: AED2024"
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semestre">Semestre</Label>
                    <Input
                      id="semestre"
                      value={createForm.semestre}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, semestre: e.target.value }))}
                      placeholder="Ex: 2024.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ano">Ano</Label>
                    <Input
                      id="ano"
                      type="number"
                      value={createForm.ano}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cor">Cor da Turma</Label>
                  <div className="flex gap-2 mt-2">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${createForm.cor === cor ? 'border-gray-400' : 'border-gray-200'}`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setCreateForm(prev => ({ ...prev, cor }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Turma
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
            <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turmas.length}</div>
            <p className="text-xs text-muted-foreground">
              {turmas.filter(t => t.status === 'ativa').length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {turmas.reduce((acc, turma) => acc + turma.totalAlunos, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulados Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {turmas.reduce((acc, turma) => acc + turma.simuladosAtivos, 0)}
            </div>
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
            <div className="text-2xl font-bold">
              {turmas.reduce((acc, turma) => acc + turma.totalMateriais, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponíveis
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
                <SelectItem value="rascunho">Rascunho</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Semestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {semestres.map((semestre) => (
                  <SelectItem key={semestre} value={semestre}>
                    {semestre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Turmas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTurmas.map((turma) => (
          <Card key={turma.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: turma.cor }}
                />
                <Badge className={getStatusColor(turma.status)}>
                  {getStatusLabel(turma.status)}
                </Badge>
              </div>
              <CardTitle className="text-lg">{turma.nome}</CardTitle>
              <CardDescription className="line-clamp-2">
                {turma.descricao}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{turma.codigo}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyTurmaCode(turma.codigo)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{turma.totalAlunos}</div>
                  <div className="text-xs text-muted-foreground">Alunos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{turma.simuladosAtivos}</div>
                  <div className="text-xs text-muted-foreground">Simulados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{turma.totalMateriais}</div>
                  <div className="text-xs text-muted-foreground">Materiais</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Criada em {new Date(turma.dataCriacao).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/turmas/${turma.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTurmas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <School className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedStatus !== 'all' || selectedSemestre !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira turma'
              }
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedSemestre === 'all' && (
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Turma
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}