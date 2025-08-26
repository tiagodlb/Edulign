'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Users,
  FileText,
  BookOpen,
  BarChart,
  UserPlus,
  UserMinus,
  Download,
  Eye,
  Trash2,
  Copy,
  Settings,
  Mail,
  Calendar,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react'
import { turmaService, type Turma, type Aluno, type TurmaStats } from '@/lib/api/turmas'

export default function TurmaDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const turmaId = params.id as string
  
  const [turma, setTurma] = useState<Turma | null>(null)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [stats, setStats] = useState<TurmaStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('alunos')
  const [searchAluno, setSearchAluno] = useState('')
  const [isAddingAluno, setIsAddingAluno] = useState(false)
  const [removingAlunoId, setRemovingAlunoId] = useState<string | null>(null)
  const [addProfessorEmail, setAddProfessorEmail] = useState('')
  const [isAddingProfessor, setIsAddingProfessor] = useState(false)

  useEffect(() => {
    if (turmaId) {
      loadTurmaData()
    }
  }, [turmaId])

  const loadTurmaData = async () => {
    try {
      setIsLoading(true)
      
      // Carregar dados da turma em paralelo
      const [turmasData, alunosData, statsData] = await Promise.all([
        turmaService.getTurmas(),
        turmaService.getAlunosTurma(turmaId),
        turmaService.getTurmaStats(turmaId)
      ])
      
      const turmaAtual = turmasData.find(t => t.id === turmaId)
      if (turmaAtual) {
        setTurma(turmaAtual)
      }
      
      setAlunos(alunosData.data)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados da turma:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados da turma',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveAluno = async (alunoId: string, alunoNome: string) => {
    if (!confirm(`Deseja remover o aluno "${alunoNome}" da turma?`)) {
      return
    }

    try {
      setRemovingAlunoId(alunoId)
      await turmaService.removeAluno(turmaId, alunoId)
      
      toast({
        title: 'Aluno removido',
        description: `${alunoNome} foi removido da turma com sucesso`
      })
      
      // Atualizar lista
      setAlunos(prev => prev.filter(a => a.id !== alunoId))
      if (stats) {
        setStats({ ...stats, totalAlunos: stats.totalAlunos - 1 })
      }
    } catch (error) {
      console.error('Erro ao remover aluno:', error)
      toast({
        title: 'Erro ao remover aluno',
        description: 'Não foi possível remover o aluno da turma',
        variant: 'destructive'
      })
    } finally {
      setRemovingAlunoId(null)
    }
  }

  const handleAddProfessor = async () => {
    if (!addProfessorEmail) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, informe o email do professor',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsAddingProfessor(true)
      await turmaService.addProfessor(turmaId, addProfessorEmail)
      
      toast({
        title: 'Professor adicionado',
        description: 'O professor foi adicionado à turma com sucesso'
      })
      
      setAddProfessorEmail('')
      await loadTurmaData()
    } catch (error) {
      console.error('Erro ao adicionar professor:', error)
      toast({
        title: 'Erro ao adicionar professor',
        description: 'Não foi possível adicionar o professor. Verifique se o email está correto.',
        variant: 'destructive'
      })
    } finally {
      setIsAddingProfessor(false)
    }
  }

  const handleGenerateReport = async (formato: 'pdf' | 'excel') => {
    try {
      const blob = await turmaService.generateReport(turmaId, formato)
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-turma-${turma?.codigo}-${new Date().toISOString().split('T')[0]}.${formato}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: 'Relatório gerado',
        description: `O relatório foi gerado e baixado com sucesso`
      })
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Não foi possível gerar o relatório',
        variant: 'destructive'
      })
    }
  }

  const copyTurmaCode = async () => {
    if (!turma) return
    
    try {
      await navigator.clipboard.writeText(turma.codigo)
      toast({
        title: 'Código copiado!',
        description: `O código ${turma.codigo} foi copiado para a área de transferência`
      })
    } catch (error) {
      console.error('Erro ao copiar código:', error)
    }
  }

  const filteredAlunos = alunos.filter(aluno =>
    aluno.usuario.nome.toLowerCase().includes(searchAluno.toLowerCase()) ||
    aluno.usuario.email.toLowerCase().includes(searchAluno.toLowerCase()) ||
    aluno.matricula.toLowerCase().includes(searchAluno.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!turma) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h3 className="text-lg font-semibold mb-2">Turma não encontrada</h3>
        <Button onClick={() => router.push('/turmas')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Turmas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/turmas')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{turma.nome}</h2>
            <p className="text-muted-foreground">{turma.descricao}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={turma.ativa ? 'default' : 'secondary'}>
            {turma.ativa ? 'Ativa' : 'Arquivada'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={copyTurmaCode}
          >
            <Copy className="mr-2 h-4 w-4" />
            {turma.codigo}
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlunos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.alunosAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Simulados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSimulados}</div>
              <p className="text-xs text-muted-foreground">
                {stats.simuladosCompletos} completos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materiais</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMateriais}</div>
              <p className="text-xs text-muted-foreground">
                {stats.materiaisRecentes} recentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.taxaConclusao)}%</div>
              <p className="text-xs text-muted-foreground">
                Média geral: {stats.mediaGeral.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alunos">
            <Users className="mr-2 h-4 w-4" />
            Alunos
          </TabsTrigger>
          <TabsTrigger value="simulados">
            <FileText className="mr-2 h-4 w-4" />
            Simulados
          </TabsTrigger>
          <TabsTrigger value="materiais">
            <BookOpen className="mr-2 h-4 w-4" />
            Materiais
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Tab Alunos */}
        <TabsContent value="alunos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alunos da Turma</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar alunos..."
                    value={searchAluno}
                    onChange={(e) => setSearchAluno(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAlunos.length > 0 ? (
                <div className="space-y-2">
                  {filteredAlunos.map((aluno) => (
                    <div
                      key={aluno.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{aluno.usuario.nome}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {aluno.usuario.email}
                          </span>
                          <span>Matrícula: {aluno.matricula}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Desde {new Date(aluno.dataIngresso).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{aluno._count?.simulados || 0}</p>
                          <p className="text-xs text-muted-foreground">Simulados</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{aluno._count?.respostas || 0}</p>
                          <p className="text-xs text-muted-foreground">Respostas</p>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAluno(aluno.id, aluno.usuario.nome)}
                          disabled={removingAlunoId === aluno.id}
                        >
                          {removingAlunoId === aluno.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          ) : (
                            <UserMinus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchAluno ? 'Nenhum aluno encontrado com esta busca' : 'Nenhum aluno cadastrado nesta turma'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Simulados */}
        <TabsContent value="simulados">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Gerencie os simulados desta turma</p>
                <Button className="mt-4" onClick={() => router.push(`/simulados?turma=${turmaId}`)}>
                  Ir para Simulados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Materiais */}
        <TabsContent value="materiais">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4" />
                <p>Gerencie os materiais desta turma</p>
                <Button className="mt-4" onClick={() => router.push(`/materiais?turma=${turmaId}`)}>
                  Ir para Materiais
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Configurações */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professores</CardTitle>
              <CardDescription>
                Gerencie os professores que têm acesso a esta turma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {turma.professores && turma.professores.length > 0 && (
                <div className="space-y-2">
                  {turma.professores.map((prof) => (
                    <div key={prof.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium">{prof.usuario.nome}</p>
                        <p className="text-sm text-muted-foreground">{prof.usuario.email}</p>
                      </div>
                      {prof.principal && (
                        <Badge>Principal</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Email do professor..."
                  value={addProfessorEmail}
                  onChange={(e) => setAddProfessorEmail(e.target.value)}
                />
                <Button
                  onClick={handleAddProfessor}
                  disabled={isAddingProfessor}
                >
                  {isAddingProfessor ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Gere relatórios detalhados sobre o desempenho da turma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('pdf')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport('excel')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}