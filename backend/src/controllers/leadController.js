// @desc    Get all leads for agent
// @route   GET /api/leads
// @access  Private
exports.getAllLeads = async (req, res) => {
  try {
    const { 
      status, 
      priority,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { agent: req.agent.id, isActive: true };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const leads = await Lead.find(query)
      .populate('property', 'title price location.address location.city images')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: { leads }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recent leads
// @route   GET /api/leads/recent
// @access  Private
exports.getRecentLeads = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const leads = await Lead.find({ 
      agent: req.agent.id, 
      isActive: true 
    })
      .populate('property', 'title price location.city images')
      .sort('-createdAt')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: leads.length,
      data: { leads }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('property', 'title price location images features')
      .populate('agent', 'name email phone');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Make sure agent owns the lead
    if (lead.agent._id.toString() !== req.agent.id && req.agent.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lead'
      });
    }

    res.status(200).json({
      success: true,
      data: { lead }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Public/Private
exports.createLead = async (req, res) => {
  try {
    const { propertyId, clientName, email, phone, budgetMin, budgetMax, source } = req.body;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Create lead
    const lead = await Lead.create({
      agent: property.agent,
      property: propertyId,
      clientName,
      email,
      phone,
      budgetRange: {
        min: budgetMin,
        max: budgetMax
      },
      source: source || 'website'
    });

    // Update property inquiries count
    await Property.findByIdAndUpdate(propertyId, {
      $inc: { inquiries: 1 }
    });

    // Update agent's active leads count
    await Agent.findByIdAndUpdate(property.agent, {
      $inc: { 'stats.activeLeads': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Make sure agent owns the lead
    if (lead.agent.toString() !== req.agent.id && req.agent.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('property', 'title price location');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status, reason, dealValue } = req.body;
    
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Make sure agent owns the lead
    if (lead.agent.toString() !== req.agent.id && req.agent.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    const oldStatus = lead.status;
    await lead.updateStatus(status, reason);

    // Update deal value if closing
    if (status === 'closed' && dealValue) {
      lead.dealValue = dealValue;
      await lead.save();

      // Update agent stats
      await Agent.findByIdAndUpdate(req.agent.id, {
        $inc: { 
          'stats.dealsClosed': 1,
          'stats.monthlyRevenue': dealValue
        }
      });
    }

    // If status changed from active to closed/lost, decrease active leads
    if (['new', 'contacted', 'follow-up', 'qualified', 'negotiating'].includes(oldStatus) &&
        ['closed', 'lost'].includes(status)) {
      await Agent.findByIdAndUpdate(req.agent.id, {
        $inc: { 'stats.activeLeads': -1 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: { lead }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add activity to lead
// @route   POST /api/leads/:id/activity
// @access  Private
exports.addActivity = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Make sure agent owns the lead
    if (lead.agent.toString() !== req.agent.id && req.agent.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    await lead.addActivity(req.body);

    res.status(200).json({
      success: true,
      message: 'Activity added successfully',
      data: { lead }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Make sure agent owns the lead
    if (lead.agent.toString() !== req.agent.id && req.agent.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    lead.notes.push({
      text,
      createdBy: req.agent.id
    });

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: { lead }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Make sure agent owns the lead
    if (lead.agent.toString() !== req.agent.id && req.agent.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lead'
      });
    }

    // Soft delete
    lead.isActive = false;
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};