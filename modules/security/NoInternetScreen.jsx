import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Linking,
} from 'react-native';
import { Wifi, WifiOff, RefreshCw, Settings, Home, HelpCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function NoInternetScreen() {
  const [isRetrying, setIsRetrying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRetrying) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animations
      const createWaveAnimation = (anim, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      Animated.parallel([
        createWaveAnimation(waveAnim1, 0),
        createWaveAnimation(waveAnim2, 500),
        createWaveAnimation(waveAnim3, 1000),
      ]).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
    }
  }, [isRetrying]);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate retry attempt
    setTimeout(() => {
      setIsRetrying(false);
      // In real app, check connectivity using NetInfo
      // import NetInfo from '@react-native-community/netinfo';
      // NetInfo.fetch().then(state => { ... });
    }, 1500);
  };

  const handleOpenSettings = () => {
    // Open device network settings
    Linking.openSettings();
  };

  const handleGoHome = () => {
    // In real app: navigation.navigate('Home')
    console.log('Navigating to home...');
  };

  const handleContactSupport = () => {
    // In real app: navigation.navigate('Support') or open email
    console.log('Opening support...');
  };

  const WaveCircle = ({ animValue }) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.75, 1],
      outputRange: [0.5, 0.2, 0],
    });

    return (
      <Animated.View
        style={[
          styles.waveCircle,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Home color="#2563eb" size={28} strokeWidth={2} />
          <Text style={styles.brandText}>EstateHub</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.statusIconWrapper}>
            <WifiOff color="#94a3b8" size={20} />
            <View style={styles.statusDot} />
          </View>
          <Text style={styles.statusText}>Offline Mode</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Illustration with Animation */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <WifiOff color="#60a5fa" size={64} strokeWidth={1.5} />
            </Animated.View>
          </View>

          {/* Animated Waves */}
          {isRetrying && (
            <View style={styles.wavesContainer}>
              <WaveCircle animValue={waveAnim1} />
              <WaveCircle animValue={waveAnim2} />
              <WaveCircle animValue={waveAnim3} />
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>No Internet Connection</Text>

        {/* Description */}
        <Text style={styles.description}>
          You're currently offline. Please check your internet connection and try again.
        </Text>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          Some features may not be available without an active connection.
        </Text>

        {/* Offline Support Message */}
        <View style={styles.offlineCard}>
          <Text style={styles.offlineCardText}>
            Previously viewed properties may still be available.
          </Text>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isRetrying && styles.primaryButtonDisabled]}
          onPress={handleRetry}
          disabled={isRetrying}
          activeOpacity={0.8}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: isRetrying
                    ? pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: ['0deg', '360deg'],
                      })
                    : '0deg',
                },
              ],
            }}
          >
            <RefreshCw color="#ffffff" size={20} />
          </Animated.View>
          <Text style={styles.primaryButtonText}>
            {isRetrying ? 'Checking...' : 'Try Again'}
          </Text>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleOpenSettings}
            activeOpacity={0.8}
          >
            <Settings color="#475569" size={16} />
            <Text style={styles.secondaryButtonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Home color="#475569" size={16} />
            <Text style={styles.secondaryButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help Section */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleContactSupport}
          activeOpacity={0.7}
        >
          <HelpCircle color="#64748b" size={16} />
          <Text style={styles.helpText}>Need help? Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    width: 440,
    height: 956,
  },
  header: {
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  statusIconWrapper: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    backgroundColor: '#f97316',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -64,
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wavesContainer: {
    position: 'absolute',
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveCircle: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: '#93c5fd',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 320,
    lineHeight: 24,
  },
  helperText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 40,
  },
  offlineCard: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
    maxWidth: 320,
    width: '100%',
  },
  offlineCardText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: '100%',
    maxWidth: 320,
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 320,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#64748b',
  },
});