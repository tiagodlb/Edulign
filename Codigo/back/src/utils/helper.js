export const isExplanationOutdated = (generatedAt) => {
    const EXPLANATION_VALIDITY_DAYS = 30;
    const validityThreshold = new Date();
    validityThreshold.setDate(validityThreshold.getDate() - EXPLANATION_VALIDITY_DAYS);

    return new Date(generatedAt) < validityThreshold;
};

export const verifyQuestionAccess = async (questionId, userId) => {
    try {
        // Check if the question is part of any simulated exam the user has access to
        const count = await db.simulado.count({
            where: {
                AND: [
                    {
                        aluno: {
                            usuario: {
                                id: userId
                            }
                        }
                    },
                    {
                        questoes: {
                            some: {
                                id: questionId
                            }
                        }
                    }
                ]
            }
        });

        return count > 0;
    } catch (error) {
        throw new AppError('Erro ao verificar acesso à questão', 500);
    }
};
