const Subscription = require('../models/Subscription');
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const ServiceProvider = require('../models/ServiceProvider');
const Payment = require('../models/Payment');
const logger = require('../utils/logger.util');
const { sendNotificationEmail } = require('../utils/notification.util');

/**
 * @desc    Get all subscriptions for authenticated user
 * @route   GET /api/subscription
 * @access  Private
 */
exports.getSubscriptions = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const query = {};
        
        // Filter by user role
        if (req.user.role === 'customer') {
            const customer = await Customer.findOne({ userId: req.user.userId });
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer profile not found'
                });
            }
            query.customerId = customer._id;
        } else if (req.user.role === 'provider') {
            const provider = await ServiceProvider.findOne({ userId: req.user.userId });
            if (!provider) {
                return res.status(404).json({
                    success: false,
                    message: 'Provider profile not found'
                });
            }
            query.providerId = provider._id;
        }

        if (status) query.status = status;

        const subscriptions = await Subscription.find(query)
            .populate('serviceId', 'name pricing category')
            .populate('customerId', 'fullName email')
            .populate('providerId', 'businessName rating')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Subscription.countDocuments(query);

        res.json({
            success: true,
            data: subscriptions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalResults: count
            }
        });
    } catch (error) {
        logger.error('Get subscriptions error:', error);
        next(error);
    }
};

/**
 * @desc    Get single subscription details
 * @route   GET /api/subscription/:id
 * @access  Private
 */
exports.getSubscriptionDetails = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('serviceId')
            .populate('customerId')
            .populate('providerId');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Check access permission
        const customer = await Customer.findOne({ userId: req.user.userId });
        const provider = await ServiceProvider.findOne({ userId: req.user.userId });

        const hasAccess = 
            req.user.role === 'admin' ||
            (customer && subscription.customerId.toString() === customer._id.toString()) ||
            (provider && subscription.providerId.toString() === provider._id.toString());

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        logger.error('Get subscription details error:', error);
        next(error);
    }
};

/**
 * @desc    Create new subscription
 * @route   POST /api/subscription
 * @access  Private
 */
exports.createSubscription = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ userId: req.user.userId });
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        const { serviceId, plan, startDate, schedule, paymentMethodId, specialInstructions } = req.body;

        // Get service details
        const service = await Service.findById(serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or inactive'
            });
        }

        // Calculate billing dates
        const start = startDate ? new Date(startDate) : new Date();
        const nextBilling = new Date(start);
        
        const intervalDays = {
            'weekly': 7,
            'bi-weekly': 14,
            'monthly': 30,
            'quarterly': 90,
            'yearly': 365
        };
        
        nextBilling.setDate(nextBilling.getDate() + (intervalDays[plan.interval] || 30));

        // Create subscription
        const subscription = await Subscription.create({
            customerId: customer._id,
            serviceId: service._id,
            providerId: service.providerId,
            plan: {
                type: plan.type,
                name: plan.name || service.name,
                price: plan.price || service.pricing.basePrice,
                interval: plan.interval,
                visitsPerInterval: plan.visitsPerInterval || 1
            },
            status: 'pending',
            startDate: start,
            nextBillingDate: nextBilling,
            nextServiceDate: start,
            schedule: schedule || {},
            specialInstructions: specialInstructions,
            billing: {
                amount: plan.price || service.pricing.basePrice,
                currency: 'USD',
                paymentMethodId: paymentMethodId
            }
        });

        // Update customer subscriptions
        customer.subscriptions.push(subscription._id);
        customer.statistics.activeSubscriptions += 1;
        await customer.save();

        // Update service statistics
        service.statistics.activeSubscriptions += 1;
        await service.save();

        logger.info(`Subscription created: ${subscription._id} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Create subscription error:', error);
        next(error);
    }
};

/**
 * @desc    Update subscription
 * @route   PUT /api/subscription/:id
 * @access  Private
 */
exports.updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Check ownership
        const customer = await Customer.findOne({ userId: req.user.userId });
        if (!customer || subscription.customerId.toString() !== customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const { plan, schedule, autoRenew, specialInstructions } = req.body;

        if (plan) {
            if (plan.type) subscription.plan.type = plan.type;
            if (plan.interval) subscription.plan.interval = plan.interval;
        }

        if (schedule) {
            subscription.schedule = { ...subscription.schedule, ...schedule };
        }

        if (autoRenew !== undefined) subscription.autoRenew = autoRenew;
        if (specialInstructions !== undefined) subscription.specialInstructions = specialInstructions;

        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription updated successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Update subscription error:', error);
        next(error);
    }
};

/**
 * @desc    Pause subscription
 * @route   POST /api/subscription/:id/pause
 * @access  Private
 */
exports.pauseSubscription = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Only active subscriptions can be paused'
            });
        }

        subscription.pause(reason);
        await subscription.save();

        // Update customer statistics
        const customer = await Customer.findById(subscription.customerId);
        if (customer) {
            customer.statistics.activeSubscriptions -= 1;
            await customer.save();
        }

        logger.info(`Subscription ${subscription._id} paused by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Subscription paused successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Pause subscription error:', error);
        next(error);
    }
};

/**
 * @desc    Resume subscription
 * @route   POST /api/subscription/:id/resume
 * @access  Private
 */
exports.resumeSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.status !== 'paused') {
            return res.status(400).json({
                success: false,
                message: 'Only paused subscriptions can be resumed'
            });
        }

        subscription.resume();
        await subscription.save();

        // Update customer statistics
        const customer = await Customer.findById(subscription.customerId);
        if (customer) {
            customer.statistics.activeSubscriptions += 1;
            await customer.save();
        }

        logger.info(`Subscription ${subscription._id} resumed by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Subscription resumed successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Resume subscription error:', error);
        next(error);
    }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/subscription/:id/cancel
 * @access  Private
 */
exports.cancelSubscription = async (req, res, next) => {
    try {
        const { reason, requestRefund } = req.body;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        subscription.cancel(reason, req.user.role);
        
        if (requestRefund) {
            subscription.cancellation.refundAmount = subscription.billing.amount;
            subscription.cancellation.refundStatus = 'pending';
        }

        await subscription.save();

        // Update customer statistics
        const customer = await Customer.findById(subscription.customerId);
        if (customer) {
            if (subscription.status === 'active') {
                customer.statistics.activeSubscriptions -= 1;
            }
            await customer.save();
        }

        // Update service statistics
        const service = await Service.findById(subscription.serviceId);
        if (service) {
            service.statistics.activeSubscriptions -= 1;
            await service.save();
        }

        logger.info(`Subscription ${subscription._id} cancelled by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Cancel subscription error:', error);
        next(error);
    }
};

/**
 * @desc    Renew subscription manually
 * @route   POST /api/subscription/:id/renew
 * @access  Private
 */
exports.renewSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.status !== 'expired') {
            return res.status(400).json({
                success: false,
                message: 'Only expired subscriptions can be renewed'
            });
        }

        subscription.status = 'active';
        subscription.calculateNextBillingDate();
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription renewed successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Renew subscription error:', error);
        next(error);
    }
};

/**
 * @desc    Get subscription history
 * @route   GET /api/subscription/:id/history
 * @access  Private
 */
exports.getSubscriptionHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        const history = subscription.serviceHistory
            .slice((page - 1) * limit, page * limit);

        res.json({
            success: true,
            data: {
                history,
                total: subscription.serviceHistory.length,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(subscription.serviceHistory.length / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Get subscription history error:', error);
        next(error);
    }
};

/**
 * @desc    Record service visit
 * @route   POST /api/subscription/:id/record-visit
 * @access  Private
 */
exports.recordServiceVisit = async (req, res, next) => {
    try {
        const { status, notes, rating } = req.body;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        subscription.recordVisit(status, notes);
        
        if (rating) {
            const lastVisit = subscription.serviceHistory[subscription.serviceHistory.length - 1];
            lastVisit.rating = rating;
        }

        await subscription.save();

        res.json({
            success: true,
            message: 'Service visit recorded successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Record service visit error:', error);
        next(error);
    }
};

/**
 * @desc    Update subscription schedule
 * @route   PUT /api/subscription/:id/schedule
 * @access  Private
 */
exports.updateSchedule = async (req, res, next) => {
    try {
        const { preferredDays, preferredTime, flexibleScheduling } = req.body;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (preferredDays) subscription.schedule.preferredDays = preferredDays;
        if (preferredTime) subscription.schedule.preferredTime = preferredTime;
        if (flexibleScheduling !== undefined) subscription.schedule.flexibleScheduling = flexibleScheduling;

        await subscription.save();

        res.json({
            success: true,
            message: 'Schedule updated successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Update schedule error:', error);
        next(error);
    }
};

/**
 * @desc    Reschedule next service
 * @route   POST /api/subscription/:id/reschedule
 * @access  Private
 */
exports.rescheduleService = async (req, res, next) => {
    try {
        const { newDate, reason } = req.body;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        subscription.nextServiceDate = new Date(newDate);
        await subscription.save();

        logger.info(`Service rescheduled for subscription ${subscription._id} to ${newDate}`);

        res.json({
            success: true,
            message: 'Service rescheduled successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Reschedule service error:', error);
        next(error);
    }
};

/**
 * @desc    Get payment history for subscription
 * @route   GET /api/subscription/:id/payment-history
 * @access  Private
 */
exports.getPaymentHistory = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        const payments = await Payment.find({
            subscriptionId: subscription._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        logger.error('Get payment history error:', error);
        next(error);
    }
};

/**
 * @desc    Update payment method
 * @route   PUT /api/subscription/:id/payment-method
 * @access  Private
 */
exports.updatePaymentMethod = async (req, res, next) => {
    try {
        const { paymentMethodId } = req.body;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        subscription.billing.paymentMethodId = paymentMethodId;
        await subscription.save();

        res.json({
            success: true,
            message: 'Payment method updated successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Update payment method error:', error);
        next(error);
    }
};

/**
 * @desc    Get upcoming services
 * @route   GET /api/subscription/upcoming
 * @access  Private
 */
exports.getUpcomingServices = async (req, res, next) => {
    try {
        const { days = 7 } = req.query;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(days));

        const customer = await Customer.findOne({ userId: req.user.userId });
        
        const subscriptions = await Subscription.find({
            customerId: customer._id,
            status: 'active',
            nextServiceDate: {
                $gte: new Date(),
                $lte: futureDate
            }
        })
            .populate('serviceId', 'name category')
            .populate('providerId', 'businessName')
            .sort({ nextServiceDate: 1 });

        res.json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        logger.error('Get upcoming services error:', error);
        next(error);
    }
};

/**
 * @desc    Get expiring subscriptions
 * @route   GET /api/subscription/expiring
 * @access  Private
 */
exports.getExpiringSubscriptions = async (req, res, next) => {
    try {
        const { days = 7 } = req.query;
        
        const subscriptions = await Subscription.getExpiringSubscriptions(parseInt(days));

        res.json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        logger.error('Get expiring subscriptions error:', error);
        next(error);
    }
};

/**
 * @desc    Apply discount to subscription
 * @route   POST /api/subscription/:id/apply-discount
 * @access  Private
 */
exports.applyDiscount = async (req, res, next) => {
    try {
        const { code } = req.body;
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Here you would validate the discount code
        // For now, applying a mock discount
        subscription.discount = {
            code: code,
            percentage: 10 // 10% discount
        };

        await subscription.save();

        res.json({
            success: true,
            message: 'Discount applied successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Apply discount error:', error);
        next(error);
    }
};

/**
 * @desc    Remove discount
 * @route   DELETE /api/subscription/:id/discount
 * @access  Private
 */
exports.removeDiscount = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        subscription.discount = undefined;
        await subscription.save();

        res.json({
            success: true,
            message: 'Discount removed successfully',
            data: subscription
        });
    } catch (error) {
        logger.error('Remove discount error:', error);
        next(error);
    }
};

module.exports = exports;