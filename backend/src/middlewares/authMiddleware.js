// backend/src/middlewares/authMiddleware.js
/**
 * Middleware to protect routes - requires valid JWT token
 * Usage: router.get('/protected-route', protect, yourController)
 */
exports.protect = (req, res, next) => {
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
exports.allow = (...allowedRoles) => {
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

// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
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
 * Optional middleware - attaches user if token exists but doesn't fail if missing
 * Useful for routes that work for both authenticated and non-authenticated users
 * Usage: router.get('/public-route', optionalAuth, yourController)
 */
exports.optionalAuth = (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (header && header.startsWith("Bearer ")) {
            const token = header.split(" ")[1];
            
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            }
        }

        // Always proceed to next middleware
        next();

    } catch (err) {
        // If token is invalid, just proceed without user
        // Don't throw error for optional auth
        if (process.env.NODE_ENV === 'development') {
            console.log("Optional auth failed:", err.message);
        }
        next();
    }
};

/**
 * Middleware to check if user owns the resource they're trying to access
 * Useful for routes where users can only access their own data
 * Usage: router.get('/users/:userId', protect, checkOwnership('userId'), yourController)
 * 
 * @param {string} paramName - Name of the URL parameter containing the user ID
 */
exports.checkOwnership = (paramName = 'id') => {
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
exports.checkAccountStatus = async (req, res, next) => {
    try {
        const pool = require("../config/db");

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