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

// FIRST: Log EVERY single request before any middleware
app.use((req, res, next) => {
  console.log("\n" + "=".repeat(60));
  console.log("🌐 INCOMING REQUEST");
  console.log("   Method:", req.method);
  console.log("   URL:", req.url);
  console.log("   Full Path:", req.path);
  console.log("   Original URL:", req.originalUrl);
  console.log("   Headers:", {
    authorization: req.headers.authorization ? "Present" : "Missing",
    contentType: req.headers['content-type'] || "None"
  });
  console.log("=".repeat(60));
  next();
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
console.log(" Registering /api/auth routes");
app.use("/api/auth", authRoutes);
console.log(" Registering /api/properties routes with protect middleware");
app.use("/api/properties", protect, propertyRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/chats", chatRoutes);

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

// 404 Handler - Log what route was requested
app.use((req, res) => {
  console.log("\n" + "❌".repeat(30));
  console.log(" 404 - ROUTE NOT FOUND");
  console.log("   Method:", req.method);
  console.log("   Requested URL:", req.originalUrl);
  console.log("   Path:", req.path);
  console.log("   Available routes:");
  console.log("     - POST /api/auth/register");
  console.log("     - POST /api/auth/login");
  console.log("     - POST /api/properties/add");
  console.log("❌".repeat(30) + "\n");

  res.status(404).json({
    message: "Route not found",
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

module.exports = app;