'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  Eye,
  Edit3,
  Check,
  X,
  Filter,
  RotateCcw,
  Zap,
  Brain,
  HelpCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

import { adminService, type AIResponse, type PaginatedResponse } from '@/lib/api/admin'

const priorityColors = {
  HIGH: 'destructive',
  MEDIUM: 'default',
  LOW: 'secondary'
} as const

const priorityLabels = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa'
}

const typeLabels = {
  QUESTION: 'Questão',
  EXPLANATION: 'Explicação',
  HINT: 'Dica'
}

const typeIcons = {
  QUESTION: MessageSquare,
  EXPLANATION: Brain,
  HINT: HelpCircle
}

export default function RevisaoIAPage() {
  // Estados principais
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 10
  })

  // Estados de filtros
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all'
  })

  // Estados de revisão
  const [reviewingResponse, setReviewingResponse] = useState<AIResponse | null>(null)
  const [reviewForm, setReviewForm] = useState({
    revisedResponse: '',
    feedback: '',
    approved: true
  })

  // Estados de seleção múltipla
  const [selectedResponses, setSelectedResponses] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | ''>('')
  const [bulkFeedback, setBulkFeedback] = useState('')

  // Estados de visualização
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set())

  const { toast } = useToast()

  // Carregar respostas pendentes
  useEffect(() => {
    loadPendingResponses()
  }, [filters, pagination.currentPage])

  const loadPendingResponses = async () => {
    try {
      setLoading(true)
      const response = await adminService.getPendingResponses({
        page: pagination.currentPage,
        limit: pagination.perPage,
        ...filters,
        type: filters.type !== 'all' ? filters.type : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined
      })

      setResponses(response.data)
      setPagination(response.pagination)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar respostas pendentes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handlers de revisão
  const openReviewDialog = (response: AIResponse) => {
    setReviewingResponse(response)
    setReviewForm({
      revisedResponse: response.originalResponse,
      feedback: '',
      approved: true
    })
  }

  const handleReview = async () => {
    if (!reviewingResponse) return

    try {
      await adminService.reviewResponse({
        responseId: reviewingResponse.id,
        revisedResponse: reviewForm.revisedResponse,
        feedback: reviewForm.feedback,
        approved: reviewForm.approved
      })

      toast({
        title: 'Sucesso',
        description: `Resposta ${reviewForm.approved ? 'aprovada' : 'rejeitada'} com sucesso`
      })

      setReviewingResponse(null)
      loadPendingResponses()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao revisar resposta',
        variant: 'destructive'
      })
    }
  }

  // Handlers de seleção múltipla
  const toggleResponseSelection = (responseId: string) => {
    setSelectedResponses(prev => 
      prev.includes(responseId)
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    )
  }

  const selectAllResponses = (checked: boolean) => {
    setSelectedResponses(checked ? responses.map(r => r.id) : [])
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedResponses.length === 0) return

    try {
      await adminService.bulkApproveResponses({
        responseIds: selectedResponses,
        approved: bulkAction === 'approve',
        feedback: bulkFeedback
      })

      toast({
        title: 'Sucesso',
        description: `${selectedResponses.length} respostas ${bulkAction === 'approve' ? 'aprovadas' : 'rejeitadas'} com sucesso`
      })

      setSelectedResponses([])
      setBulkAction('')
      setBulkFeedback('')
      loadPendingResponses()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao processar respostas em lote',
        variant: 'destructive'
      })
    }
  }

  // Handlers de visualização
  const toggleResponseExpansion = (responseId: string) => {
    setExpandedResponses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(responseId)) {
        newSet.delete(responseId)
      } else {
        newSet.add(responseId)
      }
      return newSet
    })
  }

  // Handlers de filtros
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      type: 'all',
      priority: 'all'
    })
  }

  // Estatísticas rápidas
  const stats = {
    total: pagination.total,
    highPriority: responses.filter(r => r.priority === 'HIGH').length,
    questions: responses.filter(r => r.type === 'QUESTION').length,
    explanations: responses.filter(r => r.type === 'EXPLANATION').length
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revisão de Respostas IA</h1>
          <p className="text-muted-foreground">
            Analise e aprove respostas geradas pela inteligência artificial
          </p>
        </div>
        <Button onClick={loadPendingResponses} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendente</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-destructive">{stats.highPriority}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Questões</p>
                <p className="text-2xl font-bold">{stats.questions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Explicações</p>
                <p className="text-2xl font-bold">{stats.explanations}</p>
              </div>
              <Brain className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações em Lote */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="filters">Filtros</TabsTrigger>
              <TabsTrigger value="bulk">Ações em Lote</TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-type">Tipo de Resposta</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="QUESTION">Questões</SelectItem>
                      <SelectItem value="EXPLANATION">Explicações</SelectItem>
                      <SelectItem value="HINT">Dicas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-priority">Prioridade</Label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => handleFilterChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as prioridades</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="MEDIUM">Média</SelectItem>
                      <SelectItem value="LOW">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bulk">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedResponses.length === responses.length && responses.length > 0}
                    onCheckedChange={selectAllResponses}
                  />
                  <Label>Selecionar todos ({responses.length} itens)</Label>
                  <span className="text-sm text-muted-foreground">
                    {selectedResponses.length} selecionados
                  </span>
                </div>

                {selectedResponses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label htmlFor="bulk-action">Ação</Label>
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma ação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Aprovar</SelectItem>
                          <SelectItem value="reject">Rejeitar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="bulk-feedback">Comentário (opcional)</Label>
                      <Textarea
                        id="bulk-feedback"
                        placeholder="Comentário para todas as respostas selecionadas..."
                        value={bulkFeedback}
                        onChange={(e) => setBulkFeedback(e.target.value)}
                        className="h-9"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={handleBulkAction}
                        disabled={!bulkAction}
                        className="w-full"
                      >
                        Aplicar ({selectedResponses.length})
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lista de Respostas */}
      <Card>
        <CardHeader>
          <CardTitle>
            Respostas Pendentes ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-sm font-semibold">Nenhuma resposta pendente</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Todas as respostas foram revisadas!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => {
                const TypeIcon = typeIcons[response.type]
                const isExpanded = expandedResponses.has(response.id)
                const isSelected = selectedResponses.includes(response.id)

                return (
                  <Card 
                    key={response.id} 
                    className={`transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleResponseSelection(response.id)}
                            />
                            <TypeIcon className="h-5 w-5 text-primary" />
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={priorityColors[response.priority]}>
                                  {priorityLabels[response.priority]}
                                </Badge>
                                <Badge variant="outline">
                                  {typeLabels[response.type]}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(response.dataCriacao).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleResponseExpansion(response.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              {isExpanded ? 'Recolher' : 'Expandir'}
                            </Button>
                            <Button
                              onClick={() => openReviewDialog(response)}
                              size="sm"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Revisar
                            </Button>
                          </div>
                        </div>

                        {/* Questão relacionada (se houver) */}
                        {response.questao && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">Questão relacionada:</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {response.questao.enunciado.substring(0, 150)}...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Área: {response.questao.area}
                            </p>
                          </div>
                        )}

                        {/* Resposta original */}
                        <div>
                          <p className="text-sm font-medium mb-2">Resposta Original:</p>
                          <div className="p-3 bg-background border rounded-lg">
                            <p className={`text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
                              {response.originalResponse}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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

      {/* Dialog de Revisão */}
      <Dialog open={!!reviewingResponse} onOpenChange={() => setReviewingResponse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisar Resposta da IA</DialogTitle>
            <DialogDescription>
              Analise e aprove ou rejeite a resposta gerada pela IA
            </DialogDescription>
          </DialogHeader>

          {reviewingResponse && (
            <div className="space-y-6">
              {/* Informações da resposta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <p className="text-sm">{typeLabels[reviewingResponse.type]}</p>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Badge variant={priorityColors[reviewingResponse.priority]}>
                    {priorityLabels[reviewingResponse.priority]}
                  </Badge>
                </div>
              </div>

              {/* Resposta original */}
              <div>
                <Label>Resposta Original</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm">{reviewingResponse.originalResponse}</p>
                </div>
              </div>

              {/* Resposta revisada */}
              <div>
                <Label htmlFor="revised-response">Resposta Revisada *</Label>
                <Textarea
                  id="revised-response"
                  value={reviewForm.revisedResponse}
                  onChange={(e) => setReviewForm(prev => ({ 
                    ...prev, 
                    revisedResponse: e.target.value 
                  }))}
                  className="min-h-[150px] mt-2"
                  placeholder="Edite a resposta conforme necessário..."
                />
              </div>

              {/* Feedback */}
              <div>
                <Label htmlFor="feedback">Comentário (opcional)</Label>
                <Textarea
                  id="feedback"
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm(prev => ({ 
                    ...prev, 
                    feedback: e.target.value 
                  }))}
                  className="mt-2"
                  placeholder="Adicione comentários sobre a revisão..."
                />
              </div>

              {/* Ação */}
              <div>
                <Label>Decisão</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="approve"
                      name="decision"
                      checked={reviewForm.approved}
                      onChange={() => setReviewForm(prev => ({ ...prev, approved: true }))}
                    />
                    <Label htmlFor="approve" className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Aprovar
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reject"
                      name="decision"
                      checked={!reviewForm.approved}
                      onChange={() => setReviewForm(prev => ({ ...prev, approved: false }))}
                    />
                    <Label htmlFor="reject" className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      Rejeitar
                    </Label>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setReviewingResponse(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleReview}>
                  {reviewForm.approved ? 'Aprovar' : 'Rejeitar'} Resposta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}