const pool = require("../config/db")

exports.getDashboard = async (req, res) => {
    try {
        const builderId = req.user.id;

        // Total Listings - all properties regardless of status
        const [totalRows] = await pool.query(
            "SELECT COUNT(*) as total FROM properties WHERE uploaded_by = ?",
            [builderId]
        );

        // Active Projects - only properties with status='active'
        const [activeRows] = await pool.query(
            "SELECT COUNT(*) as active FROM properties WHERE uploaded_by = ? AND status = 'active'",
            [builderId]
        );

        // Pending Inquiries Count
        const [pendingRows] = await pool.query(
            "SELECT COUNT(*) as pending FROM inquiries WHERE builder_id = ? AND status = 'pending'",
            [builderId]
        );

        // Get all properties with full details
        const [properties] = await pool.query(
            `SELECT p.*, 
            (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id LIMIT 1) as image_url,
            (SELECT COUNT(*) FROM inquiries i WHERE i.property_id = p.id) as inquiry_count
       FROM properties p
       WHERE uploaded_by = ?
       ORDER BY created_at DESC`,
            [builderId]
        );

        // Fetch all images for these properties (so details screen can show multiple images)
        const propertyIds = (properties || []).map((p) => p.id).filter(Boolean);
        const imagesByPropertyId = new Map();
        const agentByPropertyId = new Map();

        if (propertyIds.length > 0) {
            const [imageRows] = await pool.query(
                `SELECT 
                    pi.property_id,
                    pi.image_url,
                    pi.is_primary,
                    pi.sort_order,
                    pi.id as image_id
                 FROM property_images pi
                 WHERE pi.property_id IN (?)
                 ORDER BY pi.property_id ASC, pi.is_primary DESC, pi.sort_order ASC, pi.id ASC`,
                [propertyIds]
            );

            (imageRows || []).forEach((row) => {
                if (!imagesByPropertyId.has(row.property_id)) {
                    imagesByPropertyId.set(row.property_id, []);
                }
                imagesByPropertyId.get(row.property_id).push(row);
            });

            // If this property was submitted by an agent, attach agent details (approved/pending/rejected)
            const [agentRows] = await pool.query(
                `SELECT 
                    pr.property_id,
                    u.id as agent_id,
                    u.name as agent_name,
                    u.email as agent_email,
                    u.phone as agent_phone,
                    pr.status as request_status
                 FROM property_requests pr
                 JOIN users u ON u.id = pr.agent_id
                 WHERE pr.property_id IN (?)`,
                [propertyIds]
            );

            (agentRows || []).forEach((row) => {
                agentByPropertyId.set(row.property_id, {
                    id: row.agent_id,
                    name: row.agent_name,
                    email: row.agent_email,
                    phone: row.agent_phone,
                    role: 'agent',
                    requestStatus: row.request_status,
                });
            });
        }

        // Format properties for frontend with proper field names
        const formattedProperties = (properties || []).map(p => {
            const imgs = imagesByPropertyId.get(p.id) || [];
            const agent = agentByPropertyId.get(p.id) || null;
            const imageUrls = imgs
                .map((x) => x.image_url)
                .filter((x) => x !== null && x !== undefined && String(x).trim().length > 0)
                .map((x) => String(x));

            return ({
                id: p.id,
                title: p.title,
                price: typeof p.price === 'number' ? p.price : parseFloat(p.price),
                formattedPrice: `$${parseFloat(p.price).toLocaleString()}`,
                city: p.city,
                state: p.state,
                location: p.city,
                address: p.address,
                status: p.status,
                created_at: p.created_at,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                area: p.area_sqft,
                area_sqft: p.area_sqft,
                description: p.description,
                uploaded_by: p.uploaded_by,
                image: imageUrls[0] || null,
                images: imageUrls,
                agent,
                // Temporary fields
                progress: p.status === 'sold' ? 100 : (p.status === 'active' ? 50 : 0),
                deadline: new Date(p.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                views: p.view_count || 0,
                inquiries: p.inquiry_count || 0
            });
        });

        res.json({
            success: true,
            stats: {
                totalListings: totalRows[0].total,
                activeProjects: activeRows[0].active,
                pendingInquiries: pendingRows[0].pending,
                upcomingDeadlines: activeRows[0].active // Approximation
            },
            recentListings: formattedProperties.slice(0, 5),
            activeListings: formattedProperties.filter(p => p.status === 'active').slice(0, 3)
        });

    } catch (err) {
        console.error('Builder dashboard error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


// List builders (for agent to select when adding property)
exports.getBuildersList = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `
            SELECT 
              u.id,
              u.name,
              u.email,
              u.phone,
              b.company_name
            FROM users u
            LEFT JOIN builders b ON b.user_id = u.id
            WHERE u.role = 'builder' AND u.is_blocked = FALSE
            ORDER BY COALESCE(b.company_name, u.name) ASC
            `
        );

        const builders = (rows || []).map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            companyName: r.company_name || null,
            displayName: r.company_name || r.name
        }));

        res.json({ success: true, builders });
    } catch (err) {
        console.error('Get builders list error:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ─── Assign Agent / Hire Agent APIs ─────────────────────────────────────────

// GET /api/builder/assign-agent/properties — list builder's properties for assign screen
exports.getPropertiesForAssign = async (req, res) => {
    try {
        const builderId = req.user.id;
        const [rows] = await pool.query(
            `SELECT p.id, p.uploaded_by, p.title, p.address, p.city, p.state, p.status, p.created_at,
                    (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image_url
             FROM properties p
             WHERE p.uploaded_by = ?
             ORDER BY p.created_at DESC`,
            [builderId]
        );
        const list = (rows || []).map((r) => ({
            id: r.id,
            uploaded_by: r.uploaded_by,
            name: r.title,
            location: [r.address, r.city, r.state].filter(Boolean).join(', '),
            type: 'Residential',
            units: '-',
            status: (r.status || 'active') === 'active' ? 'Active' : (r.status || 'Active'),
            image: r.image_url || null,
        }));
        res.json({ success: true, properties: list });
    } catch (err) {
        console.error('getPropertiesForAssign error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/builder/assign-agent/agents — list agents hired by this builder (from builder_agents + users)
exports.getHiredAgents = async (req, res) => {
    try {
        const builderId = req.user.id;
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone, u.profile_image,
                    ba.hired_at
             FROM builder_agents ba
             JOIN users u ON u.id = ba.agent_id
             WHERE ba.builder_id = ? AND u.role = 'agent' AND (u.is_blocked = FALSE OR u.is_blocked IS NULL)
             ORDER BY ba.hired_at DESC`,
            [builderId]
        );
        const list = (rows || []).map((r) => ({
            id: String(r.id),
            name: r.name,
            email: r.email || '',
            phone: r.phone || '',
            exp: 0,
            rating: 0,
            deals: 0,
            city: '—',
            spec: 'Agent',
            avatar: r.profile_image || null,
        }));
        res.json({ success: true, agents: list });
    } catch (err) {
        console.error('getHiredAgents error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/builder/assign-agent/agents/available — registered agents not yet hired by this builder
exports.getAvailableAgents = async (req, res) => {
    try {
        const builderId = req.user.id;
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone, u.profile_image
             FROM users u
             LEFT JOIN builder_agents ba 
               ON ba.agent_id = u.id AND ba.builder_id = ?
             LEFT JOIN builder_agent_requests bar
               ON bar.agent_id = u.id AND bar.builder_id = ? AND bar.status = 'pending'
             WHERE u.role = 'agent' 
               AND (u.is_blocked = FALSE OR u.is_blocked IS NULL) 
               AND ba.id IS NULL
               AND bar.id IS NULL
             ORDER BY u.name ASC`,
            [builderId, builderId]
        );
        const list = (rows || []).map((r) => ({
            id: String(r.id),
            name: r.name,
            email: r.email || '',
            phone: r.phone || '',
            exp: 0,
            rating: 0,
            deals: 0,
            city: '—',
            spec: 'Agent',
            avatar: r.profile_image || null,
        }));
        res.json({ success: true, agents: list });
    } catch (err) {
        console.error('getAvailableAgents error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/builder/assign-agent/agents/:agentId/hire — create hire request + notify agent
exports.hireAgent = async (req, res) => {
    try {
        const builderId = req.user.id;
        const agentId = parseInt(req.params.agentId, 10);
        if (!agentId) {
            return res.status(400).json({ success: false, message: 'Invalid agent ID' });
        }
        const [userRows] = await pool.query(
            'SELECT id, role, name FROM users WHERE id = ? AND role = ?',
            [agentId, 'agent']
        );
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }
        // If already hired, no need to create a new request
        const [existingHire] = await pool.query(
            'SELECT id FROM builder_agents WHERE builder_id = ? AND agent_id = ?',
            [builderId, agentId]
        );
        if (existingHire && existingHire.length > 0) {
            return res.json({ success: true, alreadyHired: true, message: 'Agent is already on your team' });
        }

        // Check if there is an active pending request
        const [existingReq] = await pool.query(
            'SELECT id, status FROM builder_agent_requests WHERE builder_id = ? AND agent_id = ? ORDER BY created_at DESC LIMIT 1',
            [builderId, agentId]
        );
        if (existingReq && existingReq.length > 0 && existingReq[0].status === 'pending') {
            return res.json({ success: true, pending: true, message: 'Hire request is already pending with this agent' });
        }

        const [reqResult] = await pool.query(
            'INSERT INTO builder_agent_requests (builder_id, agent_id) VALUES (?, ?)',
            [builderId, agentId]
        );

        const requestId = reqResult.insertId;

        // Fetch builder name for a friendly message
        const [builderRows] = await pool.query(
            'SELECT name FROM users WHERE id = ?',
            [builderId]
        );
        const builderName = builderRows && builderRows[0] && builderRows[0].name ? builderRows[0].name : 'A builder';

        await pool.query(
            'INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id) VALUES (?, ?, ?, ?, ?, ?)',
            [
                agentId,
                'hire_request',
                'New hire request',
                `${builderName} wants to add you as their agent.`,
                'builder_agent_request',
                requestId,
            ]
        );

        res.json({
            success: true,
            message: 'Hire request sent to agent for approval',
            requestId,
        });
    } catch (err) {
        console.error('hireAgent error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/builder/assign-agent/assignments — property_id -> agent_id map for this builder
exports.getAssignments = async (req, res) => {
    try {
        const builderId = req.user.id;
        const [rows] = await pool.query(
            'SELECT property_id, agent_id FROM property_agent_assignments WHERE builder_id = ?',
            [builderId]
        );
        const assignments = {};
        (rows || []).forEach((r) => {
            assignments[String(r.property_id)] = String(r.agent_id);
        });
        res.json({ success: true, assignments });
    } catch (err) {
        console.error('getAssignments error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/builder/assign-agent/properties/:propertyId/assign — assign agent to property
exports.assignAgentToProperty = async (req, res) => {
    try {
        const builderId = req.user.id;
        const propertyId = parseInt(req.params.propertyId, 10);
        const { agentId } = req.body;
        const agentIdNum = parseInt(agentId, 10);
        if (!propertyId || !agentIdNum) {
            return res.status(400).json({ success: false, message: 'propertyId and agentId required' });
        }
        const [propRows] = await pool.query(
            'SELECT id FROM properties WHERE id = ? AND uploaded_by = ?',
            [propertyId, builderId]
        );
        if (!propRows || propRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const [agentInTeam] = await pool.query(
            'SELECT id FROM builder_agents WHERE builder_id = ? AND agent_id = ?',
            [builderId, agentIdNum]
        );
        if (!agentInTeam || agentInTeam.length === 0) {
            return res.status(400).json({ success: false, message: 'Agent must be hired first' });
        }
        await pool.query(
            'INSERT INTO property_agent_assignments (property_id, agent_id, builder_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE agent_id = VALUES(agent_id), builder_id = VALUES(builder_id)',
            [propertyId, agentIdNum, builderId]
        );
        const [propTitle] = await pool.query('SELECT title FROM properties WHERE id = ?', [propertyId]);
        const title = (propTitle && propTitle[0] && propTitle[0].title) ? propTitle[0].title : 'Property';
        await pool.query(
            'INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id) VALUES (?, ?, ?, ?, ?, ?)',
            [agentIdNum, 'assignment', 'Assigned to property', `You have been assigned to "${title}".`, 'property', propertyId]
        );
        res.json({ success: true, message: 'Agent assigned' });
    } catch (err) {
        console.error('assignAgentToProperty error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/builder/assign-agent/properties/:propertyId/assign — remove assignment
exports.unassignAgentFromProperty = async (req, res) => {
    try {
        const builderId = req.user.id;
        const propertyId = parseInt(req.params.propertyId, 10);
        if (!propertyId) {
            return res.status(400).json({ success: false, message: 'propertyId required' });
        }
        const [result] = await pool.query(
            'DELETE FROM property_agent_assignments WHERE property_id = ? AND builder_id = ?',
            [propertyId, builderId]
        );
        res.json({ success: true, message: 'Assignment removed', removed: result.affectedRows > 0 });
    } catch (err) {
        console.error('unassignAgentFromProperty error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/builder/hire-requests/:id
exports.getHireRequestById = async (req, res) => {
    try {
        const builderId = req.user.id;
        const requestId = parseInt(req.params.id, 10);

        if (!requestId) {
            return res.status(400).json({ success: false, message: "Invalid request ID" });
        }

        // Fetch request + agent info + professional details
        const [rows] = await pool.query(
            `SELECT 
                bar.id, bar.status, bar.created_at, bar.decided_at,
                u.id as agent_id, u.name as agent_name, u.email as agent_email, u.phone as agent_phone, u.profile_image as agent_avatar,
                a.professional_title, a.experience_years, a.city as agent_city, a.about_me
             FROM builder_agent_requests bar
             JOIN users u ON u.id = bar.agent_id
             LEFT JOIN agents a ON a.user_id = u.id
             WHERE bar.id = ? AND bar.builder_id = ?`,
            [requestId, builderId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hire request not found" });
        }

        res.json({ success: true, request: rows[0] });
    } catch (err) {
        console.error("getHireRequestById error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

