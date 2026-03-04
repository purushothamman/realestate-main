const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

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
            (title, description, price, listing_type, property_type_id, area_sqft, bedrooms, bathrooms, 
             address, city, state, pincode, uploaded_by_role, uploaded_by, is_verified, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, 'active')`,
            [title, description, price, purpose || listing_type, property_type, area_sqft, bedrooms, bathrooms,
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
            `SELECT id, title, price, city, state, is_verified
             FROM properties
             WHERE status IN ('active', 'sold', 'rented') AND is_verified = TRUE`
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add Property (with transaction for multi-table insertion)
exports.addProperty = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            title,
            description,
            price,
            listing_type,
            property_type_id,
            builder_id, // required when agent adds property (on behalf of builder)
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            area_sqft,
            bedrooms,
            bathrooms,
            images = [],
            features = [],
            documents = {}
        } = req.body;

        // Validation
        if (!title || !description || !price || !listing_type || !property_type_id || !address || !city || !state) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, description, price, listing_type, property_type_id, address, city, state'
            });
        }

        // Get authenticated user
        const uploaded_by = req.user?.id;
        const uploaded_by_role = req.user?.role;

        if (!uploaded_by || !uploaded_by_role) {
            await connection.rollback();
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Verify user role is builder or agent
        if (uploaded_by_role !== 'builder' && uploaded_by_role !== 'agent') {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'Only builders and agents can add properties'
            });
        }

        // Agent flow: property must be created as BLOCKED and linked to a builder
        // We treat the selected builder as the property "owner" (uploaded_by), so the existing
        // builder dashboards / inquiry logic that expects uploaded_by=builder continues to work.
        let propertyOwnerId = uploaded_by;
        let propertyOwnerRole = uploaded_by_role;
        let propertyStatus = 'active';
        let agentIdForRequest = null;
        let builderIdForRequest = null;

        if (uploaded_by_role === 'agent') {
            if (!builder_id) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'builder_id is required when an agent adds a property'
                });
            }

            const autoForHiringBuilder = !!req.body.auto_for_hiring_builder;

            // Validate builder exists and is a builder
            const [builderRows] = await connection.query(
                "SELECT id FROM users WHERE id = ? AND role = 'builder' AND is_blocked = FALSE",
                [builder_id]
            );

            if (!builderRows || builderRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Selected builder not found or not eligible'
                });
            }

            propertyOwnerId = builder_id;
            propertyOwnerRole = 'builder';

            // If this builder has formally hired the agent, and the flag is set,
            // auto-approve: property is active immediately, no manual approval step.
            if (autoForHiringBuilder) {
                const [relRows] = await connection.query(
                    "SELECT id FROM builder_agents WHERE builder_id = ? AND agent_id = ?",
                    [builder_id, uploaded_by]
                );

                if (relRows && relRows.length > 0) {
                    propertyStatus = 'active';
                    agentIdForRequest = uploaded_by;
                    builderIdForRequest = builder_id;
                } else {
                    // Fallback to normal approval flow if not actually hired
                    propertyStatus = 'blocked';
                    agentIdForRequest = uploaded_by;
                    builderIdForRequest = builder_id;
                }
            } else {
                // Original behaviour: needs builder approval
                propertyStatus = 'blocked';
                agentIdForRequest = uploaded_by;
                builderIdForRequest = builder_id;
            }
        }

        // 1. Insert into properties table
        const [propertyResult] = await connection.query(
            `INSERT INTO properties 
       (title, description, price, listing_type, property_type_id, address, city, state, pincode, latitude, longitude, area_sqft, bedrooms, bathrooms, uploaded_by, uploaded_by_role, is_verified, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)`,
            [
                title,
                description,
                price,
                listing_type,
                property_type_id,
                address,
                city,
                state,
                pincode || null,
                latitude || null,
                longitude || null,
                area_sqft || null,
                bedrooms || null,
                bathrooms || null,
                propertyOwnerId,
                propertyOwnerRole,
                propertyStatus
            ]
        );

        const property_id = propertyResult.insertId;

        // 1b. If agent added property, create request record for builder
        let request_id = null;
        if (uploaded_by_role === 'agent') {
            if (agentIdForRequest && builderIdForRequest) {
                const initialStatus = propertyStatus === 'active' ? 'approved' : 'pending';
                const [requestResult] = await connection.query(
                    `INSERT INTO property_requests (property_id, agent_id, builder_id, status)
                     VALUES (?, ?, ?, ?)`,
                    [property_id, agentIdForRequest, builderIdForRequest, initialStatus]
                );
                request_id = requestResult.insertId;

                // Notify the builder about the pending submission
                if (initialStatus === 'pending' && builderIdForRequest) {
                    const [agentRows] = await connection.query(
                        'SELECT name FROM users WHERE id = ?',
                        [agentIdForRequest]
                    );
                    const agentName = agentRows?.[0]?.name || 'An agent';
                    await connection.query(
                        `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
                         VALUES (?, 'property_submission', 'New property submission', ?, 'property_request', ?)`,
                        [builderIdForRequest, `${agentName} submitted "${title}" for your approval.`, request_id]
                    );
                }
                // Notify the builder about the auto-approved submission (Direct for My Builder)
                if (initialStatus === 'approved' && builderIdForRequest) {
                    await connection.query(
                        `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
                         VALUES (?, 'property_upload', 'Property uploaded by agent', 'Your agent has uploaded a new property on your behalf.', 'property_request', ?)`,
                        [builderIdForRequest, request_id]
                    );
                }
            }
        }

        // 2. Insert property images and move files to structured storage
        if (images && images.length > 0) {
            // Fetch builder email for folder structure
            const [ownerRows] = await connection.query(
                "SELECT email FROM users WHERE id = ?",
                [propertyOwnerId]
            );
            const ownerEmail = ownerRows[0]?.email || 'unknown';

            // Format safe folder names
            const safeEmail = ownerEmail.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            const safeTitle = title.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

            const builderFolderName = `${propertyOwnerId}_${safeEmail}`;
            const propertyFolderName = `${property_id}_${safeTitle}`;

            const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
            const imagesRsDir = path.join(__dirname, '..', '..', 'images_rs', builderFolderName, propertyFolderName);

            // Create target directory
            try {
                fs.mkdirSync(imagesRsDir, { recursive: true });
            } catch (err) {
                console.warn('Could not create images_rs directory:', imagesRsDir, err.message);
            }

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                let finalUrl = image.image_url || image.url;

                console.log(`[images_rs] Processing image ${i}: finalUrl = ${finalUrl}`);

                // If the URL points to our temp uploads directory, move it
                if (finalUrl && finalUrl.includes('/uploads/')) {
                    const filename = finalUrl.split('/').pop();
                    const sourcePath = path.join(uploadsDir, filename);
                    const destPath = path.join(imagesRsDir, filename);

                    console.log(`[images_rs] filename=${filename}`);
                    console.log(`[images_rs] sourcePath=${sourcePath}`);
                    console.log(`[images_rs] destPath=${destPath}`);
                    console.log(`[images_rs] source exists? ${fs.existsSync(sourcePath)}`);

                    try {
                        if (fs.existsSync(sourcePath)) {
                            // Copy then unlink to ensure we don't lose the file if something crashes mid-move
                            fs.copyFileSync(sourcePath, destPath);
                            fs.unlinkSync(sourcePath);

                            // Update the URL to point to the new structured path
                            finalUrl = finalUrl.replace('/uploads/', `/images_rs/${builderFolderName}/${propertyFolderName}/`);
                            console.log(`[images_rs] ✅ Moved successfully. New URL: ${finalUrl}`);
                        } else {
                            console.error(`[images_rs] ❌ Source file NOT found: ${sourcePath}`);
                            // List what IS in uploadsDir for debugging
                            try {
                                const filesInUploads = fs.readdirSync(uploadsDir).filter(f => f.startsWith('property-')).slice(0, 5);
                                console.log(`[images_rs] Sample files in uploads/: ${filesInUploads.join(', ')}`);
                            } catch (e) { }
                        }
                    } catch (err) {
                        console.error(`[images_rs] Failed to move image ${filename}:`, err.message);
                    }
                } else {
                    console.log(`[images_rs] URL does not contain /uploads/, skipping move`);
                }

                await connection.query(
                    `INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
                     VALUES (?, ?, ?, ?)`,
                    [property_id, finalUrl, i === 0, i]
                );
            }
        }

        // 3. Insert property features
        if (features && features.length > 0) {
            for (const feature of features) {
                if (feature.name) {
                    await connection.query(
                        `INSERT INTO property_features (property_id, feature_name, feature_value)
             VALUES (?, ?, ?)`,
                        [property_id, feature.name, feature.value || null]
                    );
                }
            }
        }

        // 4. Insert property documents
        if (documents && Object.keys(documents).length > 0) {
            await connection.query(
                `INSERT INTO property_documents (property_id, government_approval, property_code, supporting_document_url)
         VALUES (?, ?, ?, ?)`,
                [
                    property_id,
                    documents.government_approval || null,
                    documents.property_code || null,
                    documents.supporting_document_url || null
                ]
            );
        }

        // Commit transaction
        await connection.commit();

        res.status(201).json({
            success: true,
            message: uploaded_by_role === 'agent'
                ? (propertyStatus === 'active'
                    ? 'Property added successfully for your builder'
                    : 'Property saved and sent to builder for approval')
                : 'Property added successfully',
            property_id,
            request_id,
            data: {
                id: property_id,
                title,
                price,
                city,
                state,
                status: propertyStatus,
                is_verified: false
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Add property error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add property',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get properties uploaded by logged-in agent/builder
exports.getMyProperties = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId || !userRole) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Fetch properties uploaded by this user with all images
        // For agents: also include properties they submitted via property_requests that are approved (active)
        // For builders: only properties they uploaded directly
        let query;
        let params;

        if (userRole === 'agent') {
            query = `SELECT 
                p.id,
                p.uploaded_by,
                p.title,
                p.description,
                p.price,
                p.listing_type,
                p.property_type_id,
                p.address,
                p.city,
                p.state,
                p.pincode,
                p.area_sqft,
                p.bedrooms,
                p.bathrooms,
                p.status,
                p.is_verified,
                p.created_at,
                p.updated_at,
                pi.image_url,
                pi.is_primary
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            LEFT JOIN property_requests pr ON p.id = pr.property_id AND pr.agent_id = ?
            WHERE (
                (p.uploaded_by = ? AND p.uploaded_by_role = ?)
                OR 
                (pr.agent_id = ? AND pr.status = 'approved' AND p.status IN ('active', 'sold', 'rented'))
            )
            ORDER BY p.created_at DESC, pi.sort_order ASC`;
            params = [userId, userId, userRole, userId];
        } else {
            // Builder: only properties they uploaded directly
            query = `SELECT 
                p.id,
                p.uploaded_by,
                p.title,
                p.description,
                p.price,
                p.listing_type,
                p.property_type_id,
                p.address,
                p.city,
                p.state,
                p.pincode,
                p.area_sqft,
                p.bedrooms,
                p.bathrooms,
                p.status,
                p.is_verified,
                p.created_at,
                p.updated_at,
                pi.image_url,
                pi.is_primary
            FROM properties p
            LEFT JOIN property_images pi ON p.id = pi.property_id
            WHERE p.uploaded_by = ? AND p.uploaded_by_role = ?
            ORDER BY p.created_at DESC, pi.sort_order ASC`;
            params = [userId, userRole];
        }

        const [rows] = await pool.query(query, params);

        // Group images by property
        const propertiesMap = new Map();

        rows.forEach(row => {
            if (!propertiesMap.has(row.id)) {
                propertiesMap.set(row.id, {
                    id: row.id,
                    uploaded_by: row.uploaded_by,
                    title: row.title,
                    description: row.description,
                    price: row.price,
                    listing_type: row.listing_type,
                    listingType: row.listing_type,
                    property_type_id: row.property_type_id,
                    address: row.address,
                    city: row.city,
                    state: row.state,
                    pincode: row.pincode,
                    area_sqft: row.area_sqft,
                    areaSqft: row.area_sqft,
                    bedrooms: row.bedrooms,
                    bathrooms: row.bathrooms,
                    status: row.status,
                    isVerified: row.is_verified,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                    images: []
                });
            }

            if (row.image_url) {
                const property = propertiesMap.get(row.id);
                property.images.push({
                    url: row.image_url,
                    image_url: row.image_url,
                    isPrimary: row.is_primary === 1
                });
            }
        });



        // Transform to array and set primary image
        const transformedProperties = Array.from(propertiesMap.values()).map(prop => ({
            ...prop,
            primaryImage: prop.images.find(img => img.isPrimary)?.url ||
                prop.images[0]?.url ||
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
            imageCount: prop.images.length
        }));

        res.json({
            success: true,
            properties: transformedProperties,
            total: transformedProperties.length
        });

    } catch (error) {
        console.error('Get my properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: error.message
        });
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
                (SELECT COUNT(*) FROM favorites f WHERE f.property_id = p.id) as favorite_count,
                (SELECT COUNT(*) FROM property_views v WHERE v.property_id = p.id) as view_count,
                EXISTS(
                    SELECT 1 FROM favorites f2
                    WHERE f2.property_id = p.id AND f2.user_id = ?
                ) as is_favorited,
                (
                    SELECT JSON_ARRAYAGG(pi2.image_url)
                    FROM property_images pi2
                    WHERE pi2.property_id = p.id
                    ORDER BY pi2.is_primary DESC, pi2.sort_order ASC
                ) as images_json,
                (
                    SELECT pi3.image_url
                    FROM property_images pi3
                    WHERE pi3.property_id = p.id
                    ORDER BY pi3.is_primary DESC, pi3.sort_order ASC
                    LIMIT 1
                ) as primary_image_url,
                (
                    SELECT JSON_ARRAYAGG(JSON_OBJECT('name', pf.feature_name, 'value', pf.feature_value))
                    FROM property_features pf
                    WHERE pf.property_id = p.id
                ) as features_json
            FROM properties p
            LEFT JOIN users u ON p.uploaded_by = u.id
            WHERE p.status IN ('active', 'sold', 'rented')
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
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), parseInt(offset));

        const [properties] = await pool.query(query, params);

        const transformedProperties = properties.map(prop => {
            // Parse images JSON array from subquery
            let imagesArray = [];
            try {
                const raw = prop.images_json;
                if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (Array.isArray(parsed)) {
                        imagesArray = parsed.filter(u => u !== null);
                    }
                }
            } catch (e) { /* ignore parse errors */ }

            // Parse features JSON array from subquery
            let featuresArray = [];
            try {
                const raw = prop.features_json;
                if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (Array.isArray(parsed)) {
                        featuresArray = parsed.filter(f => f && f.name !== null);
                    }
                }
            } catch (e) { /* ignore parse errors */ }

            const primaryImage = prop.primary_image_url || imagesArray[0] || null;

            return {
                id: prop.id,
                title: prop.title,
                price: prop.price,
                purpose: prop.purpose,
                listing_type: prop.listing_type,
                propertyType: prop.property_type,
                address: prop.address,
                city: prop.city,
                state: prop.state,
                pincode: prop.pincode,
                bedrooms: prop.bedrooms,
                bathrooms: prop.bathrooms,
                area: prop.area_sqft ? `${prop.area_sqft} sq ft` : null,
                area_sqft: prop.area_sqft,
                description: prop.description,
                status: prop.status,
                isVerified: Boolean(prop.is_verified),
                isFavorited: Boolean(prop.is_favorited),
                viewCount: prop.view_count,
                favoriteCount: prop.favorite_count,
                // Single image for list cards
                image: primaryImage,
                imageUrl: primaryImage,
                // Full images array for detail screen
                images: imagesArray,
                // Features / amenities for detail screen
                features: featuresArray,
                owner: {
                    id: prop.uploaded_by,
                    name: prop.owner_name,
                    email: prop.owner_email,
                    phone: prop.owner_phone
                },
            };
        });

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
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const [properties] = await pool.query(
            `SELECT 
        p.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone,
        u.profile_image as owner_image,
        u.role as owner_type,

        EXISTS(
            SELECT 1 FROM favorites 
            WHERE property_id = p.id AND user_id = ?
        ) as is_favorited,

        (
            SELECT JSON_ARRAYAGG(image_url)
            FROM property_images
            WHERE property_id = p.id
        ) as images,

        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT('name', feature_name, 'value', feature_value)
            )
            FROM property_features
            WHERE property_id = p.id
        ) as features

    FROM properties p
    LEFT JOIN users u ON p.uploaded_by = u.id
    WHERE p.id = ?`,
            [req.user?.id || 0, id]
        );

        if (properties.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        const property = properties[0];




        let can_edit = false;

        // Admin can edit
        if (userRole === 'admin') {
            can_edit = true;
        }

        // Direct uploader can edit
        if (!can_edit && userId && String(property.uploaded_by) === String(userId)) {
            can_edit = true;
        }

        // Agent who submitted request can edit
        if (!can_edit && userRole === 'agent' && userId) {
            const [reqRows] = await pool.query(
                `SELECT id FROM property_requests 
         WHERE property_id = ? AND agent_id = ?`,
                [property.id, userId]
            );

            if (reqRows.length > 0) {
                can_edit = true;
            }
        }

        // Parse images and features (handle nulls from left join)
        const parsedImages = property.images ? property.images.filter(img => img !== null) : [];
        const parsedFeatures = property.features ? property.features.filter(f => f.name !== null) : [];

        res.json({
            success: true,
            property: {
                id: property.id,
                title: property.title,
                price: property.price,
                purpose: property.purpose || property.listing_type,
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
                isVerified: Boolean(property.is_verified),
                isFavorited: Boolean(property.is_favorited),
                createdAt: property.created_at,
                updatedAt: property.updated_at,
                images: parsedImages,
                image: parsedImages[0] || null,
                features: parsedFeatures,
                can_edit: can_edit,
                owner: {
                    id: property.uploaded_by,
                    name: property.owner_name,
                    email: property.owner_email,
                    phone: property.owner_phone,
                    image: property.owner_image,
                    type: property.owner_type
                },
                can_edit: can_edit,
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
            WHERE p.status IN ('active', 'sold', 'rented')
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
            uploaded_by: prop.uploaded_by,
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

exports.addPropertyView = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user?.id || null;

        await pool.query(
            "INSERT INTO property_views (user_id, property_id) VALUES (?, ?)",
            [userId, propertyId]
        );

        res.json({ success: true });

    } catch (error) {
        console.error("View error:", error);
        res.status(500).json({ success: false });
    }
};

// GET /properties/cities?search=TEXT
// Returns distinct city names from properties where cities match the search text
exports.getCities = async (req, res) => {
    try {
        const { search = '' } = req.query;

        if (!search || search.trim().length === 0) {
            return res.json({ success: true, cities: [] });
        }

        const searchTerm = `%${search.trim()}%`;

        const [rows] = await pool.query(
            `SELECT DISTINCT city 
             FROM properties 
             WHERE city IS NOT NULL 
               AND city != '' 
               AND city LIKE ? 
               AND status IN ('active', 'sold', 'rented')
             ORDER BY city ASC
             LIMIT 10`,
            [searchTerm]
        );

        const cities = rows.map(r => r.city);

        res.json({ success: true, cities });

    } catch (err) {
        console.error("getCities error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch cities", error: err.message });
    }
};

// GET /properties/search?city=CITY_NAME
// Returns all active properties in a given city with images
exports.searchByCity = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city || city.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'city parameter is required' });
        }

        const [properties] = await pool.query(
            `SELECT 
                p.id,
                p.uploaded_by,
                p.title,
                p.description,
                p.price,
                p.listing_type,
                p.address,
                p.city,
                p.state,
                p.pincode,
                p.area_sqft,
                p.bedrooms,
                p.bathrooms,
                p.status,
                p.is_verified,
                p.created_at,
                (
                    SELECT pi.image_url 
                    FROM property_images pi 
                    WHERE pi.property_id = p.id 
                    ORDER BY pi.is_primary DESC, pi.sort_order ASC 
                    LIMIT 1
                ) as primary_image,
                (
                    SELECT JSON_ARRAYAGG(pi2.image_url)
                    FROM property_images pi2
                    WHERE pi2.property_id = p.id
                    ORDER BY pi2.is_primary DESC, pi2.sort_order ASC
                ) as images_json,
                (
                    SELECT COUNT(*) FROM property_images pi3 WHERE pi3.property_id = p.id
                ) as image_count
             FROM properties p
             WHERE p.city = ? AND p.status IN ('active', 'sold', 'rented')
             ORDER BY p.created_at DESC
             LIMIT 50`,
            [city.trim()]
        );

        const transformed = properties.map(p => {
            let imagesArray = [];
            try {
                const raw = p.images_json;
                if (raw) {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (Array.isArray(parsed)) {
                        imagesArray = parsed.filter(u => u !== null);
                    }
                }
            } catch (e) { /* ignore parse errors */ }

            return {
                id: p.id,
                title: p.title,
                description: p.description,
                price: p.price,
                listing_type: p.listing_type,
                address: p.address,
                city: p.city,
                state: p.state,
                pincode: p.pincode,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                area: p.area_sqft ? `${p.area_sqft} sq ft` : null,
                area_sqft: p.area_sqft,
                isVerified: Boolean(p.is_verified),
                image: p.primary_image || imagesArray[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
                imageUrl: p.primary_image || imagesArray[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
                images: imagesArray,
                imageCount: p.image_count || imagesArray.length || 0,
                uploaded_by: p.uploaded_by,
            };
        });

        res.json({
            success: true,
            properties: transformed,
            total: transformed.length,
            city: city.trim(),
        });

    } catch (err) {
        console.error("searchByCity error:", err);
        res.status(500).json({ success: false, message: "Search failed", error: err.message });
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


// //             WHERE is_verified = true AND status = 'active'`
// //         )

// //         res.json(rows)

// Update Property (builder or agent who owns it)
exports.updateProperty = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const propertyId = req.params.id;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Verify ownership
        const [propRows] = await connection.query(
            `SELECT id, uploaded_by, uploaded_by_role FROM properties WHERE id = ?`,
            [propertyId]
        );
        if (!propRows || propRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const prop = propRows[0];

        // Allow: admin, the direct uploader, or an agent whose role is 'agent' on the property
        let authorized = userRole === 'admin'
            || String(prop.uploaded_by) === String(userId)
            || (userRole === 'agent' && prop.uploaded_by_role === 'agent');

        if (!authorized && userRole === 'agent') {
            // Also check if agent submitted via property_requests
            const [reqRows] = await connection.query(
                `SELECT id FROM property_requests WHERE property_id = ? AND agent_id = ? LIMIT 1`,
                [propertyId, userId]
            );
            if (reqRows && reqRows.length > 0) authorized = true;
        }

        if (!authorized) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Not authorized to edit this property' });
        }

        const {
            title,
            description,
            price,
            listing_type,
            property_type_id,
            address,
            city,
            state,
            pincode,
            area_sqft,
            bedrooms,
            bathrooms,
            features = [],
            images = [],
        } = req.body;

        // Update main property row
        await connection.query(
            `UPDATE properties SET
                title            = COALESCE(?, title),
                description      = COALESCE(?, description),
                price            = COALESCE(?, price),
                listing_type     = COALESCE(?, listing_type),
                property_type_id = COALESCE(?, property_type_id),
                address          = COALESCE(?, address),
                city             = COALESCE(?, city),
                state            = COALESCE(?, state),
                pincode          = COALESCE(?, pincode),
                area_sqft        = COALESCE(?, area_sqft),
                bedrooms         = COALESCE(?, bedrooms),
                bathrooms        = COALESCE(?, bathrooms)
             WHERE id = ?`,
            [title, description, price, listing_type, property_type_id,
                address, city, state, pincode, area_sqft, bedrooms, bathrooms, propertyId]
        );

        // Replace features if provided (even empty array to clear)
        if (Array.isArray(features)) {
            await connection.query(`DELETE FROM property_features WHERE property_id = ?`, [propertyId]);
            if (features.length > 0) {
                const featureRows = features.map(f => [propertyId, f.name, f.value]);
                await connection.query(
                    `INSERT INTO property_features (property_id, feature_name, feature_value) VALUES ?`,
                    [featureRows]
                );
            }
        }

        // Replace images if provided (even empty array to clear)
        if (Array.isArray(images)) {
            // Fetch builder email for folder structure
            const [ownerRows] = await connection.query(
                "SELECT email FROM users WHERE id = ?",
                [prop.uploaded_by]
            );
            const ownerEmail = ownerRows[0]?.email || 'unknown';

            // Format safe folder names
            const safeEmail = ownerEmail.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
            const currentTitle = title || prop.title || 'untitled';
            const safeTitle = currentTitle.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

            const builderFolderName = `${prop.uploaded_by}_${safeEmail}`;
            const propertyFolderName = `${propertyId}_${safeTitle}`;

            const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
            const imagesRsDir = path.join(__dirname, '..', '..', 'images_rs', builderFolderName, propertyFolderName);

            // Create target directory
            try {
                fs.mkdirSync(imagesRsDir, { recursive: true });
            } catch (err) {
                console.warn('Could not create images_rs directory:', imagesRsDir, err.message);
            }

            await connection.query(`DELETE FROM property_images WHERE property_id = ?`, [propertyId]);

            if (images.length > 0) {
                const processedImages = [];
                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    let finalUrl = image.image_url || image.url;

                    // If the URL points to our temp uploads directory, move it
                    if (finalUrl && finalUrl.includes('/uploads/')) {
                        const filename = finalUrl.split('/').pop();
                        const sourcePath = path.join(uploadsDir, filename);
                        const destPath = path.join(imagesRsDir, filename);

                        try {
                            if (fs.existsSync(sourcePath)) {
                                fs.copyFileSync(sourcePath, destPath);
                                fs.unlinkSync(sourcePath);
                                // Update the URL to point to the new structured path
                                finalUrl = `/images_rs/${builderFolderName}/${propertyFolderName}/${filename}`;
                            }
                        } catch (err) {
                            console.error(`[images_rs] Failed to move image ${filename}:`, err.message);
                        }
                    }
                    processedImages.push([propertyId, finalUrl, (image.is_primary || i === 0) ? 1 : 0, image.sort_order || i]);
                }

                if (processedImages.length > 0) {
                    await connection.query(
                        `INSERT INTO property_images (property_id, image_url, is_primary, sort_order) VALUES ?`,
                        [processedImages]
                    );
                }
            }
        }

        await connection.commit();

        // Return updated property (enriched like getPropertyById)
        const [properties] = await pool.query(
            `SELECT 
        p.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone,
        u.profile_image as owner_image,
        u.role as owner_type,
        EXISTS(
            SELECT 1 FROM favorites 
            WHERE property_id = p.id AND user_id = ?
        ) as is_favorited,
        (SELECT JSON_ARRAYAGG(image_url) FROM property_images WHERE property_id = p.id) as images,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', feature_name, 'value', feature_value)) FROM property_features WHERE property_id = p.id) as features
    FROM properties p
    LEFT JOIN users u ON p.uploaded_by = u.id
    WHERE p.id = ?`,
            [userId || 0, propertyId]
        );

        const property = properties[0];
        const parsedImages = property.images ? (typeof property.images === 'string' ? JSON.parse(property.images) : property.images).filter(img => img !== null) : [];
        const parsedFeatures = property.features ? (typeof property.features === 'string' ? JSON.parse(property.features) : property.features).filter(f => f.name !== null) : [];

        return res.json({
            success: true,
            message: 'Property updated successfully',
            property: {
                ...property,
                images: parsedImages,
                features: parsedFeatures,
                isFavorited: Boolean(property.is_favorited),
                owner: {
                    id: property.uploaded_by,
                    name: property.owner_name,
                    email: property.owner_email,
                    phone: property.owner_phone,
                    image: property.owner_image,
                    type: property.owner_type
                }
            }
        });

    } catch (err) {
        await connection.rollback();
        console.error('updateProperty error:', err);
        return res.status(500).json({ success: false, message: err.message });
    } finally {
        connection.release();
    }
};

// Toggle favorite property
exports.toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params.id;

        // Check if property exists
        const [propCheck] = await pool.query("SELECT id FROM properties WHERE id = ?", [propertyId]);
        if (propCheck.length === 0) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // Check if already favorited
        const [favCheck] = await pool.query(
            "SELECT id FROM favorites WHERE user_id = ? AND property_id = ?",
            [userId, propertyId]
        );

        if (favCheck.length > 0) {
            // Already favorited, so remove it
            await pool.query("DELETE FROM favorites WHERE user_id = ? AND property_id = ?", [userId, propertyId]);
            return res.json({
                success: true,
                message: "Property removed from favorites",
                isFavorited: false
            });
        } else {
            // Not favorited, so add it
            await pool.query("INSERT INTO favorites (user_id, property_id) VALUES (?, ?)", [userId, propertyId]);
            return res.json({
                success: true,
                message: "Property added to favorites",
                isFavorited: true
            });
        }
    } catch (err) {
        console.error("toggleFavorite error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all favorited properties for a user
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                p.*,
                (
                    SELECT pi.image_url 
                    FROM property_images pi 
                    WHERE pi.property_id = p.id 
                    ORDER BY pi.is_primary DESC, pi.sort_order ASC 
                    LIMIT 1
                ) as primary_image_url
            FROM favorites f
            JOIN properties p ON f.property_id = p.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `;

        const [rows] = await pool.query(query, [userId]);

        const favorites = rows.map(prop => ({
            id: prop.id,
            title: prop.title,
            price: prop.price,
            location: `${prop.city}, ${prop.state}`,
            city: prop.city,
            state: prop.state,
            address: prop.address,
            image: prop.primary_image_url,
            beds: prop.bedrooms,
            baths: prop.bathrooms,
            area: prop.area_sqft,
            tag: prop.listing_type === 'sale' ? 'For Sale' : 'For Rent',
            isFavorited: true, // Obviously true if coming from favorites table
            uploaded_by: prop.uploaded_by,
            createdAt: prop.created_at
        }));

        res.json({
            success: true,
            favorites,
            count: favorites.length
        });

    } catch (err) {
        console.error("getFavorites error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
