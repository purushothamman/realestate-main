const { all } = require("../app")
const pool = require("../config/db")

exports.createBooking = async (req, res) => {
    try {
        const {propertyId} = req.params
        const userId = req.user.id

        //checks if property exists,active & have doc
        const [rows] = await pool.query(`
            SELECT p.property_id
            From properties p 
            JOIN property_documents d ON d.property_id = p.property_id
            WHERE p.property_id = ?
                AND p.status = 'active'
            `
            ,[propertyId])

        if(rows.length === 0) {

            return  res.status(400).json({
                message: "Property not available for Booking"
            })
        }

        await pool.query(
            "INSERT INTO bookings (user_id, property_id, status) VALUES (?,?, 'requested')",
            [userId, propertyId]


        )

        res.json({message: "Booking request sent"})

        
    } catch (err) {
        res.status(500).json({error: err.message})
        
    }
    
}

exports.getMyLeads = async (req, res) => {
    try {
        const ownerId = req.user.id
        const [rows] = await pool.query(`
            SELECT 
                b.id AS booking_id,
                u.name AS user_name,
                u.phone,
                u.title,
                b.status,
                b.created_at,
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN properties p ON p.property_id = b.property_id
            WHERE p.owner_id = ?
            ORDER BY b.created_at DESC
            `,
        [ownerId])




        res.json(rows)
        
    } catch (err) {
        res.status({error:err.message})
        
    }
    
}


exports.updateBookingStatus = async (req,res) => {
    try {
        const {bookingId} = req.params
        const {status} = req.body

        const allowedStatus = ["contacted","closed"]
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({message:"Invalid status"})

        }

        // fetch booking + property owner
        const [rows] = await pool.query(`
            SELECT b.id, p.owner_id
            FROM bookings b
            JOIN properties p ON p.property_id = b.property_id
            WHERE b.id = ?     
            `,[bookingId])
        
            if(rows.length === 0 ) {
                return res.status(404).json({message:"Booking not found"})

            }

            if (rows[0].owner_id !== req.user.id && req.user.role !== "admin"){
                return res.status(403).json({message: "Not authorized"})

            }

            await pool.query(
                "UPDATE bookings SET status = ? WHERE id = ?",
                [status,bookingId]

            )

            res.json({message: `Booking marked as ${status}`})
            
    } catch (err) {
        res.status(500).json({error:err.message})
        }
    
}