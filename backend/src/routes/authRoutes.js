// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { authenticate, verifyToken: verifyTokenMiddleware, requireRole } = require('../middlewares/authMiddleware');
const { 
    rateLimitByIP, 
    checkBlockedIP, 
    detectSuspiciousActivity,
    getUserActiveSessions,
    revokeAllUserSessions 
} = require('../middlewares/securityMiddleware');
const db = require('../config/db');

// Validate and create safe handler wrapper
const createSafeHandler = (handlerName, fallbackMessage) => {
    if (typeof authController[handlerName] === 'function') {
        return authController[handlerName];
    } else {
        console.error(`ERROR: authController.${handlerName} is not a function. Using fallback handler.`);
        return (req, res) => {
            res.status(501).json({
                message: `${fallbackMessage} - Handler not implemented`,
                error: process.env.NODE_ENV === 'development' 
                    ? `authController.${handlerName} is not available` 
                    : 'Service unavailable'
            });
        };
    }
};

// Add validation to check if all auth controller methods exist
const requiredAuthMethods = [
    'register', 'login', 'googleLogin', 'microsoftLogin', 
    'verifyOtp', 'resendOtp', 'forgotPassword', 'resetPassword', 'logout'
];

console.log('\n=== Validating auth controller methods ===');
requiredAuthMethods.forEach(method => {
    if (typeof authController[method] !== 'function') {
        console.error(`❌ authController.${method} is NOT a function`);
    } else {
        console.log(`✓ authController.${method} is available`);
    }
});

// Validate middleware
console.log('\n=== Validating middleware functions ===');
console.log(`✓ checkBlockedIP is ${typeof checkBlockedIP === 'function' ? 'available' : 'NOT available'}`);
console.log(`✓ rateLimitByIP is ${typeof rateLimitByIP === 'function' ? 'available' : 'NOT available'}`);
console.log(`✓ detectSuspiciousActivity is ${typeof detectSuspiciousActivity === 'function' ? 'available' : 'NOT available'}`);
console.log(`✓ authenticate is ${typeof authenticate === 'function' ? 'available' : 'NOT available'}`);
console.log(`✓ getUserActiveSessions is ${typeof getUserActiveSessions === 'function' ? 'available' : 'NOT available'}`);
console.log(`✓ revokeAllUserSessions is ${typeof revokeAllUserSessions === 'function' ? 'available' : 'NOT available'}`);
console.log('==========================================\n');

// ============================================
// PUBLIC ROUTES (No authentication required)

<<<<<<< HEAD
// Registration - with rate limiting
router.post('/register', 
    checkBlockedIP, 
    rateLimitByIP({ maxAttempts: 5, windowMs: 15 * 60 * 1000 }), 
    createSafeHandler('register', 'Registration failed')
);

// Regular Login - with strict rate limiting and suspicious activity detection
router.post('/login', 
    checkBlockedIP,
    detectSuspiciousActivity,
    rateLimitByIP({ maxAttempts: 5, windowMs: 15 * 60 * 1000, activityType: 'failed_login' }),
    createSafeHandler('login', 'Login failed')
);

// OAuth Login Routes - with rate limiting
router.post('/google-login', 
    checkBlockedIP,
    rateLimitByIP({ maxAttempts: 10, windowMs: 15 * 60 * 1000 }),
    createSafeHandler('googleLogin', 'Google login failed')
);

router.post('/microsoft-login', 
    checkBlockedIP,
    rateLimitByIP({ maxAttempts: 10, windowMs: 15 * 60 * 1000 }),
    createSafeHandler('microsoftLogin', 'Microsoft login failed')
);

// OTP Routes - with rate limiting
router.post('/verify-otp', 
    checkBlockedIP,
    rateLimitByIP({ maxAttempts: 10, windowMs: 15 * 60 * 1000 }),
    createSafeHandler('verifyOtp', 'OTP verification failed')
);

router.post('/resend-otp', 
    checkBlockedIP,
    rateLimitByIP({ maxAttempts: 3, windowMs: 5 * 60 * 1000 }), // Stricter for OTP resend
    createSafeHandler('resendOtp', 'OTP resend failed')
);

// Password Reset Routes - with rate limiting and suspicious activity detection
router.post('/forgot-password', 
    checkBlockedIP,
    detectSuspiciousActivity,
    rateLimitByIP({ maxAttempts: 3, windowMs: 15 * 60 * 1000 }),
    createSafeHandler('forgotPassword', 'Forgot password request failed')
);

router.post('/reset-password', 
    checkBlockedIP,
    rateLimitByIP({ maxAttempts: 5, windowMs: 15 * 60 * 1000 }),
=======
// Registration - rate limiting disabled for development
router.post('/register',
    createSafeHandler('register', 'Registration failed')
);

// Regular Login - rate limiting disabled for development
router.post('/login',
    createSafeHandler('login', 'Login failed')
);

// OAuth Login Routes - rate limiting disabled for development
router.post('/google-login',
    createSafeHandler('googleLogin', 'Google login failed')
);

router.post('/microsoft-login',
    createSafeHandler('microsoftLogin', 'Microsoft login failed')
);

// OTP Routes - rate limiting disabled for development
router.post('/verify-otp',
    createSafeHandler('verifyOtp', 'OTP verification failed')
);

router.post('/resend-otp',
    createSafeHandler('resendOtp', 'OTP resend failed')
);

// Password Reset Routes - rate limiting disabled for development
router.post('/forgot-password',
    createSafeHandler('forgotPassword', 'Forgot password request failed')
);

router.post('/reset-password',
>>>>>>> f70ee9b0c572b72c7f98cd41ec1e8fd985e4d9d3
    createSafeHandler('resetPassword', 'Password reset failed')
);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token validity
 * @access  Public
 */
router.post('/verify-token', 
    createSafeHandler('verifyToken', 'Token verification failed')
);

// ============================================
// PROTECTED ROUTES (Authentication required)

// Logout - requires authentication
router.post('/logout', 
    authenticate, 
    createSafeHandler('logout', 'Logout failed')
);

// Get current user profile
router.get('/me', 
    authenticate, 
    async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    success: false,
                    message: "User not authenticated" 
                });
            }

            const [users] = await db.query(
                `SELECT 
                    id, 
                    name, 
                    email, 
                    phone, 
                    role, 
                    is_verified, 
                    created_at, 
                    last_login 
                 FROM users 
                 WHERE id = ?`,
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: "User not found" 
                });
            }
            
            res.json({ user: users[0] });
        } catch (err) {
            console.error("Get profile error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error retrieving user profile" 
            });
        }
    }
);

// Get user login history
router.get('/login-history', 
    authenticate, 
    async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;
            
            const [history] = await require('../config/db').query(
                `SELECT 
                    login_time, 
                    logout_time, 
                    login_method, 
                    ip_address, 
                    device_type, 
                    browser, 
                    os, 
                    activity_type, 
                    description
                 FROM user_login_logs 
                 WHERE user_id = ? 
                 ORDER BY login_time DESC 
                 LIMIT ?`,
                [req.user.id, limit]
            );
            
            res.json({ history });
        } catch (err) {
            console.error("Get login history error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error retrieving login history" 
            });
        }
    }
);

// Get active sessions
router.get('/active-sessions', 
    authenticate, 
    async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    success: false,
                    message: "User not authenticated" 
                });
            }

            const sessions = await getUserActiveSessions(req.user.id);
            
            res.json({ sessions });
        } catch (err) {
            console.error("Get active sessions error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error retrieving active sessions" 
            });
        }
    }
);

// Revoke all sessions (logout from all devices)
router.post('/revoke-all-sessions', 
    authenticate, 
    async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    success: false,
                    message: "User not authenticated" 
                });
            }

            await revokeAllUserSessions(req.user.id);
            
            res.json({ message: "All sessions have been revoked successfully" });
        } catch (err) {
            console.error("Revoke all sessions error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error revoking sessions" 
            });
        }
    }
);

// Get security alerts
router.get('/security-alerts', 
    authenticate, 
    async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    success: false,
                    message: "User not authenticated" 
                });
            }

            const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Cap at 100
            
            const [alerts] = await db.query(
                `SELECT 
                    id, 
                    alert_type, 
                    severity, 
                    ip_address, 
                    details, 
                    is_resolved, 
                    created_at
                 FROM security_alerts 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [req.user.id, limit]
            );
            
            res.json({ alerts });
        } catch (err) {
            console.error("Get security alerts error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error retrieving security alerts" 
            });
        }
    }
);

// ============================================
// ROLE-BASED DASHBOARD ROUTES
// ============================================

/**
 * @route   GET /api/auth/builder/dashboard
 * @desc    Get builder dashboard data
 * @access  Private (Builder only)
 */
router.get('/builder/dashboard', 
    authenticate, 
    requireRole('builder'), 
    async (req, res) => {
        try {
            res.status(200).json({
                success: true,
                message: "Builder dashboard access granted",
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            });
        } catch (err) {
            console.error("Builder dashboard error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error accessing dashboard" 
            });
        }
    }
);

/**
 * @route   GET /api/auth/agent/dashboard
 * @desc    Get agent dashboard data
 * @access  Private (Agent only)
 */
router.get('/agent/dashboard', 
    authenticate, 
    requireRole('agent'), 
    async (req, res) => {
        try {
            res.status(200).json({
                success: true,
                message: "Agent dashboard access granted",
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            });
        } catch (err) {
            console.error("Agent dashboard error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error accessing dashboard" 
            });
        }
    }
);

/**
 * @route   GET /api/auth/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (Admin only)
 */
router.get('/admin/dashboard', 
    authenticate, 
    requireRole('admin'), 
    async (req, res) => {
        try {
            res.status(200).json({
                success: true,
                message: "Admin dashboard access granted",
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            });
        } catch (err) {
            console.error("Admin dashboard error:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error accessing dashboard" 
            });
        }
    }
);

module.exports = router;