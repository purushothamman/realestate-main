const pool = require("../config/db");

// Agent: respond to a hire request (accept / reject)

// POST /api/agent/hire-requests/:id/accept
exports.acceptHireRequest = async (req, res) => {
    try {
        const agentId = req.user.id;
        const requestId = parseInt(req.params.id, 10);
        if (!requestId) {
            return res.status(400).json({ success: false, message: "Invalid request ID" });
        }

        const [rows] = await pool.query(
            "SELECT id, builder_id, agent_id, status FROM builder_agent_requests WHERE id = ?",
            [requestId]
        );
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hire request not found" });
        }
        const reqRow = rows[0];
        if (reqRow.agent_id !== agentId) {
            return res.status(403).json({ success: false, message: "You are not allowed to act on this request" });
        }
        if (reqRow.status !== "pending") {
            return res.status(400).json({ success: false, message: `Request is already ${reqRow.status}` });
        }

        // Mark request accepted
        await pool.query(
            "UPDATE builder_agent_requests SET status = 'accepted', decided_at = CURRENT_TIMESTAMP WHERE id = ?",
            [requestId]
        );

        // Ensure builder_agents link exists
        await pool.query(
            "INSERT IGNORE INTO builder_agents (builder_id, agent_id) VALUES (?, ?)",
            [reqRow.builder_id, agentId]
        );

        // Notify builder
        const [agentRows] = await pool.query(
            "SELECT name FROM users WHERE id = ?",
            [agentId]
        );
        const agentName = agentRows && agentRows[0] && agentRows[0].name ? agentRows[0].name : "An agent";

        await pool.query(
            "INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id) VALUES (?, ?, ?, ?, ?, ?)",
            [
                reqRow.builder_id,
                "hire_response",
                "Hire request accepted",
                `${agentName} accepted your hire request.`,
                "builder_agent_request",
                requestId,
            ]
        );

        res.json({ success: true, message: "Hire request accepted" });
    } catch (err) {
        console.error("acceptHireRequest error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/agent/hire-requests/:id/reject
exports.rejectHireRequest = async (req, res) => {
    try {
        const agentId = req.user.id;
        const requestId = parseInt(req.params.id, 10);
        if (!requestId) {
            return res.status(400).json({ success: false, message: "Invalid request ID" });
        }

        const [rows] = await pool.query(
            "SELECT id, builder_id, agent_id, status FROM builder_agent_requests WHERE id = ?",
            [requestId]
        );
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hire request not found" });
        }
        const reqRow = rows[0];
        if (reqRow.agent_id !== agentId) {
            return res.status(403).json({ success: false, message: "You are not allowed to act on this request" });
        }
        if (reqRow.status !== "pending") {
            return res.status(400).json({ success: false, message: `Request is already ${reqRow.status}` });
        }

        await pool.query(
            "UPDATE builder_agent_requests SET status = 'rejected', decided_at = CURRENT_TIMESTAMP WHERE id = ?",
            [requestId]
        );

        // Notify builder
        const [agentRows] = await pool.query(
            "SELECT name FROM users WHERE id = ?",
            [agentId]
        );
        const agentName = agentRows && agentRows[0] && agentRows[0].name ? agentRows[0].name : "An agent";

        await pool.query(
            "INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id) VALUES (?, ?, ?, ?, ?, ?)",
            [
                reqRow.builder_id,
                "hire_response",
                "Hire request rejected",
                `${agentName} rejected your hire request.`,
                "builder_agent_request",
                requestId,
            ]
        );

        res.json({ success: true, message: "Hire request rejected" });
    } catch (err) {
        console.error("rejectHireRequest error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/agent/hire-requests/:id
exports.getHireRequestById = async (req, res) => {
    try {
        const agentId = req.user.id;
        const requestId = parseInt(req.params.id, 10);

        if (!requestId) {
            return res.status(400).json({ success: false, message: "Invalid request ID" });
        }

        // 1. Fetch request + builder basic info + company info
        const [rows] = await pool.query(
            `SELECT 
                bar.id, bar.status, bar.created_at,
                u.id as builder_id, u.name as builder_name, u.email as builder_email, u.phone as builder_phone, u.profile_image as builder_avatar,
                b.company_name, b.city as company_city, b.description as company_description
             FROM builder_agent_requests bar
             JOIN users u ON u.id = bar.builder_id
             LEFT JOIN builders b ON b.user_id = u.id
             WHERE bar.id = ?`,
            [requestId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hire request not found" });
        }

        const request = rows[0];

        // 2. Fetch total properties uploaded by this builder
        const [propCountRows] = await pool.query(
            "SELECT COUNT(*) as total FROM properties WHERE uploaded_by = ?",
            [request.builder_id]
        );
        request.total_properties = propCountRows[0].total || 0;

        res.json({ success: true, request });
    } catch (err) {
        console.error("getHireRequestById error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/agent/my-builders — list builders who have hired this agent
exports.getMyBuilders = async (req, res) => {
    try {
        const agentId = req.user.id;

        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone,
                    b.company_name, b.verification_status
             FROM builder_agents ba
             JOIN users u ON ba.builder_id = u.id
             LEFT JOIN builders b ON b.user_id = u.id
             WHERE ba.agent_id = ?
             ORDER BY u.name ASC`,
            [agentId]
        );

        res.json({ success: true, builders: rows || [] });
    } catch (err) {
        console.error("getMyBuilders error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/agent/dashboard-stats
exports.getAgentDashboardStats = async (req, res) => {
    try {
        const agentId = req.user.id;

        // Total Listings: Properties where agent is uploader OR in property_requests (approved)
        const [totalRows] = await pool.query(
            `SELECT COUNT(DISTINCT p.id) as total 
             FROM properties p
             LEFT JOIN property_requests pr ON p.id = pr.property_id
             WHERE (p.uploaded_by = ? AND p.uploaded_by_role = 'agent')
                OR (pr.agent_id = ? AND pr.status = 'approved')`,
            [agentId, agentId]
        );

        // Deals Closed: Above properties with status 'sold' or 'rented'
        const [closedRows] = await pool.query(
            `SELECT COUNT(DISTINCT p.id) as closed 
             FROM properties p
             LEFT JOIN property_requests pr ON p.id = pr.property_id
             WHERE ((p.uploaded_by = ? AND p.uploaded_by_role = 'agent')
                OR (pr.agent_id = ? AND pr.status = 'approved'))
               AND p.status IN ('sold', 'rented')`,
            [agentId, agentId]
        );

        // Active Leads: Unique inquiries directed to this agent where property is not sold/rented
        const [leadsRows] = await pool.query(
            `SELECT COUNT(DISTINCT i.id) as active_leads 
             FROM inquiries i
             JOIN properties p ON i.property_id = p.id
             WHERE i.builder_id = ? 
               AND p.status NOT IN ('sold', 'rented')`,
            [agentId]
        );

        // Pending Inquiries: Inquiries directed to this agent with status 'pending'
        const [pendingRows] = await pool.query(
            "SELECT COUNT(*) as pending FROM inquiries WHERE builder_id = ? AND status = 'pending'",
            [agentId]
        );

        // Monthly Revenue: 3% commission on sold/rented properties (simulation)
        const [revenueRows] = await pool.query(
            `SELECT SUM(p.price * 0.03) as revenue 
             FROM properties p
             LEFT JOIN property_requests pr ON p.id = pr.property_id
             WHERE ((p.uploaded_by = ? AND p.uploaded_by_role = 'agent')
                OR (pr.agent_id = ? AND pr.status = 'approved'))
               AND p.status IN ('sold', 'rented')`,
            [agentId, agentId]
        );

        res.json({
            success: true,
            stats: {
                totalListings: totalRows[0].total || 0,
                dealsClosed: closedRows[0].closed || 0,
                activeLeads: leadsRows[0].active_leads || 0,
                pendingInquiries: pendingRows[0].pending || 0,
                newLeads: 0, // Could be derived from inquiries in last 24h
                conversionRate: totalRows[0].total > 0 ? Math.round((closedRows[0].closed / totalRows[0].total) * 100) : 0,
                monthlyRevenue: revenueRows[0].revenue || 0
            }
        });
    } catch (err) {
        console.error("getAgentDashboardStats error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
