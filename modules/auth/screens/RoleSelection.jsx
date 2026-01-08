import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Home, Building2, User, ArrowRight, ArrowLeft } from 'lucide-react-native';
import HomeScreen from '../../user/screens/HomeScreen';
// import BuilderDashboard from './BuilderDashboard';

const { width, height } = Dimensions.get('window');

export default function RoleSelection({ navigation }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showNextScreen, setShowNextScreen] = useState(false);

  const handleRoleSelect = (role) => {
    console.log(`Selected role: ${role}`);
    setSelectedRole(role);
    setShowNextScreen(true);
  };

  const handleBack = () => {
    setShowNextScreen(false);
    setSelectedRole(null);
  };

  const handleBackToWelcome = () => {
    // Navigate back to Welcome screen
    if (navigation) {
      navigation.navigate('Welcome');
    }
  };

  // Show HomeScreen for user role
  if (showNextScreen && selectedRole === 'user') {
    return <HomeScreen onBack={handleBack} />;
  }

  // Show BuilderDashboard for builder role
  // if (showNextScreen && selectedRole === 'builder') {
  //   return <BuilderDashboard onBack={handleBack} />;
  // }

  return (
    <View style={styles.container}>
      {/* Background Image with Overlay */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1664892798972-079f15663b16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjYwNzE1Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay for Readability */}
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToWelcome}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <ArrowLeft color="#FFFFFF" size={24} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Home color="#FFFFFF" size={40} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>EstateHub</Text>
        </View>

        {/* Main Content - Centered */}
        <View style={styles.mainContent}>
          {/* Headline and Subtext */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Choose Your Role</Text>
            <Text style={styles.subtext}>
              Select how you want to continue in the app.
            </Text>
          </View>

          {/* Role Selection Cards */}
          <View style={styles.cardsContainer}>
            {/* User Role Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleRoleSelect('user')}
              style={styles.roleCard}
            >
              <View style={styles.cardContent}>
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <User color="#2D6A4F" size={28} strokeWidth={2} />
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  <Text style={styles.roleTitle}>User</Text>
                  <Text style={styles.roleDescription}>
                    Buy, rent, and explore properties
                  </Text>
                </View>

                {/* Arrow Icon */}
                <ArrowRight
                  color="#2D6A4F"
                  size={24}
                  strokeWidth={2}
                  style={styles.arrowIcon}
                />
              </View>
            </TouchableOpacity>

            {/* Builder Role Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleRoleSelect('builder')}
              style={styles.roleCard}
            >
              <View style={styles.cardContent}>
                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <Building2 color="#2D6A4F" size={28} strokeWidth={2} />
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  <Text style={styles.roleTitle}>Builder</Text>
                  <Text style={styles.roleDescription}>
                    List, manage, and sell properties
                  </Text>
                </View>

                {/* Arrow Icon */}
                <ArrowRight
                  color="#2D6A4F"
                  size={24}
                  strokeWidth={2}
                  style={styles.arrowIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Conditions
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 20,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 20,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 64,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  roleTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleDescription: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  arrowIcon: {
    marginTop: 4,
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
});