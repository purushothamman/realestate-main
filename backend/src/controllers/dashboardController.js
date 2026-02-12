// @desc    Get agent dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const agentId = req.agent.id;

    // Get agent with stats
    const agent = await Agent.findById(agentId);

    // Get additional stats
    const [
      totalProperties,
      activeProperties,
      pendingProperties,
      soldProperties,
      totalLeads,
      newLeads,
      activeLeads,
      closedLeads,
      lostLeads,
      scheduledVisits
    ] = await Promise.all([
      Property.countDocuments({ agent: agentId, isActive: true }),
      Property.countDocuments({ agent: agentId, status: 'active', isActive: true }),
      Property.countDocuments({ agent: agentId, status: 'pending', isActive: true }),
      Property.countDocuments({ agent: agentId, status: 'sold', isActive: true }),
      Lead.countDocuments({ agent: agentId, isActive: true }),
      Lead.countDocuments({ agent: agentId, status: 'new', isActive: true }),
      Lead.countDocuments({ 
        agent: agentId, 
        status: { $in: ['contacted', 'follow-up', 'qualified', 'negotiating'] },
        isActive: true 
      }),
      Lead.countDocuments({ agent: agentId, status: 'closed', isActive: true }),
      Lead.countDocuments({ agent: agentId, status: 'lost', isActive: true }),
      Lead.aggregate([
        {
          $match: {
            agent: agent._id,
            isActive: true,
            'activities.type': 'site-visit',
            'activities.status': 'scheduled'
          }
        },
        {
          $unwind: '$activities'
        },
        {
          $match: {
            'activities.type': 'site-visit',
            'activities.status': 'scheduled',
            'activities.scheduledAt': { $gte: new Date() }
          }
        },
        {
          $count: 'total'
        }
      ])
    ]);

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 
      ? Math.round((closedLeads / totalLeads) * 100) 
      : 0;

    // Update agent's conversion rate
    agent.conversionRate = conversionRate;
    await agent.save();

    // Get monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyRevenue = await Lead.aggregate([
      {
        $match: {
          agent: agent._id,
          status: 'closed',
          closedDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$dealValue' }
        }
      }
    ]);

    const stats = {
      totalListings: totalProperties,
      activeListings: activeProperties,
      pendingListings: pendingProperties,
      soldListings: soldProperties,
      totalLeads,
      newLeads,
      activeLeads: activeLeads + newLeads,
      closedLeads,
      lostLeads,
      siteVisits: scheduledVisits.length > 0 ? scheduledVisits[0].total : 0,
      dealsClosed: closedLeads,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      conversionRate,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        avatar: agent.avatar,
        title: agent.title,
        verified: agent.verified
      }
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/recent-activity
// @access  Private
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent properties
    const recentProperties = await Property.find({ 
      agent: req.agent.id,
      isActive: true 
    })
      .sort('-createdAt')
      .limit(3)
      .select('title price location status createdAt');

    // Get recent leads
    const recentLeads = await Lead.find({ 
      agent: req.agent.id,
      isActive: true 
    })
      .populate('property', 'title location')
      .sort('-createdAt')
      .limit(limit);

    // Combine and sort by date
    const activities = [
      ...recentProperties.map(prop => ({
        type: 'property',
        action: 'created',
        data: prop,
        timestamp: prop.createdAt
      })),
      ...recentLeads.map(lead => ({
        type: 'lead',
        action: lead.status,
        data: lead,
        timestamp: lead.createdAt
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get performance analytics
// @route   GET /api/dashboard/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const agentId = req.agent.id;

    // Leads over time
    const leadsOverTime = await Lead.aggregate([
      {
        $match: {
          agent: agentId,
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Properties by status
    const propertiesByStatus = await Property.aggregate([
      {
        $match: {
          agent: agentId,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Leads by status
    const leadsByStatus = await Lead.aggregate([
      {
        $match: {
          agent: agentId,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue over time
    const revenueOverTime = await Lead.aggregate([
      {
        $match: {
          agent: agentId,
          status: 'closed',
          closedDate: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$closedDate' }
          },
          revenue: { $sum: '$dealValue' },
          deals: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top performing properties
    const topProperties = await Property.find({
      agent: agentId,
      isActive: true
    })
      .sort('-views -inquiries')
      .limit(5)
      .select('title price location views inquiries');

    res.status(200).json({
      success: true,
      data: {
        leadsOverTime,
        propertiesByStatus,
        leadsByStatus,
        revenueOverTime,
        topProperties
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get trending properties
// @route   GET /api/dashboard/trending-properties
// @access  Private
exports.getTrendingProperties = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const trendingProperties = await Property.find({
      agent: req.agent.id,
      isActive: true,
      status: 'active'
    })
      .sort('-views -inquiries')
      .limit(limit)
      .select('title price location views inquiries images');

    res.status(200).json({
      success: true,
      count: trendingProperties.length,
      data: { properties: trendingProperties }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};