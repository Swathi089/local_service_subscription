const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('./logger.util');

// Create transporter ✅ FIXED HERE
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.gmailUser,
        pass: config.gmailAppPassword
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        logger.error('Email configuration error:', error);
    } else {
        logger.info('✅ Email service ready');
    }
});

// Email templates
const getOTPEmailTemplate = (otp, type, userName) => {
    const titles = {
        login: 'Login Verification',
        registration: 'Welcome to LocalServe',
        'password-reset': 'Password Reset Request'
    };

    const messages = {
        login: 'Use the OTP below to login to your account',
        registration: `Welcome ${userName}! Use the OTP below to verify your email`,
        'password-reset': 'Use the OTP below to reset your password'
    };

    return `
        <html>
        <body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px">
            <div style="max-width:600px;margin:auto;background:white;padding:30px">
                <h2>🔐 LocalServe</h2>
                <h3>${titles[type]}</h3>

                <p>Hello${userName ? ' ' + userName : ''},</p>
                <p>${messages[type]}</p>

                <div style="font-size:32px;letter-spacing:6px;font-weight:bold;margin:20px 0">
                    ${otp}
                </div>

                <p>Valid for ${config.otpExpiryMinutes} minutes</p>

                <p style="color:red">
                    Never share this OTP with anyone.
                </p>

                <hr />
                <p style="font-size:12px;color:#666">
                    © ${new Date().getFullYear()} LocalServe
                </p>
            </div>
        </body>
        </html>
    `;
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, type, userName = '') => {
    const mailOptions = {
        from: `LocalServe <${config.gmailUser}>`,
        to: email,
        subject: `Your OTP for ${type}`,
        html: getOTPEmailTemplate(otp, type, userName)
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
};

// Send general email
exports.sendEmail = async (to, subject, html) => {
    const info = await transporter.sendMail({
        from: `LocalServe <${config.gmailUser}>`,
        to,
        subject,
        html
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
};
