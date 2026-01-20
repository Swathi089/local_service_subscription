const User = require('../models/User');
const Customer = require('../models/Customer');
const ServiceProvider = require('../models/ServiceProvider');
const Service = require('../models/Service');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const logger = require('../utils/logger.util');
const { sendEmail } = require('../utils/email.util');

// ==================== DASHBOARD ====================

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
exports.getDashboard = async (req, res, next) => {
    try {
        // Get counts and statistics
        const [
            totalUsers,
            totalCustomers,
            totalProviders,
            activeProviders,
            pendingProviders,
            totalServices,
            activeServices,
            pendingServices,
            totalSubscriptions,
            activeSubscriptions,
            totalPayments,
            monthlyRevenue,
            revenueStats
        ] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'customer', isActive: true }),
            User.countDocuments({ role: 'provider', isActive: true }),
            ServiceProvider.countDocuments({ verificationStatus: 'verified', isActive: true }),
            ServiceProvider.countDocuments({ verificationStatus: 'pending' }),
            Service.countDocuments(),
            Service.countDocuments({ status: 'active', isActive: true }),
            Service.countDocuments({ status: 'pending' }),
            Subscription.countDocuments(),
            Subscription.countDocuments({ status: 'active' }),
            Payment.countDocuments({ type: 'payment', status: 'completed' }),
            Payment.aggregate([
                {
                    $match: {
                        type: 'payment',
                        status: 'completed',
                        createdAt: {
                            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' },
                        platformFee: { $sum: '$platformFee' }
                    }
                }
            ]),
            Payment.getStatistics()
        ]);

        // Get recent registrations
        const recentUsers = await User.find({ isActive: true })
            .select('fullName email role createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get pending approvals
        const pendingApprovals = await ServiceProvider.find({
            verificationStatus: 'pending'
        })
            .populate('userId', 'fullName email')
            .limit(10);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalCustomers,
                    totalProviders,
                    activeProviders,
                    pendingProviders,
                    totalServices,
                    activeServices,
                    pendingServices,
                    totalSubscriptions,
                    activeSubscriptions,
                    totalPayments
                },
                revenue: {
                    monthly: monthlyRevenue[0]?.total || 0,
                    platformFee: monthlyRevenue[0]?.platformFee || 0,
                    total: revenueStats.totalAmount,
                    avgTransaction: revenueStats.avgAmount
                },
                recentUsers,
                pendingApprovals
            }
        });
    } catch (error) {
        logger.error('Get admin dashboard error:', error);
        next(error);
    }
};

// ==================== USER MANAGEMENT ====================

/**
 * @desc    Get all users with filters
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const { role, status, verified, page = 1, limit = 10, search } = req.query;
        
        const query = {};
        
        if (role) query.role = role;
        if (status) query.isActive = status === 'active';
        if (verified !== undefined) query.isVerified = verified === 'true';
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -refreshToken')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalResults: count,
                resultsPerPage: users.length
            }
        });
    } catch (error) {
        logger.error('Get all users error:', error);
        next(error);
    }
};

/**
 * @desc    Get single user details
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
exports.getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get role-specific profile
        let profile = null;
        if (user.role === 'customer') {
            profile = await Customer.findOne({ userId: user._id })
                .populate('subscriptions');
        } else if (user.role === 'provider') {
            profile = await ServiceProvider.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        logger.error('Get user details error:', error);
        next(error);
    }
};

/**
 * @desc    Update user
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { fullName, phone, isActive, isVerified } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (isActive !== undefined) user.isActive = isActive;
        if (isVerified !== undefined) {
            user.isVerified = isVerified;
            if (isVerified) user.emailVerifiedAt = new Date();
        }

        await user.save();

        logger.info(`Admin updated user ${user.email}`);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        logger.error('Update user error:', error);
        next(error);
    }
};

/**
 * @desc    Delete/Deactivate user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete - deactivate account
        user.isActive = false;
        await user.save();

        logger.warn(`Admin deactivated user ${user.email}`);

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        logger.error('Delete user error:', error);
        next(error);
    }
};

/**
 * @desc    Verify user account
 * @route   PUT /api/admin/users/:id/verify
 * @access  Private (Admin)
 */
exports.verifyUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'User verified successfully'
        });
    } catch (error) {
        logger.error('Verify user error:', error);
        next(error);
    }
};

/**
 * @desc    Suspend user account
 * @route   PUT /api/admin/users/:id/suspend
 * @access  Private (Admin)
 */
exports.suspendUser = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = false;
        await user.save();

        // Send suspension email
        await sendEmail(
            user.email,
            'Account Suspended',
            `Your account has been suspended. Reason: ${reason}`
        );

        logger.warn(`Admin suspended user ${user.email}. Reason: ${reason}`);

        res.json({
            success: true,
            message: 'User suspended successfully'
        });
    } catch (error) {
        logger.error('Suspend user error:', error);
        next(error);
    }
};

/**
 * @desc    Activate user account
 * @route   PUT /api/admin/users/:id/activate
 * @access  Private (Admin)
 */
exports.activateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = true;
        await user.save();

        res.json({
            success: true,
            message: 'User activated successfully'
        });
    } catch (error) {
        logger.error('Activate user error:', error);
        next(error);
    }
};

// ==================== SERVICE MANAGEMENT ====================

/**
 * @desc    Get all services
 * @route   GET /api/admin/services
 * @access  Private (Admin)
 */
exports.getAllServices = async (req, res, next) => {
    try {
        const { category, status, page = 1, limit = 10, search } = req.query;
        
        const query = {};
        
        if (category) query.category = category;
        if (status) query.status = status;
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const services = await Service.find(query)
            .populate('providerId', 'businessName rating')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Service.countDocuments(query);

        res.json({
            success: true,
            data: services,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalResults: count
            }
        });
    } catch (error) {
        logger.error('Get all services error:', error);
        next(error);
    }
};

/**
 * @desc    Get service details
 * @route   GET /api/admin/services/:id
 * @access  Private (Admin)
 */
exports.getServiceDetails = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('providerId');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const reviews = await Review.find({ serviceId: service._id })
            .populate('customerId', 'fullName')
            .limit(10);

        res.json({
            success: true,
            data: {
                service,
                reviews
            }
        });
    } catch (error) {
        logger.error('Get service details error:', error);
        next(error);
    }
};

/**
 * @desc    Approve service
 * @route   PUT /api/admin/services/:id/approve
 * @access  Private (Admin)
 */
exports.approveService = async (req, res, next) => {
    try {
        const { notes } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        service.status = 'active';
        await service.save();

        logger.info(`Admin approved service ${service.name}`);

        res.json({
            success: true,
            message: 'Service approved successfully',
            data: service
        });
    } catch (error) {
        logger.error('Approve service error:', error);
        next(error);
    }
};

/**
 * @desc    Reject service
 * @route   PUT /api/admin/services/:id/reject
 * @access  Private (Admin)
 */
exports.rejectService = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        service.status = 'inactive';
        await service.save();

        logger.warn(`Admin rejected service ${service.name}. Reason: ${reason}`);

        res.json({
            success: true,
            message: 'Service rejected'
        });
    } catch (error) {
        logger.error('Reject service error:', error);
        next(error);
    }
};

/**
 * @desc    Suspend service
 * @route   PUT /api/admin/services/:id/suspend
 * @access  Private (Admin)
 */
exports.suspendService = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        service.status = 'suspended';
        service.isActive = false;
        await service.save();

        logger.warn(`Admin suspended service ${service.name}. Reason: ${reason}`);

        res.json({
            success: true,
            message: 'Service suspended successfully'
        });
    } catch (error) {
        logger.error('Suspend service error:', error);
        next(error);
    }
};

/**
 * @desc    Feature/unfeature service
 * @route   PUT /api/admin/services/:id/feature
 * @access  Private (Admin)
 */
exports.featureService = async (req, res, next) => {
    try {
        const { isFeatured } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        service.isFeatured = isFeatured;
        await service.save();

        res.json({
            success: true,
            message: `Service ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
            data: service
        });
    } catch (error) {
        logger.error('Feature service error:', error);
        next(error);
    }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/admin/services/:id
 * @access  Private (Admin)
 */
exports.deleteService = async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        await service.remove();

        res.json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        logger.error('Delete service error:', error);
        next(error);
    }
};

// ==================== PAYMENT MANAGEMENT ====================

/**
 * @desc    Get all payments
 * @route   GET /api/admin/payments
 * @access  Private (Admin)
 */
exports.getAllPayments = async (req, res, next) => {
    try {
        const { type, status, page = 1, limit = 10, startDate, endDate } = req.query;
        
        const query = {};
        
        if (type) query.type = type;
        if (status) query.status = status;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const payments = await Payment.find(query)
            .populate('customerId', 'fullName email')
            .populate('providerId', 'businessName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Payment.countDocuments(query);

        res.json({
            success: true,
            data: payments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalResults: count
            }
        });
    } catch (error) {
        logger.error('Get all payments error:', error);
        next(error);
    }
};

/**
 * @desc    Get payment details
 * @route   GET /api/admin/payments/:id
 * @access  Private (Admin)
 */
exports.getPaymentDetails = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('customerId')
            .populate('providerId')
            .populate('serviceId')
            .populate('subscriptionId');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        logger.error('Get payment details error:', error);
        next(error);
    }
};

/**
 * @desc    Process refund
 * @route   POST /api/admin/payments/:id/refund
 * @access  Private (Admin)
 */
exports.processRefund = async (req, res, next) => {
    try {
        const { amount, reason } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        await payment.processRefund(amount, reason);

        logger.info(`Admin processed refund for payment ${payment.transactionId}`);

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: payment
        });
    } catch (error) {
        logger.error('Process refund error:', error);
        next(error);
    }
};

/**
 * @desc    Get payout requests
 * @route   GET /api/admin/payouts
 * @access  Private (Admin)
 */
exports.getPayoutRequests = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const query = { type: 'payout' };
        if (status) query['payout.status'] = status;

        const payouts = await Payment.find(query)
            .populate('providerId', 'businessName email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Payment.countDocuments(query);

        res.json({
            success: true,
            data: payouts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalResults: count
            }
        });
    } catch (error) {
        logger.error('Get payout requests error:', error);
        next(error);
    }
};

/**
 * @desc    Process payouts
 * @route   POST /api/admin/payouts/process
 * @access  Private (Admin)
 */
exports.processPayouts = async (req, res, next) => {
    try {
        const { payoutIds } = req.body;

        const results = await Promise.all(
            payoutIds.map(async (id) => {
                const payout = await Payment.findById(id);
                if (payout && payout.type === 'payout') {
                    payout.status = 'completed';
                    payout.processedAt = new Date();
                    await payout.save();
                    return { id, success: true };
                }
                return { id, success: false, message: 'Payout not found' };
            })
        );

        res.json({
            success: true,
            message: 'Payouts processed',
            data: results
        });
    } catch (error) {
        logger.error('Process payouts error:', error);
        next(error);
    }
};

// Continue in next response with more methods...

module.exports = exports;