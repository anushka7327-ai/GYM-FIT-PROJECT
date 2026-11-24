const WorkoutLog = require('../models/WorkoutLog');
const Routine = require('../models/Routine');

// @desc    Log daily workout and body measurements
// @route   POST /api/workout-logs
// @access  Private (Member)
exports.createWorkoutLog = async (req, res) => {
  try {
    const {
      routineId,
      date,
      workoutTitle,
      durationMinutes,
      exercisesCompleted,
      measurements,
      caloriesBurned,
      moodRating,
      notes,
    } = req.body;

    const workoutLog = await WorkoutLog.create({
      member: req.user._id,
      routine: routineId || null,
      date: date || new Date(),
      workoutTitle: workoutTitle || 'Daily Workout',
      durationMinutes: durationMinutes || 45,
      exercisesCompleted: exercisesCompleted || [],
      measurements: measurements || {},
      caloriesBurned: caloriesBurned || 0,
      moodRating: moodRating || 4,
      notes: notes || '',
    });

    const populated = await WorkoutLog.findById(workoutLog._id)
      .populate('routine', 'title goal')
      .populate('member', 'name email');

    res.status(201).json({
      success: true,
      message: 'Workout and measurements logged successfully',
      data: populated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in member's workout logs
// @route   GET /api/workout-logs/my
// @access  Private (Member)
exports.getMyWorkoutLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    const query = { member: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await WorkoutLog.find(query)
      .populate('routine', 'title goal')
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workout logs of a member (Trainer or Admin)
// @route   GET /api/workout-logs/member/:memberId
// @access  Private (Trainer or Admin)
exports.getMemberWorkoutLogs = async (req, res) => {
  try {
    const { memberId } = req.params;
    const logs = await WorkoutLog.find({ member: memberId })
      .populate('routine', 'title goal')
      .sort({ date: -1 });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single workout log by ID
// @route   GET /api/workout-logs/:id
// @access  Private
exports.getWorkoutLogById = async (req, res) => {
  try {
    const log = await WorkoutLog.findById(req.params.id)
      .populate('member', 'name email phone avatar')
      .populate('routine', 'title goal');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Workout log not found' });
    }

    // Authorization
    const isOwner = log.member._id.toString() === req.user._id.toString();
    const isTrainerOrAdmin = req.user.role === 'trainer' || req.user.role === 'admin';
    if (!isOwner && !isTrainerOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this log' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update workout log
// @route   PUT /api/workout-logs/:id
// @access  Private (Member owner)
exports.updateWorkoutLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Workout log not found' });
    }

    if (log.member.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this log' });
    }

    const {
      workoutTitle,
      date,
      durationMinutes,
      exercisesCompleted,
      measurements,
      caloriesBurned,
      moodRating,
      notes,
    } = req.body;

    if (workoutTitle !== undefined) log.workoutTitle = workoutTitle;
    if (date !== undefined) log.date = date;
    if (durationMinutes !== undefined) log.durationMinutes = durationMinutes;
    if (exercisesCompleted !== undefined) log.exercisesCompleted = exercisesCompleted;
    if (measurements !== undefined) log.measurements = { ...log.measurements.toObject(), ...measurements };
    if (caloriesBurned !== undefined) log.caloriesBurned = caloriesBurned;
    if (moodRating !== undefined) log.moodRating = moodRating;
    if (notes !== undefined) log.notes = notes;

    await log.save();
    res.json({ success: true, message: 'Workout log updated successfully', data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete workout log
// @route   DELETE /api/workout-logs/:id
// @access  Private (Member owner or Admin)
exports.deleteWorkoutLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Workout log not found' });
    }

    if (log.member.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this log' });
    }

    await WorkoutLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Workout log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
