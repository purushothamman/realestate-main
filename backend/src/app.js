const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const authRoutes = require("./routes/authRoutes")
const {protect, allow} = require("./middlewares/authMiddleware")
const propertyRoutes = require("./routes/propertyRoutes")

const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use("/api/auth", authRoutes)

app.get("/",(req,res)=> {
    res.json({message:"RealEstate API is running"})
})

app.get("/api/secure",protect,(req,res) => {
    res.json({message: "Secure access",user: req.user})
})

app.use("/api/properties", propertyRoutes)



module.exports = app;