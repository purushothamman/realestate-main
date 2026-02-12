const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all agents
// @route   GET /api/agents
// @access  Public
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true })
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: agents.length,
      data: { agents }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single agent
// @route   GET /api/agents/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { agent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update agent (admin only)
// @route   PUT /api/agents/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      data: { agent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;