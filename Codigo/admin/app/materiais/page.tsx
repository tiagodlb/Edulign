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
  User
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { SiteHeader } from '@/components/layout/site-header'

interface Material {
  id: string
  nome: string
  descricao: string
  tipo: 'pdf' | 'video' | 'imagem' | 'documento'
  arquivo: string
  tamanho: string
  dataUpload: string
  turma: {
    id: string
    nome: string
    codigo: string
  }
  professor: {
    id: string
    nome: string
  }
  categoria: string
  tags: string[]
}

interface Turma {
  id: string
  nome: string
  codigo: string
}

export default function MaterialsPage() {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Form states
  const [uploadForm, setUploadForm] = useState({
    nome: '',
    descricao: '',
    turmaId: '',
    categoria: '',
    tags: '',
    arquivo: null as File | null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Simular dados
      const mockMaterials: Material[] = [
        {
          id: '1',
          nome: 'Introdução aos Algoritmos',
          descricao: 'Material base sobre conceitos fundamentais de algoritmos',
          tipo: 'pdf',
          arquivo: 'algoritmos_intro.pdf',
          tamanho: '2.5 MB',
          dataUpload: '2024-02-08T10:30:00',
          turma: { id: '1', nome: 'Algoritmos e Estrutura de Dados', codigo: 'AED2024' },
          professor: { id: '1', nome: 'Prof. João Silva' },
          categoria: 'Teoria',
          tags: ['algoritmos', 'fundamentos', 'programação']
        },
        {
          id: '2',
          nome: 'Aula 05 - Estruturas Condicionais',
          descricao: 'Videoaula sobre if, else e switch case',
          tipo: 'video',
          arquivo: 'aula05_condicionais.mp4',
          tamanho: '125 MB',
          dataUpload: '2024-02-07T14:15:00',
          turma: { id: '1', nome: 'Algoritmos e Estrutura de Dados', codigo: 'AED2024' },
          professor: { id: '1', nome: 'Prof. João Silva' },
          categoria: 'Videoaula',
          tags: ['condicionais', 'programação', 'lógica']
        },
        {
          id: '3',
          nome: 'Exercícios de Fixação - Loops',
          descricao: 'Lista de exercícios práticos sobre estruturas de repetição',
          tipo: 'documento',
          arquivo: 'exercicios_loops.docx',
          tamanho: '890 KB',
          dataUpload: '2024-02-06T16:45:00',
          turma: { id: '2', nome: 'Engenharia de Software - 2024.2', codigo: 'ENG2024' },
          professor: { id: '2', nome: 'Prof. Maria Santos' },
          categoria: 'Exercícios',
          tags: ['loops', 'exercícios', 'prática']
        }
      ]

      const mockTurmas: Turma[] = [
        { id: '1', nome: 'Algoritmos e Estrutura de Dados', codigo: 'AED2024' },
        { id: '2', nome: 'Engenharia de Software - 2024.2', codigo: 'ENG2024' },
        { id: '3', nome: 'Banco de Dados Avançado', codigo: 'BDA2024' }
      ]

      setMaterials(mockMaterials)
      setTurmas(mockTurmas)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (tipo: Material['tipo']) => {
    switch (tipo) {
      case 'pdf':
      case 'documento':
        return <FileText className="h-8 w-8" />
      case 'video':
        return <FileVideo className="h-8 w-8" />
      case 'imagem':
        return <FileImage className="h-8 w-8" />
      default:
        return <FileText className="h-8 w-8" />
    }
  }

  const getFileColor = (tipo: Material['tipo']) => {
    switch (tipo) {
      case 'pdf':
        return 'text-red-500'
      case 'video':
        return 'text-blue-500'
      case 'imagem':
        return 'text-green-500'
      case 'documento':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTurma = selectedTurma === 'all' || material.turma.id === selectedTurma
    const matchesCategoria = selectedCategoria === 'all' || material.categoria === selectedCategoria

    return matchesSearch && matchesTurma && matchesCategoria
  })

  const categorias = [...new Set(materials.map(m => m.categoria))]

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadForm.arquivo || !uploadForm.turmaId) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      // Aqui você faria o upload real
      console.log('Uploading:', uploadForm)
      
      // Simular sucesso
      setIsUploadOpen(false)
      setUploadForm({
        nome: '',
        descricao: '',
        turmaId: '',
        categoria: '',
        tags: '',
        arquivo: null
      })
      
      // Recarregar lista
      await loadData()
    } catch (error) {
      console.error('Erro no upload:', error)
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
                Faça upload de um novo material para suas turmas
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="arquivo">Arquivo *</Label>
                  <Input
                    id="arquivo"
                    type="file"
                    onChange={(e) => setUploadForm(prev => ({ 
                      ...prev, 
                      arquivo: e.target.files?.[0] || null 
                    }))}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.avi"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="nome">Nome do Material *</Label>
                  <Input
                    id="nome"
                    value={uploadForm.nome}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Aula 01 - Introdução"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={uploadForm.descricao}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Breve descrição do material..."
                  />
                </div>

                <div>
                  <Label htmlFor="turma">Turma *</Label>
                  <Select 
                    value={uploadForm.turmaId} 
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, turmaId: value }))}
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
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={uploadForm.categoria}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, categoria: e.target.value }))}
                    placeholder="Ex: Teoria, Exercícios, Videoaula"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Ex: algoritmos, programação, fundamentos"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Upload className="mr-2 h-4 w-4" />
                  Fazer Upload
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar materiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
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

            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Materiais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`${getFileColor(material.tipo)}`}>
                  {getFileIcon(material.tipo)}
                </div>
                <Badge variant="secondary">{material.categoria}</Badge>
              </div>
              <CardTitle className="text-lg">{material.nome}</CardTitle>
              <CardDescription className="line-clamp-2">
                {material.descricao}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{material.turma.codigo}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{material.professor.nome}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(material.dataUpload).toLocaleDateString('pt-BR')}</span>
                <span className="ml-auto">{material.tamanho}</span>
              </div>

              {material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {material.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {material.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{material.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || selectedTurma !== 'all' || selectedCategoria !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando materiais para suas turmas'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}