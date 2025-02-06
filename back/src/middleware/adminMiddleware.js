const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        // Debug: Log user object
        console.log('Usuário autenticado:', req.user);

        // Check admin privileges dynamically
        if (!req.user.administrador && !req.user.isAdmin && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Privilégios de administrador necessários'
            });
        }

        // Start timing the request
        const startTime = Date.now();

        // Store the original end function
        const originalEnd = res.end;

        res.end = function (...args) {
            const duration = Date.now() - startTime;

            // Create a detailed log entry
            const logEntry = {
                method: req.method,
                path: req.path,
                adminId: req.user.id,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
                requestBody: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
                queryParams: Object.keys(req.query).length > 0 ? req.query : undefined
            };

            // Log the administrative action
            console.info('Admin Action:', logEntry);

            // Call the original end function
            originalEnd.apply(res, args);
        };

        next();
    } catch (error) {
        console.error('Error in admin middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao processar requisição administrativa'
        });
    }
};

/**
 * Sanitizes sensitive information from request body before logging
 * @param {Object} body - The request body to sanitize
 * @returns {Object} - Sanitized body object
 */
const sanitizeRequestBody = (body) => {
    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'senha', 'token', 'secret'];
    sensitiveFields.forEach(field => {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

export default adminMiddleware;
