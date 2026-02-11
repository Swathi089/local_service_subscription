// Payment configuration for Stripe or other payment gateways
const config = require('./env');

const paymentConfig = {
    // Stripe configuration
    stripe: {
        secretKey: config.stripeSecretKey,
        publishableKey: config.stripePublishableKey,
        currency: 'usd',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    
    // Supported payment methods
    supportedMethods: ['card', 'bank_transfer', 'paypal'],
    
    // Commission rates
    commission: {
        platform: 0.10, // 10% platform fee
        stripe: 0.029, // 2.9% + $0.30 per transaction
        fixedFee: 0.30
    },
    
    // Subscription plans
    subscriptionPlans: {
        basic: {
            id: 'basic',
            name: 'Basic Plan',
            price: 29.99,
            interval: 'month',
            services: 1,
            features: ['Monthly visits', 'Email support']
        },
        premium: {
            id: 'premium',
            name: 'Premium Plan',
            price: 79.99,
            interval: 'month',
            services: 3,
            features: ['Weekly visits', 'Priority support', 'Flexible scheduling']
        },
        enterprise: {
            id: 'enterprise',
            name: 'Enterprise Plan',
            price: 'custom',
            interval: 'month',
            services: 'unlimited',
            features: ['Custom scheduling', '24/7 support', 'Dedicated manager']
        }
    },
    
    // Payout settings for providers
    payout: {
        minimumAmount: 50.00, // Minimum $50 for payout
        schedule: 'weekly', // weekly, bi-weekly, monthly
        methods: ['bank_transfer', 'paypal', 'check'],
        processingTime: '3-5 business days'
    },
    
    // Refund policy
    refund: {
        allowedWithinDays: 7,
        reasons: [
            'customer_request',
            'service_not_provided',
            'quality_issue',
            'duplicate_charge',
            'other'
        ]
    }
};

module.exports = paymentConfig;