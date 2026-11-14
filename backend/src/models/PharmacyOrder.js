const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const pharmacyOrderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pharmacyName: {
      type: String,
      required: true,
    },
    pharmacyPhone: {
      type: String,
      default: '',
    },
    pharmacyAddress: {
      type: String,
      default: '',
    },
    items: [orderItemSchema],
    prescriptionImage: {
      type: String,
      default: '',
    },
    deliveryType: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup',
    },
    deliveryAddress: {
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
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    platformCommissionRate: {
      type: Number,
      default: 5, // 5% for pharmacy transactions
    },
    platformCommission: {
      type: Number,
      default: 0,
    },
    pharmacyNetEarnings: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'preparing',
        'ready_for_pickup',
        'out_for_delivery',
        'completed',
        'rejected',
      ],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate commissions
pharmacyOrderSchema.pre('save', function (next) {
  if (this.totalPrice !== undefined) {
    const rate = this.platformCommissionRate || 5;
    this.platformCommission = Math.round((this.totalPrice * rate) / 100);
    this.pharmacyNetEarnings = this.totalPrice - this.platformCommission;
  }
  next();
});

module.exports = mongoose.model('PharmacyOrder', pharmacyOrderSchema);
