const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider'
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    type: {
        type: String,
        enum: ['payment', 'refund', 'payout', 'adjustment'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    platformFee: {
        type: Number,
        default: 0
    },
    providerAmount: {
        type: Number,
        default: 0
    },
    method: {
        type: String,
        enum: ['card', 'bank_transfer', 'paypal', 'cash', 'other'],
        required: true
    },
    paymentDetails: {
        last4: String,
        brand: String,
        paymentMethodId: String,
        receiptUrl: String
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        invoiceNumber: String,
        billingPeriod: String,
        notes: String
    },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    refund: {
        refundId: String,
        amount: Number,
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed']
        },
        processedAt: Date
    },
    payout: {
        payoutId: String,
        method: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'check']
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed']
        },
        processedAt: Date,
        estimatedArrival: Date
    },
    failureReason: String,
    processedAt: Date,
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
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ customerId: 1, createdAt: -1 });
paymentSchema.index({ providerId: 1, status: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ type: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for customer
paymentSchema.virtual('customer', {
    ref: 'Customer',
    localField: 'customerId',
    foreignField: '_id',
    justOne: true
});

// Virtual for provider
paymentSchema.virtual('provider', {
    ref: 'ServiceProvider',
    localField: 'providerId',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Calculate platform fee and provider amount for payments
    if (this.type === 'payment' && !this.platformFee) {
        const feePercentage = 0.10; // 10% platform fee
        this.platformFee = this.amount * feePercentage;
        this.providerAmount = this.amount - this.platformFee;
    }
    
    next();
});

// Generate unique transaction ID
paymentSchema.pre('save', async function(next) {
    if (this.isNew && !this.transactionId) {
        const prefix = {
            'payment': 'PAY',
            'refund': 'REF',
            'payout': 'OUT',
            'adjustment': 'ADJ'
        };
        
        const typePrefix = prefix[this.type] || 'TXN';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        this.transactionId = `${typePrefix}-${timestamp}-${random}`;
    }
    next();
});

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = function() {
    this.status = 'completed';
    this.processedAt = new Date();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason) {
    this.status = 'failed';
    this.failureReason = reason;
    this.processedAt = new Date();
};

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
    if (this.type !== 'payment' || this.status !== 'completed') {
        throw new Error('Can only refund completed payments');
    }
    
    const refundAmount = amount || this.amount;
    
    if (refundAmount > this.amount) {
        throw new Error('Refund amount cannot exceed original payment amount');
    }
    
    this.refund = {
        amount: refundAmount,
        reason: reason,
        status: 'pending'
    };
    
    if (refundAmount === this.amount) {
        this.status = 'refunded';
    }
    
    return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(filters = {}) {
    const match = { status: 'completed' };
    
    if (filters.customerId) match.customerId = filters.customerId;
    if (filters.providerId) match.providerId = filters.providerId;
    if (filters.startDate || filters.endDate) {
        match.createdAt = {};
        if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
    }
    
    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalPlatformFee: { $sum: '$platformFee' },
                totalProviderAmount: { $sum: '$providerAmount' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$amount' }
            }
        }
    ]);
    
    return stats[0] || {
        totalAmount: 0,
        totalPlatformFee: 0,
        totalProviderAmount: 0,
        count: 0,
        avgAmount: 0
    };
};

module.exports = mongoose.model('Payment', paymentSchema);