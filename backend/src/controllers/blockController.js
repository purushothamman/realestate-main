const pool = require("../config/db")

exports.blockEntity = async (req, res) => {
    try {
        const {target_type ,target_id, reason} = req.body
        const adminId = req.user.id

        const allowed = ["user", "builder", "agent", "property"]
        if(!allowed.includes(target_type)) {
            return res.status(400).json({message:"Invalid target type"})

        }

        const tableMap = {
            user: "users",
            builder: "users",
            agent: "users",
            property: "properties"

        }

        await pool.query(`
            UPDATE ${tableMap[target_type]} 
            SET is_blocked = true WHERE id = ?
             `, 
        [target_id])

        await pool.query(`
            INSERT INTO block_logs 
            (target_type, target_id, admin_id, reason)
            VALUES(?,?,?,?)
            `,
        [target_type,target_id,adminId,reason])

        res.json({message: `${target_type} blocked successfully`})
        
        
    } catch (err) {
        res.status(500).json({error:err.message})
        
    }
    
}


exports.unblockEntity = async (req, res) => {
    try {
        const {target_type, target_id} = req.body

        
        const tableMap = {
            user: "users",
            builder: "users",
            agent: "users",
            property: "properties"

        }

        await pool.query(`
            UPDATE ${tableMap[target_type]}
            SET is_blocked = false WHERE id = ?
            `,
        [target_id])

        res.json({message:`${target_type} unblocked successfully`})
        
    } catch (err) {
        res.status(500).json({error:err.message})
        
    }
    
}