/**
 * Creates a validation middleware using a Joi schema
 * This middleware validates incoming request data against the provided schema
 * and provides detailed, user-friendly error messages when validation fails.
 * 
 * @param {Object} schema - The Joi validation schema
 * @param {String} source - The request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,      // Collect all errors, not just the first one
      stripUnknown: true,     // Remove unknown fields
      convert: true           // Allow type conversion where possible
    });

    if (error) {
      // Transform Joi validation errors into a more user-friendly format
      const errorDetails = error.details.map(detail => {
        const errorType = detail.type.split('.').pop();

        // Create a user-friendly error message based on the error type
        let message = detail.message;
        switch (errorType) {
          case 'required':
            message = `O campo ${detail.context.label} é obrigatório`;
            break;
          case 'min':
            message = `O campo ${detail.context.label} deve ter no mínimo ${detail.context.limit} caracteres`;
            break;
          case 'max':
            message = `O campo ${detail.context.label} deve ter no máximo ${detail.context.limit} caracteres`;
            break;
          case 'email':
            message = 'O email fornecido não é válido';
            break;
          case 'pattern':
            message = detail.message || `O campo ${detail.context.label} contém caracteres inválidos`;
            break;
        }

        return {
          field: detail.path[0],
          message: message,
          type: errorType
        };
      });

      // Log validation errors for debugging purposes
      console.warn('Validation failed:', {
        path: req.path,
        method: req.method,
        errors: errorDetails,
        timestamp: new Date().toISOString()
      });

      // Return a structured error response
      return res.status(400).json({
        success: false,
        message: 'Erro de validação nos dados fornecidos',
        errors: errorDetails,
        timestamp: new Date().toISOString()
      });
    }

    // If validation succeeds, update the request with the validated and sanitized data
    req[source] = value;

    // Continue to the next middleware
    next();
  };
};

/**
 * Helper function to create common validation options
 * This can be used to maintain consistent validation rules across different schemas
 */
export const validationOptions = {
  messages: {
    'string.empty': 'Este campo não pode estar vazio',
    'string.min': 'Este campo deve ter no mínimo {#limit} caracteres',
    'string.max': 'Este campo deve ter no máximo {#limit} caracteres',
    'string.email': 'Formato de email inválido',
    'string.pattern.base': 'Formato inválido para este campo',
    'any.required': 'Este campo é obrigatório',
    'number.base': 'Este campo deve ser um número',
    'number.min': 'O valor deve ser maior ou igual a {#limit}',
    'number.max': 'O valor deve ser menor ou igual a {#limit}',
    'array.min': 'Deve conter no mínimo {#limit} itens',
    'array.max': 'Deve conter no máximo {#limit} itens'
  }
};

export default validateRequest;