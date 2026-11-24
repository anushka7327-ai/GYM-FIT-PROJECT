const express = require('express');
const router = express.Router();
const {
  subscribeToPlan,
  getMySubscriptions,
  getAllSubscriptions,
  getExpiringSubscriptions,
  updateSubscriptionStatus,
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Member routes
router.post('/', protect, authorize('member'), subscribeToPlan);
router.get('/my', protect, authorize('member'), getMySubscriptions);

// Admin routes
router.get('/expiring', protect, authorize('admin'), getExpiringSubscriptions);
router.get('/', protect, authorize('admin'), getAllSubscriptions);
router.put('/:id/status', protect, updateSubscriptionStatus);

module.exports = router;
