///: 192.168.137.194

import { Platform } from 'react-native';

export const getApiUrl = () => {
    // IPv4 Address . . . . . . . 192.168.137.194
    return 'http://10.42.218.244:5000/api';

};




export const API_BASE_URL = getApiUrl();


/**
 * Resolves a profile/property image URL from the database value.
 * - If already a full URL (http://...), returns as-is.
 * - If a relative path, prepends the server base URL (no /api suffix).
 */
export const getImageUrl = (dbPath) => {
    if (!dbPath) return null;

    // If it's already a full URL or local URI, return as-is
    if (typeof dbPath === 'string' && (
        dbPath.startsWith('http') ||
        dbPath.startsWith('data:') ||
        dbPath.startsWith('file://') ||
        dbPath.startsWith('content://')
    )) {
        return dbPath;
    }

    // Ensure we have a clean base URL (no /api trailing)
    const baseUrl = API_BASE_URL.endsWith('/api')
        ? API_BASE_URL.slice(0, -4)
        : API_BASE_URL;

    // Ensure dbPath starts with a slash
    const normalizedPath = dbPath.startsWith('/') ? dbPath : `/${dbPath}`;

    return `${baseUrl}${normalizedPath}`;
};

export const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
export const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
