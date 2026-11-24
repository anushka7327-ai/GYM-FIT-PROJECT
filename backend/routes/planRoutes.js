const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public or member can read plans
router.get('/', getPlans);
router.get('/:id', getPlanById);

// Admin can create, update, delete plans
router.post('/', protect, authorize('admin'), createPlan);
router.put('/:id', protect, authorize('admin'), updatePlan);
router.delete('/:id', protect, authorize('admin'), deletePlan);

module.exports = router;
