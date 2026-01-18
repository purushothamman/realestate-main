const pool = require("../config/db") 
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.register = async (req,res) => {
    try {
        const {name, email, phone, password, role } = req.body;

         const allowedRoles = ["user","builder","agent"];

        if (!allowedRoles.includes(role)) { 
            return res.status(400).json({message: "Invalid role selected"})
        }

        const [existing] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        )

        if (existing.length > 0 ) 
            return res.status(400).json ({
            message: "Email already exists"
            
        })

        console.log("Register payload:", req.body);


        const hashed = await bcrypt.hash(password, 10)

        await pool.query(
            "INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?,?)",
            [name, email, phone, hashed, role]
        )

        res.json({message: "Registration Successful"})
         
    } catch (err) {
        res.status(500).json({error:err.message})
        
    }
}

exports.login = async (req,res) => { 
    try {
        const {email, password } = req.body;

        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        )

        if (users.length === 0 ) {
            return res.status(400).json({message: "Invalid credentials"})
        }
            const user = users[0]

            if (user.is_blocked)
                return res.status(403).json({message:"Account blocked"})

            const valid = await bcrypt.compare(password, user.password)
            if(!valid){

             return res.status(400).json({message: "Invalid credentials"})
            }

            const token = jwt.sign(
                {id: user.id, role: user.role},
                process.env.JWT_SECRET,
                { expiresIn: "1d"}

            )

            await pool.query(
                "INSERT INTO user_login_logs (user_id) VALUES (?)",
                [user.id]

            )

            res.json({ token, role: user.role})
        }catch (err) {
        res.status(500).json({error:err.message})
        
    }
}