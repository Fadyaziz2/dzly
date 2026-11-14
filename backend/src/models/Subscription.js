const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['monthly', 'annual'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'pending', 'cancelled'],
      default: 'active',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['baridimob', 'ccp', 'cash', 'admin_grant'],
      default: 'baridimob',
    },
    paymentReceiptUrl: {
      type: String,
      default: '',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if subscription is currently valid
subscriptionSchema.methods.isValid = function () {
  return this.status === 'active' && new Date(this.endDate) > new Date();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);

