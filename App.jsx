import React, { useState } from 'react';
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

  const [userData, setUserData] = useState({
    name: 'Sarah',
    email: 'sarah@example.com',
    phone: '+1 234 567 8900',
  });

  // 🔹 Navigation handler (Stack based)
  const navigateTo = (screen, params = {}) => {
    setScreenStack(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);

    if (params.property) setSelectedProperty(params.property);
    if (params.query !== undefined) setSearchQuery(params.query);
    if (params.propertyId || params.propertyName) {
      setReportPropertyData({
        propertyId: params.propertyId,
        propertyName: params.propertyName,
      });
    }
  };

  const goBack = () => {
    setScreenStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setCurrentScreen(last);
      return prev.slice(0, -1);
    });
  };

  const resetApp = () => {
    setScreenStack([]);
    setCurrentScreen('welcome');
    setSelectedProperty(null);
  };

  const navigation = {
    navigate: navigateTo,
    goBack,
  };

  // 🔹 Render Screens
  const renderScreen = () => {
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
            onBack={goBack}
            onVerifySuccess={() => navigateTo('home')}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPassword
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
            route={{ params: { propertyId: selectedProperty?.id || 'property-001' } }}
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
              },
            }}
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
        return null;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});