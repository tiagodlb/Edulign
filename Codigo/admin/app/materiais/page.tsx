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
  Upload,
  Search,
  Filter,
  FileText,
  FileImage,
  FileVideo,
  Download,
  Eye,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
  User,
  Link2,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { materialService, type Material, type Turma } from '@/lib/api/materials'

interface MaterialDisplay extends Material {
  turma?: Turma
}

type MaterialType = 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENTO'

export default function MaterialsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [materials, setMaterials] = useState<MaterialDisplay[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedTipo, setSelectedTipo] = useState<string>('all')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form states
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    descricao: '',
    turmaId: '',
    tipo: 'PDF' as MaterialType,
    url: '',
    arquivo: null as File | null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Buscar turmas
      const turmasData = await materialService.getTurmas()
      setTurmas(turmasData)

      // Se houver turmas, buscar materiais de todas
      if (turmasData.length > 0) {
        const allMaterials: MaterialDisplay[] = []

        for (const turma of turmasData) {
          try {
            const turmaMateriails = await materialService.getMaterials(turma.id)
            const materialsWithTurma = turmaMateriails.map(m => ({
              ...m,
              turma
            }))
            allMaterials.push(...materialsWithTurma)
          } catch (error) {
            console.error(`Erro ao buscar materiais da turma ${turma.nome}:`, error)
          }
        }

        setMaterials(allMaterials)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as informações. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMaterialsForTurma = async (turmaId: string) => {
    try {
      const materialsData = await materialService.getMaterials(
        turmaId,
        selectedTipo !== 'all' ? selectedTipo : undefined
      )

      const turma = turmas.find(t => t.id === turmaId)
      const materialsWithTurma = materialsData.map(m => ({
        ...m,
        turma
      }))

      return materialsWithTurma
    } catch (error) {
      console.error('Erro ao buscar materiais:', error)
      return []
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadForm.titulo || !uploadForm.turmaId || !uploadForm.tipo) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios',
        variant: 'destructive'
      })
      return
    }

    if (uploadForm.tipo === 'LINK' && !uploadForm.url) {
      toast({
        title: 'URL obrigatória',
        description: 'Para materiais do tipo Link, a URL é obrigatória',
        variant: 'destructive'
      })
      return
    }

    if (uploadForm.tipo !== 'LINK' && !uploadForm.arquivo) {
      toast({
        title: 'Arquivo obrigatório',
        description: 'Por favor, selecione um arquivo para upload',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsUploading(true)

      await materialService.uploadMaterial(uploadForm.turmaId, {
        titulo: uploadForm.titulo,
        descricao: uploadForm.descricao,
        tipo: uploadForm.tipo,
        url: uploadForm.url || undefined,
        arquivo: uploadForm.arquivo || undefined
      })

      toast({
        title: 'Material adicionado',
        description: 'O material foi adicionado com sucesso à turma'
      })

      // Limpar formulário
      setUploadForm({
        titulo: '',
        descricao: '',
        turmaId: '',
        tipo: 'PDF',
        url: '',
        arquivo: null
      })

      setIsUploadOpen(false)

      // Recarregar materiais
      if (selectedTurma !== 'all') {
        const newMaterials = await loadMaterialsForTurma(selectedTurma)
        setMaterials(newMaterials)
      } else {
        await loadData()
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível adicionar o material. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (materialId: string, turmaId: string) => {
    if (!confirm('Tem certeza que deseja remover este material?')) {
      return
    }

    try {
      setDeletingId(materialId)
      await materialService.deleteMaterial(turmaId, materialId)

      toast({
        title: 'Material removido',
        description: 'O material foi removido com sucesso'
      })

      // Atualizar lista
      setMaterials(prev => prev.filter(m => m.id !== materialId))
    } catch (error) {
      console.error('Erro ao remover material:', error)
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o material. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (material: MaterialDisplay) => {
    try {
      await materialService.downloadMaterial(material.id, material.titulo)
      toast({
        title: 'Download iniciado',
        description: `Fazendo download de ${material.titulo}`
      })
    } catch (error) {
      console.error('Erro no download:', error)
      toast({
        title: 'Erro no download',
        description: 'Não foi possível fazer o download do material.',
        variant: 'destructive'
      })
    }
  }

  const handleView = async (material: MaterialDisplay) => {
    try {
      const viewUrl = await materialService.viewMaterial(material.id)
      if (viewUrl) {
        window.open(viewUrl, '_blank')
      }
    } catch (error) {
      console.error('Erro ao visualizar:', error)
      toast({
        title: 'Erro ao visualizar',
        description: 'Não foi possível visualizar o material.',
        variant: 'destructive'
      })
    }
  }

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
      case 'DOCUMENTO':
        return <FileText className="h-8 w-8" />
      case 'VIDEO':
        return <FileVideo className="h-8 w-8" />
      case 'IMAGEM':
        return <FileImage className="h-8 w-8" />
      case 'LINK':
        return <Link2 className="h-8 w-8" />
      default:
        return <FileText className="h-8 w-8" />
    }
  }

  const getFileColor = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return 'text-red-500'
      case 'VIDEO':
        return 'text-blue-500'
      case 'IMAGEM':
        return 'text-green-500'
      case 'DOCUMENTO':
        return 'text-purple-500'
      case 'LINK':
        return 'text-cyan-500'
      default:
        return 'text-gray-500'
    }
  }

  // Filtrar materiais
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (material.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesTurma = selectedTurma === 'all' || material.turmaId === selectedTurma
    const matchesTipo = selectedTipo === 'all' || material.tipo === selectedTipo

    return matchesSearch && matchesTurma && matchesTipo
  })

  useEffect(() => {
    const loadFilteredMaterials = async () => {
      if (selectedTurma !== 'all') {
        const newMaterials = await loadMaterialsForTurma(selectedTurma)
        setMaterials(newMaterials)
      } else {
        await loadData()
      }
    }

    if (!isLoading) {
      loadFilteredMaterials()
    }
  }, [selectedTurma, selectedTipo])

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
          <h2 className="text-3xl font-bold tracking-tight">Materiais</h2>
          <p className="text-muted-foreground">
            Gerencie e organize os materiais das suas turmas
          </p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Material</DialogTitle>
              <DialogDescription>
                Faça upload de um novo material ou adicione um link para suas turmas
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={uploadForm.titulo}
                    onChange={(e) => setUploadForm(prev => ({
                      ...prev,
                      titulo: e.target.value
                    }))}
                    placeholder="Ex: Introdução à Programação"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={uploadForm.tipo}
                    onValueChange={(value: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENTO') =>
                      setUploadForm(prev => ({ ...prev, tipo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="VIDEO">Vídeo</SelectItem>
                      <SelectItem value="DOCUMENTO">Documento</SelectItem>
                      <SelectItem value="LINK">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {uploadForm.tipo === 'LINK' ? (
                  <div>
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={uploadForm.url}
                      onChange={(e) => setUploadForm(prev => ({
                        ...prev,
                        url: e.target.value
                      }))}
                      placeholder="https://exemplo.com/material"
                      required={uploadForm.tipo === 'LINK'}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="arquivo">Arquivo *</Label>
                    <Input
                      id="arquivo"
                      type="file"
                      onChange={(e) => setUploadForm(prev => ({
                        ...prev,
                        arquivo: e.target.files?.[0] || null
                      }))}
                      accept={
                        uploadForm.tipo === 'PDF' ? '.pdf' :
                          uploadForm.tipo === 'VIDEO' ? '.mp4,.avi,.mov,.wmv' :
                            uploadForm.tipo === 'DOCUMENTO' ? '.doc,.docx,.txt,.odt' :
                              '*'
                      }
                      required={String(uploadForm.tipo) !== 'LINK'}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="turmaId">Turma *</Label>
                  <Select
                    value={uploadForm.turmaId}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, turmaId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.codigo} - {turma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={uploadForm.descricao}
                    onChange={(e) => setUploadForm(prev => ({
                      ...prev,
                      descricao: e.target.value
                    }))}
                    placeholder="Descreva o conteúdo do material..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger className="w-full sm:w-[200px]">
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

            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="VIDEO">Vídeo</SelectItem>
                <SelectItem value="DOCUMENTO">Documento</SelectItem>
                <SelectItem value="LINK">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiais */}
      {filteredMaterials.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`${getFileColor(material.tipo)}`}>
                    {getFileIcon(material.tipo)}
                  </div>
                  <Badge variant="secondary">{material.tipo}</Badge>
                </div>
                <CardTitle className="text-lg">{material.titulo}</CardTitle>
                {material.descricao && (
                  <CardDescription className="line-clamp-2">
                    {material.descricao}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {material.turma && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{material.turma.codigo} - {material.turma.nome}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(material.dataCriacao).toLocaleDateString('pt-BR')}</span>
                  {material.tamanho && (
                    <span className="ml-auto">{material.tamanho}</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {material.tipo === 'LINK' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => material.url && window.open(material.url, '_blank')}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Abrir Link
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(material)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(material.id, material.turmaId)}
                    disabled={deletingId === material.id}
                  >
                    {deletingId === material.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Carregando materiais...</p>
              </>
            ) : materials.length === 0 ? (
              <>
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum material cadastrado</h3>
                <p className="text-muted-foreground text-center">
                  Comece adicionando materiais para suas turmas clicando no botão acima.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
                <p className="text-muted-foreground text-center">
                  Tente ajustar os filtros de busca ou adicione novos materiais.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}