import { PrismaClient } from '@prisma/client';

// Log based on environment set
const logLevels = process.env['NODE_ENV'] === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'];

const prisma = new PrismaClient({
    log: logLevels,
    errorFormat: 'pretty',
});

const withPerformanceMonitoring = prisma.$extends({
    name: 'performance-monitoring',
    query: {
        async $allOperations({ operation, model, args, query }) {
            const startTime = Date.now();

            // Execute the original query
            const result = await query(args);

            const duration = Date.now() - startTime;

            // Log slow queries for performance monitoring
            if (duration > 100) {
                console.warn(`Slow query detected (${duration}ms):`, {
                    model,
                    operation,
                    args,
                    timestamp: new Date().toISOString()
                });
            }

            return result;
        }
    }
});

// Error extension
const withErrorHandling = withPerformanceMonitoring.$extends({
    name: 'error-handling',
    query: {
        async $allOperations({ operation, model, args, query }) {
            try {
                return await query(args);
            } catch (error) {
                if (error.code === 'P2002') {
                    throw new Error(`Unique constraint violation on ${error.meta?.target} for ${model}`);
                }
                if (error.code === 'P2025') {
                    throw new Error(`Record not found in ${model}`);
                }
                if (error.code === 'P2003') {
                    throw new Error(`Foreign key constraint failed on ${model}`);
                }

                // Log unexpected errors
                console.error('Database operation failed:', {
                    model,
                    operation,
                    error: error.message,
                    code: error.code,
                    timestamp: new Date().toISOString()
                });

                throw error;
            }
        }
    }
});

// Query logging extension for development
const withQueryLogging = withErrorHandling.$extends({
    name: 'query-logging',
    query: {
        async $allOperations({ operation, model, args, query }) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`Executing ${operation} on ${model}`, {
                    args,
                    timestamp: new Date().toISOString()
                });
            }

            return query(args);
        }
    }
});

// Handle graceful shutdown
const disconnectPrisma = async () => {
    await prisma.$disconnect();
    console.log('Database connection closed gracefully.');
};

// Setup process handlers for graceful shutdown
process.on('SIGINT', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);

// Export the enhanced client with all extensions
export const db = withQueryLogging;

// Export the raw client for cases where direct access is needed
export const prismaRaw = prisma;