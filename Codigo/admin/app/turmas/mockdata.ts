// mockData.ts

export const mockTurmas = [
  {
    id: 'turma-1',
    nome: 'Algoritmos e Estruturas de Dados',
    descricao: 'Turma focada em lógica de programação e estruturas de dados.',
    codigo: 'ALG123',
    ativa: true,
    dataCriacao: '2025-03-15T10:00:00Z',
    _count: {
      alunos: 25,
      simulados: 3,
      materiais: 10
    },
    status: 'ativa',
    totalAlunos: 25,
    simuladosAtivos: 3,
    totalMateriais: 10,
    cor: '#3b82f6',
    semestre: '2025.1',
    ano: 2025
  },
  {
    id: 'turma-2',
    nome: 'Banco de Dados',
    descricao: 'Turma introdutória a SQL e modelagem de dados.',
    codigo: 'BD456',
    ativa: true,
    dataCriacao: '2025-04-10T14:30:00Z',
    _count: {
      alunos: 20,
      simulados: 2,
      materiais: 8
    },
    status: 'ativa',
    totalAlunos: 20,
    simuladosAtivos: 2,
    totalMateriais: 8,
    cor: '#10b981',
    semestre: '2025.1',
    ano: 2025
  }
]

// Mock students for TurmaDetailsPage
export const mockAlunos = {
  'turma-1': [
    {
      id: 'aluno-1',
      matricula: '2025001',
      dataIngresso: '2025-03-16T09:00:00Z',
      usuario: { nome: 'João Silva', email: 'joao.silva@example.com' },
      _count: { simulados: 3, respostas: 15 }
    },
    {
      id: 'aluno-2',
      matricula: '2025002',
      dataIngresso: '2025-03-17T11:00:00Z',
      usuario: { nome: 'Maria Oliveira', email: 'maria.oliveira@example.com' },
      _count: { simulados: 3, respostas: 14 }
    }
  ],
  'turma-2': [
    {
      id: 'aluno-3',
      matricula: '2025003',
      dataIngresso: '2025-04-11T10:30:00Z',
      usuario: { nome: 'Carlos Pereira', email: 'carlos.pereira@example.com' },
      _count: { simulados: 2, respostas: 10 }
    },
    {
      id: 'aluno-4',
      matricula: '2025004',
      dataIngresso: '2025-04-12T08:45:00Z',
      usuario: { nome: 'Ana Costa', email: 'ana.costa@example.com' },
      _count: { simulados: 2, respostas: 12 }
    }
  ]
}

// Mock statistics for TurmaDetailsPage
export const mockStats = {
  'turma-1': {
    totalAlunos: 25,
    alunosAtivos: 24,
    totalSimulados: 3,
    simuladosCompletos: 2,
    totalMateriais: 10,
    materiaisRecentes: 3,
    taxaConclusao: 80,
    mediaGeral: 7.5
  },
  'turma-2': {
    totalAlunos: 20,
    alunosAtivos: 19,
    totalSimulados: 2,
    simuladosCompletos: 1,
    totalMateriais: 8,
    materiaisRecentes: 2,
    taxaConclusao: 75,
    mediaGeral: 7.0
  }
}
