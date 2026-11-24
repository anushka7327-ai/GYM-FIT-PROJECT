const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration in months is required'],
      min: [1, 'Duration must be at least 1 month'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    features: [
      {
        type: String,
      },
    ],
    tag: {
      type: String,
      default: '', // e.g. "Most Popular", "Best Value", "Starter"
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Plan', planSchema);
