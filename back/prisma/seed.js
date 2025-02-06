import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

// Initialize Prisma Client with explicit logging for debugging
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

// Helper function to log each step of the seeding process
function logStep(step) {
    console.log(`\n📍 ${step}`);
}

// Main seeding function with comprehensive error handling
async function main() {
    try {
        logStep('Starting database seed');

        // Clean the database first
        logStep('Cleaning existing database records');
        await prisma.explicacaoIA.deleteMany();
        await prisma.resposta.deleteMany();
        await prisma.simulado.deleteMany();
        await prisma.questao.deleteMany();
        await prisma.administrador.deleteMany();
        await prisma.aluno.deleteMany();
        await prisma.usuario.deleteMany();

        // Create administrator
        logStep('Creating administrator account');
        const adminPassword = await bcrypt.hash('Admin@123', 12);
        const admin = await prisma.usuario.create({
            data: {
                nome: 'Administrator Principal',
                email: 'admin@eduling.com',
                senha: adminPassword,
                administrador: true,
                admin: {
                    create: {} // Creates associated Administrador record
                }
            },
            include: {
                admin: true
            }
        });

        // Create student
        logStep('Creating student account');
        const studentPassword = await bcrypt.hash('Student@123', 12);
        const student = await prisma.usuario.create({
            data: {
                nome: 'João Silva',
                email: 'joao@gmail.com',
                senha: studentPassword,
                aluno: {
                    create: {} // Creates associated Aluno record
                }
            },
            include: {
                aluno: true
            }
        });

        // Create a question
        logStep('Creating sample question');
        const question = await prisma.questao.create({
            data: {
                enunciado: 'Qual é a capital do Brasil?',
                alternativas: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
                respostaCorreta: 2, // Index of Brasília (0-based)
                area: 'Exatas',
                ano: 2024,
                autor: {
                    connect: { id: admin.admin.id }
                }
            }
        });

        // Create a simulated exam
        logStep('Creating simulated exam');
        const simulado = await prisma.simulado.create({
            data: {
                aluno: {
                    connect: { id: student.aluno.id }
                },
                questoes: {
                    connect: [{ id: question.id }]
                },
                qtdQuestoes: 1,
                dataInicio: new Date(),
                finalizado: false
            }
        });

        // Create a student response
        logStep('Creating student response');
        await prisma.resposta.create({
            data: {
                aluno: {
                    connect: { id: student.aluno.id }
                },
                questao: {
                    connect: { id: question.id }
                },
                alternativaSelecionada: 2,
                correta: true,
                explicacao: 'O aluno acertou a questão sobre a capital do Brasil.',
                tempoResposta: 45.5,
                simulado: {
                    connect: { id: simulado.id }
                }
            }
        });

        logStep('Seed completed successfully! ✅');
    } catch (error) {
        console.error('\n❌ Seed failed:', error);
        throw error;
    }
}

// Execute the seed with proper cleanup
main()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });