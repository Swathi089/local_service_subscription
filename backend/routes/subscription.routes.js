const express = require('express');
const { body, query, param } = require('express-validator');
const subscriptionController = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/subscription
 * @desc    Get all subscriptions for the authenticated user
 * @access  Private
 */
router.get(
    '/',
    [
        query('status').optional().isIn(['active', 'paused', 'cancelled', 'expired', 'pending']).withMessage('Invalid status'),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        validate
    ],
    subscriptionController.getSubscriptions
);

/**
 * @route   GET /api/subscription/:id
 * @desc    Get single subscription details
 * @access  Private
 */
router.get(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        validate
    ],
    subscriptionController.getSubscriptionDetails
);

/**
 * @route   POST /api/subscription
 * @desc    Create new subscription
 * @access  Private
 */
router.post(
    '/',
    [
        body('serviceId').notEmpty().isMongoId().withMessage('Valid service ID is required'),
        body('plan.type').isIn(['basic', 'premium', 'enterprise', 'custom']).withMessage('Invalid plan type'),
        body('plan.interval').isIn(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid interval'),
        body('plan.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
        body('startDate').optional().isISO8601().withMessage('Invalid start date'),
        body('schedule.preferredDays').optional().isArray(),
        body('schedule.preferredTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
        body('paymentMethodId').optional().trim().notEmpty(),
        body('specialInstructions').optional().trim().isLength({ max: 500 }),
        validate
    ],
    subscriptionController.createSubscription
);

/**
 * @route   PUT /api/subscription/:id
 * @desc    Update subscription details
 * @access  Private
 */
router.put(
    '/:id',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('plan.type').optional().isIn(['basic', 'premium', 'enterprise', 'custom']),
        body('plan.interval').optional().isIn(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']),
        body('schedule.preferredDays').optional().isArray(),
        body('schedule.preferredTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('autoRenew').optional().isBoolean(),
        body('specialInstructions').optional().trim().isLength({ max: 500 }),
        validate
    ],
    subscriptionController.updateSubscription
);

/**
 * @route   POST /api/subscription/:id/pause
 * @desc    Pause an active subscription
 * @access  Private
 */
router.post(
    '/:id/pause',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters'),
        validate
    ],
    subscriptionController.pauseSubscription
);

/**
 * @route   POST /api/subscription/:id/resume
 * @desc    Resume a paused subscription
 * @access  Private
 */
router.post(
    '/:id/resume',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        validate
    ],
    subscriptionController.resumeSubscription
);

/**
 * @route   POST /api/subscription/:id/cancel
 * @desc    Cancel a subscription
 * @access  Private
 */
router.post(
    '/:id/cancel',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Cancellation reason is required and must be less than 500 characters'),
        body('requestRefund').optional().isBoolean().withMessage('Request refund must be true or false'),
        validate
    ],
    subscriptionController.cancelSubscription
);

/**
 * @route   POST /api/subscription/:id/renew
 * @desc    Manually renew a subscription
 * @access  Private
 */
router.post(
    '/:id/renew',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        validate
    ],
    subscriptionController.renewSubscription
);

/**
 * @route   GET /api/subscription/:id/history
 * @desc    Get subscription service history
 * @access  Private
 */
router.get(
    '/:id/history',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        validate
    ],
    subscriptionController.getSubscriptionHistory
);

/**
 * @route   POST /api/subscription/:id/record-visit
 * @desc    Record a service visit (for providers/admin)
 * @access  Private
 */
router.post(
    '/:id/record-visit',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('status').isIn(['scheduled', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status'),
        body('notes').optional().trim().isLength({ max: 1000 }),
        body('rating').optional().isInt({ min: 1, max: 5 }),
        validate
    ],
    subscriptionController.recordServiceVisit
);

/**
 * @route   PUT /api/subscription/:id/schedule
 * @desc    Update subscription schedule
 * @access  Private
 */
router.put(
    '/:id/schedule',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('preferredDays').optional().isArray().withMessage('Preferred days must be an array'),
        body('preferredDays.*').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        body('preferredTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('flexibleScheduling').optional().isBoolean(),
        validate
    ],
    subscriptionController.updateSchedule
);

/**
 * @route   POST /api/subscription/:id/reschedule
 * @desc    Reschedule next service date
 * @access  Private
 */
router.post(
    '/:id/reschedule',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('newDate').isISO8601().withMessage('Valid date is required'),
        body('reason').optional().trim().isLength({ max: 500 }),
        validate
    ],
    subscriptionController.rescheduleService
);

/**
 * @route   GET /api/subscription/:id/payment-history
 * @desc    Get payment history for a subscription
 * @access  Private
 */
router.get(
    '/:id/payment-history',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        validate
    ],
    subscriptionController.getPaymentHistory
);

/**
 * @route   PUT /api/subscription/:id/payment-method
 * @desc    Update payment method for subscription
 * @access  Private
 */
router.put(
    '/:id/payment-method',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('paymentMethodId').trim().notEmpty().withMessage('Payment method ID is required'),
        validate
    ],
    subscriptionController.updatePaymentMethod
);

/**
 * @route   GET /api/subscription/upcoming
 * @desc    Get upcoming scheduled services
 * @access  Private
 */
router.get(
    '/upcoming',
    [
        query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90'),
        validate
    ],
    subscriptionController.getUpcomingServices
);

/**
 * @route   GET /api/subscription/expiring
 * @desc    Get subscriptions expiring soon
 * @access  Private
 */
router.get(
    '/expiring',
    [
        query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90'),
        validate
    ],
    subscriptionController.getExpiringSubscriptions
);

/**
 * @route   POST /api/subscription/:id/apply-discount
 * @desc    Apply discount code to subscription
 * @access  Private
 */
router.post(
    '/:id/apply-discount',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('code').trim().notEmpty().withMessage('Discount code is required'),
        validate
    ],
    subscriptionController.applyDiscount
);

/**
 * @route   DELETE /api/subscription/:id/discount
 * @desc    Remove discount from subscription
 * @access  Private
 */
router.delete(
    '/:id/discount',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        validate
    ],
    subscriptionController.removeDiscount
);

module.exports = router;