const logger = require('../utils/logger.util');

/**
 * Custom Error Class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global Error Handler Middleware
 */
exports.errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error details
    logger.error('Error Handler:', {
        message: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        user: req.user?.email || 'Not authenticated'
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const value = err.keyValue[field];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        const message = `Validation Error: ${errors.join(', ')}`;
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please login again.';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please login again.';
        error = new AppError(message, 401);
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files uploaded';
        }
        error = new AppError(message, 400);
    }

    // MongoDB server errors
    if (err.name === 'MongoServerError') {
        const message = 'Database operation failed';
        error = new AppError(message, 500);
    }

    // Stripe errors
    if (err.type && err.type.startsWith('Stripe')) {
        const message = err.message || 'Payment processing error';
        error = new AppError(message, 400);
    }

    // Send error response
    const statusCode = error.statusCode || err.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? {
            message: message,
            statusCode: statusCode,
            stack: error.stack,
            details: err
        } : {
            message: message
        }
    });
};

/**
 * Not Found Handler
 * For routes that don't exist
 */
exports.notFound = (req, res, next) => {
    const message = `Route not found: ${req.method} ${req.originalUrl}`;
    logger.warn(message);

    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestedUrl: req.originalUrl,
        method: req.method
    });
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors
 * Usage: asyncHandler(async (req, res, next) => { ... })
 */
exports.asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Handle unhandled promise rejections
 */
exports.handleUnhandledRejection = () => {
    process.on('unhandledRejection', (err) => {
        logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
            message: err.message,
            stack: err.stack
        });

        // In production, you might want to use a process manager like PM2
        // that will automatically restart the application
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });
};

/**
 * Handle uncaught exceptions
 */
exports.handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', {
            message: err.message,
            stack: err.stack
        });

        process.exit(1);
    });
};

/**
 * Validation Error Response
 * For custom validation errors
 */
exports.validationError = (errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
    });
};

/**
 * Not Authorized Error
 */
exports.notAuthorized = (message = 'Not authorized') => {
    return (req, res) => {
        res.status(403).json({
            success: false,
            message: message
        });
    };
};

/**
 * Bad Request Error
 */
exports.badRequest = (message = 'Bad request') => {
    return (req, res) => {
        res.status(400).json({
            success: false,
            message: message
        });
    };
};

/**
 * Internal Server Error
 */
exports.serverError = (message = 'Internal server error') => {
    return (req, res) => {
        res.status(500).json({
            success: false,
            message: message
        });
    };
};

/**
 * Service Unavailable Error
 */
exports.serviceUnavailable = (message = 'Service temporarily unavailable') => {
    return (req, res) => {
        res.status(503).json({
            success: false,
            message: message
        });
    };
};

/**
 * Database Error Handler
 */
exports.handleDatabaseError = (err, req, res, next) => {
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        logger.error('Database Error:', err);

        return res.status(500).json({
            success: false,
            message: 'Database operation failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    next(err);
};

/**
 * Rate Limit Error Handler
 */
exports.rateLimitHandler = (req, res) => {
    logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        url: req.originalUrl,
        user: req.user?.email
    });

    res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: req.rateLimit?.resetTime
    });
};

/**
 * CORS Error Handler
 */
exports.corsErrorHandler = (err, req, res, next) => {
    if (err.message && err.message.includes('CORS')) {
        logger.warn('CORS Error:', {
            origin: req.headers.origin,
            method: req.method
        });

        return res.status(403).json({
            success: false,
            message: 'CORS policy violation'
        });
    }

    next(err);
};

/**
 * Send Error Response
 * Utility function to send consistent error responses
 */
exports.sendErrorResponse = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message: message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send Success Response
 * Utility function to send consistent success responses
 */
exports.sendSuccessResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message: message
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

// Export AppError class
exports.AppError = AppError;

module.exports = exports;