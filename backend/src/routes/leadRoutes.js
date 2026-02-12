const express = require('express');
const { body } = require('express-validator');
const {
  getAllLeads,
  getRecentLeads,
  getLead,
  createLead,
  updateLead,
  updateLeadStatus,
  addActivity,
  addNote,
  deleteLead
} = require('../controllers/leadController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createLeadValidation = [
  body('propertyId').notEmpty().withMessage('Property ID is required'),
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('budgetMin').isNumeric().withMessage('Budget min must be a number'),
  body('budgetMax').isNumeric().withMessage('Budget max must be a number')
];

const updateStatusValidation = [
  body('status').isIn(['new', 'contacted', 'follow-up', 'qualified', 'negotiating', 'closed', 'lost'])
    .withMessage('Invalid status')
];

const addActivityValidation = [
  body('type').isIn(['call', 'email', 'meeting', 'site-visit', 'follow-up'])
    .withMessage('Invalid activity type'),
  body('description').notEmpty().withMessage('Description is required')
];

const addNoteValidation = [
  body('text').trim().notEmpty().withMessage('Note text is required')
];

// Routes
router.get('/', protect, getAllLeads);
router.get('/recent', protect, getRecentLeads);
router.get('/:id', protect, getLead);
router.post('/', optionalAuth, createLeadValidation, validate, createLead);
router.put('/:id', protect, updateLead);
router.patch('/:id/status', protect, updateStatusValidation, validate, updateLeadStatus);
router.post('/:id/activity', protect, addActivityValidation, validate, addActivity);
router.post('/:id/notes', protect, addNoteValidation, validate, addNote);
router.delete('/:id', protect, deleteLead);

module.exports = router;