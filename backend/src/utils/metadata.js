// utils/metadata.js
function getRequestMetadata(req) {
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.connection?.remoteAddress || 
                     req.socket?.remoteAddress || 
                     'Unknown';
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    return { ipAddress, userAgent };
}

module.exports = { getRequestMetadata };
