// backend/src/utils/requestUtils.js

/**
 * Extract IP address from request
 * Handles proxy scenarios (X-Forwarded-For, X-Real-IP)
 */
const getClientIp = (req) => {
    // Check X-Forwarded-For header (for proxies/load balancers)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
    }
    
    // Check X-Real-IP header (nginx proxy)
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return realIp.trim();
    }
    
    // Fallback to connection remote address
    return req.connection?.remoteAddress 
        || req.socket?.remoteAddress 
        || req.connection?.socket?.remoteAddress
        || req.ip
        || 'unknown';
};

/**
 * Extract User-Agent from request headers
 */
const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};

/**
 * Get both IP and User-Agent in one call
 */
const getRequestMetadata = (req) => {
    return {
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req)
    };
};

/**
 * Parse device type from User-Agent
 * Returns: mobile, tablet, desktop
 */
const getDeviceType = (userAgent) => {
    const ua = userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
        return 'mobile';
    }
    
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        return 'tablet';
    }
    
    return 'desktop';
};

/**
 * Parse browser from User-Agent
 */
const getBrowser = (userAgent) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    if (ua.includes('msie') || ua.includes('trident')) return 'Internet Explorer';
    
    return 'Unknown';
};

/**
 * Parse OS from User-Agent
 */
const getOS = (userAgent) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return 'Unknown';
};


/**
 * Format phone number
 */
function formatPhoneNumber(phone) {
    if (!phone) return null;
    // Remove all non-numeric characters
    return phone.replace(/\D/g, '');
}

/**
 * Validate Indian GST number
 */
function validateGSTNumber(gstNo) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gstNo?.trim());
}

/**
 * Validate Indian PAN number
 */
function validatePANNumber(panNo) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(panNo?.trim());
}

/**
 * Generate random verification code
 */
function generateVerificationCode(length = 6) {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
}

/**
 * Sanitize string input
 */
function sanitizeString(str) {
    if (!str) return null;
    return str.trim().replace(/[<>]/g, '');
}

module.exports = {
    getClientIp,
    getUserAgent,
    getRequestMetadata,
    getDeviceType,
    getBrowser,
    getOS,
    formatPhoneNumber,
    validateGSTNumber,
    validatePANNumber,
    generateVerificationCode,
    sanitizeString
};