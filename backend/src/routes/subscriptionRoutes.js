const express = require('express');
const router = express.Router();
const {
  getMySubscriptionStatus,
  requestRenewal,
  getAllSubscriptions,
  adminActivateSubscription,
  updateSubscriptionStatus,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Provider routes
router.get('/my-status', protect, authorize('provider'), getMySubscriptionStatus);
router.post('/request-renewal', protect, authorize('provider'), requestRenewal);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllSubscriptions);
router.post('/admin/activate', protect, authorize('admin'), adminActivateSubscription);
router.patch('/admin/:id/status', protect, authorize('admin'), updateSubscriptionStatus);

module.exports = router;

