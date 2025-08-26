'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Users,
  FileText,
  BookOpen,
  Download,
  Calendar,
  Filter,
  Target,
  Clock,
  Award,
  Activity
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { SubjectReportTab } from './subject'

interface ReportData {
  desempenhoTurmas: Array<{
    turma: string
    media: number
    participantes: number
    aprovacao: number
  }>
  evolucaoNotas: Array<{
    periodo: string
    media: number
    participantes: number
  }>
  distribuicaoNotas: Array<{
    faixa: string
    quantidade: number
    porcentagem: number
  }>
  usoMateriais: Array<{
    material: string
    downloads: number
    visualizacoes: number
  }>
  atividadeDiaria: Array<{
    data: string
    simulados: number
    materiais: number
    alunos: number
  }>
  topAlunos: Array<{
    nome: string
    media: number
    simulados: number
    posicao: number
  }>
}

interface Turma {
  id: string
  nome: string
  codigo: string
}

// Configurações dos charts
const chartConfigs = {
  desempenho: {
    media: {
      label: "Média",
      color: "hsl(var(--chart-1))",
    },
    aprovacao: {
      label: "Aprovação %",
      color: "hsl(var(--chart-2))",
    },
  },
  evolucao: {
    media: {
      label: "Média",
      color: "hsl(var(--chart-1))",
    },
    participantes: {
      label: "Participantes",
      color: "hsl(var(--chart-2))",
    },
  },
  materiais: {
    downloads: {
      label: "Downloads",
      color: "hsl(var(--chart-1))",
    },
    visualizacoes: {
      label: "Visualizações",
      color: "hsl(var(--chart-2))",
    },
  },
  atividade: {
    simulados: {
      label: "Simulados",
      color: "hsl(var(--chart-1))",
    },
    materiais: {
      label: "Materiais",
      color: "hsl(var(--chart-2))",
    },
    alunos: {
      label: "Alunos Ativos",
      color: "hsl(var(--chart-3))",
    },
  },
  distribuicao: {
    quantidade: {
      label: "Quantidade",
      color: "hsl(var(--chart-1))",
    },
  },
}

export default function RelatoriosPage() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('30days')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadReportData()
  }, [selectedTurma, selectedPeriodo])

  const loadReportData = async () => {
    try {
      // Simular dados de relatório
      const mockData: ReportData = {
        desempenhoTurmas: [
          { turma: 'AED2024', media: 7.8, participantes: 28, aprovacao: 85 },
          { turma: 'ENG2024', media: 8.2, participantes: 32, aprovacao: 90 },
          { turma: 'BDA2024', media: 7.1, participantes: 27, aprovacao: 78 },
          { turma: 'WEB2024', media: 8.5, participantes: 35, aprovacao: 94 }
        ],
        evolucaoNotas: [
          { periodo: 'Jan', media: 7.2, participantes: 120 },
          { periodo: 'Fev', media: 7.8, participantes: 122 },
          { periodo: 'Mar', media: 8.1, participantes: 118 },
          { periodo: 'Abr', media: 7.9, participantes: 125 },
          { periodo: 'Mai', media: 8.3, participantes: 130 }
        ],
        distribuicaoNotas: [
          { faixa: '0-2', quantidade: 5, porcentagem: 4 },
          { faixa: '2-4', quantidade: 8, porcentagem: 7 },
          { faixa: '4-6', quantidade: 15, porcentagem: 13 },
          { faixa: '6-8', quantidade: 45, porcentagem: 38 },
          { faixa: '8-10', quantidade: 45, porcentagem: 38 }
        ],
        usoMateriais: [
          { material: 'Algoritmos Básicos', downloads: 85, visualizacoes: 120 },
          { material: 'Estruturas de Dados', downloads: 78, visualizacoes: 95 },
          { material: 'Programação Web', downloads: 92, visualizacoes: 145 },
          { material: 'Banco de Dados', downloads: 67, visualizacoes: 89 }
        ],
        atividadeDiaria: [
          { data: '01/02', simulados: 3, materiais: 8, alunos: 45 },
          { data: '02/02', simulados: 5, materiais: 12, alunos: 52 },
          { data: '03/02', simulados: 2, materiais: 6, alunos: 38 },
          { data: '04/02', simulados: 4, materiais: 15, alunos: 48 },
          { data: '05/02', simulados: 6, materiais: 18, alunos: 55 },
          { data: '06/02', simulados: 1, materiais: 4, alunos: 28 },
          { data: '07/02', simulados: 3, materiais: 9, alunos: 42 }
        ],
        topAlunos: [
          { nome: 'Ana Silva', media: 9.2, simulados: 8, posicao: 1 },
          { nome: 'João Santos', media: 8.9, simulados: 7, posicao: 2 },
          { nome: 'Maria Oliveira', media: 8.7, simulados: 9, posicao: 3 },
          { nome: 'Pedro Costa', media: 8.5, simulados: 6, posicao: 4 },
          { nome: 'Laura Ferreira', media: 8.3, simulados: 8, posicao: 5 }
        ]
      }

      const mockTurmas: Turma[] = [
        { id: '1', nome: 'Algoritmos e Estrutura de Dados', codigo: 'AED2024' },
        { id: '2', nome: 'Engenharia de Software', codigo: 'ENG2024' },
        { id: '3', nome: 'Banco de Dados Avançado', codigo: 'BDA2024' },
        { id: '4', nome: 'Programação Web', codigo: 'WEB2024' }
      ]

      setReportData(mockData)
      setTurmas(mockTurmas)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel') => {
    console.log(`Exportando relatório em ${format}`)
    // Implementar exportação real
  }

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!reportData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análises e métricas do desempenho acadêmico
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todas as turmas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.codigo} - {turma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.0</div>
            <p className="text-xs text-muted-foreground">
              +0.3 em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% em relação ao semestre anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulados Realizados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais Acessados</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              Visualizações este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas de relatórios */}
      <Tabs>
        <TabsList className="grid w-full grid-cols-5"> {/* Mudou de 4 para 5 colunas */}
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="subjects">Assunto/Conteúdo</TabsTrigger> {/* Nova aba */}
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Desempenho por turma */}
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Turma</CardTitle>
                <CardDescription>Média de notas e taxa de aprovação</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigs.desempenho} className="h-[300px]">
                  <BarChart data={reportData.desempenhoTurmas}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="turma"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="media"
                      fill="var(--color-media)"
                      radius={4}
                    />
                    <Bar
                      dataKey="aprovacao"
                      fill="var(--color-aprovacao)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Distribuição de notas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Notas</CardTitle>
                <CardDescription>Faixas de pontuação dos alunos</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigs.distribuicao} className="h-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="faixa" />} />
                    <Pie
                      data={reportData.distribuicaoNotas}
                      dataKey="quantidade"
                      nameKey="faixa"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ faixa, porcentagem }) => `${faixa}: ${porcentagem}%`}
                    >
                      {reportData.distribuicaoNotas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top alunos */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Alunos</CardTitle>
              <CardDescription>Melhores desempenhos no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topAlunos.map((aluno) => (
                  <div key={aluno.posicao} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${aluno.posicao === 1 ? 'bg-yellow-100 text-yellow-800' :
                        aluno.posicao === 2 ? 'bg-gray-100 text-gray-800' :
                          aluno.posicao === 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {aluno.posicao}
                      </div>
                      <div>
                        <div className="font-semibold">{aluno.nome}</div>
                        <div className="text-sm text-muted-foreground">{aluno.simulados} simulados realizados</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{aluno.media}</div>
                      <div className="text-sm text-muted-foreground">média</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Evolução das notas */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Notas</CardTitle>
              <CardDescription>Tendência de desempenho ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigs.evolucao} className="h-[400px]">
                <LineChart data={reportData.evolucaoNotas}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="periodo"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="media"
                    type="monotone"
                    stroke="var(--color-media)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    dataKey="participantes"
                    type="monotone"
                    stroke="var(--color-participantes)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          {/* Uso de materiais */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Materiais</CardTitle>
              <CardDescription>Downloads e visualizações por material</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigs.materiais} className="h-[400px]">
                <BarChart data={reportData.usoMateriais}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="material"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="downloads"
                    fill="var(--color-downloads)"
                    radius={4}
                  />
                  <Bar
                    dataKey="visualizacoes"
                    fill="var(--color-visualizacoes)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Atividade diária */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Diária</CardTitle>
              <CardDescription>Simulados, materiais e participação por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigs.atividade} className="h-[400px]">
                <LineChart data={reportData.atividadeDiaria}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="data"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="simulados"
                    type="monotone"
                    stroke="var(--color-simulados)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    dataKey="materiais"
                    type="monotone"
                    stroke="var(--color-materiais)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    dataKey="alunos"
                    type="monotone"
                    stroke="var(--color-alunos)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <SubjectReportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}