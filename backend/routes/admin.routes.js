const express = require('express');
const { body, query, param } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, isAdmin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard with overall statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', adminController.getDashboard);

// ==================== USER MANAGEMENT ====================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin)
 */
router.get(
    '/users',
    [
        query('role').optional().isIn(['customer', 'provider', 'admin']).withMessage('Invalid role'),
        query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
        query('verified').optional().isBoolean(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('search').optional().trim(),
        validate
    ],
    adminController.getAllUsers
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details
 * @access  Private (Admin)
 */
router.get(
    '/users/:id',
    [
        param('id').isMongoId().withMessage('Invalid user ID'),
        validate
    ],
    adminController.getUserDetails
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Private (Admin)
 */
router.put(
    '/users/:id',
    [
        param('id').isMongoId().withMessage('Invalid user ID'),
        body('fullName').optional().trim().isLength({ min: 2, max: 100 }),
        body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/),
        body('isActive').optional().isBoolean(),
        body('isVerified').optional().isBoolean(),
        validate
    ],
    adminController.updateUser
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete/deactivate user
 * @access  Private (Admin)
 */
router.delete(
    '/users/:id',
    [
        param('id').isMongoId().withMessage('Invalid user ID'),
        validate
    ],
    adminController.deleteUser
);

/**
 * @route   PUT /api/admin/users/:id/verify
 * @desc    Verify user account
 * @access  Private (Admin)
 */
router.put(
    '/users/:id/verify',
    [
        param('id').isMongoId().withMessage('Invalid user ID'),
        validate
    ],
    adminController.verifyUser
);

/**
 * @route   PUT /api/admin/users/:id/suspend
 * @desc    Suspend user account
 * @access  Private (Admin)
 */
router.put(
    '/users/:id/suspend',
    [
        param('id').isMongoId().withMessage('Invalid user ID'),
        body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Suspension reason is required'),
        validate
    ],
    adminController.suspendUser
);

/**
 * @route   PUT /api/admin/users/:id/activate
 * @desc    Reactivate suspended user
 * @access  Private (Admin)
 */
router.put(
    '/users/:id/activate',
    [
        param('id').isMongoId().withMessage('Invalid user ID'),
        validate
    ],
    adminController.activateUser
);

// ==================== SERVICE MANAGEMENT ====================

/**
 * @route   GET /api/admin/services
 * @desc    Get all services with filters
 * @access  Private (Admin)
 */
router.get(
    '/services',
    [
        query('category').optional().isIn(['cleaning', 'plumbing', 'electrical', 'gardening', 'carpentry', 'painting']),
        query('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('search').optional().trim(),
        validate
    ],
    adminController.getAllServices
);

/**
 * @route   GET /api/admin/services/:id
 * @desc    Get single service details
 * @access  Private (Admin)
 */
router.get(
    '/services/:id',
    [
        param('id').isMongoId().withMessage('Invalid service ID'),
        validate
    ],
    adminController.getServiceDetails
);

/**
 * @route   PUT /api/admin/services/:id/approve
 * @desc    Approve pending service
 * @access  Private (Admin)
 */
router.put(
    '/services/:id/approve',
    [
        param('id').isMongoId().withMessage('Invalid service ID'),
        body('notes').optional().trim().isLength({ max: 1000 }),
        validate
    ],
    adminController.approveService
);

/**
 * @route   PUT /api/admin/services/:id/reject
 * @desc    Reject pending service
 * @access  Private (Admin)
 */
router.put(
    '/services/:id/reject',
    [
        param('id').isMongoId().withMessage('Invalid service ID'),
        body('reason').trim().notEmpty().isLength({ max: 1000 }).withMessage('Rejection reason is required'),
        validate
    ],
    adminController.rejectService
);

/**
 * @route   PUT /api/admin/services/:id/suspend
 * @desc    Suspend active service
 * @access  Private (Admin)
 */
router.put(
    '/services/:id/suspend',
    [
        param('id').isMongoId().withMessage('Invalid service ID'),
        body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Suspension reason is required'),
        validate
    ],
    adminController.suspendService
);

/**
 * @route   PUT /api/admin/services/:id/feature
 * @desc    Feature/unfeature a service
 * @access  Private (Admin)
 */
router.put(
    '/services/:id/feature',
    [
        param('id').isMongoId().withMessage('Invalid service ID'),
        body('isFeatured').isBoolean().withMessage('Featured status must be true or false'),
        validate
    ],
    adminController.featureService
);

/**
 * @route   DELETE /api/admin/services/:id
 * @desc    Delete service
 * @access  Private (Admin)
 */
router.delete(
    '/services/:id',
    [
        param('id').isMongoId().withMessage('Invalid service ID'),
        validate
    ],
    adminController.deleteService
);

// ==================== PAYMENT MANAGEMENT ====================

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments with filters
 * @access  Private (Admin)
 */
router.get(
    '/payments',
    [
        query('type').optional().isIn(['payment', 'refund', 'payout']),
        query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded']),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        validate
    ],
    adminController.getAllPayments
);

/**
 * @route   GET /api/admin/payments/:id
 * @desc    Get single payment details
 * @access  Private (Admin)
 */
router.get(
    '/payments/:id',
    [
        param('id').isMongoId().withMessage('Invalid payment ID'),
        validate
    ],
    adminController.getPaymentDetails
);

/**
 * @route   POST /api/admin/payments/:id/refund
 * @desc    Process refund for payment
 * @access  Private (Admin)
 */
router.post(
    '/payments/:id/refund',
    [
        param('id').isMongoId().withMessage('Invalid payment ID'),
        body('amount').optional().isFloat({ min: 0.01 }),
        body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Refund reason is required'),
        validate
    ],
    adminController.processRefund
);

/**
 * @route   GET /api/admin/payouts
 * @desc    Get all payout requests
 * @access  Private (Admin)
 */
router.get(
    '/payouts',
    [
        query('status').optional().isIn(['pending', 'processing', 'completed', 'failed']),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        validate
    ],
    adminController.getPayoutRequests
);

/**
 * @route   POST /api/admin/payouts/process
 * @desc    Process pending payouts
 * @access  Private (Admin)
 */
router.post(
    '/payouts/process',
    [
        body('payoutIds').isArray({ min: 1 }).withMessage('At least one payout ID is required'),
        body('payoutIds.*').isMongoId().withMessage('Invalid payout ID'),
        validate
    ],
    adminController.processPayouts
);

/**
 * @route   PUT /api/admin/payouts/:id/approve
 * @desc    Approve payout request
 * @access  Private (Admin)
 */
router.put(
    '/payouts/:id/approve',
    [
        param('id').isMongoId().withMessage('Invalid payout ID'),
        validate
    ],
    adminController.approvePayout
);

/**
 * @route   PUT /api/admin/payouts/:id/reject
 * @desc    Reject payout request
 * @access  Private (Admin)
 */
router.put(
    '/payouts/:id/reject',
    [
        param('id').isMongoId().withMessage('Invalid payout ID'),
        body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Rejection reason is required'),
        validate
    ],
    adminController.rejectPayout
);

// ==================== SUBSCRIPTION MANAGEMENT ====================

/**
 * @route   GET /api/admin/subscriptions
 * @desc    Get all subscriptions
 * @access  Private (Admin)
 */
router.get(
    '/subscriptions',
    [
        query('status').optional().isIn(['active', 'paused', 'cancelled', 'expired', 'pending']),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        validate
    ],
    adminController.getAllSubscriptions
);

/**
 * @route   PUT /api/admin/subscriptions/:id/cancel
 * @desc    Cancel subscription (admin override)
 * @access  Private (Admin)
 */
router.put(
    '/subscriptions/:id/cancel',
    [
        param('id').isMongoId().withMessage('Invalid subscription ID'),
        body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Cancellation reason is required'),
        validate
    ],
    adminController.cancelSubscription
);

// ==================== REPORTS & ANALYTICS ====================

/**
 * @route   GET /api/admin/reports/revenue
 * @desc    Get revenue report
 * @access  Private (Admin)
 */
router.get(
    '/reports/revenue',
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('groupBy').optional().isIn(['day', 'week', 'month', 'year']),
        validate
    ],
    adminController.getRevenueReport
);

/**
 * @route   GET /api/admin/reports/users
 * @desc    Get user analytics report
 * @access  Private (Admin)
 */
router.get(
    '/reports/users',
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        validate
    ],
    adminController.getUsersReport
);

/**
 * @route   GET /api/admin/reports/services
 * @desc    Get services performance report
 * @access  Private (Admin)
 */
router.get(
    '/reports/services',
    [
        query('category').optional(),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        validate
    ],
    adminController.getServicesReport
);

/**
 * @route   GET /api/admin/reports/providers
 * @desc    Get provider performance report
 * @access  Private (Admin)
 */
router.get(
    '/reports/providers',
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        validate
    ],
    adminController.getProvidersReport
);

// ==================== REVIEWS MANAGEMENT ====================

/**
 * @route   GET /api/admin/reviews
 * @desc    Get all reviews
 * @access  Private (Admin)
 */
router.get(
    '/reviews',
    [
        query('status').optional().isIn(['pending', 'approved', 'rejected', 'flagged']),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        validate
    ],
    adminController.getAllReviews
);

/**
 * @route   PUT /api/admin/reviews/:id/approve
 * @desc    Approve review
 * @access  Private (Admin)
 */
router.put(
    '/reviews/:id/approve',
    [
        param('id').isMongoId().withMessage('Invalid review ID'),
        validate
    ],
    adminController.approveReview
);

/**
 * @route   PUT /api/admin/reviews/:id/reject
 * @desc    Reject/remove review
 * @access  Private (Admin)
 */
router.put(
    '/reviews/:id/reject',
    [
        param('id').isMongoId().withMessage('Invalid review ID'),
        body('reason').trim().notEmpty().isLength({ max: 500 }).withMessage('Rejection reason is required'),
        validate
    ],
    adminController.rejectReview
);

// ==================== SETTINGS ====================

/**
 * @route   GET /api/admin/settings
 * @desc    Get platform settings
 * @access  Private (Admin)
 */
router.get('/settings', adminController.getSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update platform settings
 * @access  Private (Admin)
 */
router.put(
    '/settings',
    [
        body('platformFee').optional().isFloat({ min: 0, max: 1 }),
        body('minPayoutAmount').optional().isFloat({ min: 1 }),
        validate
    ],
    adminController.updateSettings
);

/**
 * @route   GET /api/admin/activity-log
 * @desc    Get system activity log
 * @access  Private (Admin)
 */
router.get(
    '/activity-log',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('action').optional().trim(),
        validate
    ],
    adminController.getActivityLog
);

module.exports = router;