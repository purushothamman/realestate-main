import { Platform } from 'react-native';

// API URL comes from .env file (EXPO_PUBLIC_ prefix makes it available in Expo)
// To change the API URL, edit the .env file at the project root
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://realestate.careeradvancement.in/api';

/**
 * Resolves a profile/property image URL from the database value.
 * - Strips known server origins from old absolute URLs (fixes APK http:// blocking)
 * - If a relative path, prepends the server base URL (no /api suffix).
 * - If already a full external URL (e.g. unsplash), returns as-is.
 */
export const getImageUrl = (dbPath) => {
    if (!dbPath) return null;

    // Normalize: strip any known server origins to convert old absolute URLs to relative paths
    // This fixes property images stored as http://host/images_rs/... which Android blocks
    if (typeof dbPath === 'string') {
        dbPath = dbPath
            .replace(/^https?:\/\/realestate\.careeradvancement\.in/, '')
            .replace(/^https?:\/\/72\.61\.225\.120:\d+/, '')
            .replace(/^https?:\/\/localhost:\d+/, '')
            .replace(/^https?:\/\/192\.168\.\d+\.\d+:\d+/, '');
    }

    // If it's a full external URL (e.g. unsplash) or local URI, return as-is
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
