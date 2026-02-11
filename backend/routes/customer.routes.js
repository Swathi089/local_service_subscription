const express = require('express');
const { body, query } = require('express-validator');
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');
const { isCustomer } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Auth + role
router.use(protect, isCustomer);

// Dashboard
router.get('/dashboard', customerController.getDashboard);

// Services
router.get('/services', validate, customerController.getAllServices);
router.get('/services/:id', customerController.getServiceDetails);

// Subscriptions
router.post('/subscriptions', validate, customerController.createSubscription);
router.get('/subscriptions', customerController.getSubscriptions);
router.get('/subscriptions/:id', customerController.getSubscriptionDetails);

// Profile
router.put('/profile', validate, customerController.updateProfile);
router.get('/profile', customerController.getProfile);

// Reviews
router.post('/reviews', validate, customerController.submitReview);
router.put('/reviews/:id', validate, customerController.updateReview);
router.delete('/reviews/:id', customerController.deleteReview);

// Favorite Providers
router.post('/favorite-providers/:providerId', customerController.addFavoriteProvider);
router.delete('/favorite-providers/:providerId', customerController.removeFavoriteProvider);
router.get('/favorite-providers', customerController.getFavoriteProviders);

// Saved Services
router.post('/saved-services/:serviceId', customerController.saveService);
router.delete('/saved-services/:serviceId', customerController.unsaveService);
router.get('/saved-services', customerController.getSavedServices);

// Payment Methods
router.get('/payment-methods', customerController.getPaymentMethods);
router.post('/payment-methods', validate, customerController.addPaymentMethod);
router.delete('/payment-methods/:id', customerController.deletePaymentMethod);
router.put('/payment-methods/:id/default', customerController.setDefaultPaymentMethod);

module.exports = router;
