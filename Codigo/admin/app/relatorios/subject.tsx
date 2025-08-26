'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { 
  BookOpen, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Users,
  Trophy,
  Target,
  Brain,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Activity,
  Filter,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/components/AuthProvider'

// Tipos de dados
interface SubjectReport {
  id: string
  subject: string
  area: string
  totalQuestions: number
  averageScore: number
  totalAttempts: number
  successRate: number
  averageTime: number
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  topicBreakdown: {
    topic: string
    questions: number
    correctAnswers: number
    percentage: number
  }[]
  performanceByPeriod: {
    period: string
    score: number
    attempts: number
  }[]
  commonErrors: {
    type: string
    frequency: number
    description: string
  }[]
}

interface AreaSummary {
  area: string
  totalSubjects: number
  averageScore: number
  totalStudents: number
  totalQuestions: number
  completionRate: number
}

// Componente principal - adicionar à página de relatórios existente
export function SubjectReportTab() {
  const { user } = useAuth()
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [subjectReports, setSubjectReports] = useState<SubjectReport[]>([])
  const [areaSummaries, setAreaSummaries] = useState<AreaSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubjectReports()
  }, [selectedArea, selectedSubject, selectedPeriod, selectedDifficulty])

  const loadSubjectReports = async () => {
    try {
      // Dados mockados - substituir por chamada API real
      const mockReports: SubjectReport[] = [
        {
          id: '1',
          subject: 'Algoritmos de Ordenação',
          area: 'Estruturas de Dados',
          totalQuestions: 45,
          averageScore: 7.8,
          totalAttempts: 234,
          successRate: 72,
          averageTime: 4.5,
          difficulty: 'Médio',
          trend: 'up',
          trendValue: 12,
          topicBreakdown: [
            { topic: 'Bubble Sort', questions: 10, correctAnswers: 8, percentage: 80 },
            { topic: 'Quick Sort', questions: 15, correctAnswers: 11, percentage: 73 },
            { topic: 'Merge Sort', questions: 10, correctAnswers: 7, percentage: 70 },
            { topic: 'Heap Sort', questions: 10, correctAnswers: 6, percentage: 60 },
          ],
          performanceByPeriod: [
            { period: 'Sem 1', score: 6.5, attempts: 45 },
            { period: 'Sem 2', score: 7.2, attempts: 52 },
            { period: 'Sem 3', score: 7.8, attempts: 68 },
            { period: 'Sem 4', score: 8.1, attempts: 69 },
          ],
          commonErrors: [
            { type: 'Complexidade', frequency: 45, description: 'Confusão entre O(n) e O(n²)' },
            { type: 'Implementação', frequency: 32, description: 'Erro na troca de elementos' },
            { type: 'Conceitual', frequency: 28, description: 'Escolha incorreta do algoritmo' },
          ],
        },
        {
          id: '2',
          subject: 'Programação Orientada a Objetos',
          area: 'Engenharia de Software',
          totalQuestions: 60,
          averageScore: 8.2,
          totalAttempts: 312,
          successRate: 78,
          averageTime: 5.2,
          difficulty: 'Médio',
          trend: 'stable',
          trendValue: 0,
          topicBreakdown: [
            { topic: 'Herança', questions: 15, correctAnswers: 12, percentage: 80 },
            { topic: 'Polimorfismo', questions: 15, correctAnswers: 11, percentage: 73 },
            { topic: 'Encapsulamento', questions: 15, correctAnswers: 13, percentage: 87 },
            { topic: 'Abstração', questions: 15, correctAnswers: 11, percentage: 73 },
          ],
          performanceByPeriod: [
            { period: 'Sem 1', score: 7.8, attempts: 72 },
            { period: 'Sem 2', score: 8.0, attempts: 78 },
            { period: 'Sem 3', score: 8.2, attempts: 81 },
            { period: 'Sem 4', score: 8.2, attempts: 81 },
          ],
          commonErrors: [
            { type: 'Herança múltipla', frequency: 38, description: 'Confusão com interfaces' },
            { type: 'Override vs Overload', frequency: 29, description: 'Diferença entre métodos' },
            { type: 'Modificadores', frequency: 22, description: 'Uso incorreto de public/private' },
          ],
        },
        {
          id: '3',
          subject: 'Normalização de Dados',
          area: 'Banco de Dados',
          totalQuestions: 35,
          averageScore: 6.9,
          totalAttempts: 189,
          successRate: 65,
          averageTime: 6.1,
          difficulty: 'Difícil',
          trend: 'down',
          trendValue: -8,
          topicBreakdown: [
            { topic: '1ª Forma Normal', questions: 10, correctAnswers: 8, percentage: 80 },
            { topic: '2ª Forma Normal', questions: 10, correctAnswers: 7, percentage: 70 },
            { topic: '3ª Forma Normal', questions: 10, correctAnswers: 5, percentage: 50 },
            { topic: 'BCNF', questions: 5, correctAnswers: 2, percentage: 40 },
          ],
          performanceByPeriod: [
            { period: 'Sem 1', score: 7.5, attempts: 45 },
            { period: 'Sem 2', score: 7.2, attempts: 48 },
            { period: 'Sem 3', score: 7.0, attempts: 49 },
            { period: 'Sem 4', score: 6.9, attempts: 47 },
          ],
          commonErrors: [
            { type: 'Dependências', frequency: 52, description: 'Identificação incorreta de DF' },
            { type: '3FN vs BCNF', frequency: 41, description: 'Confusão entre formas' },
            { type: 'Decomposição', frequency: 35, description: 'Perda de informação' },
          ],
        },
      ]

      const mockAreaSummaries: AreaSummary[] = [
        {
          area: 'Estruturas de Dados',
          totalSubjects: 8,
          averageScore: 7.6,
          totalStudents: 145,
          totalQuestions: 320,
          completionRate: 82,
        },
        {
          area: 'Engenharia de Software',
          totalSubjects: 12,
          averageScore: 8.1,
          totalStudents: 168,
          totalQuestions: 450,
          completionRate: 88,
        },
        {
          area: 'Banco de Dados',
          totalSubjects: 6,
          averageScore: 7.2,
          totalStudents: 132,
          totalQuestions: 210,
          completionRate: 75,
        },
        {
          area: 'Programação Web',
          totalSubjects: 10,
          averageScore: 8.3,
          totalStudents: 187,
          totalQuestions: 380,
          completionRate: 91,
        },
      ]

      // Filtrar por área
      let filteredReports = mockReports
      if (selectedArea !== 'all') {
        filteredReports = filteredReports.filter(r => r.area === selectedArea)
      }

      // Filtrar por assunto
      if (selectedSubject !== 'all') {
        filteredReports = filteredReports.filter(r => r.subject === selectedSubject)
      }

      // Filtrar por dificuldade
      if (selectedDifficulty !== 'all') {
        filteredReports = filteredReports.filter(r => r.difficulty === selectedDifficulty)
      }

      setSubjectReports(filteredReports)
      setAreaSummaries(mockAreaSummaries)
    } catch (error) {
      console.error('Erro ao carregar relatórios por assunto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportSubjectReport = (format: 'pdf' | 'excel') => {
    console.log(`Exportando relatório de assuntos em ${format}`)
    // Implementar exportação real
  }

  // Configuração dos gráficos
  const chartConfig = {
    score: {
      label: "Pontuação",
      color: "hsl(var(--chart-1))",
    },
    attempts: {
      label: "Tentativas",
      color: "hsl(var(--chart-2))",
    },
    success: {
      label: "Taxa de Sucesso",
      color: "hsl(var(--chart-3))",
    },
    time: {
      label: "Tempo Médio",
      color: "hsl(var(--chart-4))",
    },
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                <SelectItem value="Estruturas de Dados">Estruturas de Dados</SelectItem>
                <SelectItem value="Engenharia de Software">Engenharia de Software</SelectItem>
                <SelectItem value="Banco de Dados">Banco de Dados</SelectItem>
                <SelectItem value="Programação Web">Programação Web</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os assuntos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os assuntos</SelectItem>
                {subjectReports.map(report => (
                  <SelectItem key={report.id} value={report.subject}>
                    {report.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as dificuldades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as dificuldades</SelectItem>
                <SelectItem value="Fácil">Fácil</SelectItem>
                <SelectItem value="Médio">Médio</SelectItem>
                <SelectItem value="Difícil">Difícil</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => exportSubjectReport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={() => exportSubjectReport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Área */}
      <div className="grid gap-4 md:grid-cols-4">
        {areaSummaries.map((summary, index) => (
          <Card key={summary.area}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {summary.area}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSubjects} assuntos</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  Média: {summary.averageScore.toFixed(1)}
                </span>
                <Badge variant="outline">
                  {summary.completionRate}% completo
                </Badge>
              </div>
              <Progress value={summary.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Análise Detalhada por Assunto */}
      <div className="grid gap-6 md:grid-cols-2">
        {subjectReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{report.subject}</CardTitle>
                  <CardDescription>{report.area}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      report.difficulty === 'Fácil' ? 'default' : 
                      report.difficulty === 'Médio' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {report.difficulty}
                  </Badge>
                  {report.trend === 'up' && (
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">+{report.trendValue}%</span>
                    </div>
                  )}
                  {report.trend === 'down' && (
                    <div className="flex items-center text-red-600">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{report.trendValue}%</span>
                    </div>
                  )}
                  {report.trend === 'stable' && (
                    <div className="flex items-center text-gray-600">
                      <Activity className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Estável</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Métricas Principais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Média Geral</p>
                  <p className="text-2xl font-bold">{report.averageScore.toFixed(1)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">{report.successRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total de Questões</p>
                  <p className="text-lg font-semibold">{report.totalQuestions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-lg font-semibold">{report.averageTime}min</p>
                </div>
              </div>

              <Separator />

              {/* Desempenho por Tópico */}
              <div>
                <h4 className="text-sm font-medium mb-3">Desempenho por Tópico</h4>
                <div className="space-y-2">
                  {report.topicBreakdown.map((topic) => (
                    <div key={topic.topic} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{topic.topic}</span>
                        <span className="font-medium">{topic.percentage}%</span>
                      </div>
                      <Progress value={topic.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Gráfico de Evolução */}
              <div>
                <h4 className="text-sm font-medium mb-3">Evolução do Desempenho</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={report.performanceByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <Separator />

              {/* Erros Comuns */}
              <div>
                <h4 className="text-sm font-medium mb-3">Erros Mais Frequentes</h4>
                <div className="space-y-2">
                  {report.commonErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{error.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {error.description} ({error.frequency} ocorrências)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Assuntos</CardTitle>
          <CardDescription>
            Análise comparativa de desempenho entre diferentes assuntos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assunto</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="text-center">Questões</TableHead>
                <TableHead className="text-center">Tentativas</TableHead>
                <TableHead className="text-center">Média</TableHead>
                <TableHead className="text-center">Taxa Sucesso</TableHead>
                <TableHead className="text-center">Tempo Médio</TableHead>
                <TableHead className="text-center">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.subject}</TableCell>
                  <TableCell>{report.area}</TableCell>
                  <TableCell className="text-center">{report.totalQuestions}</TableCell>
                  <TableCell className="text-center">{report.totalAttempts}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{report.averageScore.toFixed(1)}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {report.successRate >= 70 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : report.successRate >= 50 ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{report.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{report.averageTime}min</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {report.trend === 'up' && (
                      <Badge variant="default" className="bg-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {report.trendValue}%
                      </Badge>
                    )}
                    {report.trend === 'down' && (
                      <Badge variant="destructive">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {report.trendValue}%
                      </Badge>
                    )}
                    {report.trend === 'stable' && (
                      <Badge variant="secondary">
                        <Activity className="h-3 w-3 mr-1" />
                        Estável
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gráfico de Radar - Comparação de Áreas */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Multidimensional por Área</CardTitle>
          <CardDescription>
            Comparação de diferentes métricas entre as áreas de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={areaSummaries.map(area => ({
              area: area.area,
              'Média de Notas': area.averageScore * 10,
              'Taxa de Conclusão': area.completionRate,
              'Engajamento': (area.totalStudents / 200) * 100,
              'Conteúdo': (area.totalQuestions / 500) * 100,
            }))}>
              <PolarGrid />
              <PolarAngleAxis dataKey="area" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Métricas" 
                dataKey="Média de Notas" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Taxa de Conclusão" 
                dataKey="Taxa de Conclusão" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Engajamento" 
                dataKey="Engajamento" 
                stroke="#ffc658" 
                fill="#ffc658" 
                fillOpacity={0.6} 
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}