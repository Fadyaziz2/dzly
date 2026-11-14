const mongoose = require('mongoose');

const dynamicFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'date', 'time', 'file', 'multiselect'],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    defaultValue: { type: mongoose.Schema.Types.Mixed },
    helperText: { type: String, default: '' },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleEn: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#2563EB',
    },
    icon: {
      type: String,
      default: 'grid_view_rounded',
    },
    imageAsset: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    bookingFieldsSpecification: [dynamicFieldSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', categorySchema);

