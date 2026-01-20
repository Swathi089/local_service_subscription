const { validationResult } = require('express-validator');
const logger = require('../utils/logger.util');

/**
 * Validate request using express-validator
 * Call this after validation rules in routes
 */
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Format errors for better readability
        const formattedErrors = errors.array().map(err => ({
            field: err.param || err.path,
            message: err.msg,
            value: err.value,
            location: err.location
        }));

        logger.warn('Validation failed:', { 
            url: req.originalUrl, 
            errors: formattedErrors 
        });

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }
    
    next();
};

/**
 * Email validation helper
 */
exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Phone validation helper
 * Supports international formats
 */
exports.validatePhone = (phone) => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it has at least 10 digits
    if (digitsOnly.length < 10) {
        return false;
    }
    
    // Check format with regex
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
};

/**
 * Password strength validation
 * Requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - Optional: At least 1 special character
 */
exports.validatePassword = (password, requireSpecialChar = false) => {
    if (password.length < 8) {
        return {
            valid: false,
            message: 'Password must be at least 8 characters long'
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one uppercase letter'
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one lowercase letter'
        };
    }

    if (!/\d/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one number'
        };
    }

    if (requireSpecialChar && !/[@$!%*?&#]/.test(password)) {
        return {
            valid: false,
            message: 'Password must contain at least one special character (@$!%*?&#)'
        };
    }

    return { valid: true };
};

/**
 * Validate MongoDB ObjectId
 */
exports.validateObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

/**
 * Validate URL
 */
exports.validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Validate date format (ISO 8601)
 */
exports.validateDate = (date) => {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate);
};

/**
 * Validate time format (HH:MM)
 */
exports.validateTime = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

/**
 * Validate credit card number (basic Luhn algorithm)
 */
exports.validateCreditCard = (cardNumber) => {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if it's all digits and has correct length
    if (!/^\d{13,19}$/.test(cleanNumber)) {
        return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
};

/**
 * Validate price/amount
 */
exports.validateAmount = (amount, min = 0, max = Infinity) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
        return {
            valid: false,
            message: 'Amount must be a valid number'
        };
    }
    
    if (numAmount < min) {
        return {
            valid: false,
            message: `Amount must be at least ${min}`
        };
    }
    
    if (numAmount > max) {
        return {
            valid: false,
            message: `Amount cannot exceed ${max}`
        };
    }
    
    return { valid: true };
};

/**
 * Validate ZIP/Postal code
 */
exports.validateZipCode = (zipCode, country = 'US') => {
    const zipPatterns = {
        'US': /^\d{5}(-\d{4})?$/,
        'CA': /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
        'UK': /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/,
        'IN': /^\d{6}$/
    };
    
    const pattern = zipPatterns[country] || zipPatterns['US'];
    return pattern.test(zipCode);
};

/**
 * Sanitize input to prevent XSS
 */
exports.sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate file upload
 */
exports.validateFile = (file, options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
        allowedExtensions = ['jpg', 'jpeg', 'png']
    } = options;
    
    if (!file) {
        return {
            valid: false,
            message: 'No file provided'
        };
    }
    
    // Check file size
    if (file.size > maxSize) {
        return {
            valid: false,
            message: `File size must not exceed ${maxSize / (1024 * 1024)}MB`
        };
    }
    
    // Check MIME type
    if (!allowedTypes.includes(file.mimetype)) {
        return {
            valid: false,
            message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
    }
    
    // Check file extension
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
        return {
            valid: false,
            message: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
        };
    }
    
    return { valid: true };
};

/**
 * Validate rating (1-5)
 */
exports.validateRating = (rating) => {
    const numRating = parseInt(rating);
    
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return {
            valid: false,
            message: 'Rating must be between 1 and 5'
        };
    }
    
    return { valid: true };
};

/**
 * Validate pagination parameters
 */
exports.validatePagination = (page, limit) => {
    const numPage = parseInt(page) || 1;
    const numLimit = parseInt(limit) || 10;
    
    if (numPage < 1) {
        return {
            valid: false,
            message: 'Page must be a positive integer'
        };
    }
    
    if (numLimit < 1 || numLimit > 100) {
        return {
            valid: false,
            message: 'Limit must be between 1 and 100'
        };
    }
    
    return {
        valid: true,
        page: numPage,
        limit: numLimit,
        skip: (numPage - 1) * numLimit
    };
};

/**
 * Validate array input
 */
exports.validateArray = (arr, options = {}) => {
    const {
        minLength = 0,
        maxLength = Infinity,
        uniqueItems = false
    } = options;
    
    if (!Array.isArray(arr)) {
        return {
            valid: false,
            message: 'Input must be an array'
        };
    }
    
    if (arr.length < minLength) {
        return {
            valid: false,
            message: `Array must contain at least ${minLength} items`
        };
    }
    
    if (arr.length > maxLength) {
        return {
            valid: false,
            message: `Array cannot contain more than ${maxLength} items`
        };
    }
    
    if (uniqueItems && new Set(arr).size !== arr.length) {
        return {
            valid: false,
            message: 'Array must contain unique items only'
        };
    }
    
    return { valid: true };
};

/**
 * Custom validator for service categories
 */
exports.validateServiceCategory = (category) => {
    const validCategories = [
        'cleaning',
        'plumbing',
        'electrical',
        'gardening',
        'carpentry',
        'painting'
    ];
    
    return validCategories.includes(category);
};

/**
 * Custom validator for subscription intervals
 */
exports.validateInterval = (interval) => {
    const validIntervals = [
        'weekly',
        'bi-weekly',
        'monthly',
        'quarterly',
        'yearly'
    ];
    
    return validIntervals.includes(interval);
};

module.exports = exports;