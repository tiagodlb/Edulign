import { db } from '../config/prisma.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { generateUniqueCode } from '../utils/codeGenerator.js';

// ========== FUNÇÕES DE TURMAS ==========

export const criarTurma = async (professorId, data) => {
  const codigo = await generateUniqueCode();
  
  return await db.turma.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      codigo,
      professores: {
        create: {
          professorId,
          principal: true
        }
      }
    },
    include: {
      professores: {
        include: {
          professor: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  email: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          alunos: true,
          simulados: true,
          materiais: true
        }
      }
    }
  });
};

export const listarTurmasProfessor = async (professorId) => {
  const turmas = await db.turma.findMany({
    where: {
      professores: {
        some: {
          professorId
        }
      }
    },
    include: {
      professores: {
        include: {
          professor: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  email: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          alunos: true,
          simulados: true,
          materiais: true
        }
      }
    },
    orderBy: {
      dataCriacao: 'desc'
    }
  });

  return turmas;
};

export const atualizarTurma = async (turmaId, data) => {
  const updateData = {};
  
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.descricao !== undefined) updateData.descricao = data.descricao;
  if (data.ativa !== undefined) updateData.ativa = data.ativa;

  return await db.turma.update({
    where: { id: turmaId },
    data: updateData,
    include: {
      professores: {
        include: {
          professor: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  email: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          alunos: true,
          simulados: true,
          materiais: true
        }
      }
    }
  });
};

export const excluirTurma = async (turmaId) => {
  // Verificar se existem alunos na turma
  const turma = await db.turma.findUnique({
    where: { id: turmaId },
    include: {
      _count: {
        select: { alunos: true }
      }
    }
  });

  if (turma._count.alunos > 0) {
    throw new AppError('Não é possível excluir uma turma com alunos. Remova os alunos primeiro.', 400);
  }

  // Usar transação para excluir turma e todas as relações
  return await db.$transaction(async (prisma) => {
    // Excluir materiais
    await prisma.materialTurma.deleteMany({
      where: { turmaId }
    });

    // Excluir relações de simulados
    await prisma.simuladoTurma.deleteMany({
      where: { turmaId }
    });

    // Excluir relações de professores
    await prisma.professorTurma.deleteMany({
      where: { turmaId }
    });

    // Excluir a turma
    return await prisma.turma.delete({
      where: { id: turmaId }
    });
  });
};

// ========== FUNÇÕES DE VERIFICAÇÃO ==========

export const verificarAcessoTurma = async (professorId, turmaId) => {
  const acesso = await db.professorTurma.findFirst({
    where: {
      professorId,
      turmaId
    }
  });

  return !!acesso;
};

export const verificarProfessorPrincipal = async (professorId, turmaId) => {
  const acesso = await db.professorTurma.findFirst({
    where: {
      professorId,
      turmaId,
      principal: true
    }
  });

  return !!acesso;
};

// ========== FUNÇÕES DE ALUNOS ==========

export const listarAlunosTurma = async (turmaId, options = {}) => {
  const { page = 1, limit = 20, search } = options;
  const skip = (page - 1) * limit;

  const where = {
    turmaId,
    ...(search && {
      usuario: {
        OR: [
          { nome: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }
    })
  };

  const [alunos, total] = await Promise.all([
    db.aluno.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            dataCriacao: true
          }
        },
        _count: {
          select: {
            simulados: true,
            respostas: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        usuario: {
          nome: 'asc'
        }
      }
    }),
    db.aluno.count({ where })
  ]);

  return {
    data: alunos,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      perPage: limit
    }
  };
};

export const removerAlunoDaTurma = async (turmaId, alunoId) => {
  // Verificar se o aluno está na turma
  const aluno = await db.aluno.findFirst({
    where: {
      id: alunoId,
      turmaId
    }
  });

  if (!aluno) {
    throw new AppError('Aluno não encontrado nesta turma', 404);
  }

  // Remover aluno da turma
  return await db.aluno.update({
    where: { id: alunoId },
    data: { turmaId: null }
  });
};

// ========== FUNÇÕES DE SIMULADOS ==========

export const criarSimuladoParaTurma = async (data) => {
  const { 
    turmaId, 
    titulo, 
    tipo, 
    area, 
    tempoLimite, 
    questoes,
    dataLiberacao,
    dataEncerramento 
  } = data;

  // Verificar se a turma existe
  const turma = await db.turma.findUnique({
    where: { id: turmaId }
  });

  if (!turma) {
    throw new AppError('Turma não encontrada', 404);
  }

  // Criar simulado e associar à turma em uma transação
  return await db.$transaction(async (prisma) => {
    // Criar o simulado base
    const simulado = await prisma.simulado.create({
      data: {
        titulo,
        tipo,
        area,
        tempoLimite,
        qtdQuestoes: questoes.length,
        questoes: {
          connect: questoes.map(q => ({ id: q }))
        }
      },
      include: {
        questoes: {
          include: {
            alternativas: true
          }
        }
      }
    });

    // Criar a relação com a turma
    await prisma.simuladoTurma.create({
      data: {
        simuladoId: simulado.id,
        turmaId,
        dataLiberacao,
        dataEncerramento
      }
    });

    return simulado;
  });
};

export const listarSimuladosTurma = async (turmaId, options = {}) => {
  const { status, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  const now = new Date();

  let whereCondition = { turmaId };

  // Filtrar por status
  if (status === 'ativo') {
    whereCondition = {
      ...whereCondition,
      dataLiberacao: { lte: now },
      OR: [
        { dataEncerramento: null },
        { dataEncerramento: { gte: now } }
      ]
    };
  } else if (status === 'encerrado') {
    whereCondition = {
      ...whereCondition,
      dataEncerramento: { lt: now }
    };
  } else if (status === 'futuro') {
    whereCondition = {
      ...whereCondition,
      dataLiberacao: { gt: now }
    };
  }

  const [simuladosTurma, total] = await Promise.all([
    db.simuladoTurma.findMany({
      where: whereCondition,
      include: {
        simulado: {
          include: {
            _count: {
              select: {
                questoes: true,
                respostas: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        dataLiberacao: 'desc'
      }
    }),
    db.simuladoTurma.count({ where: whereCondition })
  ]);

  return {
    data: simuladosTurma,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      perPage: limit
    }
  };
};

// ========== FUNÇÕES DE MATERIAIS ==========

export const adicionarMaterial = async (turmaId, data) => {
  return await db.materialTurma.create({
    data: {
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo,
      url: data.url,
      arquivo: data.arquivo,
      turmaId
    }
  });
};

export const listarMateriaisTurma = async (turmaId, options = {}) => {
  const { tipo, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where = {
    turmaId,
    ...(tipo && { tipo })
  };

  const [materiais, total] = await Promise.all([
    db.materialTurma.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        dataCriacao: 'desc'
      }
    }),
    db.materialTurma.count({ where })
  ]);

  return {
    data: materiais,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      perPage: limit
    }
  };
};

export const removerMaterial = async (materialId) => {
  const material = await db.materialTurma.findUnique({
    where: { id: materialId }
  });

  if (!material) {
    throw new AppError('Material não encontrado', 404);
  }

  return await db.materialTurma.delete({
    where: { id: materialId }
  });
};

// ========== FUNÇÕES DE ESTATÍSTICAS ==========

export const obterEstatisticasTurma = async (turmaId) => {
  const turma = await db.turma.findUnique({
    where: { id: turmaId },
    include: {
      _count: {
        select: {
          alunos: true,
          simulados: true,
          materiais: true
        }
      },
      alunos: {
        include: {
          _count: {
            select: {
              simulados: true,
              respostas: true
            }
          }
        }
      },
      simulados: {
        include: {
          simulado: {
            include: {
              _count: {
                select: {
                  questoes: true,
                  respostas: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!turma) {
    throw new AppError('Turma não encontrada', 404);
  }

  // Calcular estatísticas gerais
  const totalAlunos = turma._count.alunos;
  const totalSimulados = turma._count.simulados;
  const totalMateriais = turma._count.materiais;

  // Calcular média de participação em simulados
  const participacaoSimulados = turma.alunos.reduce((acc, aluno) => {
    return acc + aluno._count.simulados;
  }, 0) / (totalAlunos || 1);

  // Calcular taxa de conclusão de simulados
  const simuladosCompletos = turma.simulados.filter(st => {
    const respostasEsperadas = st.simulado._count.questoes * totalAlunos;
    const respostasRecebidas = st.simulado._count.respostas;
    return respostasRecebidas >= respostasEsperadas * 0.8; // 80% de conclusão
  }).length;

  const taxaConclusao = totalSimulados > 0 ? (simuladosCompletos / totalSimulados) * 100 : 0;

  return {
    turma: {
      id: turma.id,
      nome: turma.nome,
      codigo: turma.codigo,
      ativa: turma.ativa
    },
    estatisticas: {
      totalAlunos,
      totalSimulados,
      totalMateriais,
      participacaoMedia: participacaoSimulados.toFixed(2),
      taxaConclusaoSimulados: taxaConclusao.toFixed(2) + '%'
    }
  };
};

export const obterDesempenhoSimulado = async (turmaId, simuladoId) => {
  // Verificar se o simulado pertence à turma
  const simuladoTurma = await db.simuladoTurma.findFirst({
    where: {
      turmaId,
      simuladoId
    },
    include: {
      simulado: {
        include: {
          questoes: true,
          respostas: {
            include: {
              aluno: {
                include: {
                  usuario: {
                    select: {
                      nome: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!simuladoTurma) {
    throw new AppError('Simulado não encontrado nesta turma', 404);
  }

  // Agrupar respostas por aluno
  const desempenhoPorAluno = {};
  
  simuladoTurma.simulado.respostas.forEach(resposta => {
    const alunoId = resposta.alunoId;
    
    if (!desempenhoPorAluno[alunoId]) {
      desempenhoPorAluno[alunoId] = {
        aluno: resposta.aluno,
        totalQuestoes: simuladoTurma.simulado.questoes.length,
        respostasCorretas: 0,
        tempoTotal: 0,
        questoesRespondidas: 0
      };
    }

    desempenhoPorAluno[alunoId].questoesRespondidas++;
    desempenhoPorAluno[alunoId].tempoTotal += resposta.tempoResposta;
    
    if (resposta.correta) {
      desempenhoPorAluno[alunoId].respostasCorretas++;
    }
  });

  // Calcular estatísticas e formatar resultado
  const resultados = Object.values(desempenhoPorAluno).map(item => {
    const percentualAcerto = (item.respostasCorretas / item.totalQuestoes) * 100;
    const tempoMedio = item.tempoTotal / item.questoesRespondidas;

    return {
      aluno: {
        id: item.aluno.id,
        nome: item.aluno.usuario.nome,
        email: item.aluno.usuario.email
      },
      desempenho: {
        questoesRespondidas: item.questoesRespondidas,
        totalQuestoes: item.totalQuestoes,
        respostasCorretas: item.respostasCorretas,
        percentualAcerto: percentualAcerto.toFixed(2) + '%',
        tempoTotal: Math.round(item.tempoTotal),
        tempoMedio: Math.round(tempoMedio),
        completo: item.questoesRespondidas === item.totalQuestoes
      }
    };
  });

  // Calcular estatísticas gerais
  const totalAlunos = resultados.length;
  const alunosCompletos = resultados.filter(r => r.desempenho.completo).length;
  const mediaGeral = resultados.reduce((acc, r) => 
    acc + parseFloat(r.desempenho.percentualAcerto), 0
  ) / (totalAlunos || 1);

  return {
    simulado: {
      id: simuladoTurma.simulado.id,
      titulo: simuladoTurma.simulado.titulo,
      tipo: simuladoTurma.simulado.tipo,
      area: simuladoTurma.simulado.area,
      qtdQuestoes: simuladoTurma.simulado.questoes.length
    },
    estatisticasGerais: {
      totalAlunos,
      alunosCompletos,
      taxaConclusao: ((alunosCompletos / totalAlunos) * 100).toFixed(2) + '%',
      mediaGeral: mediaGeral.toFixed(2) + '%'
    },
    desempenhoIndividual: resultados.sort((a, b) => 
      parseFloat(b.desempenho.percentualAcerto) - parseFloat(a.desempenho.percentualAcerto)
    )
  };
};

// ========== FUNÇÕES DE GERENCIAMENTO DE PROFESSORES ==========

export const adicionarProfessorTurma = async (turmaId, email) => {
  // Buscar o usuário pelo email
  const usuario = await db.usuario.findUnique({
    where: { email },
    include: { professor: true }
  });

  if (!usuario) {
    throw new AppError('Usuário não encontrado com este email', 404);
  }

  if (!usuario.professor) {
    throw new AppError('Este usuário não é um professor', 400);
  }

  // Verificar se o professor já está na turma
  const jaEstaNaTurma = await db.professorTurma.findFirst({
    where: {
      professorId: usuario.professor.id,
      turmaId
    }
  });

  if (jaEstaNaTurma) {
    throw new AppError('Este professor já está nesta turma', 400);
  }

  // Adicionar o professor à turma
  return await db.professorTurma.create({
    data: {
      professorId: usuario.professor.id,
      turmaId,
      principal: false
    },
    include: {
      professor: {
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      }
    }
  });
};

export const removerProfessorTurma = async (turmaId, professorId) => {
  // Verificar se o professor está na turma
  const professorTurma = await db.professorTurma.findFirst({
    where: {
      professorId,
      turmaId
    }
  });

  if (!professorTurma) {
    throw new AppError('Professor não encontrado nesta turma', 404);
  }

  if (professorTurma.principal) {
    throw new AppError('O professor principal não pode ser removido', 400);
  }

  // Remover o professor da turma
  return await db.professorTurma.delete({
    where: {
      id: professorTurma.id
    }
  });
};