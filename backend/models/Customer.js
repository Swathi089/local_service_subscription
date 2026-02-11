const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    }],
    favoriteProviders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider'
    }],
    savedServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    loyaltyPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    memberSince: {
        type: Date,
        default: Date.now
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'USA'
        }
    },
    paymentMethods: [{
        type: {
            type: String,
            enum: ['card', 'bank_transfer', 'paypal'],
            required: true
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        last4: String,
        brand: String,
        expiryMonth: Number,
        expiryYear: Number,
        stripePaymentMethodId: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    statistics: {
        totalBookings: {
            type: Number,
            default: 0
        },
        activeSubscriptions: {
            type: Number,
            default: 0
        },
        completedServices: {
            type: Number,
            default: 0
        },
        reviewsGiven: {
            type: Number,
            default: 0
        }
    },
    preferences: {
        preferredServiceCategories: [String],
        preferredTimeSlots: [String],
        notificationPreferences: {
            bookingReminders: {
                type: Boolean,
                default: true
            },
            promotions: {
                type: Boolean,
                default: true
            },
            newServices: {
                type: Boolean,
                default: false
            }
        }
    },
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
customerSchema.index({ userId: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ loyaltyPoints: -1 });

// Virtual for active subscriptions count
customerSchema.virtual('activeSubscriptionsCount').get(function() {
    return this.statistics.activeSubscriptions;
});

// Pre-save middleware
customerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to add loyalty points
customerSchema.methods.addLoyaltyPoints = function(amount) {
    const pointsPerDollar = 10; // 10 points per dollar spent
    const points = Math.floor(amount * pointsPerDollar);
    this.loyaltyPoints += points;
    return points;
};

// Method to update spending
customerSchema.methods.recordPayment = function(amount) {
    this.totalSpent += amount;
    this.addLoyaltyPoints(amount);
};

module.exports = mongoose.model('Customer', customerSchema);