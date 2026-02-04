// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authControllers');
const { authenticate } = require('../middlewares/authMiddleware');
const { rateLimitByIP, checkBlockedIP, detectSuspiciousActivity } = require('../middlewares/securityMiddleware');

// Validate and create safe handler wrapper
const createSafeHandler = (handlerName, fallbackMessage) => {
    if (typeof auth[handlerName] === 'function') {
        return auth[handlerName];
    } else {
        console.error(`ERROR: auth.${handlerName} is not a function. Using fallback handler.`);
        return (req, res) => {
            res.status(501).json({
                message: `${fallbackMessage} - Handler not implemented`,
                error: `auth.${handlerName} is not available`
            });
        };
    }
};

// Add validation to check if all auth controller methods exist
const requiredAuthMethods = [
    'register', 'login', 'googleLogin', 'microsoftLogin',
    'verifyOtp', 'resendOtp', 'forgotPassword', 'resetPassword', 'logout'
];

console.log('\n Validating auth controller methods...');
requiredAuthMethods.forEach(method => {
    if (typeof auth[method] !== 'function') {
        console.error(`auth.${method} is NOT a function`);
    } else {
        console.log(`auth.${method} is available`);
    }
});
console.log('');

// PUBLIC ROUTES (No authentication required)

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
    createSafeHandler('resetPassword', 'Password reset failed')
);

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
            const [users] = await require('../config/db').query(
                "SELECT id, name, email, phone, role, is_verified, created_at, last_login FROM users WHERE id = ?",
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ user: users[0] });
        } catch (err) {
            console.error("Get profile error:", err);
            res.status(500).json({ message: "Server error" });
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
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get active sessions
router.get('/active-sessions',
    authenticate,
    async (req, res) => {
        try {
            const { getUserActiveSessions } = require('../middlewares/securityMiddleware');
            const sessions = await getUserActiveSessions(req.user.id);

            res.json({ sessions });
        } catch (err) {
            console.error("Get active sessions error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Revoke all sessions (logout from all devices)
router.post('/revoke-all-sessions',
    authenticate,
    async (req, res) => {
        try {
            const { revokeAllUserSessions } = require('../middlewares/securityMiddleware');
            await revokeAllUserSessions(req.user.id);

            res.json({ message: "All sessions have been revoked successfully" });
        } catch (err) {
            console.error("Revoke all sessions error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get security alerts
router.get('/security-alerts',
    authenticate,
    async (req, res) => {
        try {
            const [alerts] = await require('../config/db').query(
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
                 LIMIT 50`,
                [req.user.id]
            );

            res.json({ alerts });
        } catch (err) {
            console.error("Get security alerts error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;