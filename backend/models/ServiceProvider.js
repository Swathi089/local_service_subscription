const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        trim: true
    },
    serviceTypes: [{
        type: String,
        enum: ['cleaning', 'plumbing', 'electrical', 'gardening', 'carpentry', 'painting'],
        required: true
    }],
    experience: {
        type: Number,
        required: [true, 'Please provide years of experience'],
        min: [0, 'Experience cannot be negative']
    },
    bio: {
        type: String,
        maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        certificateUrl: String
    }],
    serviceArea: {
        cities: [String],
        radius: {
            type: Number,
            default: 25 // miles
        },
        zipCodes: [String]
    },
    availability: {
        monday: { type: Boolean, default: false },
        tuesday: { type: Boolean, default: false },
        wednesday: { type: Boolean, default: false },
        thursday: { type: Boolean, default: false },
        friday: { type: Boolean, default: false },
        saturday: { type: Boolean, default: false },
        sunday: { type: Boolean, default: false }
    },
    workingHours: {
        start: {
            type: String,
            default: '09:00'
        },
        end: {
            type: String,
            default: '17:00'
        }
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    statistics: {
        totalJobs: {
            type: Number,
            default: 0
        },
        completedJobs: {
            type: Number,
            default: 0
        },
        activeClients: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        pendingPayouts: {
            type: Number,
            default: 0
        },
        availableBalance: {
            type: Number,
            default: 0
        }
    },
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        routingNumber: String,
        bankName: String,
        accountType: {
            type: String,
            enum: ['checking', 'savings']
        },
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    paypalEmail: String,
    documents: [{
        type: {
            type: String,
            enum: ['license', 'insurance', 'certification', 'id'],
            required: true
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        verified: {
            type: Boolean,
            default: false
        }
    }],
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedAt: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    acceptingNewClients: {
        type: Boolean,
        default: true
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
serviceProviderSchema.index({ userId: 1 });
serviceProviderSchema.index({ serviceTypes: 1 });
serviceProviderSchema.index({ 'rating.average': -1 });
serviceProviderSchema.index({ verificationStatus: 1 });
serviceProviderSchema.index({ 'serviceArea.cities': 1 });

// Virtual for services
serviceProviderSchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'providerId'
});

// Virtual for completion rate
serviceProviderSchema.virtual('completionRate').get(function() {
    if (this.statistics.totalJobs === 0) return 0;
    return ((this.statistics.completedJobs / this.statistics.totalJobs) * 100).toFixed(2);
});

// Pre-save middleware
serviceProviderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to update rating
serviceProviderSchema.methods.updateRating = function(newRating) {
    const totalRating = (this.rating.average * this.rating.count) + newRating;
    this.rating.count += 1;
    this.rating.average = parseFloat((totalRating / this.rating.count).toFixed(2));
};

// Method to record earnings
serviceProviderSchema.methods.recordEarning = function(amount, platformFee = 0.10) {
    const providerAmount = amount * (1 - platformFee);
    this.statistics.totalEarnings += providerAmount;
    this.statistics.pendingPayouts += providerAmount;
};

// Method to process payout
serviceProviderSchema.methods.processPayout = function(amount) {
    if (this.statistics.pendingPayouts >= amount) {
        this.statistics.pendingPayouts -= amount;
        this.statistics.availableBalance += amount;
        return true;
    }
    return false;
};

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);