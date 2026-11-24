const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const WorkoutLog = require('../models/WorkoutLog');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Routine = require('../models/Routine');

// @desc    Revenue report per plan using MongoDB Aggregation
// @route   GET /api/analytics/revenue
// @access  Private (Admin only)
exports.getRevenueReport = async (req, res) => {
  try {
    // 1. Aggregation pipeline: Revenue and subscriptions grouped per plan
    const planRevenueAggregation = await Subscription.aggregate([
      {
        $group: {
          _id: '$plan',
          totalRevenue: { $sum: '$amountPaid' },
          totalSubscriptions: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          expiredCount: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] },
          },
          avgAmountPaid: { $avg: '$amountPaid' },
          firstSale: { $min: '$createdAt' },
          lastSale: { $max: '$createdAt' },
        },
      },
      {
        $lookup: {
          from: 'plans',
          localField: '_id',
          foreignField: '_id',
          as: 'planDetails',
        },
      },
      {
        $unwind: {
          path: '$planDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          planId: '$_id',
          planName: { $ifNull: ['$planDetails.name', 'Custom/Archived Plan'] },
          planPrice: '$planDetails.price',
          durationMonths: '$planDetails.durationMonths',
          totalRevenue: 1,
          totalSubscriptions: 1,
          activeCount: 1,
          expiredCount: 1,
          avgAmountPaid: { $round: ['$avgAmountPaid', 2] },
          firstSale: 1,
          lastSale: 1,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    // 2. Monthly revenue aggregation trend
    const monthlyRevenueTrend = await Subscription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          monthlyRevenue: { $sum: '$amountPaid' },
          subscriptionsCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          revenue: '$monthlyRevenue',
          count: '$subscriptionsCount',
        },
      },
    ]);

    // 3. Overall grand totals
    const grandTotals = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          grandTotalRevenue: { $sum: '$amountPaid' },
          grandTotalSubscriptions: { $sum: 1 },
          avgRevenuePerSubscription: { $avg: '$amountPaid' },
        },
      },
    ]);

    const totalRev = grandTotals[0]?.grandTotalRevenue || 0;
    const totalSubs = grandTotals[0]?.grandTotalSubscriptions || 0;
    const avgRev = grandTotals[0]?.avgRevenuePerSubscription ? Math.round(grandTotals[0].avgRevenuePerSubscription) : 0;

    res.json({
      success: true,
      summary: {
        totalRevenue: totalRev,
        totalSubscriptions: totalSubs,
        averageRevenuePerSubscription: avgRev,
      },
      perPlanRevenue: planRevenueAggregation,
      monthlyTrend: monthlyRevenueTrend,
    });
  } catch (error) {
    console.error('Revenue aggregation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Progress report per member using MongoDB Aggregation
// @route   GET /api/analytics/progress/:memberId?
// @access  Private (Member self, or Trainer/Admin for any member)
exports.getMemberProgressReport = async (req, res) => {
  try {
    let targetMemberId = req.params.memberId;

    // If no memberId provided or member role, default to current user
    if (!targetMemberId || req.user.role === 'member') {
      targetMemberId = req.user._id.toString();
    }

    const memberObjectId = new mongoose.Types.ObjectId(targetMemberId);
    const member = await User.findById(memberObjectId).select('name email phone assignedTrainer avatar');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // 1. Overall workout stats aggregation
    const workoutSummary = await WorkoutLog.aggregate([
      { $match: { member: memberObjectId } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalMinutes: { $sum: '$durationMinutes' },
          totalCalories: { $sum: '$caloriesBurned' },
          avgMoodRating: { $avg: '$moodRating' },
          firstWorkout: { $min: '$date' },
          lastWorkout: { $max: '$date' },
        },
      },
    ]);

    // 2. Measurements timeline aggregation (filter only logs where measurements exist)
    const measurementTimeline = await WorkoutLog.aggregate([
      {
        $match: {
          member: memberObjectId,
          $or: [
            { 'measurements.weightKg': { $ne: null } },
            { 'measurements.waistCm': { $ne: null } },
            { 'measurements.chestCm': { $ne: null } },
            { 'measurements.bodyFatPercentage': { $ne: null } },
          ],
        },
      },
      {
        $project: {
          date: 1,
          workoutTitle: 1,
          weightKg: '$measurements.weightKg',
          bodyFatPercentage: '$measurements.bodyFatPercentage',
          chestCm: '$measurements.chestCm',
          waistCm: '$measurements.waistCm',
          hipsCm: '$measurements.hipsCm',
          armsCm: '$measurements.armsCm',
          thighsCm: '$measurements.thighsCm',
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Calculate progression metrics (start vs current)
    let progressionSummary = {
      weightChangeKg: 0,
      bodyFatChange: 0,
      waistChangeCm: 0,
      chestChangeCm: 0,
      armsChangeCm: 0,
      currentWeightKg: null,
      startingWeightKg: null,
    };

    if (measurementTimeline.length > 0) {
      const validWeights = measurementTimeline.filter((m) => m.weightKg !== null && m.weightKg !== undefined);
      if (validWeights.length > 0) {
        const start = validWeights[0].weightKg;
        const current = validWeights[validWeights.length - 1].weightKg;
        progressionSummary.startingWeightKg = start;
        progressionSummary.currentWeightKg = current;
        progressionSummary.weightChangeKg = +(current - start).toFixed(1);
      }

      const validWaist = measurementTimeline.filter((m) => m.waistCm);
      if (validWaist.length > 0) {
        const start = validWaist[0].waistCm;
        const current = validWaist[validWaist.length - 1].waistCm;
        progressionSummary.waistChangeCm = +(current - start).toFixed(1);
      }

      const validBodyFat = measurementTimeline.filter((m) => m.bodyFatPercentage);
      if (validBodyFat.length > 0) {
        const start = validBodyFat[0].bodyFatPercentage;
        const current = validBodyFat[validBodyFat.length - 1].bodyFatPercentage;
        progressionSummary.bodyFatChange = +(current - start).toFixed(1);
      }
    }

    // 3. Exercise frequency & consistency aggregation
    const exerciseFrequency = await WorkoutLog.aggregate([
      { $match: { member: memberObjectId } },
      { $unwind: '$exercisesCompleted' },
      {
        $group: {
          _id: '$exercisesCompleted.exerciseName',
          timesPerformed: { $sum: 1 },
          totalSets: { $sum: '$exercisesCompleted.setsCompleted' },
          maxWeight: { $max: '$exercisesCompleted.weightKg' },
        },
      },
      { $sort: { timesPerformed: -1 } },
      { $limit: 8 },
    ]);

    // 4. Active routine and subscription status
    const activeSubscription = await Subscription.findOne({
      user: memberObjectId,
      status: 'active',
      endDate: { $gt: new Date() },
    }).populate('plan', 'name durationMonths price');

    const activeRoutine = await Routine.findOne({
      member: memberObjectId,
      status: 'active',
    }).populate('trainer', 'name specialization');

    res.json({
      success: true,
      member,
      summary: workoutSummary[0] || {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0,
        avgMoodRating: 0,
      },
      progressionSummary,
      measurementTimeline,
      exerciseFrequency,
      activeSubscription,
      activeRoutine,
    });
  } catch (error) {
    console.error('Member progress aggregation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dashboard overview metrics for Admin, Trainer, Member
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const now = new Date();

    if (role === 'admin') {
      const [
        totalMembers,
        totalTrainers,
        totalPlans,
        activeSubscriptions,
        expiringSoonSubscriptions,
        revenueAgg,
      ] = await Promise.all([
        User.countDocuments({ role: 'member', isActive: true }),
        User.countDocuments({ role: 'trainer', isActive: true }),
        Plan.countDocuments(),
        Subscription.countDocuments({ status: 'active', endDate: { $gt: now } }),
        Subscription.countDocuments({
          status: 'active',
          endDate: {
            $gte: now,
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
        }),
        Subscription.aggregate([
          { $group: { _id: null, total: { $sum: '$amountPaid' } } },
        ]),
      ]);

      return res.json({
        success: true,
        stats: {
          totalMembers,
          totalTrainers,
          totalPlans,
          activeSubscriptions,
          expiringSoonSubscriptions,
          totalRevenue: revenueAgg[0]?.total || 0,
        },
      });
    }

    if (role === 'trainer') {
      const [assignedMembersCount, routinesCount, activeRoutinesCount] = await Promise.all([
        User.countDocuments({ assignedTrainer: req.user._id, role: 'member' }),
        Routine.countDocuments({ trainer: req.user._id }),
        Routine.countDocuments({ trainer: req.user._id, status: 'active' }),
      ]);

      return res.json({
        success: true,
        stats: {
          assignedMembersCount,
          routinesCount,
          activeRoutinesCount,
        },
      });
    }

    // Member dashboard stats
    const activeSub = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gt: now },
    }).populate('plan');

    const totalLogs = await WorkoutLog.countDocuments({ member: req.user._id });
    const assignedRoutine = await Routine.findOne({ member: req.user._id, status: 'active' }).populate('trainer', 'name');

    let daysLeft = 0;
    if (activeSub) {
      daysLeft = Math.max(0, Math.ceil((new Date(activeSub.endDate) - now) / (1000 * 60 * 60 * 24)));
    }

    return res.json({
      success: true,
      stats: {
        hasActiveSubscription: !!activeSub,
        activePlanName: activeSub?.plan?.name || 'No active plan',
        daysLeft,
        subscriptionEndDate: activeSub?.endDate || null,
        totalWorkoutsLogged: totalLogs,
        hasAssignedRoutine: !!assignedRoutine,
        routineTitle: assignedRoutine?.title || 'None',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
