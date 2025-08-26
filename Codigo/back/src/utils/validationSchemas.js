import Joi from 'joi';

const patterns = {
  name: /^[A-Za-zÀ-ÿ\s]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
};

// Common validation messages for reuse and consistency
const messages = {
  name: {
    'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
    'string.max': 'Nome deve ter no máximo {#limit} caracteres',
    'string.pattern.base': 'Nome deve conter apenas letras',
    'any.required': 'Nome é obrigatório'
  },
  email: {
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório'
  },
  password: {
    'string.min': 'Senha deve ter no mínimo {#limit} caracteres',
    'string.pattern.base': 'Senha deve conter letra maiúscula, minúscula, número e caractere especial',
    'any.required': 'Senha é obrigatória'
  }
};

// User registration schema
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(patterns.name)
    .required()
    .messages(messages.name),

  email: Joi.string()
    .email()
    .required()
    .messages(messages.email),

  password: Joi.string()
    .min(8)
    .pattern(patterns.password)
    .required()
    .messages(messages.password)
});

// Login schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages(messages.email),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha é obrigatória'
    })
});

// User schema for admin operations
export const userSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(patterns.name)
    .required()
    .messages(messages.name),

  email: Joi.string()
    .email()
    .required()
    .messages(messages.email),

  password: Joi.string()
    .min(8)
    .pattern(patterns.password)
    .required()
    .messages(messages.password),

  role: Joi.string()
    .valid('student', 'admin')
    .required()
    .messages({
      'any.only': 'Função deve ser student ou admin',
      'any.required': 'Função é obrigatória'
    })
});

export const adminSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(patterns.name)
    .required()
    .messages(messages.name),

  email: Joi.string()
    .email()
    .required()
    .messages(messages.email),

  password: Joi.string()
    .min(8)
    .pattern(patterns.password)
    .required()
    .messages(messages.password),

  role: Joi.string()
    .valid('admin')
    .required()
    .messages({
      'any.only': 'Função deve ser student ou admin',
      'any.required': 'Função é obrigatória'
    })
});



// Question schema for creating and updating questions
export const questionSchema = Joi.object({
  enunciado: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': 'Enunciado deve ter no mínimo {#limit} caracteres',
      'string.max': 'Enunciado deve ter no máximo {#limit} caracteres',
      'any.required': 'Enunciado é obrigatório'
    }),

  alternativas: Joi.array()
    .items(Joi.string().min(1).max(500))
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': 'A questão deve ter no mínimo {#limit} alternativas',
      'array.max': 'A questão deve ter no máximo {#limit} alternativas',
      'any.required': 'Alternativas são obrigatórias',
      'string.min': 'Alternativa deve ter no mínimo {#limit} caractere',
      'string.max': 'Alternativa deve ter no máximo {#limit} caracteres'
    }),

  respostaCorreta: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Resposta correta deve ser um número',
      'number.integer': 'Resposta correta deve ser um número inteiro',
      'number.min': 'Resposta correta deve ser maior ou igual a 0',
      'any.required': 'Resposta correta é obrigatória'
    }),

  area: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Área deve ter no mínimo {#limit} caracteres',
      'string.max': 'Área deve ter no máximo {#limit} caracteres',
      'any.required': 'Área é obrigatória'
    }),

  ano: Joi.number()
    .integer()
    .min(2000)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.base': 'Ano deve ser um número',
      'number.integer': 'Ano deve ser um número inteiro',
      'number.min': 'Ano deve ser maior ou igual a 2000',
      'number.max': 'Ano não pode ser maior que o ano atual',
      'any.required': 'Ano é obrigatório'
    })
});

export const questionIdSchema = Joi.object({
  id: Joi.string().uuid().required()
});

// Schema for reviewing AI responses
export const reviewResponseSchema = Joi.object({
  responseId: Joi.string()
    .required()
    .messages({
      'any.required': 'ID da resposta é obrigatório'
    }),

  revisedResponse: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Resposta revisada deve ter no mínimo {#limit} caracteres',
      'string.max': 'Resposta revisada deve ter no máximo {#limit} caracteres',
      'any.required': 'Resposta revisada é obrigatória'
    })
});

export const simulatedExamSchema = Joi.object({
  knowledgeArea: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Área de conhecimento deve ter no mínimo {#limit} caracteres',
      'string.max': 'Área de conhecimento deve ter no máximo {#limit} caracteres',
      'any.required': 'Área de conhecimento é obrigatória'
    }),
  numberOfQuestions: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10) // Define o valor padrão como 10
    .messages({
      'number.base': 'Número de questões deve ser um número',
      'number.integer': 'Número de questões deve ser um número inteiro',
      'number.min': 'Número de questões deve ser maior ou igual a 1',
      'number.max': 'Número de questões não pode ser maior que 100'
    })
});

export const simulatedExamUpdateSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string().uuid().required(),
      selectedAnswer: Joi.string().required(),
      timeSpent: Joi.number().min(0).required()
    })
  ),
  completed: Joi.boolean().required()
});

export const aiSimulatedExamSchema = Joi.object({
  area: Joi.string().required()
    .messages({
      'string.empty': 'A área é obrigatória',
      'any.required': 'A área é obrigatória'
    }),
  subjects: Joi.array()
    .items(Joi.string())
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': 'Selecione pelo menos 1 assunto',
      'array.max': 'Selecione no máximo 5 assuntos',
      'any.required': 'Os assuntos são obrigatórios'
    }),
  numberOfQuestions: Joi.number()
    .integer()
    .min(5)
    .max(30)
    .required()
    .messages({
      'number.base': 'O número de questões deve ser um número',
      'number.min': 'O número mínimo de questões é 5',
      'number.max': 'O número máximo de questões é 30',
      'any.required': 'O número de questões é obrigatório'
    })
});

export const classEntrySchema = Joi.object({
  codigoTurma: Joi.string().required().messages({
    'string.empty': 'O código da turma é obrigatório',
    'any.required': 'O código da turma é obrigatório'
  })
});