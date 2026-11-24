const express = require('express');
const router = express.Router();
const {
  createRoutine,
  getMyRoutines,
  getTrainerRoutines,
  getAllRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
} = require('../controllers/routineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('trainer', 'admin'), createRoutine);
router.get('/my', protect, authorize('member'), getMyRoutines);
router.get('/trainer', protect, authorize('trainer'), getTrainerRoutines);
router.get('/', protect, authorize('trainer', 'admin'), getAllRoutines);
router.get('/:id', protect, getRoutineById);
router.put('/:id', protect, authorize('trainer', 'admin'), updateRoutine);
router.delete('/:id', protect, authorize('trainer', 'admin'), deleteRoutine);

module.exports = router;
