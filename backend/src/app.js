const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const chatRoutes = require("./routes/chatRoutes")
const { protect } = require("./middlewares/authMiddleware");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes)
app.use("/api/booking",bookingRoutes)
app.use("/api/chats",chatRoutes)


// Root route
app.get("/", (req, res) => {
    res.json({ message: "RealEstate API is running" });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
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