const express = require('express');
const {
  getDashboardStats,
  getRecentActivity,
  getAnalytics,
  getTrendingProperties
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Routes
router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/analytics', getAnalytics);
router.get('/trending-properties', getTrendingProperties);

module.exports = router;