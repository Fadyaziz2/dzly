const Subscription = require('../models/Subscription');
const Settings = require('../models/Settings');
const User = require('../models/User');

// @desc    Get provider subscription status
// @route   GET /api/subscriptions/my-status
// @access  Private (Provider)
exports.getMySubscriptionStatus = async (req, res, next) => {
  try {
    const activeSub = await Subscription.findOne({
      provider: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() },
    }).sort({ endDate: -1 });

    const allSubs = await Subscription.find({ provider: req.user._id }).sort({ createdAt: -1 });

    let daysLeft = 0;
    if (activeSub) {
      const diffTime = new Date(activeSub.endDate) - new Date();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const settings = await Settings.findOne({ key: 'global_settings' });

    res.json({
      success: true,
      hasActiveSubscription: Boolean(activeSub),
      activeSubscription: activeSub,
      daysLeft,
      history: allSubs,
      pricing: {
        monthly: settings ? settings.monthlySubscriptionPrice : 5000,
        annual: settings ? settings.annualSubscriptionPrice : 50000,
        baridimob: settings ? settings.baridimobAccount : '007999990022334455',
        ccp: settings ? settings.ccpAccount : '1234567 clé 89',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request subscription renewal / submit receipt
// @route   POST /api/subscriptions/request-renewal
// @access  Private (Provider)
exports.requestRenewal = async (req, res, next) => {
  try {
    const { plan, paymentMethod, paymentReference, paymentReceiptUrl } = req.body;

    const settings = await Settings.findOne({ key: 'global_settings' });
    const isAnnual = plan === 'annual';
    const price = isAnnual
      ? (settings ? settings.annualSubscriptionPrice : 50000)
      : (settings ? settings.monthlySubscriptionPrice : 5000);

    const startDate = new Date();
    const endDate = new Date();
    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      provider: req.user._id,
      plan: plan || 'monthly',
      startDate,
      endDate,
      amountPaid: price,
      status: 'active', // Direct active for testing and production readiness, or pending if admin requires review
      paymentMethod: paymentMethod || 'baridimob',
      paymentReference: paymentReference || `REF-${Date.now().toString().slice(-6)}`,
      paymentReceiptUrl: paymentReceiptUrl || '',
      notes: 'تم تقديم وتفعيل طلب الاشتراك',
    });

    res.status(201).json({
      success: true,
      message: 'تم تسجيل وتفعيل اشتراكك بنجاح!',
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all subscriptions & provider statuses
// @route   GET /api/subscriptions/admin/all
// @access  Private (Admin)
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('provider', 'name phone email businessName city status')
      .sort({ createdAt: -1 });

    const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
    const activeCount = subscriptions.filter((s) => s.status === 'active' && new Date(s.endDate) > new Date()).length;

    res.json({
      success: true,
      count: subscriptions.length,
      metrics: {
        totalRevenue,
        activeCount,
      },
      subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: activate / grant subscription for provider
// @route   POST /api/subscriptions/admin/activate
// @access  Private (Admin)
exports.adminActivateSubscription = async (req, res, next) => {
  try {
    const { providerId, plan, durationDays, amountPaid, notes } = req.body;

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'مزود الخدمة غير موجود أو صاحب الحساب ليس مزوداً',
      });
    }

    const days = Number(durationDays) || (plan === 'annual' ? 365 : 30);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const subscription = await Subscription.create({
      provider: providerId,
      plan: plan || 'monthly',
      startDate,
      endDate,
      amountPaid: Number(amountPaid) || 0,
      status: 'active',
      paymentMethod: 'admin_grant',
      notes: notes || 'تم التفعيل يدوياً من لوحة الإدارة',
    });

    res.status(201).json({
      success: true,
      message: `تم تفعيل اشتراك المزود بنجاح لمدة ${days} يوماً`,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: cancel / expire subscription
// @route   PATCH /api/subscriptions/admin/:id/status
// @access  Private (Admin)
exports.updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'الاشتراك غير موجود',
      });
    }

    res.json({
      success: true,
      message: `تم تحديث حالة الاشتراك إلى ${status}`,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

