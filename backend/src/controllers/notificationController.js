const pool = require("../config/db");

// GET /api/notifications — list notifications for the current user (e.g. agent)
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

        const [rows] = await pool.query(
            `SELECT id, type, title, body, related_entity_type, related_entity_id, is_read, read_at, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        const list = (rows || []).map((r) => ({
            id: r.id,
            type: r.type,
            title: r.title,
            body: r.body,
            relatedEntityType: r.related_entity_type,
            relatedEntityId: r.related_entity_id,
            isRead: Boolean(r.is_read),
            readAt: r.read_at,
            createdAt: r.created_at,
        }));

        res.json({ success: true, notifications: list });
    } catch (err) {
        console.error("getNotifications error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/notifications/:id/read — mark as read
exports.markRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);
        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid notification ID" });
        }
        const [result] = await pool.query(
            "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        res.json({ success: true, message: "Marked as read" });
    } catch (err) {
        console.error("markRead error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
