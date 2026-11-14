const Settings = require('../models/Settings');

// @desc    Get global platform settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await Settings.create({
        key: 'global_settings',
        monthlySubscriptionPrice: 5000,
        annualSubscriptionPrice: 50000,
        platformCommissionPercent: 10,
        supportPhone: '0661234567',
        supportEmail: 'support@dzly.com',
        baridimobAccount: '007999990022334455',
        ccpAccount: '1234567 clé 89',
        announcementText: 'أعلن عن مشروعك معنا ليصل إعلانك إلى آلاف المستخدمين',
      });
    }

    res.json({
      success: true,
      settings,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new Settings({ key: 'global_settings' });
    }

    const {
      monthlySubscriptionPrice,
      annualSubscriptionPrice,
      platformCommissionPercent,
      supportPhone,
      supportEmail,
      baridimobAccount,
      ccpAccount,
      announcementText,
      termsAndConditions,
      headerBannerUrl,
      homeAdBannerUrl,
      homeAdBannerTitle,
      homeAdBannerSubtitle,
      homeAdBannerActionText,
      homeAdBannerActionUrl,
    } = req.body;

    if (monthlySubscriptionPrice !== undefined) settings.monthlySubscriptionPrice = Number(monthlySubscriptionPrice);
    if (annualSubscriptionPrice !== undefined) settings.annualSubscriptionPrice = Number(annualSubscriptionPrice);
    if (platformCommissionPercent !== undefined) settings.platformCommissionPercent = Number(platformCommissionPercent);
    if (supportPhone !== undefined) settings.supportPhone = supportPhone;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (baridimobAccount !== undefined) settings.baridimobAccount = baridimobAccount;
    if (ccpAccount !== undefined) settings.ccpAccount = ccpAccount;
    if (announcementText !== undefined) settings.announcementText = announcementText;
    if (termsAndConditions !== undefined) settings.termsAndConditions = termsAndConditions;
    if (headerBannerUrl !== undefined) settings.headerBannerUrl = headerBannerUrl;
    if (homeAdBannerUrl !== undefined) settings.homeAdBannerUrl = homeAdBannerUrl;
    if (homeAdBannerTitle !== undefined) settings.homeAdBannerTitle = homeAdBannerTitle;
    if (homeAdBannerSubtitle !== undefined) settings.homeAdBannerSubtitle = homeAdBannerSubtitle;
    if (homeAdBannerActionText !== undefined) settings.homeAdBannerActionText = homeAdBannerActionText;
    if (homeAdBannerActionUrl !== undefined) settings.homeAdBannerActionUrl = homeAdBannerActionUrl;

    await settings.save();

    res.json({
      success: true,
      message: 'تم حفظ وتحديث إعدادات المنصة بنجاح',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

