const express = require('express');
const router = express.Router();
const { getProviderFinancials, getAdminAnalytics } = require('../controllers/financialController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/provider', protect, authorize('provider'), getProviderFinancials);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;

