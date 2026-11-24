const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'gymfit_jwt_super_secret_key_2026_fitness_tracker',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, specialization } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Restrict initial public registration to member or trainer (admin must be created or authorized via ADMIN_SECRET)
    let assignedRole = 'member';
    if (role === 'trainer' || role === 'member') {
      assignedRole = role;
    } else if (role === 'admin') {
      const expectedAdminSecret = process.env.ADMIN_SECRET || 'gymfit_admin_secret_key';
      if (req.body.adminSecret === expectedAdminSecret) {
        assignedRole = 'admin';
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin registration secret. Admin accounts must be authorized.',
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      address: address || '',
      specialization: specialization || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        specialization: user.specialization,
        assignedTrainer: user.assignedTrainer,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email }).populate('assignedTrainer', 'name email phone specialization');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        specialization: user.specialization,
        assignedTrainer: user.assignedTrainer,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assignedTrainer', 'name email phone specialization avatar');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'phone', 'address', 'specialization', 'avatar'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.password && req.body.password.length >= 6) {
      updates.password = req.body.password;
    }

    const user = await User.findById(req.user._id);
    Object.assign(user, updates);
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trainers
// @route   GET /api/auth/trainers
// @access  Private
exports.getTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer', isActive: true }).select('name email phone specialization avatar');
    res.json({ success: true, count: trainers.length, data: trainers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all members
// @route   GET /api/auth/members
// @access  Private (Trainers & Admins)
exports.getMembers = async (req, res) => {
  try {
    const query = { role: 'member', isActive: true };
    if (req.user.role === 'trainer') {
      // If trainer, can return either members assigned to them, or all members they can adopt
      if (req.query.assignedOnly === 'true') {
        query.assignedTrainer = req.user._id;
      }
    }
    const members = await User.find(query)
      .select('name email phone address assignedTrainer createdAt')
      .populate('assignedTrainer', 'name email');
    res.json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign trainer to member
// @route   PUT /api/auth/assign-trainer
// @access  Private (Admin or Trainer)
exports.assignTrainer = async (req, res) => {
  try {
    const { memberId, trainerId } = req.body;
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (trainerId) {
      const trainer = await User.findById(trainerId);
      if (!trainer || trainer.role !== 'trainer') {
        return res.status(404).json({ success: false, message: 'Trainer not found' });
      }
      member.assignedTrainer = trainerId;
    } else {
      member.assignedTrainer = null;
    }

    await member.save();
    await member.populate('assignedTrainer', 'name email specialization');

    res.json({ success: true, message: 'Trainer assignment updated', member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query).populate('assignedTrainer', 'name email').sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role or status (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { role, isActive, assignedTrainer } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (assignedTrainer !== undefined) updates.assignedTrainer = assignedTrainer || null;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
