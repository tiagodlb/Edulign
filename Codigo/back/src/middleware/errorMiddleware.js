export class AppError extends Error {
    constructor(message, statusCode, field = null) {
        super(message);
        this.statusCode = statusCode;
        this.field = field;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Capture the stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

const isOperationalError = (error) => {
    return error instanceof AppError || error.statusCode;
};

export const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    console.error('Error encountered:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    });

    if (process.env.NODE_ENV === 'development') {
        return res.status(error.statusCode).json({
            success: false,
            status: error.status,
            message: error.message,
            field: error.field || undefined,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    // Production environment
    if (isOperationalError(error)) {
        return res.status(error.statusCode).json({
            success: false,
            status: error.status,
            message: error.message,
            field: error.field || undefined,
            timestamp: new Date().toISOString()
        });
    }

    // For unexpected errors in production
    return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Algo deu errado. Por favor, tente novamente mais tarde.',
        timestamp: new Date().toISOString()
    });
};

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Common error types for reference
export const ErrorTypes = {
    VALIDATION_ERROR: {
        message: 'Erro de validação.',
        statusCode: 400
    },
    AUTHENTICATION_ERROR: {
        message: 'Não autorizado. Por favor, faça login.',
        statusCode: 401
    },
    FORBIDDEN_ERROR: {
        message: 'Você não tem permissão para acessar este recurso.',
        statusCode: 403
    },
    NOT_FOUND_ERROR: {
        message: 'Recurso não encontrado.',
        statusCode: 404
    },
    CONFLICT_ERROR: {
        message: 'Conflito com recurso existente.',
        statusCode: 409
    }
};