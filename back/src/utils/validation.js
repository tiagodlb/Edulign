import { body, validationResult } from 'express-validator';

const validateEmail = () => {
  return body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .custom(async (email) => {
      // Verificação adicional de domínio
      const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com'];
      const domain = email.split('@')[1];
      
      if (!allowedDomains.includes(domain)) {
        throw new Error('Domínio de email não permitido');
      }
      return true;
    });
};

const validatePassword = () => {
  return body('password')
    .trim()
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Senha deve conter: letra maiúscula, minúscula, número e caractere especial');
};

const validateName = () => {
  return body('name')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres')
    .matches(/^[A-Za-zÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras');
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Erro de validação',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  handleValidationErrors
};