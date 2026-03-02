const pool = require("../config/db")

exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { message } = req.body;
        const senderId = req.user.id;

        if (!message) {
            return res.status(400).json({ message: "Message required" });
        }

        // Check if chat exists
        const [chat] = await pool.query(
            "SELECT id FROM chats WHERE id = ?",
            [chatId]
        );

        if (chat.length === 0) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Insert message
        await pool.query(
            "INSERT INTO messages (chat_id, sender_id, message, sent_at) VALUES (?, ?, ?, NOW())",
            [chatId, senderId, message]
        );

        // Update chat updated_at
        await pool.query(
            "UPDATE chats SET updated_at = NOW() WHERE id = ?",
            [chatId]
        );

        // --- Notify the other participant (buyer) ---
        try {
            const [chatInfo] = await pool.query(
                `SELECT c.user1_id, c.user2_id, c.property_id, p.title as property_title
                 FROM chats c
                 LEFT JOIN properties p ON p.id = c.property_id
                 WHERE c.id = ?`,
                [chatId]
            );
            if (chatInfo && chatInfo.length > 0) {
                const ci = chatInfo[0];
                const recipientId = ci.user1_id === senderId ? ci.user2_id : ci.user1_id;
                const propTitle = ci.property_title || 'a property';

                // Only notify if recipient is different from sender
                if (recipientId && recipientId !== senderId) {
                    await pool.query(
                        `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
                         VALUES (?, 'buyer_message', ?, ?, 'chat', ?)`,
                        [
                            recipientId,
                            `New message regarding ${propTitle}`,
                            `You received a new message regarding ${propTitle}.`,
                            chatId,
                        ]
                    );
                }
            }
        } catch (notifErr) {
            console.error("Chat notification error (non-fatal):", notifErr);
        }

        res.json({ success: true, message: "Message sent" });
    } catch (err) {
        console.error("Content send message error:", err);
        res.status(500).json({ error: err.message });
    }
}

exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const [messages] = await pool.query(`
            SELECT 
                m.id,
                m.message,
                m.sender_id,
                m.sent_at as timestamp,
                u.name AS sender_name,
                u.role AS sender_role
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.chat_id = ?
            ORDER BY m.sent_at ASC
        `, [chatId]);

        // Also fetch chat details to know who is talking to whom (optional but good for UI context)
        const [chatDetails] = await pool.query(`
            SELECT 
                c.*, 
                p.title as property_title,
                p.price as property_price,
                pi.image_url as property_image,
                i.status as inquiry_status,
                i.builder_id
            FROM chats c
            LEFT JOIN properties p ON c.property_id = p.id
            LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_primary = TRUE
            LEFT JOIN inquiries i ON c.inquiry_id = i.id
            WHERE c.id = ?
        `, [chatId]);

        res.json({
            success: true,
            messages: messages,
            chatContext: chatDetails[0] || {}
        });
    } catch (err) {
        console.error("Get messages error:", err);
        res.status(500).json({ error: err.message });
    }
}

exports.getAllChats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [chats] = await pool.query(`
      SELECT 
        c.id AS chat_id,
        p.title AS property_title,
        p.price AS property_price,
        u.name AS other_user_name,
        m.message AS last_message,
        m.sent_at AS timestamp
      FROM chats c

      -- Get last message reliably using max ID
      LEFT JOIN (
        SELECT m1.*
        FROM messages m1
        JOIN (
          SELECT chat_id, MAX(id) AS max_id
          FROM messages
          GROUP BY chat_id
        ) m2 ON m1.id = m2.max_id
      ) m ON m.chat_id = c.id

      -- Property
      LEFT JOIN properties p ON c.property_id = p.id

      -- Get other user
      LEFT JOIN users u 
        ON (u.id = c.user1_id AND c.user2_id = ?) 
        OR (u.id = c.user2_id AND c.user1_id = ?)

      WHERE c.user1_id = ? OR c.user2_id = ?

      ORDER BY m.sent_at DESC
    `, [userId, userId, userId, userId]);

        res.json(chats);

    } catch (err) {
        console.error("Get chats error:", err);
        res.status(500).json({ error: err.message });
    }
};
