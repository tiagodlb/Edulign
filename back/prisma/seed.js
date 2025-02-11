// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

function logStep(step) {
    console.log(`\n📍 ${step}`);
}

async function importQuestaoRows() {
    try {
        const csvPath = path.join(__dirname, 'Questao_rows_(2).csv');
        const fileContent = await fs.readFile(csvPath, 'utf8');

        return new Promise((resolve, reject) => {
            Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: async (results) => {
                    try {
                        const questions = results.data.map(row => ({
                            enunciado: row.enunciado || '',
                            comando: row.comando || 'Analise a questão e escolha a alternativa correta:',
                            area: row.area || 'Geral',
                            tipo: 'IMPORTADO',
                            nivel: 'medio',
                            alternativas: [
                                {
                                    texto: row.alternativa1 || '',
                                    correta: parseInt(row.respostaCorreta) === 1,
                                    justificativa: 'Justificativa da alternativa 1'
                                },
                                {
                                    texto: row.alternativa2 || '',
                                    correta: parseInt(row.respostaCorreta) === 2,
                                    justificativa: 'Justificativa da alternativa 2'
                                },
                                {
                                    texto: row.alternativa3 || '',
                                    correta: parseInt(row.respostaCorreta) === 3,
                                    justificativa: 'Justificativa da alternativa 3'
                                },
                                {
                                    texto: row.alternativa4 || '',
                                    correta: parseInt(row.respostaCorreta) === 4,
                                    justificativa: 'Justificativa da alternativa 4'
                                },
                                {
                                    texto: row.alternativa5 || 'Nenhuma das alternativas anteriores',
                                    correta: parseInt(row.respostaCorreta) === 5,
                                    justificativa: 'Justificativa da alternativa 5'
                                }
                            ],
                            topicos: ['Tópico 1', 'Tópico 2'],
                            competencias: ['Competência 1', 'Competência 2'],
                            referencias: ['Referência Bibliográfica 1'],
                            ano: row.ano || new Date().getFullYear(),
                            dataCriacao: new Date()
                        }));
                        resolve(questions);
                    } catch (error) {
                        reject(error);
                    }
                },
                error: (error) => reject(error)
            });
        });
    } catch (error) {
        console.error('Error reading CSV file:', error);
        return [];
    }
}

async function main() {
    try {
        logStep('Starting database seed');

        logStep('Cleaning existing database records');
        // Delete in correct order based on relationships
        await prisma.resposta.deleteMany();
        await prisma.alternativa.deleteMany();
        await prisma.suporte.deleteMany();
        await prisma.explicacaoIA.deleteMany();
        await prisma.simulado.deleteMany();
        await prisma.questao.deleteMany();
        await prisma.administrador.deleteMany();
        await prisma.aluno.deleteMany();
        await prisma.usuario.deleteMany();

        logStep('Creating administrator account');
        const adminPassword = await bcrypt.hash('Admin@123', 12);
        const admin = await prisma.usuario.create({
            data: {
                nome: 'Administrator Principal',
                email: 'admin@eduling.com',
                senha: adminPassword,
                administrador: true,
                admin: {
                    create: {}
                }
            },
            include: {
                admin: true
            }
        });

        logStep('Creating student account');
        const studentPassword = await bcrypt.hash('Student@123', 12);
        const student = await prisma.usuario.create({
            data: {
                nome: 'João Silva',
                email: 'joao@gmail.com',
                senha: studentPassword,
                aluno: {
                    create: {}
                }
            },
            include: {
                aluno: true
            }
        });

        logStep('Importing questions from CSV');
        const questionsData = await importQuestaoRows();
        const questions = await Promise.all(
            questionsData.map(async (questionData) => {
                return await prisma.questao.create({
                    data: {
                        enunciado: questionData.enunciado,
                        comando: questionData.comando,
                        area: questionData.area,
                        tipo: questionData.tipo,
                        nivel: questionData.nivel,
                        alternativas: {
                            create: questionData.alternativas
                        },
                        topicos: questionData.topicos,
                        competencias: questionData.competencias,
                        referencias: questionData.referencias,
                        dataCriacao: questionData.dataCriacao,
                        cadastradoPor: {
                            connect: { id: admin.admin.id }
                        }
                    },
                    include: {
                        alternativas: true
                    }
                });
            })
        );

        if (questions.length > 0) {
            logStep('Creating simulated exam');
            const simulado = await prisma.simulado.create({
                data: {
                    titulo: 'Simulado de Teste',
                    tipo: 'NORMAL',
                    area: questions[0].area,
                    tempoLimite: 180,
                    alunoId: student.aluno.id,
                    qtdQuestoes: 1,
                    dataInicio: new Date(),
                    finalizado: false,
                    questoes: {
                        connect: [{ id: questions[0].id }]
                    }
                }
            });

            logStep('Creating student response');
            // Get the correct alternative
            const correctAlternative = questions[0].alternativas.find(alt => alt.correta);

            if (correctAlternative) {
                await prisma.resposta.create({
                    data: {
                        alunoId: student.aluno.id,
                        questaoId: questions[0].id,
                        alternativaId: correctAlternative.id,
                        simuladoId: simulado.id,
                        correta: true,
                        tempoResposta: 45.5,
                    }
                });
            }
        }

        logStep('Creating explanation for first question');
        if (questions.length > 0) {
            await prisma.explicacaoIA.create({
                data: {
                    questaoId: questions[0].id,
                    explicacao: 'Explicação detalhada da questão gerada por IA.',
                    revisada: true,
                    revisorId: admin.admin.id,
                    dataGeracao: new Date(),
                    dataRevisao: new Date(),
                    links: ['https://reference1.com', 'https://reference2.com'],
                    observacoes: 'Observações do revisor sobre a explicação.'
                }
            });
        }

        logStep('Seed completed successfully! ✅');
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        throw error;
    }
}

main()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });