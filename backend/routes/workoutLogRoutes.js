const express = require('express');
const router = express.Router();
const {
  createWorkoutLog,
  getMyWorkoutLogs,
  getMemberWorkoutLogs,
  getWorkoutLogById,
  updateWorkoutLog,
  deleteWorkoutLog,
} = require('../controllers/workoutLogController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('member'), createWorkoutLog);
router.get('/my', protect, authorize('member'), getMyWorkoutLogs);
router.get('/member/:memberId', protect, authorize('trainer', 'admin'), getMemberWorkoutLogs);
router.get('/:id', protect, getWorkoutLogById);
router.put('/:id', protect, authorize('member', 'admin'), updateWorkoutLog);
router.delete('/:id', protect, authorize('member', 'admin'), deleteWorkoutLog);

module.exports = router;
