const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');

// @desc    Subscribe to a membership plan (Buy Plan)
// @route   POST /api/subscriptions
// @access  Private (Member)
exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const memberId = req.user._id;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.active) {
      return res.status(404).json({ success: false, message: 'Membership plan not found or inactive' });
    }

    // Check if user currently has an active subscription
    const existingActive = await Subscription.findOne({
      user: memberId,
      status: 'active',
      endDate: { $gt: new Date() },
    }).sort({ endDate: -1 });

    let startDate = new Date();
    // If user already has an active subscription, new subscription begins after current one ends!
    if (existingActive) {
      startDate = new Date(existingActive.endDate);
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const subscription = await Subscription.create({
      user: memberId,
      plan: planId,
      startDate,
      endDate,
      amountPaid: plan.price,
      status: 'active',
      paymentMethod: paymentMethod || 'Credit Card',
      paymentStatus: 'completed',
    });

    const populated = await Subscription.findById(subscription._id)
      .populate('plan', 'name durationMonths price features')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Subscription purchased successfully!',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's subscriptions
// @route   GET /api/subscriptions/my
// @access  Private (Member)
exports.getMySubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('plan')
      .sort({ createdAt: -1 });

    // Mark any that are past endDate as expired in database if still marked active
    const now = new Date();
    for (let sub of subscriptions) {
      if (sub.status === 'active' && sub.endDate < now) {
        sub.status = 'expired';
        await sub.save();
      }
    }

    // Find current active subscription
    const activeSub = subscriptions.find(
      (s) => s.status === 'active' && new Date(s.endDate) > now
    );

    res.json({
      success: true,
      activeSubscription: activeSub || null,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all subscriptions (Admin)
// @route   GET /api/subscriptions
// @access  Private (Admin)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { status, planId, memberId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (planId) query.plan = planId;
    if (memberId) query.user = memberId;

    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email phone')
      .populate('plan', 'name price durationMonths')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get expiring memberships list using a date query (Admin)
// @route   GET /api/subscriptions/expiring
// @access  Private (Admin)
// Query params: days (e.g. 7, 14, 30, default 7), or startDate & endDate
exports.getExpiringSubscriptions = async (req, res) => {
  try {
    const { days = 7, mode = 'upcoming' } = req.query;
    const now = new Date();

    let dateQuery = {};

    if (mode === 'expired') {
      // Memberships that have already expired
      dateQuery = {
        endDate: { $lt: now },
      };
    } else {
      // Memberships expiring in the next X days
      const daysNum = parseInt(days, 10) || 7;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysNum);

      dateQuery = {
        endDate: {
          $gte: now,
          $lte: targetDate,
        },
        status: 'active',
      };
    }

    const expiringList = await Subscription.find(dateQuery)
      .populate('user', 'name email phone avatar assignedTrainer')
      .populate('plan', 'name price durationMonths')
      .sort({ endDate: 1 }); // Sort closest to expiration first

    // Add daysRemaining virtual field
    const enrichedList = expiringList.map((sub) => {
      const obj = sub.toObject();
      const diffTime = new Date(sub.endDate) - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      obj.daysRemaining = diffDays;
      return obj;
    });

    res.json({
      success: true,
      queryDays: days,
      mode,
      count: enrichedList.length,
      data: enrichedList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel or update subscription
// @route   PUT /api/subscriptions/:id/status
// @access  Private (Admin or Member owner)
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sub = await Subscription.findById(req.params.id);

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Only admin or owner can change status
    if (req.user.role !== 'admin' && sub.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this subscription' });
    }

    if (status) sub.status = status;
    await sub.save();

    res.json({ success: true, message: `Subscription marked as ${status}`, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
