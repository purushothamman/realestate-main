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

        // Format properties for frontend with proper field names
        const formattedProperties = properties.map(p => ({
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
            image: p.image_url,
            images: p.image_url ? [p.image_url] : [],
            // Temporary fields
            progress: p.status === 'sold' ? 100 : (p.status === 'active' ? 50 : 0),
            deadline: new Date(p.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            views: p.view_count || 0,
            inquiries: p.inquiry_count || 0
        }));

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

