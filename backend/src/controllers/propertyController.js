const pool = require("../config/db");

// create property
exports.createProperty = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            purpose,
            property_type,
            area_sqft,
            bedrooms,
            bathrooms,
            address,
            city,
            state,
            pincode
        } = req.body;
        
        const ownerType = req.user.role;  // buyer | builder | agent | admin 
        const ownerId = req.user.id;

        const [result] = await pool.query(
            `INSERT INTO properties
            (title, description, price, purpose, property_type, area_sqft, bedrooms, bathrooms, 
             address, city, state, pincode, owner_type, owner_id, verification_status, status, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'inactive', true)`,
            [title, description, price, purpose, property_type, area_sqft, bedrooms, bathrooms,
             address, city, state, pincode, ownerType, ownerId]
        );

        res.status(201).json({
            message: "Property created. Pending verification",
            property_id: result.insertId
        });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// get verified properties for admin
exports.getVerifiedProperties = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT property_id, title, price, city, state, verification_status
             FROM properties
             WHERE status = 'active' AND verification_status = 'verified'`
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// get all properties
exports.getAllProperties = async (req, res) => {
    try {
        const { limit = 50, offset = 0, purpose, property_type, minPrice, maxPrice, city, state } = req.query;
        
        let query = `
            SELECT 
                p.*,
                u.name as owner_name,
                u.email as owner_email,
                u.phone as owner_phone,
                COUNT(DISTINCT f.id) as favorite_count,
                COUNT(DISTINCT v.id) as view_count,
                EXISTS(
                    SELECT 1 FROM favorites 
                    WHERE property_id = p.property_id AND user_id = ?
                ) as is_favorited
            FROM properties p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN favorites f ON p.property_id = f.property_id
            LEFT JOIN property_views v ON p.property_id = v.property_id
            WHERE p.is_active = TRUE AND p.status = 'active' AND p.verification_status = 'verified'
        `;

        const params = [req.user?.id || 0];

        if (purpose) {
            query += ` AND p.purpose = ?`;
            params.push(purpose);
        }

        if (property_type) {
            query += ` AND p.property_type = ?`;
            params.push(property_type);
        }

        if (minPrice) {
            query += ` AND p.price >= ?`;
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ` AND p.price <= ?`;
            params.push(maxPrice);
        }

        if (city) {
            query += ` AND p.city = ?`;
            params.push(city);
        }

        if (state) {
            query += ` AND p.state = ?`;
            params.push(state);
        }

        query += ` 
            GROUP BY p.property_id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), parseInt(offset));

        const [properties] = await pool.query(query, params);
        
        const transformedProperties = properties.map(prop => ({
            id: prop.property_id,
            title: prop.title,
            price: prop.price,
            purpose: prop.purpose,
            propertyType: prop.property_type,
            address: prop.address,
            city: prop.city,
            state: prop.state,
            pincode: prop.pincode,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: `${prop.area_sqft} sq ft`,
            sqft: prop.area_sqft,
            description: prop.description,
            status: prop.status,
            verificationStatus: prop.verification_status,
            isFavorited: Boolean(prop.is_favorited),
            viewCount: prop.view_count,
            favoriteCount: prop.favorite_count,
            owner: {
                name: prop.owner_name,
                email: prop.owner_email,
                phone: prop.owner_phone
            }
        }));

        res.json({
            success: true,
            properties: transformedProperties,
            total: transformedProperties.length,
        });

    } catch (err) {
        console.error("Error fetching properties:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch properties",
            error: err.message 
        });
    }
};

// get single property
exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const [properties] = await pool.query(
            `SELECT 
                p.*,
                u.name as owner_name,
                u.email as owner_email,
                u.phone as owner_phone,
                u.profile_image as owner_image,
                EXISTS(
                    SELECT 1 FROM favorites 
                    WHERE property_id = p.property_id AND user_id = ?
                ) as is_favorited
            FROM properties p
            LEFT JOIN users u ON p.owner_id = u.id
            WHERE p.property_id = ? AND p.is_active = TRUE`,
            [req.user?.id || 0, id]
        );

        if (properties.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Property not found" 
            });
        }

        const property = properties[0];

        res.json({
            success: true,
            property: {
                id: property.property_id,
                title: property.title,
                price: property.price,
                purpose: property.purpose,
                propertyType: property.property_type,
                address: property.address,
                city: property.city,
                state: property.state,
                pincode: property.pincode,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                area: `${property.area_sqft} sq ft`,
                sqft: property.area_sqft,
                description: property.description,
                status: property.status,
                verificationStatus: property.verification_status,
                isFavorited: Boolean(property.is_favorited),
                createdAt: property.created_at,
                updatedAt: property.updated_at,
                owner: {
                    name: property.owner_name,
                    email: property.owner_email,
                    phone: property.owner_phone,
                    image: property.owner_image,
                    type: property.owner_type
                },
            },
        });

    } catch (err) {
        console.error("Error fetching property:", err);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch property",
            error: err.message 
        });
    }
};

// search properties
exports.searchProperties = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Search query is required" 
            });
        }

        const searchTerm = `%${q}%`;

        const [properties] = await pool.query(
            `SELECT 
                p.*,
                EXISTS(
                    SELECT 1 FROM favorites 
                    WHERE property_id = p.property_id AND user_id = ?
                ) as is_favorited
            FROM properties p
            WHERE p.is_active = TRUE AND p.status = 'active' AND p.verification_status = 'verified'
            AND (
                p.title LIKE ? OR
                p.description LIKE ? OR
                p.city LIKE ? OR
                p.state LIKE ? OR
                p.address LIKE ?
            )
            ORDER BY p.created_at DESC
            LIMIT 50`,
            [req.user?.id || 0, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
        );

        const transformedProperties = properties.map(prop => ({
            id: prop.property_id,
            title: prop.title,
            price: prop.price,
            purpose: prop.purpose,
            propertyType: prop.property_type,
            address: prop.address,
            city: prop.city,
            state: prop.state,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: `${prop.area_sqft} sq ft`,
            isFavorited: Boolean(prop.is_favorited),
        }));

        res.json({
            success: true,
            properties: transformedProperties,
            total: transformedProperties.length,
        });

    } catch (err) {
        console.error("Error searching properties:", err);
        res.status(500).json({ 
            success: false,
            message: "Search failed",
            error: err.message 
        });
    }
};

// const pool = require("../config/db")

// // create property
// exports.createProperty = async (req,res) => {
//     try {
//         const {title, description, price, location }  = req.body
        
//         const ownerType = req.user.role  // buyer | builder | agent | admin 
//         const ownerId = req.user.id

//         const [result] = await pool.query(

//             `INSERT INTO properties
//             (title, description, price, location, owner_type, owner_id, is_verified)
//             VALUES (?,?,?,?,?,?, false)
//             `,
//             [title, description, price, location, ownerType, ownerId]

//         )

//         res.status(201).json({
//             message: "Property created. Pending verification",
//             property_id: result.insertId
//         })
        
//     } catch (err) {
//         res.status(500).json({error:err.message})
        
//     }
    
// }

// // temporary  for admin document verfication 
// exports.getVerifiedProperties = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT property_id, title, price, location
//        FROM properties
//        WHERE status = 'active'`
//     );

//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// // get all properties
// exports.getAllProperties = async (req,res) => {
//   try {
//     const { limit = 50, offset = 0, type, minPrice, maxPrice } = req.query;
    
//     let query = `
//             SELECT 
//                 p.*,
//                 u.name as owner_name,
//                 u.email as owner_email,
//                 u.phone as owner_phone,
//                 COUNT(DISTINCT f.id) as favorite_count,
//                 COUNT(DISTINCT v.id) as view_count,
//                 EXISTS(
//                     SELECT 1 FROM favorites 
//                     WHERE property_id = p.id AND user_id = ?
//                 ) as is_favorited
//             FROM properties p
//             LEFT JOIN users u ON p.owner_id = u.id
//             LEFT JOIN favorites f ON p.id = f.property_id
//             LEFT JOIN property_views v ON p.id = v.property_id
//             WHERE p.is_active = TRUE
//         `;

//         if (type) {
//             query += ` AND p.listing_type = ?`;
//             params.push(type);
//         }

//         if (minPrice) {
//             query += ` AND p.price >= ?`;
//             params.push(minPrice);
//         }

//         if (maxPrice) {
//             query += ` AND p.price <= ?`;
//             params.push(maxPrice);
//         }

//         query += ` 
//             GROUP BY p.id
//             ORDER BY p.created_at DESC
//             LIMIT ? OFFSET ?
//         `;
//         params.push(parseInt(limit), parseInt(offset));

//         const [properties] = await pool.query(query, params);
//         const transformedProperties = properties.map(prop => ({
//             id: prop.id,
//             title: prop.title,
//             price: prop.price,
//             location: prop.location,
//             address: prop.address,
//             image: prop.main_image,
//             imageUrl: prop.main_image,
//             bedrooms: prop.bedrooms,
//             bathrooms: prop.bathrooms,
//             area: `${prop.area_sqft} sq ft`,
//             sqft: `${prop.area_sqft} sq ft`,
//             type: prop.listing_type,
//             listingType: prop.listing_type,
//             description: prop.description,
//             isFavorited: Boolean(prop.is_favorited),
//             viewCount: prop.view_count,
//             favoriteCount: prop.favorite_count,
//         }));

//         res.json({
//             success: true,
//             properties: transformedProperties,
//             total: transformedProperties.length,
//         });

//     } catch (err) {
//         console.error("Error fetching properties:", err);
//         res.status(500).json({ 
//             success: false,
//             message: "Failed to fetch properties",
//             error: err.message 
//         });
//     }
// };



// // get single property
// exports.getPropertyById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const [properties] = await pool.query(
//             `SELECT 
//                 p.*,
//                 u.name as owner_name,
//                 u.email as owner_email,
//                 u.phone as owner_phone,
//                 u.profile_image as owner_image,
//                 EXISTS(
//                     SELECT 1 FROM favorites 
//                     WHERE property_id = p.id AND user_id = ?
//                 ) as is_favorited
//             FROM properties p
//             LEFT JOIN users u ON p.owner_id = u.id
//             WHERE p.id = ? AND p.is_active = TRUE`,
//             [req.user.id, id]
//         );

//         if (properties.length === 0) {
//             return res.status(404).json({ 
//                 success: false,
//                 message: "Property not found" 
//             });
//         }

//         const property = properties[0];

//         res.json({
//             success: true,
//             property: {
//                 id: property.id,
//                 title: property.title,
//                 price: property.price,
//                 location: property.location,
//                 address: property.address,
//                 image: property.main_image,
//                 bedrooms: property.bedrooms,
//                 bathrooms: property.bathrooms,
//                 area: `${property.area_sqft} sq ft`,
//                 type: property.listing_type,
//                 description: property.description,
//                 isFavorited: Boolean(property.is_favorited),
//                 owner: {
//                     name: property.owner_name,
//                     email: property.owner_email,
//                     phone: property.owner_phone,
//                     image: property.owner_image,
//                 },
//             },
//         });

//     } catch (err) {
//         console.error("Error fetching property:", err);
//         res.status(500).json({ 
//             success: false,
//             message: "Failed to fetch property",
//             error: err.message 
//         });
//     }
// };


// // search properties
// exports.searchProperties = async (req, res) => {
//     try {
//         const { q } = req.query;

//         if (!q || q.trim().length === 0) {
//             return res.status(400).json({ 
//                 success: false,
//                 message: "Search query is required" 
//             });
//         }

//         const searchTerm = `%${q}%`;

//         const [properties] = await pool.query(
//             `SELECT 
//                 p.*,
//                 EXISTS(
//                     SELECT 1 FROM favorites 
//                     WHERE property_id = p.id AND user_id = ?
//                 ) as is_favorited
//             FROM properties p
//             WHERE p.is_active = TRUE
//             AND (
//                 p.title LIKE ? OR
//                 p.description LIKE ? OR
//                 p.location LIKE ? OR
//                 p.address LIKE ?
//             )
//             ORDER BY p.created_at DESC
//             LIMIT 50`,
//             [req.user.id, searchTerm, searchTerm, searchTerm, searchTerm]
//         );

//         const transformedProperties = properties.map(prop => ({
//             id: prop.id,
//             title: prop.title,
//             price: prop.price,
//             location: prop.location,
//             image: prop.main_image,
//             bedrooms: prop.bedrooms,
//             bathrooms: prop.bathrooms,
//             area: `${prop.area_sqft} sq ft`,
//             type: prop.listing_type,
//             isFavorited: Boolean(prop.is_favorited),
//         }));

//         res.json({
//             success: true,
//             properties: transformedProperties,
//             total: transformedProperties.length,
//         });

//     } catch (err) {
//         console.error("Error searching properties:", err);
//         res.status(500).json({ 
//             success: false,
//             message: "Search failed",
//             error: err.message 
//         });
//     }
// };


// // exports.getVerifiedProperties = async (req,res) => {
// //     try {
// //         const [rows] = await pool.query(
// //             `SELECT property_id, title, price, location
// //             FROM properties
// //             WHERE is_verified = true AND status = 'active'`
// //         )

// //         res.json(rows)
        
// //     } catch (err) {
// //         res.status(500).json({error:err.message})
        
// //     }
    
// // }

