'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Filter,
  FileText,
  Calendar,
  Tag,
  BookOpen,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Download,
  Upload,
  Eye
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { adminService, type Question, type PaginatedResponse } from '@/lib/api/admin'

const areas = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Física',
  'Química',
  'Biologia',
  'Inglês',
  'Filosofia',
  'Sociologia',
  'Educação Física',
  'Artes',
  'Informática',
  'Administração',
  'Direito',
  'Economia',
  'Engenharia',
  'Medicina',
  'Psicologia',
  'Arquitetura'
]

const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)
const niveis = [
  { value: 'FACIL', label: 'Fácil' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'DIFICIL', label: 'Difícil' }
]

export default function QuestoesPage() {
  // Estados principais
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 10
  })

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    area: '',
    ano: '',
    type: 'all'
  })

  // Estados de modais
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  // Estados do formulário
  const [formData, setFormData] = useState({
    enunciado: '',
    comando: '',
    alternativas: ['', '', '', '', ''],
    respostaCorreta: 0,
    area: '',
    ano: new Date().getFullYear(),
    tipo: 'CUSTOM',
    nivel: 'MEDIO'
  })

  const { toast } = useToast()

  // Carregar questões
  useEffect(() => {
    loadQuestions()
  }, [filters, pagination.currentPage])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const response = await adminService.getQuestions({
        page: pagination.currentPage,
        limit: pagination.perPage,
        ...filters,
        ano: filters.ano ? parseInt(filters.ano) : undefined
      })

      setQuestions(response.data)
      setPagination(response.pagination)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar questões',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handlers do formulário
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAlternativaChange = (index: number, value: string) => {
    const newAlternativas = [...formData.alternativas]
    newAlternativas[index] = value
    setFormData(prev => ({ ...prev, alternativas: newAlternativas }))
  }

  const addAlternativa = () => {
    if (formData.alternativas.length < 10) {
      setFormData(prev => ({
        ...prev,
        alternativas: [...prev.alternativas, '']
      }))
    }
  }

  const removeAlternativa = (index: number) => {
    if (formData.alternativas.length > 2) {
      const newAlternativas = formData.alternativas.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        alternativas: newAlternativas,
        respostaCorreta: prev.respostaCorreta >= newAlternativas.length ? 0 : prev.respostaCorreta
      }))
    }
  }

  // CRUD Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.enunciado || !formData.area) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      })
      return
    }

    const validAlternativas = formData.alternativas.filter(alt => alt.trim() !== '')
    if (validAlternativas.length < 2) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos 2 alternativas',
        variant: 'destructive'
      })
      return
    }

    try {
      const questionData = {
        ...formData,
        alternativas: validAlternativas
      }

      if (editingQuestion) {
        await adminService.updateQuestion(editingQuestion.id, questionData)
        toast({
          title: 'Sucesso',
          description: 'Questão atualizada com sucesso'
        })
      } else {
        await adminService.createQuestion(questionData)
        toast({
          title: 'Sucesso',
          description: 'Questão criada com sucesso'
        })
      }

      resetForm()
      loadQuestions()
      setIsCreateDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: editingQuestion ? 'Falha ao atualizar questão' : 'Falha ao criar questão',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      enunciado: question.enunciado,
      comando: question.comando || '',
      alternativas: question.alternativas.map(alt => alt.texto),
      respostaCorreta: question.respostaCorreta,
      area: question.area,
      ano: question.ano,
      tipo: question.tipo,
      nivel: question.nivel
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteQuestion(id)
      toast({
        title: 'Sucesso',
        description: 'Questão excluída com sucesso'
      })
      loadQuestions()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir questão',
        variant: 'destructive'
      })
    }
    setQuestionToDelete(null)
  }

  const resetForm = () => {
    setFormData({
      enunciado: '',
      comando: '',
      alternativas: ['', '', '', '', ''],
      respostaCorreta: 0,
      area: '',
      ano: new Date().getFullYear(),
      tipo: 'CUSTOM',
      nivel: 'MEDIO'
    })
    setEditingQuestion(null)
  }

  // Handlers de filtros
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      area: '',
      ano: '',
      type: 'all'
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Questões</h1>
          <p className="text-muted-foreground">
            Gerencie o banco de questões do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Questão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Editar Questão' : 'Nova Questão'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os campos abaixo para {editingQuestion ? 'editar' : 'criar'} uma questão
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor="area">Área *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => handleInputChange('area', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map(area => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ano">Ano *</Label>
                    <Select
                      value={formData.ano.toString()}
                      onValueChange={(value) => handleInputChange('ano', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {anos.map(ano => (
                          <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nivel">Nível de Dificuldade</Label>
                    <Select
                      value={formData.nivel}
                      onValueChange={(value) => handleInputChange('nivel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {niveis.map(nivel => (
                          <SelectItem key={nivel.value} value={nivel.value}>
                            {nivel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="enunciado">Enunciado *</Label>
                  <Textarea
                    id="enunciado"
                    placeholder="Digite o enunciado da questão..."
                    value={formData.enunciado}
                    onChange={(e) => handleInputChange('enunciado', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="comando">Comando da Questão</Label>
                  <Input
                    id="comando"
                    placeholder="Ex: Assinale a alternativa correta"
                    value={formData.comando}
                    onChange={(e) => handleInputChange('comando', e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Alternativas *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAlternativa}
                      disabled={formData.alternativas.length >= 10}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.alternativas.map((alternativa, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="resposta-correta"
                            checked={formData.respostaCorreta === index}
                            onChange={() => handleInputChange('respostaCorreta', index)}
                            className="w-4 h-4 text-primary"
                          />
                          <Label className="font-medium">
                            {String.fromCharCode(65 + index)})
                          </Label>
                        </div>
                        <Input
                          placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                          value={alternativa}
                          onChange={(e) => handleAlternativaChange(index, e.target.value)}
                          className="flex-1"
                        />
                        {formData.alternativas.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAlternativa(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setIsCreateDialogOpen(false)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingQuestion ? 'Atualizar' : 'Criar'} Questão
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar no enunciado..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filter-area">Área</Label>
              <Select
                value={filters.area}
                onValueChange={(value) => handleFilterChange('area', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as áreas</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filter-ano">Ano</Label>
              <Select
                value={filters.ano}
                onValueChange={(value) => handleFilterChange('ano', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os anos</SelectItem>
                  {anos.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Questões */}
      <Card>
        <CardHeader>
          <CardTitle>
            Questões ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Nenhuma questão encontrada</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comece criando uma nova questão.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{question.area}</Badge>
                          <Badge variant="outline">{question.ano}</Badge>
                          <Badge 
                            variant={question.nivel === 'FACIL' ? 'default' : 
                                   question.nivel === 'MEDIO' ? 'secondary' : 'destructive'}
                          >
                            {question.nivel === 'FACIL' ? 'Fácil' : 
                             question.nivel === 'MEDIO' ? 'Médio' : 'Difícil'}
                          </Badge>
                          <Badge variant="outline">
                            {question.tipo === 'ENADE' ? 'ENADE' : 'Personalizada'}
                          </Badge>
                        </div>
                        
                        <h4 className="font-medium mb-2 line-clamp-2">
                          {question.enunciado}
                        </h4>
                        
                        <p className="text-sm text-muted-foreground">
                          {question.alternativas.length} alternativas • 
                          Resposta correta: {String.fromCharCode(65 + question.respostaCorreta)}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(question)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQuestionToDelete(question.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {pagination.currentPage} de {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!questionToDelete} onOpenChange={() => setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A questão será removida permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => questionToDelete && handleDelete(questionToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}