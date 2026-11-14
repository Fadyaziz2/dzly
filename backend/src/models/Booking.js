const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
      index: true,
    },
    serviceTitle: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      default: '',
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerNotes: {
      type: String,
      default: '',
    },
    dynamicFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      default: 10,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    providerNet: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate commission and provider net
bookingSchema.pre('save', function (next) {
  if (this.isModified('totalPrice') || this.isModified('commissionRate')) {
    const rate = this.commissionRate || 10;
    this.commissionAmount = Math.round((this.totalPrice * rate) / 100);
    this.providerNet = this.totalPrice - this.commissionAmount;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

