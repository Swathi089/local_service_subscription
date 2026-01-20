const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide service name'],
        trim: true,
        maxlength: [200, 'Service name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide service description'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Please specify service category'],
        enum: {
            values: ['cleaning', 'plumbing', 'electrical', 'gardening', 'carpentry', 'painting'],
            message: 'Invalid service category'
        }
    },
    subCategory: {
        type: String,
        trim: true
    },
    pricing: {
        basePrice: {
            type: Number,
            required: [true, 'Please provide base price'],
            min: [0, 'Price cannot be negative']
        },
        priceType: {
            type: String,
            enum: ['per_visit', 'hourly', 'fixed'],
            default: 'per_visit'
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    duration: {
        estimated: {
            type: Number,
            required: [true, 'Please provide estimated duration'],
            min: [0.5, 'Duration must be at least 0.5 hours']
        },
        unit: {
            type: String,
            enum: ['hours', 'days'],
            default: 'hours'
        }
    },
    images: [{
        url: String,
        caption: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    features: [String],
    requirements: [String],
    availability: {
        days: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        timeSlots: [{
            start: String,
            end: String
        }]
    },
    serviceArea: {
        type: String,
        default: 'As per provider service area'
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
        totalBookings: {
            type: Number,
            default: 0
        },
        completedBookings: {
            type: Number,
            default: 0
        },
        activeSubscriptions: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'suspended'],
        default: 'active'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [String],
    metadata: {
        seoTitle: String,
        seoDescription: String,
        keywords: [String]
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
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
serviceSchema.index({ isActive: 1, isFeatured: -1 });
serviceSchema.index({ tags: 1 });

// Text index for search
serviceSchema.index({
    name: 'text',
    description: 'text',
    tags: 'text'
});

// Virtual for reviews
serviceSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'serviceId'
});

// Virtual for provider info
serviceSchema.virtual('provider', {
    ref: 'ServiceProvider',
    localField: 'providerId',
    foreignField: '_id',
    justOne: true
});

// Virtual for booking count
serviceSchema.virtual('bookingCount').get(function() {
    return this.statistics.totalBookings;
});

// Pre-save middleware
serviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to update rating
serviceSchema.methods.updateRating = function(newRating) {
    const totalRating = (this.rating.average * this.rating.count) + newRating;
    this.rating.count += 1;
    this.rating.average = parseFloat((totalRating / this.rating.count).toFixed(2));
};

// Method to increment views
serviceSchema.methods.incrementViews = function() {
    this.statistics.views += 1;
};

// Method to record booking
serviceSchema.methods.recordBooking = function() {
    this.statistics.totalBookings += 1;
};

// Static method to get popular services
serviceSchema.statics.getPopularServices = function(limit = 10) {
    return this.find({ isActive: true, status: 'active' })
        .sort({ 'statistics.totalBookings': -1, 'rating.average': -1 })
        .limit(limit)
        .populate('providerId', 'businessName rating');
};

// Static method to search services
serviceSchema.statics.searchServices = function(query, filters = {}) {
    const searchQuery = {
        isActive: true,
        status: 'active',
        $text: { $search: query }
    };

    if (filters.category) {
        searchQuery.category = filters.category;
    }

    if (filters.minPrice || filters.maxPrice) {
        searchQuery['pricing.basePrice'] = {};
        if (filters.minPrice) searchQuery['pricing.basePrice'].$gte = filters.minPrice;
        if (filters.maxPrice) searchQuery['pricing.basePrice'].$lte = filters.maxPrice;
    }

    if (filters.minRating) {
        searchQuery['rating.average'] = { $gte: filters.minRating };
    }

    return this.find(searchQuery)
        .select({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .populate('providerId', 'businessName rating serviceArea');
};

module.exports = mongoose.model('Service', serviceSchema);