const express = require('express');
const router = express.Router();
const { protect, allow } = require('../middlewares/authMiddleware');
const inquiry = require('../controllers/inquiryController');

// Create inquiry (any authenticated user)
router.post('/create', protect, inquiry.createInquiry);

// Get builder's inquiries (builder or agent)
router.get('/builder', protect, allow('builder', 'agent'), inquiry.getBuilderInquiries);

// Get user's inquiries (any authenticated user)
router.get('/user', protect, inquiry.getUserInquiries);

// Accept inquiry (builder or agent)
router.put('/:id/accept', protect, allow('builder', 'agent'), inquiry.acceptInquiry);

// Reject inquiry (builder or agent)
router.put('/:id/reject', protect, allow('builder', 'agent'), inquiry.rejectInquiry);

// Close deal (builder or agent)
router.put('/:id/close-deal', protect, allow('builder', 'agent'), inquiry.closeDeal);

console.log('✅ All inquiry routes registered');

module.exports = router;
