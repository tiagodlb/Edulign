const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        message: detail.message,
        path: detail.path[0]
      }));

      return res.status(400).json({
        message: 'Erro de validação',
        errors: errorDetails
      });
    }
    
    next();
  };
};

export default validateRequest;