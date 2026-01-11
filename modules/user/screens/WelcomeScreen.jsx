import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Home, MapPin, Search, TrendingUp, ArrowLeft, Check } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Placeholder LoginScreen component
const LoginScreen = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#1a1a1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
      </View>
      <ScrollView contentContainerStyle={styles.loginContent}>
        <Text style={styles.loginTitle}>Welcome Back!</Text>
        <Text style={styles.loginSubtitle}>Sign in to continue</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.input}>
            <Text style={styles.inputPlaceholder}>Enter your email</Text>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.input}>
            <Text style={styles.inputPlaceholder}>Enter your password</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
        
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </ScrollView>
    </View>
  );
};

// Placeholder ExploreProperties component
const ExploreProperties = ({ onBack }) => {
  const properties = [
    { id: 1, title: 'Modern Villa', price: '$850,000', location: 'Beverly Hills, CA' },
    { id: 2, title: 'Downtown Apartment', price: '$450,000', location: 'New York, NY' },
    { id: 3, title: 'Beach House', price: '$1,200,000', location: 'Malibu, CA' },
    { id: 4, title: 'Suburban Home', price: '$380,000', location: 'Austin, TX' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color="#1a1a1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Properties</Text>
      </View>
      <ScrollView contentContainerStyle={styles.exploreContent}>
        {properties.map((property) => (
          <View key={property.id} style={styles.propertyCard}>
            <View style={styles.propertyImagePlaceholder}>
              <Home color="#2D6A4F" size={64} />
            </View>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <View style={styles.propertyLocationRow}>
                <MapPin color="#666666" size={16} />
                <Text style={styles.propertyLocation}>{property.location}</Text>
              </View>
              <Text style={styles.propertyPrice}>{property.price}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export function WelcomeScreen({ onGetStarted, onSignUp }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showExplore, setShowExplore] = useState(false);

  if (showLogin) {
    return <LoginScreen onBack={() => setShowLogin(false)} />;
  }

  if (showExplore) {
    return <ExploreProperties onBack={() => setShowExplore(false)} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1594904578869-c011783103c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMHNreWxpbmV8ZW58MXx8fHwxNzY2MDcxODc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />

          {/* Logo at Top */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Home color="#2D6A4F" size={24} />
            </View>
            <Text style={styles.logoText}>EstateHub</Text>
          </View>

          {/* Floating Feature Cards */}
          <View style={styles.featureCardsContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Search color="#2D6A4F" size={16} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Smart Search</Text>
                <Text style={styles.featureSubtitle}>Find properties fast</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <TrendingUp color="#2D6A4F" size={16} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Best Deals</Text>
                <Text style={styles.featureSubtitle}>Verified listings</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Find Your Dream Property</Text>
            <Text style={styles.subheadline}>
              Discover the perfect home, apartment, or investment property with
              trusted listings and expert guidance
            </Text>
          </View>

          {/* Feature Pills */}
          <View style={styles.pillsContainer}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Buy</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Sell</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Rent</Text>
            </View>
          </View>

          {/* Stats/Trust Indicators */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Properties</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statNumber}>5K+</Text>
              <Text style={styles.statLabel}>Happy Clients</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Agents</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowExplore(true)}
              activeOpacity={0.8}
            >
              <Search color="#2D6A4F" size={20} style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Explore Properties</Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Actions */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text
                style={styles.loginLink}
                onPress={() => setShowLogin(true)}
              >
                Login
              </Text>
            </Text>
          </View>

          {/* Trust Badge */}
          <View style={styles.trustBadge}>
            <View style={styles.trustBadgeIcon}>
              <Check color="#ffffff" size={12} strokeWidth={3} />
            </View>
            <Text style={styles.trustBadgeText}>
              Trusted by thousands of property seekers
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: 480,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  logoContainer: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.24,
  },
  featureCardsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 10,
    color: '#666666',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headlineContainer: {
    marginBottom: 12,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  pillsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(45, 106, 79, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 79, 0.2)',
  },
  pillText: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e5e5e5',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  ctaContainer: {
    gap: 12,
    marginTop: 'auto',
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(45, 106, 79, 0.3)',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2D6A4F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  loginContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  trustBadge: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  trustBadgeIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 12,
    color: '#666666',
  },
  // Login Screen Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  loginContent: {
    padding: 24,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputPlaceholder: {
    color: '#999999',
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
  // Explore Properties Styles
  exploreContent: {
    padding: 16,
  },
  propertyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
  },
  propertyImagePlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  propertyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666666',
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D6A4F',
  },
});