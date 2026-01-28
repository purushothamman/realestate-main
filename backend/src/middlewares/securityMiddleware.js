// backend/src/middlewares/securityMiddleware.js
const pool = require("../config/db");
const { getClientIp } = require("../utils/requestUtils");

/**
 * Rate limiting middleware based on IP address
 * Prevents brute force attacks
 */
exports.rateLimitByIP = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        maxAttempts = 5,
        activityType = 'login'
    } = options;

    return async (req, res, next) => {
        try {
            const ipAddress = getClientIp(req);
            const windowStart = new Date(Date.now() - windowMs);

            // Count failed attempts from this IP in the time window
            const [attempts] = await pool.query(
                `SELECT COUNT(*) as count 
                 FROM user_login_logs 
                 WHERE ip_address = ? 
                 AND activity_type = ? 
                 AND login_time > ?`,
                [ipAddress, activityType, windowStart]
            );

            if (attempts[0].count >= maxAttempts) {
                return res.status(429).json({
                    message: `Too many attempts from this IP address. Please try again after ${windowMs / 60000} minutes.`,
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            next();
        } catch (err) {
            console.error("Rate limit middleware error:", err);
            // Don't block the request on middleware errors
            next();
        }
    };
};

exports.checkBlockedIP = async (req, res, next) => {
    try {
        const ipAddress = getClientIp(req);
        
        const [blocked] = await pool.query(
            `SELECT * FROM blocked_ips 
             WHERE ip_address = ? 
             AND blocked_until > NOW()`,
            [ipAddress]
        );

        if (blocked.length > 0) {
            return res.status(403).json({
                message: "This IP address has been temporarily blocked due to suspicious activity.",
                blockedUntil: blocked[0].blocked_until,
                reason: blocked[0].reason
            });
        }

        next();
    } catch (err) {
        console.error("IP block check error:", err);
        next();
    }
};

/**
 * Detect suspicious activity patterns
 * Multiple failed logins, different locations, etc.
 */
exports.detectSuspiciousActivity = async (req, res, next) => {
    try {
        const { email } = req.body;
        const ipAddress = getClientIp(req);

        if (!email) {
            return next();
        }

        // Check for multiple failed login attempts from different IPs
        const [recentAttempts] = await pool.query(
            `SELECT COUNT(DISTINCT ip_address) as unique_ips, COUNT(*) as total_attempts
             FROM user_login_logs ull
             JOIN users u ON ull.user_id = u.id
             WHERE u.email = ?
             AND ull.login_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
             AND ull.activity_type IN ('login', 'password_reset_request')`,
            [email.toLowerCase().trim()]
        );

        const { unique_ips, total_attempts } = recentAttempts[0] || { unique_ips: 0, total_attempts: 0 };

        // Flag suspicious activity if:
        // - More than 3 different IPs in 1 hour
        // - More than 10 total attempts in 1 hour
        if (unique_ips > 3 || total_attempts > 10) {
            console.warn(`Suspicious activity detected for email: ${email}, IPs: ${unique_ips}, Attempts: ${total_attempts}`);
            
            // Optionally: Send alert email, block temporarily, etc.
            req.suspiciousActivity = true;
        }

        next();
    } catch (err) {
        console.error("Suspicious activity detection error:", err);
        next();
    }
};

/**
 * Log failed login attempts
 */
exports.logFailedLogin = async (email, ipAddress, userAgent, reason = 'invalid_credentials') => {
    try {
        const [users] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email.toLowerCase().trim()]
        );

        if (users.length > 0) {
            await pool.query(
                `INSERT INTO user_login_logs 
                 (user_id, login_time, ip_address, user_agent, activity_type, description) 
                 VALUES (?, NOW(), ?, ?, 'failed_login', ?)`,
                [users[0].id, ipAddress, userAgent, `Failed login: ${reason}`]
            );
        }
    } catch (err) {
        console.error("Failed login logging error:", err);
    }
};

/**
 * Block IP address temporarily
 */
exports.blockIP = async (ipAddress, durationMs = 30 * 60 * 1000) => {
    try {
        const expiresAt = new Date(Date.now() + durationMs);
        
        await pool.query(
            `INSERT INTO blocked_ips (ip_address, blocked_until, reason, created_at) 
             VALUES (?, ?, 'Too many failed attempts', NOW())
             ON DUPLICATE KEY UPDATE blocked_until = ?, updated_at = NOW()`,
            [ipAddress, expiresAt, expiresAt]
        );
    } catch (err) {
        console.error("IP blocking error:", err);
    }
};

/**
 * Check if IP is blocked
 */
exports.checkBlockedIP = async (req, res, next) => {
    try {
        const ipAddress = getClientIp(req);
        
        const [blocked] = await pool.query(
            `SELECT * FROM blocked_ips 
             WHERE ip_address = ? 
             AND blocked_until > NOW()`,
            [ipAddress]
        );

        if (blocked.length > 0) {
            return res.status(403).json({
                message: "This IP address has been temporarily blocked due to suspicious activity.",
                blockedUntil: blocked[0].blocked_until
            });
        }

        next();
    } catch (err) {
        console.error("IP block check error:", err);
        next();
    }
};

exports.checkAndLockAccount = async (userId) => {
    try {
        // Count recent failed login attempts
        const [attempts] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM user_login_logs 
             WHERE user_id = ? 
             AND activity_type = 'failed_login' 
             AND login_time > DATE_SUB(NOW(), INTERVAL 30 MINUTE)`,
            [userId]
        );

        // Lock account if 5 or more failed attempts in 30 minutes
        if (attempts[0].count >= 5) {
            const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
            
            await pool.query(
                "UPDATE users SET account_locked_until = ? WHERE id = ?",
                [lockUntil, userId]
            );

            // Log account locked activity
            await pool.query(
                `INSERT INTO user_login_logs 
                (user_id, login_time, activity_type, description) 
                VALUES (?, NOW(), 'account_locked', ?)`,
                [userId, `Account locked until ${lockUntil} due to ${attempts[0].count} failed login attempts`]
            );

            // Create security alert
            await pool.query(
                `INSERT INTO security_alerts 
                (user_id, alert_type, severity, details, created_at) 
                VALUES (?, 'account_locked', 'high', ?, NOW())`,
                [userId, JSON.stringify({ failed_attempts: attempts[0].count, locked_until: lockUntil })]
            );

            console.log(`🔒 Account ${userId} locked until ${lockUntil}`);
            return true;
        }

        return false;
    } catch (err) {
        console.error("Account lockout check error:", err);
        return false;
    }
};
/**
 * Unlock account manually (admin function)
 */
exports.unlockAccount = async (userId, adminId = null) => {
    try {
        await pool.query(
            "UPDATE users SET account_locked_until = NULL WHERE id = ?",
            [userId]
        );

        await pool.query(
            `INSERT INTO user_login_logs 
            (user_id, login_time, activity_type, description) 
            VALUES (?, NOW(), 'account_unlocked', ?)`,
            [userId, adminId ? `Account unlocked by admin ${adminId}` : 'Account unlocked']
        );

        console.log(`🔓 Account ${userId} unlocked`);
    } catch (err) {
        console.error("Account unlock error:", err);
    }
};

/**
 * Session management - Create new session
 */
exports.createSession = async (userId, token, ipAddress, userAgent, expiresIn = '7d') => {
    try {
        const deviceType = getDeviceType(userAgent);
        const browser = getBrowser(userAgent);
        const os = getOS(userAgent);

        // Calculate expiration
        const expirationMs = expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expirationMs);

        await pool.query(
            `INSERT INTO user_sessions 
            (user_id, session_token, ip_address, user_agent, device_type, browser, os, expires_at, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [userId, token, ipAddress, userAgent, deviceType, browser, os, expiresAt]
        );
    } catch (err) {
        console.error("Session creation error:", err);
    }
};

/**
 * Session management - Invalidate session
 */
exports.invalidateSession = async (token) => {
    try {
        await pool.query(
            "UPDATE user_sessions SET is_active = FALSE WHERE session_token = ?",
            [token]
        );
    } catch (err) {
        console.error("Session invalidation error:", err);
    }
};

/**
 * Session management - Get active sessions for user
 */
exports.getUserActiveSessions = async (userId) => {
    try {
        const [sessions] = await pool.query(
            `SELECT id, ip_address, device_type, browser, os, last_activity, created_at
             FROM user_sessions 
             WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()
             ORDER BY last_activity DESC`,
            [userId]
        );
        return sessions;
    } catch (err) {
        console.error("Get active sessions error:", err);
        return [];
    }
};

/**
 * Session management - Revoke all sessions for user (logout from all devices)
 */
exports.revokeAllUserSessions = async (userId) => {
    try {
        await pool.query(
            "UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?",
            [userId]
        );
        
        console.log(`🔐 All sessions revoked for user ${userId}`);
    } catch (err) {
        console.error("Revoke all sessions error:", err);
    }
};

/**
 * Token blacklist - Add token to blacklist
 */
exports.blacklistToken = async (userId, tokenJti, expiresAt, reason = 'logout') => {
    try {
        await pool.query(
            `INSERT INTO token_blacklist (user_id, token_jti, expires_at, reason, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [userId, tokenJti, expiresAt, reason]
        );
    } catch (err) {
        console.error("Token blacklist error:", err);
    }
};

/**
 * Token blacklist - Check if token is blacklisted
 */
exports.isTokenBlacklisted = async (tokenJti) => {
    try {
        const [result] = await pool.query(
            "SELECT id FROM token_blacklist WHERE token_jti = ? AND expires_at > NOW()",
            [tokenJti]
        );
        return result.length > 0;
    } catch (err) {
        console.error("Token blacklist check error:", err);
        return false;
    }
};

/**
 * Cleanup expired data (run via cron job)
 */
exports.cleanupExpiredData = async () => {
    try {
        // Delete expired blocked IPs
        await pool.query("DELETE FROM blocked_ips WHERE blocked_until < NOW()");
        
        // Delete expired blacklisted tokens
        await pool.query("DELETE FROM token_blacklist WHERE expires_at < NOW()");
        
        // Delete expired inactive sessions
        await pool.query("DELETE FROM user_sessions WHERE expires_at < NOW()");
        
        // Delete old OTP records (older than 30 days)
        await pool.query("DELETE FROM otp_verifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");

        console.log("✅ Cleanup completed successfully");
    } catch (err) {
        console.error("Cleanup error:", err);
    }
};