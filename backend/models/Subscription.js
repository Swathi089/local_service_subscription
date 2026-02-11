const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider',
        required: true
    },
    plan: {
        type: {
            type: String,
            enum: ['basic', 'premium', 'enterprise', 'custom'],
            default: 'basic'
        },
        name: String,
        price: {
            type: Number,
            required: true,
            min: 0
        },
        interval: {
            type: String,
            enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'],
            default: 'monthly'
        },
        visitsPerInterval: {
            type: Number,
            default: 1
        }
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'cancelled', 'expired', 'pending'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    nextBillingDate: {
        type: Date,
        required: true
    },
    nextServiceDate: {
        type: Date
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    billing: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'
        },
        paymentMethodId: String,
        lastPaymentDate: Date,
        lastPaymentAmount: Number,
        nextPaymentAmount: Number
    },
    schedule: {
        preferredDays: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        preferredTime: String,
        flexibleScheduling: {
            type: Boolean,
            default: false
        }
    },
    serviceHistory: [{
        date: Date,
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'no-show']
        },
        notes: String,
        completedAt: Date,
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    specialInstructions: {
        type: String,
        maxlength: 500
    },
    discount: {
        code: String,
        percentage: {
            type: Number,
            min: 0,
            max: 100
        },
        amount: {
            type: Number,
            min: 0
        }
    },
    statistics: {
        totalVisits: {
            type: Number,
            default: 0
        },
        completedVisits: {
            type: Number,
            default: 0
        },
        cancelledVisits: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        }
    },
    pauseHistory: [{
        pausedAt: Date,
        resumedAt: Date,
        reason: String
    }],
    cancellation: {
        cancelledAt: Date,
        reason: String,
        cancelledBy: {
            type: String,
            enum: ['customer', 'provider', 'admin']
        },
        refundAmount: Number,
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'rejected']
        }
    },
    stripeSubscriptionId: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
subscriptionSchema.index({ customerId: 1, status: 1 });
subscriptionSchema.index({ serviceId: 1 });
subscriptionSchema.index({ providerId: 1, status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ status: 1, nextServiceDate: 1 });

// Virtual for customer
subscriptionSchema.virtual('customer', {
    ref: 'Customer',
    localField: 'customerId',
    foreignField: '_id',
    justOne: true
});

// Virtual for service
subscriptionSchema.virtual('service', {
    ref: 'Service',
    localField: 'serviceId',
    foreignField: '_id',
    justOne: true
});

// Virtual for provider
subscriptionSchema.virtual('provider', {
    ref: 'ServiceProvider',
    localField: 'providerId',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware
subscriptionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to pause subscription
subscriptionSchema.methods.pause = function(reason) {
    this.status = 'paused';
    this.pauseHistory.push({
        pausedAt: new Date(),
        reason: reason
    });
};

// Method to resume subscription
subscriptionSchema.methods.resume = function() {
    this.status = 'active';
    const lastPause = this.pauseHistory[this.pauseHistory.length - 1];
    if (lastPause && !lastPause.resumedAt) {
        lastPause.resumedAt = new Date();
    }
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function(reason, cancelledBy = 'customer') {
    this.status = 'cancelled';
    this.cancellation = {
        cancelledAt: new Date(),
        reason: reason,
        cancelledBy: cancelledBy
    };
};

// Method to record service visit
subscriptionSchema.methods.recordVisit = function(status, notes = '') {
    this.serviceHistory.push({
        date: new Date(),
        status: status,
        notes: notes,
        completedAt: status === 'completed' ? new Date() : null
    });

    this.statistics.totalVisits += 1;
    if (status === 'completed') {
        this.statistics.completedVisits += 1;
    } else if (status === 'cancelled') {
        this.statistics.cancelledVisits += 1;
    }
};

// Method to calculate next billing date
subscriptionSchema.methods.calculateNextBillingDate = function() {
    const intervals = {
        'weekly': 7,
        'bi-weekly': 14,
        'monthly': 30,
        'quarterly': 90,
        'yearly': 365
    };

    const days = intervals[this.plan.interval] || 30;
    this.nextBillingDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

// Static method to get expiring subscriptions
subscriptionSchema.statics.getExpiringSubscriptions = function(days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.find({
        status: 'active',
        nextBillingDate: { $lte: futureDate },
        autoRenew: false
    }).populate('customerId serviceId providerId');
};

module.exports = mongoose.model('Subscription', subscriptionSchema);