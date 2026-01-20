const express = require('express');
const providerController = require('../controllers/provider.controller');
const { protect } = require('../middleware/auth.middleware');
const { isProvider } = require('../middleware/role.middleware');

const router = express.Router();

// Auth + role
router.use(protect, isProvider);

// Routes
router.get('/dashboard', providerController.getDashboard);
router.get('/profile', providerController.getProfile);
router.put('/profile', providerController.updateProfile);

module.exports = router;
