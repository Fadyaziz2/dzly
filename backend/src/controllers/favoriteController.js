const Favorite = require('../models/Favorite');
const Service = require('../models/Service');

// @desc    Toggle favorite service
// @route   POST /api/favorites/toggle/:serviceId
// @access  Private (Client)
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user._id;

    const existing = await Favorite.findOne({ user: userId, service: serviceId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({
        success: true,
        isFavorite: false,
        message: 'تم إزالة الخدمة من المفضلة',
      });
    } else {
      await Favorite.create({ user: userId, service: serviceId });
      return res.json({
        success: true,
        isFavorite: true,
        message: 'تم إضافة الخدمة إلى المفضلة',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get client favorites
// @route   GET /api/favorites
// @access  Private (Client)
exports.getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'service',
        populate: { path: 'provider', select: 'name businessName phone city' },
      })
      .sort({ createdAt: -1 });

    const services = favorites.map((f) => f.service).filter(Boolean);

    res.json({
      success: true,
      count: services.length,
      favoriteIds: services.map((s) => s._id.toString()),
      services,
    });
  } catch (error) {
    next(error);
  }
};

