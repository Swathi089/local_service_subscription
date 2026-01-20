const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide full name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
    },
    role: {
        type: String,
        enum: {
            values: ['customer', 'provider', 'admin'],
            message: 'Role must be either customer, provider, or admin'
        },
        required: [true, 'Please specify user role']
    },
    password: {
        type: String,
        select: false,
        minlength: [8, 'Password must be at least 8 characters']
    },
    avatar: {
        type: String,
        default: null
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'USA'
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        promotionalEmails: {
            type: Boolean,
            default: true
        }
    },
    refreshToken: {
        type: String,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
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
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
});

// Update updatedAt on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { 
            userId: this._id, 
            email: this.email, 
            role: this.role 
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpire }
    );
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        name: this.fullName,
        email: this.email,
        phone: this.phone,
        role: this.role,
        avatar: this.avatar,
        isVerified: this.isVerified
    };
};

// Virtual for customer reference
userSchema.virtual('customerProfile', {
    ref: 'Customer',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

// Virtual for provider reference
userSchema.virtual('providerProfile', {
    ref: 'ServiceProvider',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

module.exports = mongoose.model('User', userSchema);