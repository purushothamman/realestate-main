//'http://192.168.137.194:5000/api'
//home - 192.168.0.104
//10.56.70.107

import { Platform } from 'react-native';


export const getApiUrl = () => {
    return 'http://192.168.0.101:5000/api';
};

export const API_BASE_URL = getApiUrl();

/**
 * Resolves a profile/property image URL from the database value.
 * - If already a full URL (http://...), returns as-is (backwards compat).
 * - If a relative path (/images_rs/...), prepends the server base URL.
 * - Returns null if no value.
 */
export const getImageUrl = (dbPath) => {
    if (!dbPath) return null;
    if (dbPath.startsWith('http')) return dbPath;
    // Relative path like /images_rs/profiles/22_user_gmail.com/profile.jpg
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${dbPath}`;
};
