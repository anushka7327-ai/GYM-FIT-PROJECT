const express = require('express');
const router = express.Router();
const {
  getRevenueReport,
  getMemberProgressReport,
  getDashboardStats,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/revenue', protect, authorize('admin'), getRevenueReport);
router.get('/progress/:memberId?', protect, getMemberProgressReport);

module.exports = router;
