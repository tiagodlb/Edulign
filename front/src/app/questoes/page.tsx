'use client'
import { useState, useEffect } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
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

interface Questao {
  id: number
  enunciado: string
  area: AreaAvaliacao
  tipo: TipoQuestao
  dataCriacao: Date
}

export default function QuestoesPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [filterArea, setFilterArea] = useState<AreaAvaliacao | 'all'>('all')
  const [filterTipo, setFilterTipo] = useState<TipoQuestao | 'all'>('all')
  const [filteredQuestoes, setFilteredQuestoes] = useState<Questao[]>(questoesMock)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  // Filter logic
  useEffect(() => {
    const filtered = questoesMock.filter(questao => {
      const matchesSearch = questao.enunciado.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesArea = filterArea === 'all' || questao.area === filterArea
      const matchesTipo = filterTipo === 'all' || questao.tipo === filterTipo

      return matchesSearch && matchesArea && matchesTipo
    })

    setFilteredQuestoes(filtered)
  }, [searchQuery, filterArea, filterTipo])

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

  return (
    <div>
      <SiteHeader />
      <main className="flex-grow container mx-auto px-8 py-12 sm:py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Banco de Questões</h1>
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nova Questão
          </Button>
        </div>
        <div className="flex space-x-4">
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
                <TableHead>Enunciado</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestoes.map(questao => (
                <TableRow key={questao.id}>
                  <TableCell>{questao.id}</TableCell>
                  <TableCell className="max-w-md">
                    {questao.enunciado.length > 100
                      ? `${questao.enunciado.substring(0, 100)}...`
                      : questao.enunciado}
                  </TableCell>
                  <TableCell>{questao.area}</TableCell>
                  <TableCell>{questao.tipo}</TableCell>
                  <TableCell>{questao.dataCriacao.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="link">Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}

const questoesMock = [
  {
    id: 1,
    enunciado:
      'Em um sistema de equações lineares, qual é a interpretação geométrica das soluções quando as retas são paralelas?',
    area: AreaAvaliacao.Arq_Urb,
    tipo: TipoQuestao.ComponenteEspecifico,
    dataCriacao: new Date('2024-01-15')
  },
  {
    id: 2,
    enunciado:
      'Analise o impacto das redes sociais na formação da opinião pública e no processo democrático contemporâneo.',
    area: AreaAvaliacao.Arq_Urb,
    tipo: TipoQuestao.FormacaoGeral,
    dataCriacao: new Date('2024-02-01')
  },
  {
    id: 3,
    enunciado:
      'Descreva o processo de síntese proteica e sua importância para o funcionamento celular.',
    area: AreaAvaliacao.Arq_Urb,
    tipo: TipoQuestao.ComponenteEspecifico,
    dataCriacao: new Date('2024-02-15')
  }
]
