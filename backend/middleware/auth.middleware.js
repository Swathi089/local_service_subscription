const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const logger = require('../utils/logger.util');

/**
 * Protect routes - require authentication
 * Verifies JWT token and attaches user info to request
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Extract token from "Bearer TOKEN"
            token = req.headers.authorization.split(' ')[1];
        }
        // Also check for token in cookies (if implementing cookie auth)
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwtSecret);

            // Get user from token (excluding password)
            const user = await User.findById(decoded.userId).select('-password -refreshToken');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Token is invalid.'
                });
            }

            // Check if user account is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Your account has been deactivated. Please contact support.'
                });
            }

            // Check if user is verified (optional - can be removed if not required)
            if (!user.isVerified) {
                return res.status(401).json({
                    success: false,
                    message: 'Please verify your email address to access this resource.'
                });
            }

            // Add user info to request object
            req.user = {
                userId: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName
            };

            // Add full user object if needed (optional)
            req.userDetails = user;

            logger.info(`User ${user.email} authenticated successfully`);

            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            throw error;
        }
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed. Please try again.'
        });
    }
};

/**
 * Optional authentication
 * Attaches user info if token is valid, but doesn't fail if no token
 * Useful for routes that have different behavior for logged-in vs guest users
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, config.jwtSecret);
                const user = await User.findById(decoded.userId).select('-password -refreshToken');

                if (user && user.isActive) {
                    req.user = {
                        userId: user._id,
                        email: user.email,
                        role: user.role,
                        fullName: user.fullName
                    };
                    req.userDetails = user;
                }
            } catch (error) {
                // Token invalid, but don't fail - just continue without user
                logger.debug('Optional auth: Invalid token, continuing as guest');
            }
        }

        next();
    } catch (error) {
        logger.error('Optional authentication error:', error);
        next(); // Continue even on error
    }
};

/**
 * Verify token without database lookup (faster but less secure)
 * Use only for non-critical routes
 */
exports.verifyToken = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Check if user owns the resource
 * Compares userId from token with userId in request params or body
 */
exports.authorize = (userIdField = 'userId') => {
    return (req, res, next) => {
        const resourceUserId = req.params[userIdField] || req.body[userIdField];

        if (!resourceUserId) {
            return res.status(400).json({
                success: false,
                message: 'Resource user ID not provided'
            });
        }

        if (req.user.userId.toString() !== resourceUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }

        next();
    };
};

/**
 * Rate limiting per user (additional to global rate limit)
 * Prevents abuse from authenticated users
 */
exports.userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const userId = req.user.userId.toString();
        const now = Date.now();
        
        if (!userRequests.has(userId)) {
            userRequests.set(userId, []);
        }

        const requests = userRequests.get(userId);
        
        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < windowMs);
        
        if (validRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
            });
        }

        validRequests.push(now);
        userRequests.set(userId, validRequests);

        next();
    };
};

/**
 * Check if account is verified
 * Additional middleware for routes that require email verification
 */
exports.requireVerification = (req, res, next) => {
    if (!req.userDetails || !req.userDetails.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email address to access this feature'
        });
    }
    next();
};

/**
 * Check if provider is approved
 * For provider-specific routes that require approval
 */
exports.requireProviderApproval = async (req, res, next) => {
    try {
        if (req.user.role !== 'provider') {
            return next();
        }

        const ServiceProvider = require('../models/ServiceProvider');
        const provider = await ServiceProvider.findOne({ userId: req.user.userId });

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider profile not found'
            });
        }

        if (provider.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Your provider account is pending verification. Please complete your profile and submit required documents.',
                verificationStatus: provider.verificationStatus
            });
        }

        next();
    } catch (error) {
        logger.error('Provider approval check error:', error);
        next(error);
    }
};

module.exports = exports;