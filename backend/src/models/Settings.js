const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true,
    },
    monthlySubscriptionPrice: {
      type: Number,
      default: 5000,
    },
    annualSubscriptionPrice: {
      type: Number,
      default: 50000,
    },
    platformCommissionPercent: {
      type: Number,
      default: 10,
    },
    supportPhone: {
      type: String,
      default: '0661234567',
    },
    supportEmail: {
      type: String,
      default: 'support@dzly.com',
    },
    baridimobAccount: {
      type: String,
      default: '007999990022334455',
    },
    ccpAccount: {
      type: String,
      default: '1234567 clé 89',
    },
    announcementText: {
      type: String,
      default: 'أعلن عن مشروعك معنا ليصل إعلانك إلى آلاف المستخدمين',
    },
    termsAndConditions: {
      type: String,
      default: 'شروط وأحكام منصة احجزلي Dz المعمول بها داخل القطر الجزائري.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);

