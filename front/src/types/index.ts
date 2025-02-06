export enum StatusCiclo {
  EmPreparacao = 'Em Preparação',
  EmAndamento = 'Em Andamento',
  Finalizado = 'Finalizado'
}

export enum AreaAvaliacao {
  Exatas = 'Exatas',
  Humanas = 'Humanas',
  Biologicas = 'Biológicas',
  Saude = 'Saúde',
  Tecnologia = 'Tecnologia'
}

export interface Simulado {
  id: number
  titulo: string
  area: AreaAvaliacao
  duracao: string
  questoes: number
  finalizado: boolean
  dataInicio: Date
  dataFim?: Date | null
}

export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface SimuladoDetailed extends Simulado {
  questions: Question[]
}

export enum TipoQuestao {
  FormacaoGeral = 'FormacaoGeral',
  ComponenteEspecifico = 'ComponenteEspecifico'
}
