const Subscription = require('../models/Subscription');

// Ensure provider has active subscription
const checkActiveSubscription = async (req, res, next) => {
  // Admins bypass subscription checks
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Only apply to providers
  if (req.user && req.user.role === 'provider') {
    try {
      const activeSub = await Subscription.findOne({
        provider: req.user._id,
        status: 'active',
        endDate: { $gt: new Date() },
      }).sort({ endDate: -1 });

      if (!activeSub) {
        return res.status(403).json({
          success: false,
          subscriptionExpired: true,
          message: 'انتهى اشتراك حسابك أو لم يتم تفعيله بعد. يرجى تجديد اشتراكك لتتمكن من استقبال الحجوزات وإدارة الخدمات.',
        });
      }

      req.subscription = activeSub;
      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'خطأ أثناء التحقق من صلاحية الاشتراك',
        error: error.message,
      });
    }
  }

  next();
};

module.exports = { checkActiveSubscription };

