import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { AlertCircle, Home, Mail, RefreshCw } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ErrorScreen = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const pulseAnim = new Animated.Value(1);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      console.log('Retrying connection...');
    }, 1500);
  };

  const handleGoHome = () => {
    console.log('Navigating to Home...');
  };

  const handleContactSupport = () => {
    console.log('Opening support contact...');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Home color="#F97316" size={32} />
          <Text style={styles.appName}>EstateHub</Text>
        </View>
        <Text style={styles.tagline}>Your Real Estate Partner</Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Error Icon with Animation */}
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.5],
                  outputRange: [0.25, 0],
                }),
              },
            ]}
          />
          <View style={styles.iconCircle}>
            <AlertCircle color="#F97316" size={64} strokeWidth={2} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Oops! Something Went Wrong</Text>

        {/* Description */}
        <Text style={styles.description}>
          We encountered an unexpected error. Please try again.
        </Text>

        {/* Secondary Text */}
        <Text style={styles.secondaryText}>
          If the problem persists, contact our support team for assistance.
        </Text>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isRetrying && styles.buttonDisabled]}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
        >
          <RefreshCw
            color="#FFFFFF"
            size={20}
            style={isRetrying && styles.spinIcon}
          />
          <Text style={styles.primaryButtonText}>
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Text>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContactSupport}
            activeOpacity={0.7}
          >
            <Mail color="#374151" size={16} />
            <Text style={styles.secondaryButtonText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <TouchableOpacity onPress={handleContactSupport} activeOpacity={0.6}>
          <Text style={styles.helpText}>Need help? Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.footerLink}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.copyright}>
          © 2026 EstateHub. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    width: 440,
    height: 956,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tagline: {
    fontSize: 12,
    color: '#6B7280',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -48,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FED7AA',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  secondaryText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#F97316',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spinIcon: {
    transform: [{ rotate: '360deg' }],
  },
  secondaryActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 16,
    gap: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerDivider: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ErrorScreen;