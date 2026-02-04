import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [screenStack, setScreenStack] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportPropertyData, setReportPropertyData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const [userData, setUserData] = useState({
    name: 'Sarah',
    email: 'sarah@example.com',
    phone: '+1 234 567 8900',
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
  };

  const navigation = {
    navigate: navigateTo,
    goBack,
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
            onNavigateToLoginSuccess={(user) => {
              if (user) setUserData(user);
              navigateTo('home');
            }}
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
              if (user) setUserData(user);
              navigateTo('otp');
            }}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );

      case 'otp':
        return (
          <OTPVerificationScreen
            navigation={navigation}
            onBack={goBack}
            onVerifySuccess={() => navigateTo('home')}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPassword
            navigation={navigation}
            onBack={goBack}
            onResetSuccess={() => navigateTo('login')}
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

      case 'ReportPropertyScreen':
        return (
          <ReportPropertyScreen
            navigation={navigation}
            onBack={goBack}
            route={{
              params: {
                propertyId: reportPropertyData?.propertyId || 'property-001',
                propertyName: reportPropertyData?.propertyName || 'Modern Luxury Villa',
                propertyAddress: reportPropertyData?.propertyAddress || '1245 Sunset Boulevard, Beverly Hills, CA 90210',
                propertyPrice: reportPropertyData?.propertyPrice || '$789,000',
                propertyImage: reportPropertyData?.propertyImage || 'https://images.unsplash.com/photo-1706808849780-7a04fbac83ef',
              },
            }}
          />
        );

      case 'PaymentScreen':
        return (
          <PaymentScreen
            navigation={navigation}
            onBack={goBack}
            route={{
              params: {
                propertyId: paymentData?.propertyId || 'property-001',
                propertyName: paymentData?.propertyName || 'Modern Luxury Villa',
                propertyPrice: paymentData?.propertyPrice || '$789,000',
              },
            }}
          />
        );

      default:
        console.warn('⚠️ Unknown screen:', currentScreen);
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
});