const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
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
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card',
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'pending', 'refunded'],
      default: 'completed',
    },
    paymentId: {
      type: String,
      default: () => 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if currently expired
subscriptionSchema.virtual('isCurrentlyExpired').get(function () {
  return new Date() > this.endDate;
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
