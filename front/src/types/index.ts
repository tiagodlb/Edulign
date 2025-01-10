export enum StatusCiclo {
  EmPreparacao = "EmPreparacao",
  EmAndamento = "EmAndamento",
  Finalizado = "Finalizado",
}

export enum AreaAvaliacao {
  Saude = "Saude",
  Exatas = "Exatas",
  Humanas = "Humanas",
  Tecnologia = "Tecnologia",
}

export enum TipoQuestao {
  FormacaoGeral = "FormacaoGeral",
  ComponenteEspecifico = "ComponenteEspecifico",
}

export interface CicloAvaliativo {
  cicloId: number;
  ano: number;
  dataInicio: Date;
  dataFim: Date;
  cursos: Curso[];
  status: StatusCiclo;
}

export interface Curso {
  cursoId: number;
  nome: string;
  area: AreaAvaliacao;
  estudantes: Estudante[];
  participante: boolean;
}

export interface Estudante {
  matricula: string;
  curso: Curso;
  habilitadoEnade: boolean;
}

export interface Questao {
  id: number;
  enunciado: string;
  alternativas: string[];
  area: AreaAvaliacao;
  respostaCorreta: number;
  autor: string;
  dataCriacao: Date;
  status: string;
}

export interface QuestaoEnade extends Questao {
  anoEnade: number;
  componenteAvaliado: string;
  tipo: TipoQuestao;
  indiceDiscriminacao: number;
  indiceDificuldade: number;
}

export interface RespostaEstudante {
  respostaId: number;
  estudante: Estudante;
  questao: Questao;
  alternativaSelecionada: number;
  dataResposta: Date;
  pontuacao: number;
}
