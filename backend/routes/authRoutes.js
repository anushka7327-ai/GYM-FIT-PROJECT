const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  getTrainers,
  getMembers,
  assignTrainer,
  getAllUsers,
  updateUserStatus,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

router.get('/trainers', protect, getTrainers);
router.get('/members', protect, authorize('trainer', 'admin'), getMembers);
router.put('/assign-trainer', protect, authorize('trainer', 'admin'), assignTrainer);

// Admin-specific user management
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id', protect, authorize('admin'), updateUserStatus);

module.exports = router;
