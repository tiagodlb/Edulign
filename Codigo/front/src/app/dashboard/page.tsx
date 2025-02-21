'use client'

import { useEffect, useState } from 'react'
import { BarChart3, BookOpen, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { SiteHeader } from '../../components/layout/site-header'
import { Progress } from '../../components/ui/progress'
import StudentService from '../../lib/api/student'
import { toast } from '../../hooks/use-toast'

interface Statistics {
  totalSimulados: number
  totalQuestoes: number
  questoesCorretas: number
  mediaGeral: number
  porArea: Record<
    string,
    {
      total: number
      corretas: number
      percentual: number
    }
  >
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const response = await StudentService.getStatistics()
      if (response?.success) {
        setStats(response.data)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar estatísticas',
        description: 'Não foi possível carregar os dados do dashboard.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando estatísticas...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-grow container mx-auto px-8 py-12 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              title="Simulados"
              value={stats?.totalSimulados.toString() || '0'}
              description="Total de simulados realizados"
            />
            <StatCard
              icon={<BookOpen className="h-4 w-4" />}
              title="Questões"
              value={stats?.totalQuestoes.toString() || '0'}
              description="Total de questões respondidas"
            />
            <StatCard
              icon={<BookOpen className="h-4 w-4" />}
              title="Acertos"
              value={stats?.questoesCorretas.toString() || '0'}
              description="Total de questões corretas"
            />
            <StatCard
              icon={<BarChart3 className="h-4 w-4" />}
              title="Média Geral"
              value={`${stats?.mediaGeral.toFixed(1) || '0'}%`}
              description="Desempenho médio"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Área</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats &&
                    Object.entries(stats.porArea).map(([area, data]) => (
                      <div key={area} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{area}</span>
                            <p className="text-sm text-muted-foreground">
                              {data.corretas} de {data.total} questões
                            </p>
                          </div>
                          <span className="text-sm font-medium">{data.percentual}%</span>
                        </div>
                        <Progress value={data.percentual} className="h-2" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  description: string
}

function StatCard({ icon, title, value, description }: Readonly<StatCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
