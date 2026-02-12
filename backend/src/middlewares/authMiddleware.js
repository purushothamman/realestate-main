// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const pool = require('../config/db');

// ==================== VERIFY TOKEN MIDDLEWARE ====================
const verifyToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from db to ensure account is still active
        const [users] = await pool.query(
            "SELECT id, email, role, is_blocked, is_verified FROM users WHERE id = ?",
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        // Check if account is blocked
        if (user.is_blocked) {
            return res.status(403).json({
                success: false,
                message: "Account has been blocked. Please contact support."
            });
        }

        // Verify role matches token (prevent role escalation)
        if (user.role.toLowerCase() !== decoded.role.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: "Role mismatch detected. Please login again."
            });
        }

        // Attach user data to request object
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role.toLowerCase(),
            isVerified: user.is_verified
        };

        next();

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again."
            });
        }

        console.error("Token verification error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error during authentication"
        });
    }
};

// ==================== ROLE-BASED ACCESS CONTROL ====================
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Normalize roles to lowercase for comparison
        const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
        const userRole = req.user.role.toLowerCase();

        if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// ==================== OPTIONAL AUTH (for routes that work with/without auth) ====================
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without user data
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const [users] = await pool.query(
                "SELECT id, email, role, is_blocked FROM users WHERE id = ?",
                [decoded.id]
            );

            if (users.length > 0 && !users[0].is_blocked) {
                req.user = {
                    id: users[0].id,
                    email: users[0].email,
                    role: users[0].role.toLowerCase()
                };
            } else {
                req.user = null;
            }
        } catch (tokenError) {
            // Invalid/expired token - continue without user data
            req.user = null;
        }

        next();

    } catch (err) {
        console.error("Optional auth error:", err);
        req.user = null;
        next();
    }
};

// ==================== VERIFY EMAIL (require verified email) ====================
const requireVerifiedEmail = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: "Email verification required. Please verify your email address."
        });
    }

    next();
};

// ==================== PROTECT MIDDLEWARE ====================
const protect = (req, res, next) => {
    try {
        // Get authorization header
        const header = req.headers.authorization;

        // Log only in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log("Auth header:", header ? "Bearer ***" : "No header");
        }

        // Check if authorization header exists and starts with "Bearer "
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. Please login to access this resource.",
                error: "NO_TOKEN"
            });
        }

        // Extract token from "Bearer <token>"
        const token = header.split(" ")[1];

        // Check if token exists after split
        if (!token) {
            return res.status(401).json({
                message: "Not authorized. Token missing.",
                error: "MISSING_TOKEN"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = decoded;

        // Token is valid, proceed to next middleware
        next();

    } catch (err) {
        console.error("Auth middleware error:", err.message);

        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Session expired. Please login again.",
                error: "TOKEN_EXPIRED"
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token. Please login again.",
                error: "INVALID_TOKEN"
            });
        }

        // Generic error
        return res.status(401).json({
            message: "Authentication failed. Please login again.",
            error: "AUTH_FAILED"
        });
    }
};

/**
 * Middleware to check if user has required role
 * Usage: router.get('/admin-route', protect, allow('admin', 'moderator'), yourController)
 * 
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const allow = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists in request (protect middleware should run first)
        if (!req.user) {
            return res.status(401).json({
                message: "Not authorized. Please login first.",
                error: "NO_USER"
            });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. This resource requires ${allowedRoles.join(' or ')} role.`,
                error: "INSUFFICIENT_PERMISSIONS",
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        // User has required role, proceed
        next();
    };
};

// ==================== AUTHENTICATE MIDDLEWARE ====================
const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

/**
 * Middleware to check if user owns the resource they're trying to access
 * Useful for routes where users can only access their own data
 * Usage: router.get('/users/:userId', protect, checkOwnership('userId'), yourController)
 * 
 * @param {string} paramName - Name of the URL parameter containing the user ID
 */
const checkOwnership = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Not authorized. Please login first.",
                error: "NO_USER"
            });
        }

        const resourceUserId = parseInt(req.params[paramName]);
        const currentUserId = req.user.id;

        // Allow if user is accessing their own resource
        if (resourceUserId === currentUserId) {
            return next();
        }

        // Allow if user is admin (optional - remove if not needed)
        if (req.user.role === 'admin') {
            return next();
        }

        // Otherwise, deny access
        return res.status(403).json({
            message: "Access denied. You can only access your own resources.",
            error: "NOT_OWNER"
        });
    };
};

/**
 * Middleware to verify user account is not blocked
 * Usage: router.get('/protected-route', protect, checkAccountStatus, yourController)
 */
const checkAccountStatus = async (req, res, next) => {
    try {
        const [users] = await pool.query(
            "SELECT is_blocked FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found",
                error: "USER_NOT_FOUND"
            });
        }

        if (users[0].is_blocked) {
            return res.status(403).json({
                message: "Your account has been blocked. Please contact support.",
                error: "ACCOUNT_BLOCKED"
            });
        }

        next();

    } catch (err) {
        console.error("Account status check error:", err);
        return res.status(500).json({
            message: "Error checking account status",
            error: "SERVER_ERROR"
        });
    }
};

// ==================== EXPORTS ====================
module.exports = {
    verifyToken,
    requireRole,
    optionalAuth,
    requireVerifiedEmail,
    authenticate,
    protect,
    allow,
    checkOwnership,
    checkAccountStatus
};