const { sendEmail } = require('./email.util');
const logger = require('./logger.util');

// Send notification email
exports.sendNotificationEmail = async (user, subject, message) => {
    try {
        if (!user.preferences || !user.preferences.emailNotifications) {
            return { success: false, message: 'Email notifications disabled' };
        }

        const html = `
            
            
            
                
                    ${subject}
                    Hello ${user.fullName},
                    ${message}
                    
                    
                        This is an automated notification from LocalServe.
                        To manage your notification preferences, please visit your account settings.
                    
                
            
            
        `;

        return await sendEmail(user.email, subject, html);
    } catch (error) {
        logger.error('Send notification error:', error);
        throw error;
    }
};

// Send booking confirmation
exports.sendBookingConfirmation = async (user, booking) => {
    const subject = 'Booking Confirmation - LocalServe';
    const message = `Your booking for ${booking.serviceName} has been confirmed for ${booking.date}.`;
    return await exports.sendNotificationEmail(user, subject, message);
};

// Send payment receipt
exports.sendPaymentReceipt = async (user, payment) => {
    const subject = 'Payment Receipt - LocalServe';
    const message = `We have received your payment of $${payment.amount}. Transaction ID: ${payment.transactionId}`;
    return await exports.sendNotificationEmail(user, subject, message);
};

module.exports = exports;