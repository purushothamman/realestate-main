//'http://192.168.137.194:5000/api'
//home - 192.168.0.104

import { Platform } from 'react-native';

// export const getApiUrl = () => {
//     if (Platform.OS === 'android') {
//         return 'http://192.168.0.104:5000/api'; // 🔥 your IP
//     } else {
//         return 'http://192.168.0.104:5000/api';
//     }
// };


export const getApiUrl = () => {
    return 'http://192.168.0.105:5000/api';
};

export const API_BASE_URL = getApiUrl();

