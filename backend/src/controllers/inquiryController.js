const pool = require('../config/db');

// Create Inquiry
exports.createInquiry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { property_id, initial_message } = req.body;

        // Validate inputs
        if (!property_id) {
            return res.status(400).json({ success: false, message: 'Property ID is required' });
        }

        // Get property and builder info
        const [property] = await pool.query(
            'SELECT id, title, uploaded_by FROM properties WHERE id = ?',
            [property_id]
        );

        if (!property || property.length === 0) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const builderId = property[0].uploaded_by;

        // Check if user already has a pending inquiry for this property
        const [existingInquiry] = await pool.query(
            'SELECT id FROM inquiries WHERE property_id = ? AND user_id = ? AND status IN ("pending", "accepted")',
            [property_id, userId]
        );

        if (existingInquiry && existingInquiry.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active inquiry for this property'
            });
        }

        // Create inquiry
        const [result] = await pool.query(
            'INSERT INTO inquiries (property_id, user_id, builder_id, initial_message, status) VALUES (?, ?, ?, ?, "pending")',
            [property_id, userId, builderId, initial_message || 'I am interested in this property']
        );

        const inquiryId = result.insertId;

        // Create chat room for this inquiry
        const [chatResult] = await pool.query(
            'INSERT INTO chats (user1_id, user2_id, inquiry_id, property_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, builderId, inquiryId, property_id]
        );

        const chatId = chatResult.insertId;

        // Send initial message to chat
        if (initial_message) {
            await pool.query(
                'INSERT INTO messages (chat_id, sender_id, message, sent_at) VALUES (?, ?, ?, NOW())',
                [chatId, userId, initial_message]
            );
        }

        res.json({
            success: true,
            message: 'Inquiry created successfully',
            inquiry_id: inquiryId,
            chat_id: chatId
        });

    } catch (error) {
        console.error('Create inquiry error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Builder Inquiries
exports.getBuilderInquiries = async (req, res) => {
    try {
        const builderId = req.user.id;
        const { status } = req.query;

        let query = `
      SELECT 
        i.id,
        i.property_id,
        i.status,
        i.initial_message,
        i.created_at,
        i.updated_at,
        p.title as property_title,
        p.city as property_city,
        p.price as property_price,
        JSON_ARRAYAGG(pi.image_url) as property_images,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        MAX(c.id) as chat_id
      FROM inquiries i
      JOIN properties p ON i.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      JOIN users u ON i.user_id = u.id
      LEFT JOIN chats c ON i.id = c.inquiry_id
      WHERE i.builder_id = ?
    `;

        const params = [builderId];

        if (status) {
            query += ' AND i.status = ?';
            params.push(status);
        }

        query += ' GROUP BY i.id ORDER BY i.created_at DESC';

        const [inquiries] = await pool.query(query, params);

        // Parse JSON aggregated images
        const formattedInquiries = inquiries.map(inquiry => ({
            ...inquiry,
            property_images: inquiry.property_images ? JSON.parse(inquiry.property_images).filter(img => img !== null) : []
        }));

        res.json({
            success: true,
            inquiries: formattedInquiries
        });

    } catch (error) {
        console.error('Get builder inquiries error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User Inquiries
exports.getUserInquiries = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
      SELECT 
        i.id,
        i.property_id,
        i.status,
        i.initial_message,
        i.rejection_reason,
        i.created_at,
        i.updated_at,
        p.title as property_title,
        p.city as property_city,
        p.price as property_price,
        JSON_ARRAYAGG(pi.image_url) as property_images,
        b.id as builder_id,
        b.name as builder_name,
        b.email as builder_email,
        c.id as chat_id
      FROM inquiries i
      JOIN properties p ON i.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      JOIN users b ON i.builder_id = b.id
      LEFT JOIN chats c ON i.id = c.inquiry_id
      WHERE i.user_id = ?
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `;

        const [inquiries] = await pool.query(query, [userId]);

        // Parse JSON aggregated images
        const formattedInquiries = inquiries.map(inquiry => ({
            ...inquiry,
            property_images: inquiry.property_images ? JSON.parse(inquiry.property_images).filter(img => img !== null) : []
        }));

        res.json({
            success: true,
            inquiries: formattedInquiries
        });

    } catch (error) {
        console.error('Get user inquiries error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Accept Inquiry
exports.acceptInquiry = async (req, res) => {
    try {
        const builderId = req.user.id;
        const inquiryId = req.params.id;

        // Verify builder owns this inquiry
        const [inquiry] = await pool.query(
            'SELECT * FROM inquiries WHERE id = ? AND builder_id = ?',
            [inquiryId, builderId]
        );

        if (!inquiry || inquiry.length === 0) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        if (inquiry[0].status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Inquiry is not pending' });
        }

        // Update inquiry status
        await pool.query(
            'UPDATE inquiries SET status = "accepted", updated_at = NOW() WHERE id = ?',
            [inquiryId]
        );

        // Get user info to send notification
        const [user] = await pool.query('SELECT name, email FROM users WHERE id = ?', [inquiry[0].user_id]);

        res.json({
            success: true,
            message: 'Inquiry accepted successfully',
            user_name: user[0]?.name
        });

    } catch (error) {
        console.error('Accept inquiry error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject Inquiry
exports.rejectInquiry = async (req, res) => {
    try {
        const builderId = req.user.id;
        const inquiryId = req.params.id;
        const { rejection_reason } = req.body;

        // Verify builder owns this inquiry
        const [inquiry] = await pool.query(
            'SELECT * FROM inquiries WHERE id = ? AND builder_id = ?',
            [inquiryId, builderId]
        );

        if (!inquiry || inquiry.length === 0) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        if (inquiry[0].status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Inquiry is not pending' });
        }

        // Update inquiry status
        await pool.query(
            'UPDATE inquiries SET status = "rejected", rejection_reason = ?, updated_at = NOW() WHERE id = ?',
            [rejection_reason, inquiryId]
        );

        res.json({
            success: true,
            message: 'Inquiry rejected'
        });

    } catch (error) {
        console.error('Reject inquiry error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Close Deal
exports.closeDeal = async (req, res) => {
    try {
        const builderId = req.user.id;
        const inquiryId = req.params.id;

        // Verify builder owns this inquiry and it's accepted
        const [inquiry] = await pool.query(
            'SELECT * FROM inquiries WHERE id = ? AND builder_id = ?',
            [inquiryId, builderId]
        );

        if (!inquiry || inquiry.length === 0) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        if (inquiry[0].status !== 'accepted') {
            return res.status(400).json({ success: false, message: 'Can only close accepted inquiries' });
        }

        // Update inquiry status to deal_closed
        await pool.query(
            'UPDATE inquiries SET status = "deal_closed", updated_at = NOW() WHERE id = ?',
            [inquiryId]
        );

        // Update property status to sold
        await pool.query(
            'UPDATE properties SET status = "sold", updated_at = NOW() WHERE id = ?',
            [inquiry[0].property_id]
        );

        res.json({
            success: true,
            message: 'Deal closed successfully! Property marked as sold.'
        });

    } catch (error) {
        console.error('Close deal error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
