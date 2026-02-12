import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AuthService from './AuthService';

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on authentication and role requirements
 * 
 * Usage:
 * <ProtectedRoute 
 *   allowedRoles={['builder']} 
 *   onUnauthorized={() => navigation.replace('Login')}
 * >
 *   <BuilderDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  onUnauthorized,
  onLoading,
  fallback = null,
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      console.log('\n🔒 Checking route authorization...');
      
      // Step 1: Check if authentication is required
      if (!requireAuth) {
        console.log('✅ No auth required - allowing access');
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Step 2: Check if user is authenticated
      const isAuthenticated = await AuthService.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log('❌ User not authenticated');
        setIsAuthorized(false);
        setIsChecking(false);
        
        if (onUnauthorized) {
          setTimeout(() => onUnauthorized('not_authenticated'), 100);
        }
        return;
      }

      console.log('✅ User is authenticated');

      // Step 3: Verify token with backend
      const verification = await AuthService.verifyToken();
      
      if (!verification.valid) {
        console.log('❌ Token verification failed:', verification.error);
        setIsAuthorized(false);
        setIsChecking(false);
        
        if (onUnauthorized) {
          setTimeout(() => onUnauthorized('token_invalid'), 100);
        }
        return;
      }

      console.log('✅ Token verified');

      // Step 4: Check role-based access if roles are specified
      if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = await AuthService.hasAnyRole(allowedRoles);
        
        if (!hasRole) {
          const userRole = await AuthService.getUserRole();
          console.log(`❌ Access denied - User role: ${userRole}, Required: ${allowedRoles.join(', ')}`);
          
          setIsAuthorized(false);
          setIsChecking(false);
          
          if (onUnauthorized) {
            setTimeout(() => onUnauthorized('insufficient_permissions'), 100);
          }
          return;
        }

        console.log('✅ User has required role');
      }

      // All checks passed
      console.log('✅ Authorization complete - Access granted\n');
      setIsAuthorized(true);
      setIsChecking(false);

    } catch (error) {
      console.error('❌ Authorization check error:', error);
      setIsAuthorized(false);
      setIsChecking(false);
      
      if (onUnauthorized) {
        setTimeout(() => onUnauthorized('error'), 100);
      }
    }
  };

  // Show loading state
  if (isChecking) {
    if (onLoading) {
      return onLoading();
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.loadingText}>Verifying access...</Text>
      </View>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    if (fallback) {
      return fallback;
    }

    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>Access Denied</Text>
        <Text style={styles.unauthorizedSubtext}>
          You don't have permission to access this page
        </Text>
      </View>
    );
  }

  // Render protected content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ProtectedRoute;