const pool = require("../config/db")

exports.createProperty = async (req,res) => {
    try {
        const {title, description, price, location }  = req.body
        
        const ownerType = req.user.role  // builder |agent|admin 
        const ownerId = req.user.id

        const [result] = await pool.query(

            `INSERT INTO properties
            (title, description, price, location, owner_type, owner_id, is_verified)
            VALUES (?,?,?,?,?,?, false)
            `,
            [title, description, price, location, ownerType, ownerId]

        )

        res.status(201).json({
            message: "Property created. Pending verification",
            property_id: result.insertId
        })
        
    } catch (err) {
        res.status(500).json({error:err.message})
        
    }
    
}

// temporary  for admin document verfication 
exports.getVerifiedProperties = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT property_id, title, price, location
       FROM properties
       WHERE status = 'active'`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// exports.getVerifiedProperties = async (req,res) => {
//     try {
//         const [rows] = await pool.query(
//             `SELECT property_id, title, price, location
//             FROM properties
//             WHERE is_verified = true AND status = 'active'`
//         )

//         res.json(rows)
        
//     } catch (err) {
//         res.status(500).json({error:err.message})
        
//     }
    
// }
