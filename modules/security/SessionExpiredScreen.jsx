import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Clock, Shield, Lock, Home, HelpCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const MAX_WIDTH = 440;
const CONTAINER_WIDTH = Math.min(width, MAX_WIDTH);

export default function App() {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Pattern Overlay */}
      <View style={styles.patternOverlay} />

      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner} />
          </View>
          <Text style={styles.appTitle}>RealEstate Pro</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Session Icon with Animation */}
        <View style={styles.iconSection}>
          {/* Outer pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          {/* Main icon container */}
          <View style={styles.iconContainer}>
            <Clock color="#FFFFFF" size={48} strokeWidth={1.5} />
            {/* Small lock badge */}
            <View style={styles.lockBadge}>
              <Lock color="#2563EB" size={16} strokeWidth={2} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Session Expired</Text>

        {/* Primary Message */}
        <Text style={styles.primaryMessage}>
          For your security, your session has expired due to inactivity.
        </Text>

        {/* Secondary Helper Text */}
        <Text style={styles.secondaryMessage}>
          Please log in again to continue accessing your account.
        </Text>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <View style={styles.securityIconContainer}>
            <Shield color="#16A34A" size={12} strokeWidth={2.5} />
          </View>
          <Text style={styles.securityText}>Your data is safe and secure</Text>
        </View>

        {/* Primary Action */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Lock color="#FFFFFF" size={20} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Log In Again</Text>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
              <Home color="#374151" size={16} style={styles.smallButtonIcon} />
              <Text style={styles.secondaryButtonText}>Go to Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
              <HelpCircle color="#374151" size={16} style={styles.smallButtonIcon} />
              <Text style={styles.secondaryButtonText}>Get Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Sessions expire after 30 minutes of inactivity
          </Text>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLinkText}>Help & Support</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLinkText}>Terms</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.copyright}>
          © 2026 RealEstate Pro. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    width: CONTAINER_WIDTH,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: '#EFF6FF',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoOuter: {
    width: 56,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoInner: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
    zIndex: 10,
  },
  iconSection: {
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: '#DBEAFE',
    borderRadius: 60,
    opacity: 0.5,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#3B82F6',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryMessage: {
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 8,
    maxWidth: 320,
    lineHeight: 24,
    fontSize: 15,
  },
  secondaryMessage: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 32,
    maxWidth: 280,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 32,
  },
  securityIconContainer: {
    width: 20,
    height: 20,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803D',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 384,
    gap: 12,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  smallButtonIcon: {
    marginRight: 6,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  infoSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  footer: {
    paddingBottom: 32,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  footerLinkText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  copyright: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
    color: '#9CA3AF',
  },
});