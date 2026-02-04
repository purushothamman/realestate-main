// cors.config.js
const cors = require('cors');

// Define allowed origins
const allowedOrigins = [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:3000',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8082',
    'http://127.0.0.1:3000',
    // Add your production domain here
    // 'https://yourdomain.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

module.exports = cors(corsOptions);