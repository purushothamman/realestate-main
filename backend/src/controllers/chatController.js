const pool = require("../config/db")

exports.sendMessage = async (req, res) => {
    try {

        const {bookingId} = req.params
        const {message} = req.body
        const senderId = req.user.id

        if (!message) {
            return res.status(400).json({message: "Message required"})
        }

        // checks if booking exists
        const [rows] = await pool.query(
            "SELECT id FROM bookings WHERE id = ?",
            [bookingId]
        )
        
        if (rows.length === 0 ) {
            return res.status(404).json({message: "Booking not found"})
          }

          await pool.query(
            "INSERT INTO chats (booking_id, sender_id, message) VALUES (?,?,?)",
            [bookingId,senderId,message]
            
          )

        res.json({message:"Message sent"})
    } catch (err) {
        res.status(500).json({error:err.message})        
    }
    
}

exports.getMessages = async (req, res) => {
    try {
        const {bookingId} = req.params

        const  [rows] = await pool.query(`
            SELECT 
                c.id,
                c.message,
                c.sender_id,
                u.name AS sender_name,
                c.created_at
                FROM chats c
                JOIN users u ON u.id = c.sender_id
                WHERE c.booking_id = ?
                ORDER BY c.created_at ASC
                `,
            [bookingId])


        
        res.json(rows)
    } catch (err) {
        res.status(500).json({error:err.message})
        
    }
    
}