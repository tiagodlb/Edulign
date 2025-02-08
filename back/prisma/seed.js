import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import Papa from 'papaparse'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

function logStep(step) {
    console.log(`\n📍 ${step}`);
}

async function importQuestaoRows() {
    try {
        const csvPath = path.join(__dirname, 'Questao_rows_(2).csv')
        const fileContent = await fs.readFile(csvPath, 'utf8')
        
        return new Promise((resolve, reject) => {
            Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: async (results) => {
                    try {
                        const questions = results.data.map(row => ({
                            enunciado: row.enunciado || '',
                            alternativas: [
                                row.alternativa1 || '',
                                row.alternativa2 || '',
                                row.alternativa3 || '',
                                row.alternativa4 || ''
                            ].filter(alt => alt !== ''),
                            respostaCorreta: parseInt(row.respostaCorreta) - 1,
                            area: row.area || 'Geral',
                            ano: row.ano || new Date().getFullYear(),
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
        await prisma.explicacaoIA.deleteMany();
        await prisma.resposta.deleteMany();
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
            questionsData.map(questionData =>
                prisma.questao.create({
                    data: {
                        ...questionData,
                        autor: {
                            connect: { id: admin.admin.id }
                        }
                    }
                })
            )
        );

        // Create a simulated exam with the first imported question
        if (questions.length > 0) {
            logStep('Creating simulated exam');
            const simulado = await prisma.simulado.create({
                data: {
                    aluno: {
                        connect: { id: student.aluno.id }
                    },
                    questoes: {
                        connect: [{ id: questions[0].id }]
                    },
                    qtdQuestoes: 1,
                    dataInicio: new Date(),
                    finalizado: false
                }
            });

            logStep('Creating student response');
            await prisma.resposta.create({
                data: {
                    aluno: {
                        connect: { id: student.aluno.id }
                    },
                    questao: {
                        connect: { id: questions[0].id }
                    },
                    alternativaSelecionada: 2,
                    correta: true,
                    explicacao: 'O aluno acertou a questão.',
                    tempoResposta: 45.5,
                    simulado: {
                        connect: { id: simulado.id }
                    }
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