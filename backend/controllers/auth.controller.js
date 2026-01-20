const User = require('../models/User');
const Customer = require('../models/Customer');
const ServiceProvider = require('../models/ServiceProvider');
const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/password.util');
const { sendOTPEmail } = require('../utils/email.util');
const logger = require('../utils/logger.util');

// ------------------- LOGIN / OTP -------------------
exports.sendLoginOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isActive: true });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });

    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    await OTP.createOTP(email, otp, 'login', expiryMinutes);
    await sendOTPEmail(email, otp, 'login', user.fullName);

    logger.info(`Login OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent', expiresIn: expiryMinutes * 60 });
  } catch (err) {
    logger.error('sendLoginOTP error:', err);
    next(err);
  }
};

exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findValidOTP(email, 'login');
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const result = otpRecord.verifyOTP(otp);
    await otpRecord.save();
    if (!result.success) return res.status(400).json({ success: false, message: result.message });

    const user = await User.findOne({ email });
    const token = user.generateAuthToken();
    res.json({ success: true, message: 'Login successful', token, user: user.getPublicProfile() });
  } catch (err) {
    logger.error('verifyLoginOTP error:', err);
    next(err);
  }
};

// ------------------- REGISTRATION -------------------
exports.sendRegistrationOTP = async (req, res, next) => {
  try {
    const { email, fullName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    await OTP.createOTP(email, otp, 'registration', expiryMinutes);
    await sendOTPEmail(email, otp, 'registration', fullName);

    res.json({ success: true, message: 'OTP sent', expiresIn: expiryMinutes * 60 });
  } catch (err) {
    logger.error('sendRegistrationOTP error:', err);
    next(err);
  }
};

exports.verifyRegistrationOTP = async (req, res, next) => {
  try {
    const { email, otp, userData } = req.body;
    const { fullName, phone, role } = userData;
    if (!fullName || !phone || !role) return res.status(400).json({ success: false, message: 'Missing required fields' });

    const otpRecord = await OTP.findValidOTP(email, 'registration');
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const result = otpRecord.verifyOTP(otp);
    await otpRecord.save();
    if (!result.success) return res.status(400).json({ success: false, message: result.message });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const user = await User.create({ fullName, email, phone, role, isVerified: true, emailVerifiedAt: new Date() });
    if (role === 'customer') await Customer.create({ userId: user._id });
    if (role === 'provider') await ServiceProvider.create({ userId: user._id });

    res.status(201).json({ success: true, message: 'Registration successful', user: user.getPublicProfile() });
  } catch (err) {
    logger.error('verifyRegistrationOTP error:', err);
    next(err);
  }
};

// ------------------- OTP RESEND -------------------
exports.resendOTP = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    if (!['login', 'registration', 'password-reset'].includes(type)) return res.status(400).json({ success: false, message: 'Invalid OTP type' });

    if (type === 'login') {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    await OTP.createOTP(email, otp, type, expiryMinutes);
    const user = await User.findOne({ email });
    await sendOTPEmail(email, otp, type, user?.fullName || '');

    res.json({ success: true, message: 'OTP resent', expiresIn: expiryMinutes * 60 });
  } catch (err) {
    logger.error('resendOTP error:', err);
    next(err);
  }
};

// ------------------- PASSWORD -------------------
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
    await OTP.createOTP(email, otp, 'password-reset', expiryMinutes);
    if (user) await sendOTPEmail(email, otp, 'password-reset', user.fullName);
    res.json({ success: true, message: 'If email exists, OTP sent', expiresIn: expiryMinutes * 60 });
  } catch (err) {
    logger.error('forgotPassword error:', err);
    next(err);
  }
};

// ------------------- PROTECTED USER ROUTES -------------------
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let profile = null;
    if (user.role === 'customer') profile = await Customer.findOne({ userId: user._id });
    if (user.role === 'provider') profile = await ServiceProvider.findOne({ userId: user._id });

    res.json({ success: true, user: user.getPublicProfile(), profile });
  } catch (err) {
    logger.error('getCurrentUser error:', err);
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    logger.error('logout error:', err);
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    logger.error('updatePassword error:', err);
    next(err);
  }
};

// Reset password (via OTP)
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const otpRecord = await OTP.findValidOTP(email, 'password-reset');
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const result = otpRecord.verifyOTP(otp);
    await otpRecord.save();
    if (!result.success) return res.status(400).json({ success: false, message: result.message });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    logger.error('resetPassword error:', err);
    next(err);
  }
};
