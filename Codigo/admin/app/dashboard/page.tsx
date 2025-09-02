"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  FileQuestion,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import { useAuth } from "@/components/AuthProvider"
import { useAdmin } from "@/lib/contexts/AdminContext"
import { PageHeader } from "@/components/layout/main-nav"
import { dateUtils, numberUtils } from "@/lib/admin-utils"
import React from "react"

// ==================== MOCK DATA ====================

const activityData = [
  { name: "Seg", usuarios: 120, questoes: 8, revisoes: 15 },
  { name: "Ter", usuarios: 98, questoes: 12, revisoes: 23 },
  { name: "Qua", usuarios: 156, questoes: 5, revisoes: 18 },
  { name: "Qui", usuarios: 134, questoes: 9, revisoes: 12 },
  { name: "Sex", usuarios: 189, questoes: 15, revisoes: 28 },
  { name: "Sab", usuarios: 78, questoes: 3, revisoes: 5 },
  { name: "Dom", usuarios: 45, questoes: 1, revisoes: 2 },
]

const responseTypeData = [
  { name: "Questões", value: 45, color: "#8884d8" },
  { name: "Explicações", value: 30, color: "#82ca9d" },
  { name: "Dicas", value: 25, color: "#ffc658" },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"]

// ==================== COMPONENTS ====================

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  description: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  trend?: "up" | "down" | "stable"
  color?: "default" | "success" | "warning" | "danger"
}

function MetricCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  href,
  trend,
  color = "default",
}: MetricCardProps) {
  const colorClasses = {
    default: "text-muted-foreground",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  }

  const trendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"

  const CardComponent = href ? Link : "div"
  const cardProps = href ? { href } : {}

  return (
    <CardComponent {...cardProps} className={href ? "block hover:shadow-md transition-shadow" : ""}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {typeof value === "number" ? numberUtils.formatNumber(value) : value}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{description}</span>
            {change !== undefined && trendIcon && (
              <div className={`flex items-center ${trendColor}`}>
                {React.createElement(trendIcon, { className: "h-3 w-3" })}
                <span>{numberUtils.formatGrowth(change, 0)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CardComponent>
  )
}

interface QuickActionProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  color?: string
}

function QuickAction({ title, description, href, icon: Icon, badge, color }: QuickActionProps) {
  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${color || "bg-primary/10"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ==================== MAIN COMPONENT ====================

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { state: adminState, loadStatistics } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month")

  // Carregar estatísticas
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await loadStatistics(period)
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [period, loadStatistics])

  const stats = adminState.statistics.data

  // Dados derivados
  const userGrowth = stats
    ? numberUtils.calculateGrowth(stats.users.active, stats.users.total - stats.users.newThisPeriod)
    : 0
  const questionGrowth = stats
    ? numberUtils.calculateGrowth(stats.questions.newThisPeriod, stats.questions.total - stats.questions.newThisPeriod)
    : 0

  // Quick actions baseadas no que precisa de atenção
  const quickActions = [
    {
      title: "Revisar Respostas IA",
      description: `${stats?.responses.totalPending || 0} respostas aguardando revisão`,
      href: "/revisao-ia",
      icon: Brain,
      badge: stats?.responses.totalPending ? stats.responses.totalPending.toString() : undefined,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Adicionar Questões",
      description: "Expandir banco de questões",
      href: "/questoes",
      icon: Plus,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Gerenciar Usuários",
      description: `${stats?.users.total || 0} usuários no sistema`,
      href: "/usuarios",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Ver Relatórios",
      description: "Análises detalhadas",
      href: "/estatisticas",
      icon: BarChart3,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user?.nome?.split(" ")[0] || "Admin"}! 👋`}
        description="Aqui está o resumo do que está acontecendo no sistema"
        action={
          <Button onClick={() => loadStatistics(period)} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="activity">Atividades</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métricas principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total de Usuários"
                value={stats?.users.total || 0}
                change={userGrowth}
                description={`${stats?.users.active || 0} ativos`}
                icon={Users}
                href="/usuarios"
                trend={userGrowth > 0 ? "up" : userGrowth < 0 ? "down" : "stable"}
                color="default"
              />

              <MetricCard
                title="Questões"
                value={stats?.questions.total || 0}
                change={questionGrowth}
                description={`+${stats?.questions.newThisPeriod || 0} este período`}
                icon={FileQuestion}
                href="/questoes"
                trend={questionGrowth > 0 ? "up" : "stable"}
                color="success"
              />

              <MetricCard
                title="Respostas Pendentes"
                value={stats?.responses.totalPending || 0}
                description="Aguardando revisão"
                icon={Clock}
                href="/revisao-ia"
                color={stats && stats.responses.totalPending > 10 ? "warning" : "default"}
              />

              <MetricCard
                title="Taxa de Aprovação"
                value={stats ? `${stats.responses.approvalRate.toFixed(1)}%` : "0%"}
                description="Respostas IA aprovadas"
                icon={CheckCircle}
                color="success"
              />
            </div>

            {/* Ações rápidas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => (
                  <QuickAction key={index} {...action} />
                ))}
              </div>
            </div>

            {/* Gráficos principais */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade dos Últimos 7 Dias</CardTitle>
                  <CardDescription>Usuários ativos, questões criadas e revisões feitas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="usuarios" stroke="#8884d8" strokeWidth={2} name="Usuários" />
                      <Line type="monotone" dataKey="questoes" stroke="#82ca9d" strokeWidth={2} name="Questões" />
                      <Line type="monotone" dataKey="revisoes" stroke="#ffc658" strokeWidth={2} name="Revisões" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Respostas IA</CardTitle>
                  <CardDescription>Tipos de respostas geradas pela IA</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={responseTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {responseTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Questões por área */}
            {stats?.questions.byArea && stats.questions.byArea.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Questões por Área de Conhecimento</CardTitle>
                  <CardDescription>Distribuição do banco de questões</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.questions.byArea}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Detalhada</CardTitle>
                  <CardDescription>Métricas de atividade por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="usuarios"
                        stackId="1"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        name="Usuários Ativos"
                      />
                      <Area
                        type="monotone"
                        dataKey="questoes"
                        stackId="2"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorQuestions)"
                        name="Novas Questões"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Atividades recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>Últimas ações no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        icon: Users,
                        title: "Novo usuário cadastrado",
                        description: "João Silva se registrou como professor",
                        time: "2 horas atrás",
                        color: "bg-green-100 text-green-600",
                      },
                      {
                        icon: FileQuestion,
                        title: "5 questões adicionadas",
                        description: "Questões de Matemática do ENADE 2024",
                        time: "4 horas atrás",
                        color: "bg-blue-100 text-blue-600",
                      },
                      {
                        icon: Brain,
                        title: "Respostas IA revisadas",
                        description: "12 respostas aprovadas por Maria Admin",
                        time: "6 horas atrás",
                        color: "bg-purple-100 text-purple-600",
                      },
                      {
                        icon: AlertCircle,
                        title: "Sistema atualizado",
                        description: "Nova versão com melhorias de performance",
                        time: "1 dia atrás",
                        color: "bg-orange-100 text-orange-600",
                      },
                    ].map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${activity.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                  <CardDescription>Saúde geral da plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Banco de Dados</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Conectado</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">IA Service</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Ativo</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">75% usado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recursos do Sistema</CardTitle>
                  <CardDescription>Uso atual dos recursos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>CPU</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Memória</span>
                      <span>62%</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Disco</span>
                      <span>28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Rede</span>
                      <span>15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                  <CardDescription>Detalhes técnicos e versões</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Versão</h4>
                      <p className="text-sm text-muted-foreground">v2.1.0</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Última Atualização</h4>
                      <p className="text-sm text-muted-foreground">
                        {dateUtils.formatDate(new Date(), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Uptime</h4>
                      <p className="text-sm text-muted-foreground">7 dias, 14h 32m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
