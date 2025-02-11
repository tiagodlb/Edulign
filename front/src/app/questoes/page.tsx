'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SiteHeader } from '@/components/layout/site-header'
import { AreaAvaliacao, TipoQuestao } from '@/types'
import StudentService from '@/lib/api/student'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface Questao {
  id: string
  enunciado: string
  comando: string
  area: string
  tipo: string
  nivel: string
  topicos: string[]
  competencias: string[]
  referencias: string[]
  dataCriacao: string
  alternativas: Array<{
    id: string
    texto: string
    correta: boolean
    justificativa: string
  }>
  suportes: Array<{
    id: string
    tipo: string
    conteudo: string
  }>
}

export default function QuestoesPage() {
  const [questions, setQuestions] = useState<Questao[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Questao[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterArea, setFilterArea] = useState<AreaAvaliacao | 'all'>('all')
  const [filterTipo, setFilterTipo] = useState<TipoQuestao | 'all'>('all')
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const generatePDF = (questao: Questao) => {
    try {
      const doc = new jsPDF()
      
      // Set font to handle special characters
      doc.setFont('helvetica')
      
      // Add title
      doc.setFontSize(16)
      doc.text('Detalhes da Questão', 20, 20)
      
      // Add metadata
      doc.setFontSize(12)
      doc.text(`Área: ${questao.area}`, 20, 35)
      doc.text(`Tipo: ${questao.tipo}`, 20, 45)
      doc.text(`Nível: ${questao.nivel}`, 20, 55)
      
      // Add question text
      doc.setFontSize(14)
      doc.text('Enunciado:', 20, 70)
      
      // Split long text into multiple lines
      const splitEnunciado = doc.splitTextToSize(questao.enunciado, 170)
      doc.setFontSize(12)
      doc.text(splitEnunciado, 20, 80)
      
      // Add command if exists
      let currentY = 80 + (splitEnunciado.length * 7)
      if (questao.comando) {
        doc.setFontSize(14)
        doc.text('Comando:', 20, currentY)
        const splitComando = doc.splitTextToSize(questao.comando, 170)
        doc.setFontSize(12)
        doc.text(splitComando, 20, currentY + 10)
        currentY += 10 + (splitComando.length * 7)
      }
      
      // Add alternatives
      doc.setFontSize(14)
      doc.text('Alternativas:', 20, currentY + 10)
      currentY += 20
      
      questao.alternativas.forEach((alt, index) => {
        const isCorrect = alt.correta ? '✓' : ''
        doc.setFontSize(12)
        const altText = doc.splitTextToSize(`${String.fromCharCode(65 + index)}) ${alt.texto}`, 160)
        doc.text(`${isCorrect} `, 20, currentY)
        doc.text(altText, 30, currentY)
        currentY += altText.length * 7 + 5
        
        // Add justification
        if (alt.justificativa) {
          doc.setFont('helvetica', 'italic')
          const justText = doc.splitTextToSize(`Justificativa: ${alt.justificativa}`, 150)
          doc.text(justText, 35, currentY)
          currentY += justText.length * 7 + 5
          doc.setFont('helvetica', 'normal')
        }
      })
      
      // Add topics, competencies and references if they exist
      if (questao.topicos.length > 0) {
        currentY += 10
        doc.setFontSize(14)
        doc.text('Tópicos:', 20, currentY)
        doc.setFontSize(12)
        questao.topicos.forEach(topico => {
          currentY += 7
          doc.text(`• ${topico}`, 25, currentY)
        })
      }

      if (questao.competencias.length > 0) {
        currentY += 10
        doc.setFontSize(14)
        doc.text('Competências:', 20, currentY)
        doc.setFontSize(12)
        questao.competencias.forEach(comp => {
          currentY += 7
          doc.text(`• ${comp}`, 25, currentY)
        })
      }

      if (questao.referencias.length > 0) {
        currentY += 10
        doc.setFontSize(14)
        doc.text('Referências:', 20, currentY)
        doc.setFontSize(12)
        questao.referencias.forEach(ref => {
          currentY += 7
          doc.text(`• ${ref}`, 25, currentY)
        })
      }

      // Save the PDF
      doc.save(`questao-${questao.id}.pdf`)
      
      toast({
        title: 'PDF gerado com sucesso',
        description: 'O arquivo foi baixado para o seu computador.'
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o arquivo PDF.'
      })
    }
  }

  // Load questions from simulados
  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    setIsLoading(true)
    try {
      const response = await StudentService.getSimulados()
      if (response?.success) {
        // Extract unique questions from all simulados
        const allQuestions = response.data.flatMap(simulado => simulado.questoes)
        // Remove duplicates based on question ID
        const uniqueQuestions = Array.from(
          new Map(allQuestions.map(q => [q.id, q])).values()
        )
        setQuestions(uniqueQuestions)
        setFilteredQuestions(uniqueQuestions)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar questões',
        description: 'Não foi possível carregar o banco de questões.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Search and filter logic
  useEffect(() => {
    const filtered = questions.filter(questao => {
      const matchesSearch = questao.enunciado.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesArea = filterArea === 'all' || questao.area === filterArea
      const matchesTipo = filterTipo === 'all' || questao.tipo === filterTipo
      return matchesSearch && matchesArea && matchesTipo
    })
    setFilteredQuestions(filtered)
  }, [questions, searchQuery, filterArea, filterTipo])

  // Filter dialog component
  const FilterDialog = () => (
    <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filtrar Questões</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Área de Avaliação</label>
            <Select
              value={filterArea}
              onValueChange={(value: AreaAvaliacao | 'all') => setFilterArea(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área" />
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Questão</label>
            <Select
              value={filterTipo}
              onValueChange={(value: TipoQuestao | 'all') => setFilterTipo(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.values(TipoQuestao).map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando questões...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-8 py-12 sm:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Banco de Questões</h1>
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nova Questão
          </Button>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar questões..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterDialog />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Enunciado</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map(questao => (
                  <TableRow key={questao.id}>
                    <TableCell className="font-medium">
                      {questao.enunciado.length > 100
                        ? `${questao.enunciado.substring(0, 100)}...`
                        : questao.enunciado}
                    </TableCell>
                    <TableCell>{questao.area}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{questao.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{questao.nivel}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(questao.dataCriacao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => generatePDF(questao)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhuma questão encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}