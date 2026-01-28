require("dotenv").config();
const app = require("./src/app")
const pool = require("./src/config/db")

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await pool.query("Select 1")
        console.log("MySQL Connected")

        app.listen(PORT , () => {
            console.log(`Server is running on port http://localhost:${PORT}`)
        })
        
    } catch (err) {
        console.error("DB Connection Failed:",err)
        process.exit(1)
    }
}
start();


// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// const { testConnection } = require('./src/config/db');
// const authRoutes = require('./src/routes/authRoutes');

// const app = express();

// // Security middleware
// app.use(helmet());

// // CORS configuration
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));

// // Body parser middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api/', limiter);

// // Test database connection
// testConnection().then(connected => {
//   if (!connected) {
//     console.log('⚠️  Server starting without database connection');
//   }
// });

// // Root route
// app.get('/', (req, res) => {
//   res.json({
//     success: true,
//     message: 'EstateHub API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // API Routes - FIXED: Proper route mounting
// app.use('/api/auth', authRoutes);

// // Health check route
// app.get('/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found',
//     path: req.originalUrl
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error:', err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
//   console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled Promise Rejection:', err);
//   server.close(() => process.exit(1));
// });

// module.exports = app;