// const express = require("express")
// const cors = require("cors")
// const helmet = require("helmet")
// const authRoutes = require("./routes/authRoutes")
// const {protect, allow} = require("./middlewares/authMiddleware")
// const propertyRoutes = require("./routes/propertyRoutes")

// const app = express()

// app.use(express.json())
// app.use(cors())
// app.use(helmet())
// app.use("/api/auth", authRoutes)

// app.get("/",(req,res)=> {
//     res.json({message:"RealEstate API is running"})
// })

// app.get("/api/secure",protect,(req,res) => {
//     res.json({message: "Secure access",user: req.user})
// })

// app.use("/api/properties", propertyRoutes)

// module.exports = app;


const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const { protect } = require("./middlewares/authMiddleware");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", protect, propertyRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({ message: "RealEstate API is running" });
});


app.get("/api/secure", protect, (req, res) => {
  res.status(200).json({
    message: "Secure access",
    user: req.user,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

module.exports = app;