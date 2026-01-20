const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    rating: {
        overall: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        quality: {
            type: Number,
            min: 1,
            max: 5
        },
        professionalism: {
            type: Number,
            min: 1,
            max: 5
        },
        punctuality: {
            type: Number,
            min: 1,
            max: 5
        },
        communication: {
            type: Number,
            min: 1,
            max: 5
        },
        value: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Review title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        required: [true, 'Please provide a review comment'],
        trim: true,
        maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    pros: [String],
    cons: [String],
    images: [{
        url: String,
        caption: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    notHelpfulCount: {
        type: Number,
        default: 0
    },
    helpfulVotes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isHelpful: Boolean,
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],
    response: {
        comment: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'approved'
    },
    moderationNotes: String,
    isFeatured: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0
    },
    reports: [{
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            enum: ['spam', 'offensive', 'fake', 'inappropriate', 'other']
        },
        description: String,
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],
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
reviewSchema.index({ serviceId: 1, status: 1 });
reviewSchema.index({ providerId: 1, status: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVerifiedPurchase: 1, status: 1 });

// Compound index for preventing duplicate reviews
reviewSchema.index({ customerId: 1, serviceId: 1, subscriptionId: 1 }, { unique: true });

// Virtual for customer
reviewSchema.virtual('customer', {
    ref: 'Customer',
    localField: 'customerId',
    foreignField: '_id',
    justOne: true
});

// Virtual for service
reviewSchema.virtual('service', {
    ref: 'Service',
    localField: 'serviceId',
    foreignField: '_id',
    justOne: true
});

// Virtual for provider
reviewSchema.virtual('provider', {
    ref: 'ServiceProvider',
    localField: 'providerId',
    foreignField: '_id',
    justOne: true
});

// Virtual for helpful ratio
reviewSchema.virtual('helpfulRatio').get(function() {
    const total = this.helpfulCount + this.notHelpfulCount;
    if (total === 0) return 0;
    return ((this.helpfulCount / total) * 100).toFixed(2);
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Post-save middleware to update service and provider ratings
reviewSchema.post('save', async function(doc) {
    const Service = mongoose.model('Service');
    const ServiceProvider = mongoose.model('ServiceProvider');
    
    // Update service rating
    await Service.findById(doc.serviceId).then(service => {
        if (service) {
            service.updateRating(doc.rating.overall);
            return service.save();
        }
    }).catch(err => console.error('Error updating service rating:', err));
    
    // Update provider rating
    await ServiceProvider.findById(doc.providerId).then(provider => {
        if (provider) {
            provider.updateRating(doc.rating.overall);
            return provider.save();
        }
    }).catch(err => console.error('Error updating provider rating:', err));
});

// Method to mark as helpful
reviewSchema.methods.markAsHelpful = function(userId, isHelpful) {
    const existingVote = this.helpfulVotes.find(
        vote => vote.userId.toString() === userId.toString()
    );
    
    if (existingVote) {
        // Update existing vote
        if (existingVote.isHelpful !== isHelpful) {
            if (isHelpful) {
                this.helpfulCount += 1;
                this.notHelpfulCount -= 1;
            } else {
                this.helpfulCount -= 1;
                this.notHelpfulCount += 1;
            }
            existingVote.isHelpful = isHelpful;
        }
    } else {
        // Add new vote
        this.helpfulVotes.push({ userId, isHelpful });
        if (isHelpful) {
            this.helpfulCount += 1;
        } else {
            this.notHelpfulCount += 1;
        }
    }
};

// Method to add provider response
reviewSchema.methods.addResponse = function(comment, respondedBy) {
    this.response = {
        comment: comment,
        respondedBy: respondedBy,
        respondedAt: new Date()
    };
};

// Method to report review
reviewSchema.methods.reportReview = function(reportedBy, reason, description) {
    this.reports.push({
        reportedBy: reportedBy,
        reason: reason,
        description: description
    });
    this.reportCount += 1;
    
    // Auto-flag if too many reports
    if (this.reportCount >= 3) {
        this.status = 'flagged';
    }
};

// Static method to get average ratings for a service
reviewSchema.statics.getServiceAverageRatings = async function(serviceId) {
    const ratings = await this.aggregate([
        { $match: { serviceId: mongoose.Types.ObjectId(serviceId), status: 'approved' } },
        {
            $group: {
                _id: null,
                avgOverall: { $avg: '$rating.overall' },
                avgQuality: { $avg: '$rating.quality' },
                avgProfessionalism: { $avg: '$rating.professionalism' },
                avgPunctuality: { $avg: '$rating.punctuality' },
                avgCommunication: { $avg: '$rating.communication' },
                avgValue: { $avg: '$rating.value' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    return ratings[0] || { avgOverall: 0, count: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);