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