const crypto = require('crypto');

// Generate OTP
exports.generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        otp += digits[bytes[i] % 10];
    }
    
    return otp;
};

// Get OTP expiry time
exports.getOTPExpiry = (minutes = 5) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};