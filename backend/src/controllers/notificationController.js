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

// GET /api/notifications/:id/detail — enriched notification for detail view
exports.getNotificationDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = parseInt(req.params.id, 10);
        if (!id) {
            return res.status(400).json({ success: false, message: "Invalid notification ID" });
        }

        // 1. Fetch the notification itself
        const [nRows] = await pool.query(
            `SELECT id, type, title, body, related_entity_type, related_entity_id, is_read, created_at
             FROM notifications WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        if (!nRows || nRows.length === 0) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        const notif = nRows[0];
        const result = {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            body: notif.body,
            createdAt: notif.created_at,
            sender: null,
            property: null,
            chatId: null,
            inquiryId: null,
        };

        // 2. Enrich based on type
        if (notif.type === 'buyer_message' && notif.related_entity_type === 'chat') {
            // Chat-based notification → get sender, property, and chatId
            const chatId = notif.related_entity_id;
            result.chatId = chatId;

            // Get chat details + property + last message sender
            const [chatRows] = await pool.query(
                `SELECT c.user1_id, c.user2_id, c.property_id, c.inquiry_id,
                        p.id as prop_id, p.title as prop_title, p.price as prop_price,
                        p.city as prop_city, p.address as prop_address,
                        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) as prop_image
                 FROM chats c
                 LEFT JOIN properties p ON p.id = c.property_id
                 WHERE c.id = ?`,
                [chatId]
            );
            if (chatRows && chatRows.length > 0) {
                const chat = chatRows[0];
                result.inquiryId = chat.inquiry_id;
                // The sender is the other participant (not this user)
                const senderId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
                const [senderRows] = await pool.query(
                    `SELECT u.id, u.name, u.email, u.phone, u.role, u.profile_image
                     FROM users u WHERE u.id = ?`,
                    [senderId]
                );
                if (senderRows && senderRows.length > 0) {
                    const s = senderRows[0];
                    result.sender = {
                        id: s.id,
                        name: s.name,
                        email: s.email || '',
                        phone: s.phone || '',
                        role: s.role || 'Agent',
                        avatar: s.profile_image || null,
                    };
                }
                if (chat.prop_id) {
                    result.property = {
                        id: chat.prop_id,
                        title: chat.prop_title,
                        price: chat.prop_price,
                        city: chat.prop_city,
                        address: chat.prop_address,
                        image: chat.prop_image || null,
                    };
                }
            }
        } else if (notif.type === 'deal_closed' && notif.related_entity_type === 'inquiry') {
            // Inquiry-based notification → get builder/agent who closed + property
            const inquiryId = notif.related_entity_id;
            result.inquiryId = inquiryId;

            const [inqRows] = await pool.query(
                `SELECT i.builder_id, i.property_id, i.status,
                        p.id as prop_id, p.title as prop_title, p.price as prop_price,
                        p.city as prop_city, p.address as prop_address,
                        (SELECT image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) as prop_image
                 FROM inquiries i
                 LEFT JOIN properties p ON p.id = i.property_id
                 WHERE i.id = ?`,
                [inquiryId]
            );
            if (inqRows && inqRows.length > 0) {
                const inq = inqRows[0];
                // Sender is the builder/agent who closed the deal
                const [senderRows] = await pool.query(
                    `SELECT u.id, u.name, u.email, u.phone, u.role, u.profile_image
                     FROM users u WHERE u.id = ?`,
                    [inq.builder_id]
                );
                if (senderRows && senderRows.length > 0) {
                    const s = senderRows[0];
                    result.sender = {
                        id: s.id,
                        name: s.name,
                        email: s.email || '',
                        phone: s.phone || '',
                        role: s.role || 'Builder',
                        avatar: s.profile_image || null,
                    };
                }
                if (inq.prop_id) {
                    result.property = {
                        id: inq.prop_id,
                        title: inq.prop_title,
                        price: inq.prop_price,
                        city: inq.prop_city,
                        address: inq.prop_address,
                        image: inq.prop_image || null,
                    };
                }

                // Also get chatId for navigation
                const [chatRows] = await pool.query(
                    'SELECT id FROM chats WHERE inquiry_id = ? LIMIT 1',
                    [inquiryId]
                );
                if (chatRows && chatRows.length > 0) {
                    result.chatId = chatRows[0].id;
                }
            }
        }

        res.json({ success: true, detail: result });
    } catch (err) {
        console.error("getNotificationDetail error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
