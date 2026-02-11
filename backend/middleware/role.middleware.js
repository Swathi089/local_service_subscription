const logger = require('../utils/logger.util');

/**
 * Restrict access to specific roles
 * Usage: restrictTo('admin', 'provider')
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login first.'
            });
        }

        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            logger.warn(`Access denied for role ${req.user.role} to ${req.originalUrl}`);
            
            return res.status(403).json({
                success: false,
                message: `Access denied. This resource requires ${roles.join(' or ')} role.`,
                requiredRoles: roles,
                yourRole: req.user.role
            });
        }

        next();
    };
};

/**
 * Check if user is customer
 */
exports.isCustomer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'customer') {
        logger.warn(`Non-customer (${req.user.role}) attempted to access customer route: ${req.originalUrl}`);
        
        return res.status(403).json({
            success: false,
            message: 'Access denied. Customer role required.',
            yourRole: req.user.role
        });
    }

    next();
};

/**
 * Check if user is provider
 */
exports.isProvider = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'provider') {
        logger.warn(`Non-provider (${req.user.role}) attempted to access provider route: ${req.originalUrl}`);
        
        return res.status(403).json({
            success: false,
            message: 'Access denied. Service provider role required.',
            yourRole: req.user.role
        });
    }

    next();
};

/**
 * Check if user is admin
 */
exports.isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        logger.warn(`Non-admin (${req.user.role}) attempted to access admin route: ${req.originalUrl}`);
        
        return res.status(403).json({
            success: false,
            message: 'Access denied. Administrator role required.',
            yourRole: req.user.role
        });
    }

    next();
};

/**
 * Check if user is customer or admin
 * Useful for routes that both customers and admins should access
 */
exports.isCustomerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'customer' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Customer or admin role required.',
            yourRole: req.user.role
        });
    }

    next();
};

/**
 * Check if user is provider or admin
 * Useful for provider management routes
 */
exports.isProviderOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Provider or admin role required.',
            yourRole: req.user.role
        });
    }

    next();
};

/**
 * Allow access only to the resource owner or admin
 * Checks if the authenticated user is either the owner of the resource or an admin
 */
exports.isOwnerOrAdmin = (ownerIdField = 'userId') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        // Get resource owner ID from params or body
        const resourceOwnerId = req.params[ownerIdField] || req.body[ownerIdField];

        if (!resourceOwnerId) {
            return res.status(400).json({
                success: false,
                message: 'Resource owner ID not found'
            });
        }

        // Check if user is the owner
        if (req.user.userId.toString() !== resourceOwnerId.toString()) {
            logger.warn(`User ${req.user.email} attempted to access resource owned by ${resourceOwnerId}`);
            
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        }

        next();
    };
};

/**
 * Check if user can access a specific subscription
 * Customer can access their own subscriptions, provider can access subscriptions for their services
 */
exports.canAccessSubscription = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin can access all subscriptions
        if (req.user.role === 'admin') {
            return next();
        }

        const Subscription = require('../models/Subscription');
        const Customer = require('../models/Customer');
        const ServiceProvider = require('../models/ServiceProvider');

        const subscriptionId = req.params.id;
        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        let hasAccess = false;

        // Check customer access
        if (req.user.role === 'customer') {
            const customer = await Customer.findOne({ userId: req.user.userId });
            if (customer && subscription.customerId.toString() === customer._id.toString()) {
                hasAccess = true;
            }
        }

        // Check provider access
        if (req.user.role === 'provider') {
            const provider = await ServiceProvider.findOne({ userId: req.user.userId });
            if (provider && subscription.providerId.toString() === provider._id.toString()) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to access this subscription.'
            });
        }

        // Attach subscription to request for later use
        req.subscription = subscription;
        next();
    } catch (error) {
        logger.error('Subscription access check error:', error);
        next(error);
    }
};

/**
 * Check if provider owns the service
 */
exports.isServiceOwner = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin can access all services
        if (req.user.role === 'admin') {
            return next();
        }

        if (req.user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                message: 'Only service providers can access this resource'
            });
        }

        const Service = require('../models/Service');
        const ServiceProvider = require('../models/ServiceProvider');

        const serviceId = req.params.id;
        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const provider = await ServiceProvider.findOne({ userId: req.user.userId });

        if (!provider || service.providerId.toString() !== provider._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only manage your own services.'
            });
        }

        // Attach service to request
        req.service = service;
        next();
    } catch (error) {
        logger.error('Service ownership check error:', error);
        next(error);
    }
};

/**
 * Check if user can leave a review
 * Only customers who have used the service can leave reviews
 */
exports.canReview = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Only customers can leave reviews'
            });
        }

        const { serviceId, subscriptionId } = req.body;

        if (subscriptionId) {
            const Subscription = require('../models/Subscription');
            const Customer = require('../models/Customer');

            const customer = await Customer.findOne({ userId: req.user.userId });
            const subscription = await Subscription.findById(subscriptionId);

            if (!subscription || subscription.customerId.toString() !== customer._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only review services you have subscribed to'
                });
            }

            // Check if service has been completed at least once
            const hasCompletedService = subscription.serviceHistory.some(
                visit => visit.status === 'completed'
            );

            if (!hasCompletedService) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only review services after at least one completed visit'
                });
            }
        }

        next();
    } catch (error) {
        logger.error('Review permission check error:', error);
        next(error);
    }
};
// role.middleware.js
exports.isCustomer = (req, res, next) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
};


module.exports = exports;