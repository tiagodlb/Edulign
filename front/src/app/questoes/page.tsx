'use client'

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
import { SiteHeader } from '@/components/layout/site-header'
import { AreaAvaliacao, TipoQuestao } from '@/types'

export default function QuestoesPage() {
  return (
    <div>
      <SiteHeader />
      <main className="w-screen p-6 space-y-6">
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
            <Input placeholder="Pesquisar questões..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Enunciado</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questoesMock.map(questao => (
                <TableRow key={questao.id}>
                  <TableCell>{questao.id}</TableCell>
                  <TableCell className="max-w-md">
                    {questao.enunciado.substring(0, 100)}...
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
    area: AreaAvaliacao.Exatas,
    tipo: TipoQuestao.ComponenteEspecifico,
    dataCriacao: new Date('2024-01-15')
  },
  {
    id: 2,
    enunciado:
      'Analise o impacto das redes sociais na formação da opinião pública e no processo democrático contemporâneo.',
    area: AreaAvaliacao.Humanas,
    tipo: TipoQuestao.FormacaoGeral,
    dataCriacao: new Date('2024-02-01')
  },
  {
    id: 3,
    enunciado:
      'Descreva o processo de síntese proteica e sua importância para o funcionamento celular.',
    area: AreaAvaliacao.Saude,
    tipo: TipoQuestao.ComponenteEspecifico,
    dataCriacao: new Date('2024-02-15')
  }
]
