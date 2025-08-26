'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
} from "recharts"
import {
  Target,
  Award,
  FileText,
  BookOpen,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  Calculator,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Brain,
  GraduationCap,
  Trophy,
  Zap,
  Eye,
  FileDown,
  Filter,
  ChevronRight
} from "lucide-react"
import { SubjectReportTab } from './subject'

interface Turma {
  id: string
  nome: string
  codigo: string
}

interface ReportData {
  desempenhoTurmas: Array<{
    turma: string
    media: number
    stdDev: number
    aprovacao: number
    participacao: number
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
  estatisticasGerais: {
    mediaGeral: number
    desvioGeralPadrao: number
    mediana: number
    coeficienteVariacao: number
    quartil1: number
    quartil3: number
  }
}

export default function ReportsPage() {
  const [selectedTurma, setSelectedTurma] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReportData()
  }, [selectedTurma, selectedPeriod])

  const calculateStandardDeviation = (values: number[]): number => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  const calculateCoefficientOfVariation = (mean: number, stdDev: number): number => {
    return (stdDev / mean) * 100
  }

  const loadReportData = async () => {
    setIsLoading(true)
    try {
      const notas = [8.5, 7.2, 9.1, 6.8, 8.0, 7.5, 8.9, 7.8, 8.3, 6.5, 9.0, 7.9]
      const mediaGeral = notas.reduce((sum, nota) => sum + nota, 0) / notas.length
      const desvioGeralPadrao = calculateStandardDeviation(notas)
      const coeficienteVariacao = calculateCoefficientOfVariation(mediaGeral, desvioGeralPadrao)

      const notasOrdenadas = [...notas].sort((a, b) => a - b)
      const quartil1 = notasOrdenadas[Math.floor(notasOrdenadas.length * 0.25)]
      const mediana = notasOrdenadas[Math.floor(notasOrdenadas.length * 0.5)]
      const quartil3 = notasOrdenadas[Math.floor(notasOrdenadas.length * 0.75)]

      const mockData: ReportData = {
        desempenhoTurmas: [
          {
            turma: 'Algoritmos',
            media: 8.5,
            stdDev: 1.2,
            aprovacao: 85,
            participacao: 92
          },
          {
            turma: 'Estrutura de Dados',
            media: 7.8,
            stdDev: 1.8,
            aprovacao: 78,
            participacao: 88
          },
          {
            turma: 'Banco de Dados',
            media: 8.2,
            stdDev: 1.1,
            aprovacao: 82,
            participacao: 90
          },
          {
            turma: 'Programação Web',
            media: 7.5,
            stdDev: 2.1,
            aprovacao: 75,
            participacao: 85
          },
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
        ],
        estatisticasGerais: {
          mediaGeral,
          desvioGeralPadrao,
          mediana,
          coeficienteVariacao,
          quartil1,
          quartil3
        }
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
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b']

  const chartConfigs = {
    desempenho: {
      media: {
        label: "Média",
        color: "hsl(var(--chart-1))",
      },
      stdDev: {
        label: "Desvio Padrão",
        color: "hsl(var(--chart-2))",
      },
      aprovacao: {
        label: "Taxa de Aprovação (%)",
        color: "hsl(var(--chart-3))",
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
  }

  if (isLoading || !reportData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  const getVariabilityColor = (cv: number) => {
    if (cv < 15) return "text-green-600 dark:text-green-400"
    if (cv < 30) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getVariabilityBadge = (cv: number) => {
    if (cv < 15) return { text: "Baixa", variant: "default" as const }
    if (cv < 30) return { text: "Moderada", variant: "secondary" as const }
    return { text: "Alta", variant: "destructive" as const }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="space-y-8 p-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Central de Relatórios
              </h1>
              <p className="text-muted-foreground mt-2">
                Análise completa de desempenho e estatísticas
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => exportReport('pdf')} className="gap-2">
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
              <Button onClick={() => exportReport('excel')} variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          {/* Filtros com design melhorado */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/95">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>
                <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                  <SelectTrigger className="w-[200px] bg-background/50">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as turmas</SelectItem>
                    {turmas.map(turma => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[200px] bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="90days">Últimos 3 meses</SelectItem>
                    <SelectItem value="6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="ml-auto">
                  <Activity className="h-3 w-3 mr-1" />
                  Atualizado há 5 min
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards com design aprimorado */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-violet-500/10 to-violet-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Target className="h-4 w-4 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportData.estatisticasGerais.mediaGeral.toFixed(1)}</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+0.3</span>
                <span className="text-xs text-muted-foreground">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desvio Padrão</CardTitle>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calculator className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportData.estatisticasGerais.desvioGeralPadrao.toFixed(2)}</div>
              <Progress value={30} className="h-1 mt-2" />
              <span className="text-xs text-muted-foreground">Dispersão das notas</span>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coef. Variação</CardTitle>
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportData.estatisticasGerais.coeficienteVariacao.toFixed(1)}%</div>
              <Badge className={`mt-2 ${getVariabilityBadge(reportData.estatisticasGerais.coeficienteVariacao).variant}`}>
                {getVariabilityBadge(reportData.estatisticasGerais.coeficienteVariacao).text}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mediana</CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reportData.estatisticasGerais.mediana.toFixed(1)}</div>
              <span className="text-xs text-muted-foreground">Valor central</span>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intervalo IQ</CardTitle>
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.estatisticasGerais.quartil1.toFixed(1)} - {reportData.estatisticasGerais.quartil3.toFixed(1)}
              </div>
              <span className="text-xs text-muted-foreground">Q1 - Q3</span>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com design melhorado */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-14 p-1 bg-muted/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Brain className="h-4 w-4 mr-2" />
              Desempenho
            </TabsTrigger>
            <TabsTrigger value="materials" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Materiais
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Activity className="h-4 w-4 mr-2" />
              Atividade
            </TabsTrigger>
            <TabsTrigger value="subjects">Assunto/Conteúdo</TabsTrigger> {/* Nova aba */}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Gráfico de Desempenho com gradiente */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Desempenho por Turma</CardTitle>
                      <CardDescription>Média de notas e desvio padrão</CardDescription>
                    </div>
                    <Badge variant="outline">4 turmas</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfigs.desempenho} className="w-full h-[350px]">
                    <AreaChart data={reportData.desempenhoTurmas}>
                      <defs>
                        <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorStdDev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="turma" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="media"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorMedia)"
                      />
                      <Area
                        type="monotone"
                        dataKey="stdDev"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorStdDev)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Pizza melhorado */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Distribuição de Notas</CardTitle>
                      <CardDescription>Frequência por faixa</CardDescription>
                    </div>
                    <Badge variant="outline">118 alunos</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.distribuicaoNotas}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ porcentagem }) => `${porcentagem}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="quantidade"
                        >
                          {reportData.distribuicaoNotas.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {reportData.distribuicaoNotas.map((item, index) => (
                      <div key={item.faixa} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs text-muted-foreground">{item.faixa}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Variabilidade com design moderno */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Análise de Variabilidade por Turma</CardTitle>
                    <CardDescription>Comparação detalhada de médias e desvios</CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    Análise Avançada
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigs.desempenho} className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.desempenhoTurmas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="mediaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="stdDevGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="turma" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background/95 backdrop-blur border border-border p-4 rounded-lg shadow-xl">
                                <p className="font-semibold mb-2">{label}</p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between gap-4">
                                    <span>Média:</span>
                                    <span className="font-mono font-semibold">{data.media.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span>Desvio Padrão:</span>
                                    <span className="font-mono font-semibold">{data.stdDev.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span>Aprovação:</span>
                                    <Badge variant="outline">{data.aprovacao}%</Badge>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex items-center gap-2">
                                    {data.stdDev < 1.5 ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : data.stdDev < 2.0 ? (
                                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-xs">
                                      {data.stdDev < 1.5 ? 'Baixa variabilidade' :
                                        data.stdDev < 2.0 ? 'Variabilidade moderada' :
                                          'Alta variabilidade'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="media" fill="url(#mediaGradient)" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="stdDev" fill="url(#stdDevGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Cards de Insights com ícones e cores */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    Análise de Desvio Padrão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-blue-600">
                        {reportData.estatisticasGerais.desvioGeralPadrao.toFixed(2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Desvio Padrão Geral</p>
                        <p className="text-xs text-muted-foreground">Medida de dispersão</p>
                      </div>
                    </div>
                    <Badge variant={reportData.estatisticasGerais.desvioGeralPadrao < 1.5 ? "default" : "secondary"}>
                      {reportData.estatisticasGerais.desvioGeralPadrao < 1.0
                        ? "Excelente"
                        : reportData.estatisticasGerais.desvioGeralPadrao < 2.0
                          ? "Bom"
                          : "Atenção"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reportData.estatisticasGerais.desvioGeralPadrao < 1.0
                      ? "✅ As notas estão muito concentradas próximas à média, indicando excelente consistência no desempenho."
                      : reportData.estatisticasGerais.desvioGeralPadrao < 2.0
                        ? "📊 Dispersão moderada e saudável. O desempenho está dentro dos padrões esperados."
                        : "⚠️ Alta dispersão detectada. Considere estratégias de nivelamento e suporte individualizado."}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/20 dark:to-emerald-950/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    Coeficiente de Variação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl font-bold ${getVariabilityColor(reportData.estatisticasGerais.coeficienteVariacao)}`}>
                        {reportData.estatisticasGerais.coeficienteVariacao.toFixed(1)}%
                      </div>
                      <div>
                        <p className="text-sm font-medium">Variabilidade Relativa</p>
                        <p className="text-xs text-muted-foreground">CV = (σ/μ) × 100</p>
                      </div>
                    </div>
                    <Badge variant={getVariabilityBadge(reportData.estatisticasGerais.coeficienteVariacao).variant}>
                      {getVariabilityBadge(reportData.estatisticasGerais.coeficienteVariacao).text}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reportData.estatisticasGerais.coeficienteVariacao < 15
                      ? "✅ Excelente homogeneidade. O grupo apresenta desempenho muito consistente."
                      : reportData.estatisticasGerais.coeficienteVariacao < 30
                        ? "📊 Variabilidade aceitável para o contexto educacional."
                        : "⚠️ Alta variabilidade detectada. Recomenda-se atenção especial aos grupos extremos."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Engajamento com Materiais</CardTitle>
                    <CardDescription>Downloads e visualizações por conteúdo</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      449 visualizações
                    </Badge>
                    <Badge variant="outline">
                      <FileDown className="h-3 w-3 mr-1" />
                      322 downloads
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigs.materiais} className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.usoMateriais} layout="horizontal">
                      <defs>
                        <linearGradient id="downloadsGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="viewsGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="material" type="category" className="text-xs" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend />
                      <Bar dataKey="downloads" fill="url(#downloadsGrad)" radius={[0, 8, 8, 0]} />
                      <Bar dataKey="visualizacoes" fill="url(#viewsGrad)" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Insights de Materiais */}
            <div className="grid gap-4 lg:grid-cols-3">
              {reportData.usoMateriais.slice(0, 3).map((material, index) => (
                <Card key={material.material} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index === 0 ? "Mais Popular" : `Top ${index + 1}`}
                      </Badge>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold mb-4">{material.material}</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Downloads</span>
                          <span className="font-semibold">{material.downloads}</span>
                        </div>
                        <Progress value={(material.downloads / 100) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Visualizações</span>
                          <span className="font-semibold">{material.visualizacoes}</span>
                        </div>
                        <Progress value={(material.visualizacoes / 150) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tendência de Atividades</CardTitle>
                    <CardDescription>Evolução diária de engajamento</CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Últimos 7 dias
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigs.atividade} className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.atividadeDiaria}>
                      <defs>
                        <linearGradient id="simuladosGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="materiaisGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="alunosGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="data" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend />
                      <Area
                        type="monotone"
                        dataKey="simulados"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="url(#simuladosGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="materiais"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="url(#materiaisGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="alunos"
                        stackId="1"
                        stroke="#10b981"
                        fill="url(#alunosGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Resumo de Atividades */}
            <div className="grid gap-4 lg:grid-cols-4">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Simulados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">24</div>
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/20 rounded-lg">
                      <FileText className="h-4 w-4 text-violet-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Esta semana</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Materiais Acessados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">72</div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">+15% vs anterior</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">308</div>
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                      <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">92% do total</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">87%</div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                      <Activity className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Meta: 85%</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Alunos com design melhorado */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <CardTitle>Ranking dos Alunos</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.topAlunos.map((aluno, index) => (
                    <div
                      key={aluno.posicao}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                          ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-500/30' :
                              index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30' :
                                'bg-gradient-to-br from-blue-400 to-blue-600 text-white'}
                        `}>
                          {aluno.posicao}
                        </div>
                        <div>
                          <p className="font-semibold text-base">{aluno.nome}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {aluno.simulados} simulados
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Top {((aluno.posicao / reportData.topAlunos.length) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          {aluno.media.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">média</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Cards de Análise Estatística */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-600/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Brain className="h-4 w-4 text-purple-600" />
                    </div>
                    Tendência Central
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-sm">Média</span>
                      <span className="font-mono font-semibold">{reportData.estatisticasGerais.mediaGeral.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-sm">Mediana</span>
                      <span className="font-mono font-semibold">{reportData.estatisticasGerais.mediana.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    Dispersão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-sm">Desvio Padrão</span>
                      <span className="font-mono font-semibold">{reportData.estatisticasGerais.desvioGeralPadrao.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-sm">Coef. Variação</span>
                      <Badge className={getVariabilityBadge(reportData.estatisticasGerais.coeficienteVariacao).variant}>
                        {reportData.estatisticasGerais.coeficienteVariacao.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500/5 to-emerald-600/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <Activity className="h-4 w-4 text-emerald-600" />
                    </div>
                    Quartis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-sm">Q1 (25%)</span>
                      <span className="font-mono font-semibold">{reportData.estatisticasGerais.quartil1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-sm">Q3 (75%)</span>
                      <span className="font-mono font-semibold">{reportData.estatisticasGerais.quartil3.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                      <span className="text-sm">IQR</span>
                      <span className="font-mono font-semibold">{(reportData.estatisticasGerais.quartil3 - reportData.estatisticasGerais.quartil1).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de dispersão por turma */}
            <Card>
              <CardHeader>
                <CardTitle>Variabilidade por Turma</CardTitle>
                <CardDescription>Comparação de médias e desvios padrão</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfigs.desempenho} className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.desempenhoTurmas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="turma" />
                      <YAxis />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                                <p className="font-medium">{label}</p>
                                <p className="text-sm">Média: {data.media.toFixed(2)}</p>
                                <p className="text-sm">Desvio Padrão: {data.stdDev.toFixed(2)}</p>
                                <p className="text-sm">Aprovação: {data.aprovacao}%</p>
                                <p className="text-sm">
                                  Interpretação: {data.stdDev < 1.5 ? 'Baixa variabilidade' :
                                    data.stdDev < 2.0 ? 'Variabilidade moderada' :
                                      'Alta variabilidade'}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="media" fill="var(--color-media)" name="Média" />
                      <Bar dataKey="stdDev" fill="var(--color-stdDev)" name="Desvio Padrão" />
                    </BarChart>
                  </ResponsiveContainer>
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
                <ChartContainer config={chartConfigs.materiais} className="w-full h-[400px]">
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
                <ChartContainer config={chartConfigs.atividade} className="w-full h-[400px]">
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
                      type="monotone"
                      dataKey="simulados"
                      stroke="var(--color-simulados)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="materiais"
                      stroke="var(--color-materiais)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="alunos"
                      stroke="var(--color-alunos)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="subjects" className="space-y-6">
            <SubjectReportTab />
          </TabsContent>
        </Tabs >

        {/* Botões de exportação */}
        < Card >
          <CardHeader>
            <CardTitle>Exportar Relatório</CardTitle>
            <CardDescription>Baixe o relatório nos formatos disponíveis</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => exportReport('pdf')} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button onClick={() => exportReport('excel')} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </CardContent>
        </Card >
      </div >
    </div>
  )
}