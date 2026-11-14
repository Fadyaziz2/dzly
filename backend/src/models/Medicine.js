const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'اسم الدواء مطلوب'],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'مسكنات وخافضات حرارة',
        'مضادات حيوية',
        'فيتامينات ومكملات',
        'فيتامينات ومكملات غذائية',
        'أمراض مزمنة',
        'أطفال ورضع',
        'عناية جلدية ومستحضرات',
        'أخرى',
      ],
      default: 'مسكنات وخافضات حرارة',
      index: true,
    },
    dosage: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'سعر الدواء مطلوب'],
      min: [0, 'السعر يجب أن يكون 0 أو أكثر'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'المخزون لا يمكن أن يكون سالباً'],
      default: 0,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    barcode: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for smart search across name and genericName
medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
