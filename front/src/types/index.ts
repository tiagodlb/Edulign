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
  status: StatusCiclo
  duracao: string
  questoes: number
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
