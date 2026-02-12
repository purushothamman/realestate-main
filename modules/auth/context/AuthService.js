import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ==================== API CONFIGURATION ====================
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  } else {
    return 'http://localhost:5000/api';
  }
};

const API_BASE_URL = getApiUrl();

// ==================== VALID ROLES ====================
const VALID_ROLES = ['buyer', 'builder', 'agent', 'admin'];

// ==================== AUTH SERVICE CLASS ====================
class AuthService {
  /**
   * Get stored authentication token
   */
  static async getToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  static async getUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get stored user role
   */
  static async getUserRole() {
    try {
      const role = await AsyncStorage.getItem('userRole');
      return role ? role.toLowerCase() : null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Validate if user is authenticated
   */
  static async isAuthenticated() {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      const role = await this.getUserRole();

      if (!token || !user || !role) {
        return false;
      }

      // Validate role
      if (!VALID_ROLES.includes(role)) {
        console.warn('Invalid role detected:', role);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Verify token with backend
   */
  static async verifyToken() {
    try {
      const token = await this.getToken();

      if (!token) {
        return { valid: false, error: 'No token found' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update stored user data with fresh data
        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          await AsyncStorage.setItem('userRole', data.user.role.toLowerCase());
        }

        return { valid: true, user: data.user };
      } else {
        // Token is invalid or expired
        await this.logout();
        return { valid: false, error: data.message || 'Token verification failed' };
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(requiredRole) {
    try {
      const userRole = await this.getUserRole();
      
      if (!userRole) {
        return false;
      }

      const normalizedRequiredRole = requiredRole.toLowerCase();
      
      return userRole === normalizedRequiredRole;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  static async hasAnyRole(roles) {
    try {
      const userRole = await this.getUserRole();
      
      if (!userRole) {
        return false;
      }

      const normalizedRoles = roles.map(role => role.toLowerCase());
      
      return normalizedRoles.includes(userRole);
    } catch (error) {
      console.error('Error checking roles:', error);
      return false;
    }
  }

  /**
   * Store authentication data
   */
  static async storeAuthData(token, user) {
    try {
      if (!token || !user || !user.id || !user.email || !user.role) {
        throw new Error('Invalid auth data');
      }

      // Validate role
      const normalizedRole = user.role.toLowerCase();
      if (!VALID_ROLES.includes(normalizedRole)) {
        throw new Error(`Invalid role: ${user.role}`);
      }

      await AsyncStorage.multiSet([
        ['authToken', token],
        ['user', JSON.stringify(user)],
        ['userRole', normalizedRole],
        ['userId', String(user.id)],
        ['userEmail', user.email],
        ['loginTimestamp', new Date().toISOString()],
      ]);

      console.log('✅ Auth data stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw error;
    }
  }

  /**
   * Clear all authentication data (logout)
   */
  static async logout() {
    try {
      console.log('🚪 Logging out...');
      
      // Optionally notify backend
      const token = await this.getToken();
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.warn('Failed to notify backend of logout:', error);
        }
      }

      // Clear local storage
      await AsyncStorage.multiRemove([
        'authToken',
        'user',
        'userRole',
        'userId',
        'userEmail',
        'loginTimestamp',
        'loginMethod',
      ]);

      console.log('✅ Logout successful');
      return true;
    } catch (error) {
      console.error('❌ Logout error:', error);
      return false;
    }
  }

  /**
   * Get authentication headers for API requests
   */
  static async getAuthHeaders() {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return {
          'Content-Type': 'application/json',
        };
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  /**
   * Make authenticated API request
   */
  static async authenticatedRequest(endpoint, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Check if token expired
      if (response.status === 401) {
        console.warn('Token expired or invalid');
        await this.logout();
        throw new Error('Authentication required. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }

  /**
   * Get complete auth state
   */
  static async getAuthState() {
    try {
      const [token, user, role, userId, email, timestamp] = await AsyncStorage.multiGet([
        'authToken',
        'user',
        'userRole',
        'userId',
        'userEmail',
        'loginTimestamp',
      ]);

      return {
        isAuthenticated: !!(token[1] && user[1] && role[1]),
        token: token[1],
        user: user[1] ? JSON.parse(user[1]) : null,
        role: role[1],
        userId: userId[1],
        email: email[1],
        loginTimestamp: timestamp[1],
      };
    } catch (error) {
      console.error('Error getting auth state:', error);
      return {
        isAuthenticated: false,
        token: null,
        user: null,
        role: null,
        userId: null,
        email: null,
        loginTimestamp: null,
      };
    }
  }

  /**
   * Refresh user data from backend
   */
  static async refreshUserData() {
    try {
      const response = await this.authenticatedRequest('/auth/me', {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('userRole', data.user.role.toLowerCase());
        
        console.log('✅ User data refreshed');
        return { success: true, user: data.user };
      } else {
        console.error('Failed to refresh user data:', data.message);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AuthService;