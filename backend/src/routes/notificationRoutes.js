const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAllRead,
  markAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyNotifications);
router.put('/mark-read', protect, markAllRead);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;

