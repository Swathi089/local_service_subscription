const express = require('express');
const { body, query, param } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/payment/methods
 * @desc    Get all payment methods for user
 * @access  Private
 */
router.get('/methods', paymentController.getPaymentMethods);

/**
 * @route   POST /api/payment/methods
 * @desc    Add new payment method
 * @access  Private
 */
router.post(
    '/methods',
    [
        body('type').isIn(['card', 'bank_transfer', 'paypal']).withMessage('Invalid payment method type'),
        body('stripePaymentMethodId').optional().trim().notEmpty().withMessage('Stripe payment method ID is required for card payments'),
        body('isDefault').optional().isBoolean(),
        validate
    ],
    paymentController.addPaymentMethod
);

/**
 * @route   DELETE /api/payment/methods/:id
 * @desc    Delete payment method
 * @access  Private
 */
router.delete(
    '/methods/:id',
    [
        param('id').isMongoId().withMessage('Invalid payment method ID'),
        validate
    ],
    paymentController.deletePaymentMethod
);

/**
 * @route   PUT /api/payment/methods/:id/default
 * @desc    Set payment method as default
 * @access  Private
 */
router.put(
    '/methods/:id/default',
    [
        param('id').isMongoId().withMessage('Invalid payment method ID'),
        validate
    ],
    paymentController.setDefaultPaymentMethod
);

/**
 * @route   POST /api/payment/process
 * @desc    Process a payment
 * @access  Private
 */
router.post(
    '/process',
    [
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be at least $0.01'),
        body('serviceId').optional().isMongoId().withMessage('Invalid service ID'),
        body('subscriptionId').optional().isMongoId().withMessage('Invalid subscription ID'),
        body('paymentMethodId').trim().notEmpty().withMessage('Payment method ID is required'),
        body('description').trim().notEmpty().withMessage('Payment description is required'),
        validate
    ],
    paymentController.processPayment
);

/**
 * @route   POST /api/payment/create-intent
 * @desc    Create payment intent for Stripe
 * @access  Private
 */
router.post(
    '/create-intent',
    [
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be at least $0.01'),
        body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency'),
        body('subscriptionId').optional().isMongoId(),
        validate
    ],
    paymentController.createPaymentIntent
);

/**
 * @route   GET /api/payment/history
 * @desc    Get payment history
 * @access  Private
 */
router.get(
    '/history',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded']).withMessage('Invalid status'),
        query('type').optional().isIn(['payment', 'refund', 'payout']).withMessage('Invalid type'),
        query('startDate').optional().isISO8601().withMessage('Invalid start date'),
        query('endDate').optional().isISO8601().withMessage('Invalid end date'),
        validate
    ],
    paymentController.getPaymentHistory
);

/**
 * @route   GET /api/payment/history/:id
 * @desc    Get single payment details
 * @access  Private
 */
router.get(
    '/history/:id',
    [
        param('id').isMongoId().withMessage('Invalid payment ID'),
        validate
    ],
    paymentController.getPaymentDetails
);

/**
 * @route   POST /api/payment/refund/:id
 * @desc    Request refund for a payment
 * @access  Private
 */
router.post(
    '/refund/:id',
    [
        param('id').isMongoId().withMessage('Invalid payment ID'),
        body('amount').optional().isFloat({ min: 0.01 }).withMessage('Refund amount must be at least $0.01'),
        body('reason').isIn(['customer_request', 'service_not_provided', 'quality_issue', 'duplicate_charge', 'other']).withMessage('Invalid refund reason'),
        body('description').optional().trim().isLength({ max: 1000 }),
        validate
    ],
    paymentController.requestRefund
);

/**
 * @route   GET /api/payment/refund/:id/status
 * @desc    Check refund status
 * @access  Private
 */
router.get(
    '/refund/:id/status',
    [
        param('id').isMongoId().withMessage('Invalid payment ID'),
        validate
    ],
    paymentController.getRefundStatus
);

/**
 * @route   GET /api/payment/statistics
 * @desc    Get payment statistics for user
 * @access  Private
 */
router.get(
    '/statistics',
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        validate
    ],
    paymentController.getPaymentStatistics
);

/**
 * @route   POST /api/payment/webhook/stripe
 * @desc    Handle Stripe webhooks
 * @access  Public (but verified by Stripe signature)
 */
router.post('/webhook/stripe', paymentController.handleStripeWebhook);

/**
 * @route   GET /api/payment/invoices
 * @desc    Get all invoices
 * @access  Private
 */
router.get(
    '/invoices',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        validate
    ],
    paymentController.getInvoices
);

/**
 * @route   GET /api/payment/invoices/:id
 * @desc    Get single invoice
 * @access  Private
 */
router.get(
    '/invoices/:id',
    [
        param('id').isMongoId().withMessage('Invalid invoice ID'),
        validate
    ],
    paymentController.getInvoice
);

/**
 * @route   GET /api/payment/invoices/:id/download
 * @desc    Download invoice as PDF
 * @access  Private
 */
router.get(
    '/invoices/:id/download',
    [
        param('id').isMongoId().withMessage('Invalid invoice ID'),
        validate
    ],
    paymentController.downloadInvoice
);

/**
 * @route   POST /api/payment/setup-autopay
 * @desc    Setup automatic payments
 * @access  Private
 */
router.post(
    '/setup-autopay',
    [
        body('subscriptionId').isMongoId().withMessage('Invalid subscription ID'),
        body('paymentMethodId').trim().notEmpty().withMessage('Payment method ID is required'),
        validate
    ],
    paymentController.setupAutopay
);

/**
 * @route   DELETE /api/payment/autopay/:subscriptionId
 * @desc    Cancel automatic payments
 * @access  Private
 */
router.delete(
    '/autopay/:subscriptionId',
    [
        param('subscriptionId').isMongoId().withMessage('Invalid subscription ID'),
        validate
    ],
    paymentController.cancelAutopay
);

/**
 * @route   GET /api/payment/upcoming
 * @desc    Get upcoming payments
 * @access  Private
 */
router.get(
    '/upcoming',
    [
        query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90'),
        validate
    ],
    paymentController.getUpcomingPayments
);

/**
 * @route   POST /api/payment/retry/:id
 * @desc    Retry failed payment
 * @access  Private
 */
router.post(
    '/retry/:id',
    [
        param('id').isMongoId().withMessage('Invalid payment ID'),
        body('paymentMethodId').optional().trim().notEmpty(),
        validate
    ],
    paymentController.retryPayment
);

/**
 * @route   GET /api/payment/balance
 * @desc    Get account balance (for providers)
 * @access  Private
 */
router.get('/balance', paymentController.getAccountBalance);

/**
 * @route   POST /api/payment/payout/request
 * @desc    Request payout (for providers)
 * @access  Private
 */
router.post(
    '/payout/request',
    [
        body('amount').isFloat({ min: 1 }).withMessage('Payout amount must be at least $1'),
        body('method').isIn(['bank_transfer', 'paypal', 'check']).withMessage('Invalid payout method'),
        body('notes').optional().trim().isLength({ max: 500 }),
        validate
    ],
    paymentController.requestPayout
);

/**
 * @route   GET /api/payment/payout/history
 * @desc    Get payout history (for providers)
 * @access  Private
 */
router.get(
    '/payout/history',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('status').optional().isIn(['pending', 'processing', 'completed', 'failed']),
        validate
    ],
    paymentController.getPayoutHistory
);

/**
 * @route   POST /api/payment/apply-credit
 * @desc    Apply credit/loyalty points to payment
 * @access  Private
 */
router.post(
    '/apply-credit',
    [
        body('subscriptionId').isMongoId().withMessage('Invalid subscription ID'),
        body('creditAmount').isFloat({ min: 0.01 }).withMessage('Credit amount must be at least $0.01'),
        validate
    ],
    paymentController.applyCredit
);

module.exports = router;