const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getProviderBookings,
  updateBookingStatus,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Client routes
router.post('/', protect, authorize('client', 'admin'), createBooking);
router.get('/my-bookings', protect, authorize('client', 'admin'), getMyBookings);
router.put('/:id/cancel', protect, authorize('client', 'admin'), cancelBooking);

// Provider routes
router.get('/provider-bookings', protect, authorize('provider'), getProviderBookings);
router.patch('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllBookings);

module.exports = router;

