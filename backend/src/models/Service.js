const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: String,
      required: [true, 'التصنيف مطلوب'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'عنوان الخدمة مطلوب'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'الولاية مطلوبة'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'العنوان مطلوب'],
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: 0,
    },
    priceUnit: {
      type: String,
      default: 'د.ج',
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    badgeLabel: {
      type: String,
      default: 'عرض',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    accentColor: {
      type: String,
      default: '#2563EB',
    },
    imageAsset: {
      type: String,
      default: '',
    },
    images: [{ type: String }],
    features: [{ type: String }],
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

serviceSchema.virtual('discountedPrice').get(function () {
  if (this.discountPercent > 0) {
    return Math.round(this.price * (1 - this.discountPercent / 100));
  }
  return this.price;
});

module.exports = mongoose.model('Service', serviceSchema);

