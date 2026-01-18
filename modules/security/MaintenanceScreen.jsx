import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Dimensions,
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Icon Components
const HomeIcon = ({ size = 40, color = '#2563eb' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12h6v10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SettingsIcon = ({ size = 48, color = '#fff', rotation }) => (
  <Animated.View style={{ transform: [{ rotate: rotation }] }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
      <Path
        d="M12 1v6m0 6v6M23 12h-6m-6 0H5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  </Animated.View>
);

const RefreshIcon = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4v6h-6M1 20v-6h6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MailIcon = ({ size = 20, color = '#475569' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6l-10 7L2 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon = ({ size = 20, color = '#64748b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Path
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const AlertIcon = ({ size = 20, color = '#64748b' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Path d="M12 8v4m0 4h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const MaintenanceScreen = () => {
  const [isRotating, setIsRotating] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleRetry = () => {
    setIsRotating(true);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
      setIsRotating(false);
      // Simulate retry logic
      console.log('Checking server status...');
    });
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@realestate.com');
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <HomeIcon size={40} color="#2563eb" />
        </View>
        <Text style={styles.appName}>RealEstate Pro</Text>
      </View>

      {/* Maintenance Icon */}
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[
            styles.iconPulse,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <View style={styles.iconCircle}>
          <SettingsIcon size={48} color="#fff" rotation={rotation} />
        </View>
      </View>

      {/* Main Content Card */}
      <View style={styles.card}>
        <Text style={styles.title}>We're Under Maintenance</Text>

        <Text style={styles.description}>
          Our services are temporarily unavailable while we perform scheduled
          maintenance.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            We'll be back shortly. Thank you for your patience.
          </Text>
        </View>

        {/* Maintenance Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <ClockIcon size={20} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Expected Duration</Text>
              <Text style={styles.detailText}>Approximately 30-60 minutes</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <AlertIcon size={20} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Maintenance Type</Text>
              <Text style={styles.detailText}>Scheduled System Update</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <RefreshIcon size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Check Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleContactSupport}
          activeOpacity={0.8}
        >
          <MailIcon size={20} color="#475569" />
          <Text style={styles.secondaryButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* Support Link */}
      <View style={styles.supportSection}>
        <Text style={styles.supportText}>
          Need assistance?{' '}
          <Text style={styles.supportLink} onPress={handleContactSupport}>
            Contact Support
          </Text>
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 RealEstate Pro. All rights reserved.
        </Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerDivider}>•</Text>
          <Text style={styles.footerLink}>Terms of Service</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    minHeight: 956,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  iconPulse: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#93c5fd',
    opacity: 0.2,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
  },
  supportSection: {
    marginBottom: 24,
  },
  supportText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  supportLink: {
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  footerDivider: {
    fontSize: 12,
    color: '#cbd5e1',
    marginHorizontal: 8,
  },
});

export default MaintenanceScreen;