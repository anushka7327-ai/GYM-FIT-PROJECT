const Routine = require('../models/Routine');
const User = require('../models/User');

// @desc    Create and assign workout routine to member
// @route   POST /api/routines
// @access  Private (Trainer or Admin)
exports.createRoutine = async (req, res) => {
  try {
    const { memberId, title, description, goal, difficulty, days } = req.body;
    const trainerId = req.user._id;

    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
      return res.status(404).json({ success: false, message: 'Valid member not found' });
    }

    const routine = await Routine.create({
      trainer: trainerId,
      member: memberId,
      title,
      description: description || '',
      goal: goal || 'General Fitness',
      difficulty: difficulty || 'Intermediate',
      days: days || [],
      status: 'active',
    });

    const populated = await Routine.findById(routine._id)
      .populate('trainer', 'name email specialization')
      .populate('member', 'name email');

    res.status(201).json({
      success: true,
      message: 'Workout routine assigned successfully',
      data: populated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get routines assigned to logged-in member
// @route   GET /api/routines/my
// @access  Private (Member)
exports.getMyRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ member: req.user._id })
      .populate('trainer', 'name email specialization avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: routines.length, data: routines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get routines created by logged-in trainer
// @route   GET /api/routines/trainer
// @access  Private (Trainer)
exports.getTrainerRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ trainer: req.user._id })
      .populate('member', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: routines.length, data: routines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all routines (Admin) or filter by member
// @route   GET /api/routines
// @access  Private (Admin or Trainer)
exports.getAllRoutines = async (req, res) => {
  try {
    const { memberId, trainerId, status } = req.query;
    const query = {};
    if (memberId) query.member = memberId;
    if (trainerId) query.trainer = trainerId;
    if (status) query.status = status;

    const routines = await Routine.find(query)
      .populate('trainer', 'name email specialization')
      .populate('member', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: routines.length, data: routines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single routine by ID
// @route   GET /api/routines/:id
// @access  Private
exports.getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate('trainer', 'name email specialization')
      .populate('member', 'name email');

    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    // Check authorization: Admin, assigned trainer, or assigned member
    const isOwnerTrainer = routine.trainer._id.toString() === req.user._id.toString();
    const isAssignedMember = routine.member._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwnerTrainer && !isAssignedMember && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this routine' });
    }

    res.json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a routine
// @route   PUT /api/routines/:id
// @access  Private (Trainer who created it, or Admin)
exports.updateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    if (req.user.role !== 'admin' && routine.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this routine' });
    }

    const { title, description, goal, difficulty, days, status, memberId } = req.body;
    if (title) routine.title = title;
    if (description !== undefined) routine.description = description;
    if (goal) routine.goal = goal;
    if (difficulty) routine.difficulty = difficulty;
    if (days) routine.days = days;
    if (status) routine.status = status;
    if (memberId) routine.member = memberId;

    await routine.save();
    res.json({ success: true, message: 'Routine updated successfully', data: routine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a routine
// @route   DELETE /api/routines/:id
// @access  Private (Trainer who created it, or Admin)
exports.deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    if (req.user.role !== 'admin' && routine.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this routine' });
    }

    await Routine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Routine deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
