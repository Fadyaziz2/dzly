const express = require('express');
const router = express.Router();
const { toggleFavorite, getMyFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.post('/toggle/:serviceId', protect, toggleFavorite);
router.get('/', protect, getMyFavorites);

module.exports = router;

