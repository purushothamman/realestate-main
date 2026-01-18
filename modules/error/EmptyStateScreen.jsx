import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { Home, RefreshCw, Search, MessageCircle } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RealEstateEmptyState = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const spinValue = new Animated.Value(0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    setTimeout(() => {
      setIsRefreshing(false);
      spinValue.setValue(0);
    }, 1500);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Decorative Background Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Home color="#ffffff" size={24} strokeWidth={2.5} />
          </View>
          <Text style={styles.appName}>EstateHub</Text>
        </View>
        <Text style={styles.tagline}>Your Real Estate Partner</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Icon/Illustration */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBox}>
            <Search color="#cbd5e1" size={64} strokeWidth={1.5} />
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>No Properties Found</Text>

        {/* Explanatory Text */}
        <Text style={styles.description}>
          There is currently no content to display here.
        </Text>

        {/* Secondary Guidance */}
        <Text style={styles.guidance}>
          Add new listings, refresh the page, or check back later for updated property information.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Primary CTA */}
          <TouchableOpacity 
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Home color="#ffffff" size={20} />
            <Text style={styles.primaryButtonText}>Add New Property</Text>
          </TouchableOpacity>

          {/* Secondary CTA */}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <RefreshCw color="#2563eb" size={20} />
            </Animated.View>
            <Text style={styles.secondaryButtonText}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>

          {/* Tertiary Action */}
          <TouchableOpacity 
            style={styles.tertiaryButton}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryButtonText}>Browse Listings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help & Support + Footer */}
      <View style={styles.footer}>
        {/* Support Link */}
        <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
          <MessageCircle color="#64748b" size={16} />
          <Text style={styles.supportText}>Need assistance? Contact Support</Text>
        </TouchableOpacity>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLinkText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 24,
    minHeight: SCREEN_HEIGHT,
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 80,
    height: 80,
    backgroundColor: '#dbeafe',
    borderRadius: 40,
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 128,
    right: 40,
    width: 128,
    height: 128,
    backgroundColor: '#bfdbfe',
    borderRadius: 64,
    opacity: 0.3,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 10,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  iconBox: {
    width: 128,
    height: 128,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 280,
    lineHeight: 24,
  },
  guidance: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  tertiaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#64748b',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLinkText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  footerDivider: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default RealEstateEmptyState;