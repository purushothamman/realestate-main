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
