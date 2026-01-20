const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email');

const otpValidation = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be 6 digits');

const registrationValidation = [
  emailValidation,
  body('userData.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('userData.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('userData.role')
    .isIn(['customer', 'provider'])
    .withMessage('Role must be either customer or provider')
];

// ------------------- PUBLIC ROUTES -------------------

// Send login OTP
router.post('/send-login-otp', [emailValidation, validate], authController.sendLoginOTP);

// Verify login OTP
router.post('/verify-login-otp', [emailValidation, otpValidation, validate], authController.verifyLoginOTP);

// Send registration OTP
router.post('/send-registration-otp', [emailValidation, validate], authController.sendRegistrationOTP);

// Verify registration OTP
router.post(
  '/verify-registration-otp',
  [emailValidation, otpValidation, ...registrationValidation, validate],
  authController.verifyRegistrationOTP
);

// Resend OTP
router.post(
  '/resend-otp',
  [
    emailValidation,
    body('type')
      .isIn(['login', 'registration', 'password-reset'])
      .withMessage('Invalid OTP type'),
    validate
  ],
  authController.resendOTP
);

// Forgot password (send password reset OTP)
router.post('/forgot-password', [emailValidation, validate], authController.forgotPassword);

// ------------------- PROTECTED ROUTES -------------------

// Get current user
router.get('/me', protect, authController.getCurrentUser);

// Logout
router.post('/logout', protect, authController.logout);

// Update password
router.put(
  '/update-password',
  [
    protect,
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
    validate
  ],
  authController.updatePassword
);

// Reset password via OTP
router.put('/reset-password', authController.resetPassword);

module.exports = router;
