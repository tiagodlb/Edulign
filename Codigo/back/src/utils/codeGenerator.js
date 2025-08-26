import { db } from '../config/prisma.js';

// Função para gerar um código aleatório de 6 caracteres
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Função para verificar se o código já existe no banco
async function isCodeUnique(code) {
  const existingTurma = await db.turma.findFirst({
    where: { codigo: code }
  });
  return !existingTurma;
}

// Função principal que gera um código único
export async function generateUniqueCode(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateCode();
    if (await isCodeUnique(code)) {
      return code;
    }
  }
  throw new Error('Não foi possível gerar um código único após várias tentativas');
}
