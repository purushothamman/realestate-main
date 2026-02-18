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

        // Get all properties for this builder
        const [properties] = await pool.query(
            `SELECT 
                p.id,
                p.title,
                p.description,
                p.price,
                p.address,
                p.city,
                p.state,
                p.area_sqft,
                p.bedrooms,
                p.bathrooms,
                p.status,
                p.created_at
             FROM properties p
             WHERE p.uploaded_by = ?
             ORDER BY p.created_at DESC`,
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
            image: imageUrls[0] || null,
            images: imageUrls,
            agent,
            // Temporary fields
            progress: 100,
            deadline: new Date(p.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            views: 0,
            inquiries: 0
        });
        });

        res.json({
            success: true,
            stats: {
                totalListings: totalRows[0].total,
                activeProjects: activeRows[0].active,
                pendingInquiries: 0, // TODO: implement inquiries count
                upcomingDeadlines: 0 // TODO: implement deadlines count
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

