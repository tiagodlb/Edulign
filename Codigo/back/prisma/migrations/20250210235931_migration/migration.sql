/*
  Warnings:

  - You are about to drop the `ExplicacaoIA` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Questao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resposta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Simulado` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExplicacaoIA" DROP CONSTRAINT "ExplicacaoIA_questaoId_fkey";

-- DropForeignKey
ALTER TABLE "ExplicacaoIA" DROP CONSTRAINT "ExplicacaoIA_revisorId_fkey";

-- DropForeignKey
ALTER TABLE "Questao" DROP CONSTRAINT "Questao_autorId_fkey";

-- DropForeignKey
ALTER TABLE "Resposta" DROP CONSTRAINT "Resposta_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Resposta" DROP CONSTRAINT "Resposta_questaoId_fkey";

-- DropForeignKey
ALTER TABLE "Resposta" DROP CONSTRAINT "Resposta_simuladoId_fkey";

-- DropForeignKey
ALTER TABLE "Simulado" DROP CONSTRAINT "Simulado_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "_QuestaoToSimulado" DROP CONSTRAINT "_QuestaoToSimulado_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestaoToSimulado" DROP CONSTRAINT "_QuestaoToSimulado_B_fkey";

-- DropTable
DROP TABLE "ExplicacaoIA";

-- DropTable
DROP TABLE "Questao";

-- DropTable
DROP TABLE "Resposta";

-- DropTable
DROP TABLE "Simulado";

-- CreateTable
CREATE TABLE "simulados" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "tempoLimite" INTEGER NOT NULL,
    "alunoId" TEXT NOT NULL,
    "qtdQuestoes" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "finalizado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "simulados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questoes" (
    "id" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "comando" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "topicos" TEXT[],
    "competencias" TEXT[],
    "referencias" TEXT[],
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ano" INTEGER,
    "cadastradoPorId" TEXT,

    CONSTRAINT "questoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternativas" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL,
    "justificativa" TEXT,
    "questaoId" TEXT NOT NULL,

    CONSTRAINT "alternativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suportes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "questaoId" TEXT NOT NULL,

    CONSTRAINT "suportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "questaoId" TEXT NOT NULL,
    "alternativaId" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL,
    "dataResposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tempoResposta" DOUBLE PRECISION NOT NULL,
    "simuladoId" TEXT NOT NULL,

    CONSTRAINT "respostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explicacoes_ia" (
    "id" TEXT NOT NULL,
    "questaoId" TEXT NOT NULL,
    "explicacao" TEXT NOT NULL,
    "revisada" BOOLEAN NOT NULL DEFAULT false,
    "revisorId" TEXT NOT NULL,
    "dataGeracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRevisao" TIMESTAMP(3),
    "links" TEXT[],
    "observacoes" TEXT,

    CONSTRAINT "explicacoes_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulados_alunoId_idx" ON "simulados"("alunoId");

-- CreateIndex
CREATE INDEX "questoes_area_tipo_idx" ON "questoes"("area", "tipo");

-- CreateIndex
CREATE INDEX "alternativas_questaoId_idx" ON "alternativas"("questaoId");

-- CreateIndex
CREATE INDEX "suportes_questaoId_idx" ON "suportes"("questaoId");

-- CreateIndex
CREATE INDEX "respostas_alunoId_simuladoId_idx" ON "respostas"("alunoId", "simuladoId");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_simuladoId_questaoId_key" ON "respostas"("simuladoId", "questaoId");

-- CreateIndex
CREATE UNIQUE INDEX "explicacoes_ia_questaoId_key" ON "explicacoes_ia"("questaoId");

-- CreateIndex
CREATE INDEX "explicacoes_ia_revisorId_idx" ON "explicacoes_ia"("revisorId");

-- AddForeignKey
ALTER TABLE "simulados" ADD CONSTRAINT "simulados_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questoes" ADD CONSTRAINT "questoes_cadastradoPorId_fkey" FOREIGN KEY ("cadastradoPorId") REFERENCES "Administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternativas" ADD CONSTRAINT "alternativas_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "questoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suportes" ADD CONSTRAINT "suportes_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "questoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "questoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_alternativaId_fkey" FOREIGN KEY ("alternativaId") REFERENCES "alternativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_simuladoId_fkey" FOREIGN KEY ("simuladoId") REFERENCES "simulados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explicacoes_ia" ADD CONSTRAINT "explicacoes_ia_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "questoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "explicacoes_ia" ADD CONSTRAINT "explicacoes_ia_revisorId_fkey" FOREIGN KEY ("revisorId") REFERENCES "Administrador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestaoToSimulado" ADD CONSTRAINT "_QuestaoToSimulado_A_fkey" FOREIGN KEY ("A") REFERENCES "questoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestaoToSimulado" ADD CONSTRAINT "_QuestaoToSimulado_B_fkey" FOREIGN KEY ("B") REFERENCES "simulados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
