const pool = require("../config/db");

// List requests for a builder (default: pending)
exports.listBuilderRequests = async (req, res) => {
  try {
    const builderId = req.user.id;
    const { status = "pending" } = req.query;

    const allowed = ["pending", "approved", "rejected"];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        pr.id,
        pr.status,
        pr.created_at,
        pr.responded_at,

        p.id as property_id,
        p.title as property_title,
        p.city as property_city,
        p.state as property_state,
        p.price as property_price,
        p.status as property_status,
        (
          SELECT image_url
          FROM property_images pi
          WHERE pi.property_id = p.id
          ORDER BY pi.sort_order ASC
          LIMIT 1
        ) as property_image,

        a.id as agent_id,
        a.name as agent_name,
        a.email as agent_email,
        a.phone as agent_phone
      FROM property_requests pr
      JOIN properties p ON pr.property_id = p.id
      JOIN users a ON pr.agent_id = a.id
      WHERE pr.builder_id = ?
        AND pr.status = ?
      ORDER BY pr.created_at DESC
      `,
      [builderId, status]
    );

    res.json({
      success: true,
      requests: rows || []
    });
  } catch (error) {
    console.error("List builder requests error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get request detail (builder view)
exports.getBuilderRequestById = async (req, res) => {
  try {
    const builderId = req.user.id;
    const requestId = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `
      SELECT
        pr.id,
        pr.status,
        pr.rejection_reason,
        pr.created_at,
        pr.updated_at,
        pr.responded_at,

        a.id as agent_id,
        a.name as agent_name,
        a.email as agent_email,
        a.phone as agent_phone,
        a.profile_image as agent_profile_image,

        p.id as property_id,
        p.title as title,
        p.description as description,
        p.price as price,
        p.listing_type as listing_type,
        p.property_type_id as property_type_id,
        p.address as address,
        p.city as city,
        p.state as state,
        p.pincode as pincode,
        p.area_sqft as area_sqft,
        p.bedrooms as bedrooms,
        p.bathrooms as bathrooms,
        p.status as property_status,
        p.is_verified as is_verified,
        p.created_at as property_created_at,
        p.updated_at as property_updated_at,
        JSON_ARRAYAGG(pi.image_url) as images
      FROM property_requests pr
      JOIN users a ON pr.agent_id = a.id
      JOIN properties p ON pr.property_id = p.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE pr.id = ? AND pr.builder_id = ?
      GROUP BY
        pr.id,
        pr.status,
        pr.rejection_reason,
        pr.created_at,
        pr.updated_at,
        pr.responded_at,
        a.id,
        a.name,
        a.email,
        a.phone,
        a.profile_image,
        p.id,
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
        p.updated_at
      `,
      [requestId, builderId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const row = rows[0];

    // Safely parse images aggregate – MySQL may return JSON string, array, or a single value
    let images = [];
    if (row.images) {
      try {
        if (typeof row.images === 'string') {
          // Typical case: JSON_ARRAYAGG(...) => '["url1","url2"]'
          images = JSON.parse(row.images);
        } else if (Array.isArray(row.images)) {
          images = row.images;
        } else {
          // Fallback: treat as single image string (e.g. blob/file URI)
          images = [String(row.images)];
        }
      } catch (e) {
        console.error('Failed to parse property request images:', e.message);
        images = [String(row.images)];
      }
    }
    images = images.filter((x) => x !== null && x !== undefined);

    res.json({
      success: true,
      request: {
        id: row.id,
        status: row.status,
        rejection_reason: row.rejection_reason,
        created_at: row.created_at,
        updated_at: row.updated_at,
        responded_at: row.responded_at,
        agent: {
          id: row.agent_id,
          name: row.agent_name,
          email: row.agent_email,
          phone: row.agent_phone,
          profile_image: row.agent_profile_image || null
        },
        property: {
          id: row.property_id,
          title: row.title,
          description: row.description,
          price: row.price,
          listing_type: row.listing_type,
          property_type_id: row.property_type_id,
          address: row.address,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          area_sqft: row.area_sqft,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          status: row.property_status,
          is_verified: !!row.is_verified,
          created_at: row.property_created_at,
          updated_at: row.property_updated_at,
          images
        }
      }
    });
  } catch (error) {
    console.error("Get builder request detail error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const builderId = req.user.id;
    const requestId = parseInt(req.params.id, 10);

    await connection.beginTransaction();

    const [reqRows] = await connection.query(
      "SELECT id, agent_id, property_id, status FROM property_requests WHERE id = ? AND builder_id = ? FOR UPDATE",
      [requestId, builderId]
    );

    if (!reqRows || reqRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (reqRows[0].status !== "pending") {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Only pending requests can be approved" });
    }

    const propertyId = reqRows[0].property_id;

    await connection.query(
      "UPDATE property_requests SET status = 'approved', responded_at = NOW(), updated_at = NOW() WHERE id = ?",
      [requestId]
    );

    await connection.query(
      "UPDATE properties SET status = 'active', is_verified = TRUE, updated_at = NOW() WHERE id = ?",
      [propertyId]
    );

    // Notify the agent that their property was approved and is now live
    const agentId = reqRows[0].agent_id;
    if (agentId) {
      await connection.query(
        `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
         VALUES (?, 'property_approved', 'Property Approved', 'Your property has been approved and is now live!', 'property', ?)`,
        [agentId, propertyId]
      );
    }

    await connection.commit();
    res.json({ success: true, message: "Request approved. Property is now active.", property_id: propertyId });
  } catch (error) {
    await connection.rollback();
    console.error("Approve request error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.rejectRequest = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const builderId = req.user.id;
    const requestId = parseInt(req.params.id, 10);
    const { rejection_reason } = req.body || {};

    await connection.beginTransaction();

    const [reqRows] = await connection.query(
      "SELECT id, property_id, status FROM property_requests WHERE id = ? AND builder_id = ? FOR UPDATE",
      [requestId, builderId]
    );

    if (!reqRows || reqRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (reqRows[0].status !== "pending") {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Only pending requests can be rejected" });
    }

    await connection.query(
      "UPDATE property_requests SET status = 'rejected', rejection_reason = ?, responded_at = NOW(), updated_at = NOW() WHERE id = ?",
      [rejection_reason || null, requestId]
    );

    // Property remains blocked (as required)
    await connection.commit();
    res.json({ success: true, message: "Request rejected. Property remains blocked." });
  } catch (error) {
    await connection.rollback();
    console.error("Reject request error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

