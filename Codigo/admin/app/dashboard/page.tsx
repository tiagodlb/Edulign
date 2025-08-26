'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  School,
  GraduationCap,
  BarChart
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { SiteHeader } from '@/components/layout/site-header'
import QuestionManager from '@/components/QuestionManager'

interface DashboardData {
  totalTurmas: number
  totalAlunos: number
  simuladosAtivos: number
  taxaConclusaoMedia: number
  turmasRecentes: Array<{
    id: string
    nome: string
    codigo: string
    totalAlunos: number
    simuladosAtivos: number
  }>
  atividadesRecentes: Array<{
    id: string
    tipo: 'simulado' | 'material' | 'aluno'
    descricao: string
    data: string
    turma: string
  }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<'admin' | 'professor' | null>(null)

  useEffect(() => {
    // Verificar o tipo de usuário
    const checkUserRole = async () => {
      // Aqui você faria uma chamada à API para verificar o papel do usuário
      // Por enquanto, vamos simular
      const isProfessor = true // Simular que é professor
      setUserRole(isProfessor ? 'professor' : 'admin')
    }

    checkUserRole()
  }, [user])

  useEffect(() => {
    if (userRole === 'professor') {
      loadProfessorDashboard()
    } else if (userRole === 'admin') {
      loadAdminDashboard()
    }
  }, [userRole])

  const loadProfessorDashboard = async () => {
    try {
      // Simular dados do dashboard do professor
      const mockData: DashboardData = {
        totalTurmas: 4,
        totalAlunos: 87,
        simuladosAtivos: 3,
        taxaConclusaoMedia: 78.5,
        turmasRecentes: [
          {
            id: '1',
            nome: 'Engenharia de Software - 2024.2',
            codigo: 'ENG2024',
            totalAlunos: 32,
            simuladosAtivos: 2
          },
          {
            id: '2',
            nome: 'Algoritmos e Estrutura de Dados',
            codigo: 'AED2024',
            totalAlunos: 28,
            simuladosAtivos: 1
          },
          {
            id: '3',
            nome: 'Banco de Dados Avançado',
            codigo: 'BDA2024',
            totalAlunos: 27,
            simuladosAtivos: 0
          }
        ],
        atividadesRecentes: [
          {
            id: '1',
            tipo: 'simulado',
            descricao: 'Novo simulado criado: "Prova P1 - Algoritmos"',
            data: '2024-02-08 14:30',
            turma: 'AED2024'
          },
          {
            id: '2',
            tipo: 'material',
            descricao: 'Material adicionado: "Slides Aula 5"',
            data: '2024-02-08 10:15',
            turma: 'ENG2024'
          },
          {
            id: '3',
            tipo: 'aluno',
            descricao: '5 novos alunos entraram na turma',
            data: '2024-02-07 16:45',
            turma: 'BDA2024'
          }
        ]
      }
      
      setDashboardData(mockData)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdminDashboard = async () => {
    // Manter a lógica existente do admin
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Dashboard do Professor
  if (userRole === 'professor' && dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard do Professor</h2>
            <p className="text-muted-foreground">
              Bem-vindo de volta! Aqui está um resumo das suas turmas.
            </p>
          </div>
          <Button asChild>
            <Link href="/turmas/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova Turma
            </Link>
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalTurmas}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.turmasRecentes.filter(t => t.simuladosAtivos > 0).length} com simulados ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalAlunos}</div>
              <p className="text-xs text-muted-foreground">
                Em todas as suas turmas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Simulados Ativos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.simuladosAtivos}</div>
              <p className="text-xs text-muted-foreground">
                Em andamento neste momento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.taxaConclusaoMedia}%</div>
              <Progress value={dashboardData.taxaConclusaoMedia} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Grid de Turmas e Atividades */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Turmas Recentes */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Suas Turmas</CardTitle>
              <CardDescription>
                Gerencie suas turmas e acompanhe o progresso dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.turmasRecentes.map((turma) => (
                  <div key={turma.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold">{turma.nome}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {turma.totalAlunos} alunos
                        </span>
                        <span>Código: {turma.codigo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {turma.simuladosAtivos > 0 && (
                        <Badge variant="secondary">
                          {turma.simuladosAtivos} simulado{turma.simuladosAtivos > 1 ? 's' : ''} ativo{turma.simuladosAtivos > 1 ? 's' : ''}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/turmas/${turma.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/turmas">
                    Ver todas as turmas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Atividades Recentes */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas ações nas suas turmas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.atividadesRecentes.map((atividade) => (
                  <div key={atividade.id} className="flex items-start space-x-3">
                    <div className={`mt-0.5 rounded-full p-2 ${
                      atividade.tipo === 'simulado' ? 'bg-blue-100 text-blue-600' :
                      atividade.tipo === 'material' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {atividade.tipo === 'simulado' ? <FileText className="h-3 w-3" /> :
                       atividade.tipo === 'material' ? <BookOpen className="h-3 w-3" /> :
                       <Users className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {atividade.descricao}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {atividade.turma}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(atividade.data).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais usadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/turmas/nova">
                  <School className="h-6 w-6" />
                  <span>Criar Turma</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/simulados/novo">
                  <FileText className="h-6 w-6" />
                  <span>Criar Simulado</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/materiais/upload">
                  <BookOpen className="h-6 w-6" />
                  <span>Adicionar Material</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/relatorios">
                  <BarChart className="h-6 w-6" />
                  <span>Ver Relatórios</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Questões</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionManager />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
