const express = require('express');
const router = express.Router();
const { protect, allow } = require('../middlewares/authMiddleware');
const inquiry = require('../controllers/inquiryController');

// Create inquiry (any authenticated user)
router.post('/create', protect, inquiry.createInquiry);

// Get builder's inquiries (builder only)
router.get('/builder', protect, allow('builder'), inquiry.getBuilderInquiries);

// Get user's inquiries (any authenticated user)
router.get('/user', protect, inquiry.getUserInquiries);

// Accept inquiry (builder only)
router.put('/:id/accept', protect, allow('builder'), inquiry.acceptInquiry);

// Reject inquiry (builder only)
router.put('/:id/reject', protect, allow('builder'), inquiry.rejectInquiry);

// Close deal (builder only)
router.put('/:id/close-deal', protect, allow('builder'), inquiry.closeDeal);

console.log('✅ All inquiry routes registered');

module.exports = router;
