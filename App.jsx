import React, { useState, useEffect } from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import { SplashScreen } from './modules/user/screens/SplashScreen';
import { WelcomeScreen } from './modules/user/screens/WelcomeScreen';
import LoginScreen from './modules/auth/screens/LoginScreen';
import RegisterScreen from './modules/auth/screens/RegisterScreen';
import OTPVerificationScreen from './modules/auth/screens/OTPVerificationScreen';
import ForgotPassword from './modules/auth/screens/ForgotPassword';
import HomeScreen from './modules/user/screens/HomeScreen';
import ProfileScreen from './modules/user/screens/ProfileScreen';
import PropertyDetailScreen from './modules/property/screens/PropertyDetailScreen';
import SearchResultsScreen from './modules/property/screens/SearchResultsScreen';
import ExploreProperties from './modules/property/screens/ExploreProperties';
import BuilderDashboard from './modules/builder/screens/BuilderDashboard';
import ReportPropertyScreen from './modules/property/screens/ReportPropertyScreen';
import PaymentScreen from './store/PaymentScreen';
import AgentDashboard from './modules/agent/AgentDashboard';
import ResetPasswordScreen from './modules/auth/screens/ResetPasswordScreen';
const Text = RNText;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [screenStack, setScreenStack] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportPropertyData, setReportPropertyData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [otpContext, setOtpContext] = useState(''); // Track if OTP is for registration or forgot password

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '', // Default role
  });

  // 🔹 Splash Screen Timeout (fallback)
  useEffect(() => {
    if (currentScreen === 'splash') {
      const splashTimer = setTimeout(() => {
        console.log('⏱️ Splash timeout - auto-navigate to welcome');
        setCurrentScreen('welcome');
      }, 5000); // After 5 seconds, go to welcome if not already done

      return () => clearTimeout(splashTimer);
    }
  }, [currentScreen]);

  // 🔹 Navigation handler (Stack based)
  const navigateTo = (screen, params = {}) => {
    setScreenStack(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);

    // Handle property selection
    if (params.property) setSelectedProperty(params.property);

    // Handle search query
    if (params.query !== undefined) setSearchQuery(params.query);
    
    // Handle Report Property data
    if (params.propertyId || params.propertyName || params.propertyAddress || params.propertyPrice || params.propertyImage) {
      setReportPropertyData({
        propertyId: params.propertyId,
        propertyName: params.propertyName,
        propertyAddress: params.propertyAddress,
        propertyPrice: params.propertyPrice,
        propertyImage: params.propertyImage,
      });
    }

    // Handle Payment data
    if (params.propertyPrice) {
      setPaymentData({
        propertyId: params.propertyId,
        propertyName: params.propertyName,
        propertyPrice: params.propertyPrice,
      });
    }
  };

  const goBack = () => {
    setScreenStack(prev => {
      if (prev.length === 0) {
        // Fallback to home when stack is empty
        setCurrentScreen('home');
        return prev;
      }
      const last = prev[prev.length - 1];
      setCurrentScreen(last);
      return prev.slice(0, -1);
    });
  };

  const resetApp = () => {
    setScreenStack([]);
    setCurrentScreen('welcome');
    setSelectedProperty(null);
    setReportPropertyData(null);
    setPaymentData(null);
    setOtpContext('');
    setUserData({
      name: '',
      email: '',
      phone: '',
      role: '',
    });
  };

  const navigation = {
    navigate: navigateTo,
    goBack,
  };

  // 🔹 FIXED: Role-based navigation handler
  const handleLoginSuccess = (user) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 APP.JSX - HANDLING LOGIN SUCCESS');
    console.log('='.repeat(60));
    console.log('User data received:', {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      role: user?.role
    });

    if (!user) {
      console.error('❌ No user data provided');
      return;
    }

    // Update user data state
    setUserData({
      name: user.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      phone: user.phone || user.phoneNumber || '',
      role: user.role?.toLowerCase() || 'buyer',
      id: user.id,
    });

    // Normalize role
    const userRole = (user.role || 'buyer').toLowerCase().trim();
    console.log('📊 Normalized role:', userRole);

    // Clear navigation stack for fresh start
    setScreenStack([]);

    // Navigate based on role
    let targetScreen = 'home'; // Default

    switch (userRole) {
      case 'buyer':
        targetScreen = 'home';
        console.log('→ Navigating to Home (Buyer)');
        break;
        
      case 'builder':
        targetScreen = 'builderDashboard';
        console.log('→ Navigating to Builder Dashboard');
        break;
        
      case 'agent':
        targetScreen = 'agentDashboard';
        console.log('→ Navigating to Agent Dashboard');
        break;
        
      case 'admin':
        targetScreen = 'adminDashboard';
        console.log('→ Navigating to Admin Dashboard');
        break;
        
      default:
        console.warn(`⚠️ Unknown role: ${userRole}, defaulting to Home`);
        targetScreen = 'home';
        break;
    }

    setCurrentScreen(targetScreen);
    console.log('✅ Navigation complete');
    console.log('='.repeat(60) + '\n');
  };

  // 🔹 Render Screens
  const renderScreen = () => {
    console.log('🎬 Rendering screen:', currentScreen);

    switch (currentScreen) {

      case 'splash':
        return <SplashScreen onComplete={() => setCurrentScreen('welcome')} />;

      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={() => navigateTo('register')}
            onExploreAsBuilder={() => navigateTo('exploreProperties')}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            navigation={navigation}
            onBack={goBack}
            onNavigateToLoginSuccess={handleLoginSuccess}
            onForgotPassword={() => navigateTo('forgotPassword')}
            onRegister={() => navigateTo('register')}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            navigation={navigation}
            onBack={goBack}
            onRegisterSuccess={(user) => {
              if (user) {
                setUserData({
                  name: user.name || user.email?.split('@')[0] || 'User',
                  email: user.email,
                  phone: user.phone || user.phoneNumber || '',
                  role: user.role?.toLowerCase() || 'buyer',
                  id: user.id,
                });
              }
              navigateTo('otp', { otpContext: 'registration' });
            }}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );

      case 'otp':
        return (
          <OTPVerificationScreen
            onBack={goBack}
            onVerifySuccess={() => {
              console.log('🔐 OTP Verified, Context:', otpContext);
              
              // Check the context of OTP verification
              if (otpContext === 'forgotPassword') {
                // Forgot password flow: OTP → Reset Password
                console.log('→ Navigating to Reset Password (Forgot Password Flow)');
                navigateTo('resetPassword');
              } else {
                // Registration flow: OTP → Role-based dashboard
                const userRole = (userData.role || 'buyer').toLowerCase();
                console.log('→ Navigating based on role:', userRole);
                
                switch (userRole) {
                  case 'builder':
                    navigateTo('builderDashboard');
                    break;
                  case 'agent':
                    navigateTo('agentDashboard');
                    break;
                  default:
                    navigateTo('home');
                    break;
                }
              }
            }}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPassword
            navigation={navigation}
            onBack={goBack}
            onOtpSent={() => {
              // Navigate to OTP screen with forgot password context
              console.log('📧 OTP sent for forgot password');
              navigateTo('otp', { otpContext: 'forgotPassword' });
            }}
          />
        );

      case 'resetPassword':
        return (
          <ResetPasswordScreen
            onBack={goBack}
            onResetSuccess={() => {
              console.log('✅ Password reset successful, navigating to login');
              // Clear the stack and navigate to login
              setScreenStack([]);
              navigateTo('login');
            }}
          />
        );

      case 'home':
        return (
          <HomeScreen
            navigation={navigation}
            userName={userData.name}
            onProfilePress={() => navigateTo('profile')}
            onLogout={resetApp}
            onSearch={(query) => navigateTo('searchResults', { query })}
            onPropertyClick={(property) =>
              navigateTo('propertyDetail', { property })
            }
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            navigation={navigation}
            userName={userData.name}
            userEmail={userData.email}
            userPhone={userData.phone}
            onBack={goBack}
            onLogout={resetApp}
          />
        );

      case 'propertyDetail':
        return (
          <PropertyDetailScreen
            navigation={navigation}
            property={selectedProperty}
            onBack={goBack}
            route={{
              params: {
                propertyId: selectedProperty?.id || 'property-001',
                propertyName: selectedProperty?.name || 'Modern Luxury Villa',
                propertyAddress: selectedProperty?.address || '1245 Sunset Boulevard, Beverly Hills, CA 90210',
                propertyPrice: selectedProperty?.price || '$789,000',
              }
            }}
          />
        );

      case 'searchResults':
        return (
          <SearchResultsScreen
            navigation={navigation}
            searchQuery={searchQuery}
            onBack={goBack}
            onPropertyClick={(property) =>
              navigateTo('propertyDetail', { property })
            }
          />
        );

      case 'exploreProperties':
        return (
          <ExploreProperties
            navigation={navigation}
            onBack={goBack}
            onPropertyClick={(property) =>
              navigateTo('propertyDetail', { property })
            }
          />
        );

      case 'builderDashboard':
        return (
          <BuilderDashboard
            navigation={navigation}
            builderName={userData.name}
            onBack={goBack}
            onPropertyClick={(property) =>
              navigateTo('propertyDetail', { property })
            }
          />
        );

      case 'agentDashboard':
        return (
          <AgentDashboard
            navigation={navigation}
            agentName={userData.name}
            onBack={goBack}
          />
        );

      case 'adminDashboard':
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Admin Dashboard</Text>
            <Text style={styles.placeholderSubtext}>Coming Soon</Text>
          </View>
        );

      case 'ReportPropertyScreen':
        return (
          <ReportPropertyScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'PaymentScreen':
        return (
          <PaymentScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      default:
        console.warn('Unknown screen:', currentScreen);
        return (
          <WelcomeScreen
            onGetStarted={() => navigateTo('register')}
            onExploreAsBuilder={() => navigateTo('exploreProperties')}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6B7280',
  },
});