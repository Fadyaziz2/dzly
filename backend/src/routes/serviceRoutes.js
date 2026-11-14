const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  updateApprovalStatus,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { checkActiveSubscription } = require('../middleware/subscriptionGuard');

router.get('/', getAllServices);
router.get('/provider/my-services', protect, authorize('provider'), getMyServices);
router.get('/:id', getServiceById);

// Create service: provider must have active subscription
router.post('/', protect, authorize('provider', 'admin'), checkActiveSubscription, createService);
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

// Admin approval
router.patch('/:id/approval', protect, authorize('admin'), updateApprovalStatus);

module.exports = router;

