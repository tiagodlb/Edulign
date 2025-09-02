'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie
} from 'recharts'

import { adminService, type SystemStats, type ActivityReport } from '@/lib/api/admin'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function EstatisticasPage() {
  // Estados principais
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [activityReport, setActivityReport] = useState<ActivityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')

  const { toast } = useToast()

  // Carregar dados
  useEffect(() => {
    loadStatistics()
  }, [period])

  useEffect(() => {
    loadActivityReport()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const response = await adminService.getSystemStatistics(period)
      setStats(response.data)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar estatísticas do sistema',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadActivityReport = async () => {
    try {
      const endDate = new Date()
      const startDate = subDays(endDate, 30) // Últimos 30 dias
      
      const response = await adminService.getActivityReport({
        startDate: format(startOfDay(startDate), 'yyyy-MM-dd'),
        endDate: format(endOfDay(endDate), 'yyyy-MM-dd'),
        type: 'all'
      })
      
      setActivityReport(response.data)
    } catch (error) {
      console.error('Erro ao carregar relatório de atividades:', error)
    }
  }

  const refreshData = () => {
    loadStatistics()
    loadActivityReport()
  }

  // Dados para gráficos
  const questionsByAreaData = stats?.questions.byArea.map(item => ({
    name: item.area,
    value: item.count
  })) || []

  const activityByDateData = activityReport?.breakdown.byDate.map(item => ({
    date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
    eventos: item.events
  })) || []

  const userActivityData = [
    { name: 'Usuários Ativos', value: stats?.users.active || 0 },
    { name: 'Usuários Inativos', value: (stats?.users.total || 0) - (stats?.users.active || 0) }
  ]

  // Métricas calculadas
  const userGrowthRate = stats?.users.total ? 
    ((stats.users.newThisPeriod / stats.users.total) * 100).toFixed(1) : '0'

  const questionGrowthRate = stats?.questions.total ?
    ((stats.questions.newThisPeriod / stats.questions.total) * 100).toFixed(1) : '0'

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estatísticas do Sistema</h1>
          <p className="text-muted-foreground">
            Acompanhe as métricas e tendências da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="questions">Questões</TabsTrigger>
            <TabsTrigger value="ai">IA & Respostas</TabsTrigger>
            <TabsTrigger value="activity">Atividades</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {stats?.users.newThisPeriod && stats?.users.newThisPeriod > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        +{userGrowthRate}% este período
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        {userGrowthRate}% este período
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Questões</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.questions.total || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {stats?.questions.newThisPeriod && stats?.questions.newThisPeriod > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        +{questionGrowthRate}% este período
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        {questionGrowthRate}% este período
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Respostas Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.responses.totalPending || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando revisão
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.responses.approvalRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Respostas IA aprovadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade dos Últimos 30 Dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={activityByDateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="eventos" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={userActivityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userActivityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Ativos</CardTitle>
                  <CardDescription>Usuários que acessaram o sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.users.active || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.users.total ? 
                      ((stats.users.active / stats.users.total) * 100).toFixed(1) : '0'
                    }% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Novos Usuários</CardTitle>
                  <CardDescription>Registrados neste período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats?.users.newThisPeriod || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Crescimento de {userGrowthRate}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total de Usuários</CardTitle>
                  <CardDescription>Todos os usuários registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats?.users.total || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acumulado histórico
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de atividade de usuários seria adicionado aqui */}
          </TabsContent>

          {/* Questões */}
          <TabsContent value="questions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Questões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.questions.total || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    +{stats?.questions.newThisPeriod || 0} neste período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Área</CardTitle>
                </CardHeader>
                <CardContent>
                  {questionsByAreaData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={questionsByAreaData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* IA & Respostas */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Respostas Pendentes</CardTitle>
                  <CardDescription>Aguardando revisão</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {stats?.responses.totalPending || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Precisam de atenção
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Respostas Revisadas</CardTitle>
                  <CardDescription>Processadas pelo admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.responses.totalReviewed || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Finalizadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Aprovação</CardTitle>
                  <CardDescription>Respostas IA aprovadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats?.responses.approvalRate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Qualidade das respostas
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Atividades */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simulados Completados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.activity.simuladosCompleted || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    Neste período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pontuação Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.activity.avgScore.toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">
                    Performance dos usuários
                  </p>
                </CardContent>
              </Card>
            </div>

            {activityReport && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Atividades (30 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{activityReport.summary.totalEvents}</div>
                      <p className="text-sm text-muted-foreground">Total de Eventos</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{activityReport.summary.uniqueUsers}</div>
                      <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {activityReport.summary.peakDay ? 
                          format(new Date(activityReport.summary.peakDay), 'dd/MM', { locale: ptBR }) : 
                          'N/A'
                        }
                      </div>
                      <p className="text-sm text-muted-foreground">Dia de Pico</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}