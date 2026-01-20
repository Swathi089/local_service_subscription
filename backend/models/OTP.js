const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['login', 'registration', 'password-reset'],
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 5
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 });

// Method to verify OTP
otpSchema.methods.verifyOTP = function(inputOTP) {
    // Check if OTP is expired
    if (new Date() > this.expiresAt) {
        return { success: false, message: 'OTP has expired' };
    }
    
    // Check if OTP is already used
    if (this.isUsed) {
        return { success: false, message: 'OTP has already been used' };
    }
    
    // Check max attempts
    if (this.attempts >= this.maxAttempts) {
        return { success: false, message: 'Maximum OTP attempts exceeded' };
    }
    
    // Increment attempts
    this.attempts += 1;
    
    // Verify OTP
    if (this.otp === inputOTP) {
        this.verified = true;
        this.isUsed = true;
        return { success: true, message: 'OTP verified successfully' };
    }
    
    return { success: false, message: 'Invalid OTP' };
};

// Static method to create OTP
otpSchema.statics.createOTP = async function(email, otp, type, expiryMinutes = 5) {
    // Delete any existing OTPs for this email and type
    await this.deleteMany({ email, type, verified: false });
    
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    return await this.create({
        email,
        otp,
        type,
        expiresAt
    });
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = async function(email, type) {
    return await this.findOne({
        email,
        type,
        verified: false,
        isUsed: false,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 }
    });
};

module.exports = mongoose.model('OTP', otpSchema);