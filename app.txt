import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from './modules/user/screens/SplashScreen';
import { WelcomeScreen } from './modules/user/screens/WelcomeScreen';
import LoginScreen from './modules/auth/screens/LoginScreen';
import RegisterScreen from './modules/auth/screens/RegisterScreen';
import OTPVerificationScreen from './modules/auth/screens/OTPVerificationScreen';
import HomeScreen from './modules/user/screens/HomeScreen';
import ForgotPassword from './modules/auth/screens/ForgotPassword';
import ProfileScreen from './modules/user/screens/ProfileScreen';
import PropertyDetailScreen from './modules/property/screens/PropertyDetailScreen';
import ExploreProperties from './modules/builder/screens/ExploreProperties';
import BuilderDashboard from './modules/builder/screens/BuilderDashboard';
import SearchResultsScreen from './modules/property/screens/SearchResultsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [previousScreen, setPreviousScreen] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState({
    name: 'Sarah',
    email: 'sarah@example.com',
    phone: '+1 234 567 8900',
  });

  // Navigation handler with history tracking
  const navigateTo = (screen, params = {}) => {
    // Store previous screen for back navigation
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    
    // Handle role selection
    if (params.role) {
      setUserRole(params.role);
    }
    
    // Handle property selection
    if (params.property) {
      setSelectedProperty(params.property);
    }

    // Handle search query
    if (params.query !== undefined) {
      setSearchQuery(params.query);
    }
  };

  // Create a navigation object to pass to components
  const navigation = {
    navigate: (screen, params = {}) => navigateTo(screen, params),
    goBack: () => {
      // Improved back navigation logic
      const navigationMap = {
        'propertyDetail': previousScreen || 'home',
        'profile': 'home',
        'home': 'welcome',
        'home': 'exploreProperties',
        'login': 'welcome',
        'register': 'login',
        'otp': 'register',
        'forgotPassword': 'login',
        'builderDashboard': 'home',
        'searchResults': 'home',
      };
      
      const targetScreen = navigationMap[currentScreen] || 'welcome';
      navigateTo(targetScreen);
    },
  };

  // Reset user data helper
  const resetUserData = () => {
    setUserData({
      name: 'Sarah',
      email: 'sarah@example.com',
      phone: '+1 234 567 8900',
    });
    setUserRole(null);
    setSelectedProperty(null);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen 
            onComplete={() => navigateTo('welcome')} 
            duration={3500} 
          />
        );

      case 'welcome':
        return (
          <WelcomeScreen 
            onGetStarted={() => navigateTo('login')}
            onExploreAsBuilder={() => navigateTo('exploreProperties')}
            onLogin={() => navigateTo('login')}
          />
        );

      case 'login':
        return (
          <LoginScreen 
            onBack={() => navigateTo('welcome')}
            onLoginSuccess={(user) => {
              if (user) {
                setUserData(user);
              }
              navigateTo('home');
            }}
            onForgotPassword={() => navigateTo('forgotPassword')}
            onRegister={() => navigateTo('register')}
          />
        );

      case 'register':
        return (
          <RegisterScreen 
            onBack={() => navigateTo('login')}
            onRegisterSuccess={(user) => {
              if (user) {
                setUserData(user);
              }
              navigateTo('otp');
            }}
            onLogin={() => navigateTo('login')}
          />
        );

      case 'otp':
        return (
          <OTPVerificationScreen 
            onBack={() => navigateTo('register')}
            onVerifySuccess={() => navigateTo('home')}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPassword 
            onBack={() => navigateTo('login')}
            onResetSuccess={() => navigateTo('login')}
          />
        );

      case 'home':
        return (
          <HomeScreen 
            navigation={navigation}
            userName={userData.name}
            onProfilePress={() => navigateTo('profile')}
            onProfile={() => navigateTo('profile')}
            onLogout={() => {
              resetUserData();
              navigateTo('welcome');
            }}
            onSearch={(query) => {
              navigateTo('searchResults', { query });
            }}
            onPropertyClick={(property) => {
              navigateTo('propertyDetail', { property });
            }}
          />
        );

      case 'propertyDetail':
        return (
          <PropertyDetailScreen 
            navigation={navigation}
            property={selectedProperty}
            onBack={() => {
              // Go back to the previous screen
              const backScreen = previousScreen === 'propertyDetail' ? 'home' : (previousScreen || 'home');
              navigateTo(backScreen);
            }}
            onScheduleViewing={() => console.log('Schedule Viewing')}
            onMakeOffer={() => console.log('Make Offer')}
            onVirtualTour={() => console.log('Virtual Tour')}
            onContactAgent={() => console.log('Contact Agent')}
          />
        );

      case 'profile':
        return (
          <ProfileScreen 
            navigation={navigation}
            userName={userData.name}
            userEmail={userData.email}
            userPhone={userData.phone}
            onBack={() => navigateTo('home')}
            onLogout={() => {
              resetUserData();
              navigateTo('welcome');
            }}
            onEditProfile={() => console.log('Edit Profile')}
            onMyProperties={() => console.log('My Properties')}
            onFavorites={() => console.log('Favorites')}
            onNotifications={() => console.log('Notifications')}
            onHelpSupport={() => console.log('Help & Support')}
            onChangePassword={() => console.log('Change Password')}
            onSettings={() => console.log('Settings')}
          />
        );

      case 'exploreProperties':
        return (
          <ExploreProperties 
            navigation={navigation}
            onBack={() => navigateTo('welcome')}
            onPropertyClick={(property) => {
              navigateTo('propertyDetail', { property });
            }}
          />
        );

      case 'builderDashboard':
        return (
          <BuilderDashboard 
            navigation={navigation}
            builderName={userData.name}
            onBack={() => navigateTo('home')}
            onPropertyClick={(property) => {
              navigateTo('propertyDetail', { property });
            }}
            onAddProperty={() => console.log('Add Property')}
            onMyProperties={() => console.log('My Properties')}
          />
        );

      case 'searchResults':
        return (
          <SearchResultsScreen 
            navigation={navigation}
            searchQuery={searchQuery}
            onBack={() => navigateTo('home')}
            onPropertyClick={(property) => {
              navigateTo('propertyDetail', { property });
            }}
          />
        );

      default:
        // Fallback to home screen
        return (
          <HomeScreen 
            navigation={navigation}
            userName={userData.name}
            onProfilePress={() => navigateTo('profile')}
            onProfile={() => navigateTo('profile')}
            onLogout={() => {
              resetUserData();
              navigateTo('welcome');
            }}
            onSearch={(query) => {
              navigateTo('searchResults', { query });
            }}
            onPropertyClick={(property) => {
              navigateTo('propertyDetail', { property });
            }}
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
    backgroundColor: '#ffffff',
  },
});