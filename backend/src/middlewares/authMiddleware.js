const jwt = require("jsonwebtoken")

exports.protect = (req,res,next) => {
    try {
        const header = req.headers.authorization;

        console.log("Auth header:", req.headers.authorization);


        if(!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({message:"Not authorized"})

        }

        const token = header.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        req.user = decoded; // for {id,role}
        next()
        
    } catch (err) {
        res.status(401).json({message:"Invalid token"})
        
    }
}

exports.allow = (...allowedRoles) => {
    return (req,res,next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)){

            return res.status(403).json({message:"Access denied"})

        }
        next()
    }
}