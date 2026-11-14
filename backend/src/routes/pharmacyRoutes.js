const express = require('express');
const router = express.Router();
const {
  searchMedicines,
  getNearbyPharmacies,
  getMedicines,
  addMedicines,
  updateMedicine,
  deleteMedicine,
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/pharmacyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public search and discovery
router.get('/search', searchMedicines);
router.get('/nearby', getNearbyPharmacies);
router.get('/medicines', getMedicines);

// Inventory management (Pharmacy Provider or Admin)
router.post('/medicines', protect, authorize('provider', 'admin'), addMedicines);
router.put('/medicines/:id', protect, authorize('provider', 'admin'), updateMedicine);
router.delete('/medicines/:id', protect, authorize('provider', 'admin'), deleteMedicine);

// Orders
router.post('/orders', protect, authorize('client', 'admin'), createOrder);
router.get('/orders', protect, getOrders);
router.route('/orders/:id/status')
  .put(protect, authorize('provider', 'admin'), updateOrderStatus)
  .patch(protect, authorize('provider', 'admin'), updateOrderStatus);

module.exports = router;
