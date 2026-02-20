import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import BuilderRequestListScreen from './modules/builder/screens/BuilderRequestListScreen';
import BuilderRequestDetailScreen from './modules/builder/screens/BuilderRequestDetailScreen';
import ReportPropertyScreen from './modules/property/screens/ReportPropertyScreen';
import AddProperty from './modules/property/screens/AddProperties';
import BuilderInquiriesScreen from './modules/builder/screens/BuilderInquiriesScreen';
import PaymentScreen from './store/PaymentScreen';
import ChatScreen from './modules/chat/screens/ChatScreen';
import ChatListScreen from './modules/chat/screens/ChatListScreen';
import AddPropertiesAgent from './modules/property/screens/AddPropertiesAgent';
import AgentDashboard from './modules/agent/AgentDashboardScreen';
import MyListingsScreen from './modules/property/screens/MyListingsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [screenStack, setScreenStack] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportPropertyData, setReportPropertyData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [userData, setUserData] = useState(null);

  // 🔹 Load User Data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUserData(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
    };
    loadUser();
  }, []);

  // 🔹 Splash Screen Timeout (fallback)
  useEffect(() => {
    if (currentScreen === 'splash') {
      const splashTimer = setTimeout(() => {
        console.log('⏱️ Splash timeout - auto-navigate to welcome');
        setCurrentScreen('welcome');
      }, 5000);

      return () => clearTimeout(splashTimer);
    }
  }, [currentScreen]);

  // 🔹 Navigation handler (Stack based)
  // const navigateTo = (screen, params = {}) => {
  //   setScreenStack(prev => [...prev, currentScreen]);
  //   setCurrentScreen(screen);

  //   if (params.property) setSelectedProperty(params.property);
  //   if (params.requestId !== undefined) setSelectedRequestId(params.requestId);
  //   if (params.query !== undefined) setSearchQuery(params.query);

  //   if (params.propertyId || params.propertyName || params.propertyAddress || params.propertyPrice || params.propertyImage) {
  //     setReportPropertyData({
  //       propertyId: params.propertyId,
  //       propertyName: params.propertyName,
  //       propertyAddress: params.propertyAddress,
  //       propertyPrice: params.propertyPrice,
  //       propertyImage: params.propertyImage,
  //     });
  //   }

  //   if (params.propertyPrice) {
  //     setPaymentData({
  //       propertyId: params.propertyId,
  //       propertyName: params.propertyName,
  //       propertyPrice: params.propertyPrice,
  //     });
  //   }

  //   if (screen === 'chat') {
  //     setChatData({
  //       chatId: params.chatId,
  //       inquiryId: params.inquiryId,
  //     });
  //   }
  // };

  const navigateTo = (screen, params = {}) => {
    const normalizedScreen =
      screen === 'PropertyDetailScreen' ? 'propertyDetail' : screen;

    // 🚫 Prevent propertyDetail without property
    if (normalizedScreen === 'propertyDetail' && !params.property) {
      console.warn("⚠️ Tried to open propertyDetail without property.");
      return;
    }

    // 🧹 Clear selectedProperty when leaving propertyDetail
    if (normalizedScreen !== 'propertyDetail') {
      setSelectedProperty(null);
    }

    setScreenStack(prev => [...prev, currentScreen]);
    setCurrentScreen(normalizedScreen);

    // ✅ Only set property when navigating to propertyDetail
    if (normalizedScreen === 'propertyDetail') {
      setSelectedProperty(params.property);
    }

    if (params.requestId !== undefined)
      setSelectedRequestId(params.requestId);

    if (params.query !== undefined)
      setSearchQuery(params.query);

    if (
      params.propertyId ||
      params.propertyName ||
      params.propertyAddress ||
      params.propertyPrice ||
      params.propertyImage
    ) {
      setReportPropertyData({
        propertyId: params.propertyId,
        propertyName: params.propertyName,
        propertyAddress: params.propertyAddress,
        propertyPrice: params.propertyPrice,
        propertyImage: params.propertyImage,
      });
    }

    if (params.propertyPrice) {
      setPaymentData({
        propertyId: params.propertyId,
        propertyName: params.propertyName,
        propertyPrice: params.propertyPrice,
      });
    }

    if (normalizedScreen === 'chat') {
      setChatData({
        chatId: params.chatId,
        inquiryId: params.inquiryId,
      });
    }
  };


  const goBack = () => {
    setScreenStack(prev => {
      if (prev.length === 0) {
        setCurrentScreen('home');
        return prev;
      }
      const last = prev[prev.length - 1];
      setCurrentScreen(last);
      return prev.slice(0, -1);
    });
  };

  const resetApp = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'user', 'userRole', 'userId', 'loginMethod']);
      setUserData(null);
      setScreenStack([]);
      setCurrentScreen('welcome');
      setSelectedProperty(null);
      setSelectedRequestId(null);
      setReportPropertyData(null);
      setPaymentData(null);
      setChatData(null);
    } catch (e) {
      console.error('Error during logout:', e);
    }
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
            userName={userData?.name}
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
            userName={userData?.name}
            userEmail={userData?.email}
            userPhone={userData?.phone}
            onBack={goBack}
            onLogout={resetApp}
          />
        );

      case 'propertyDetail':
        return (
          <PropertyDetailScreen
            navigation={navigation}
            onBack={goBack}
            route={{
              params: {
                property: selectedProperty,
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
            builderName={userData?.name}
            onBack={goBack}
            onPropertyClick={(property) =>
              navigateTo('propertyDetail', { property })
            }
            onAddProperty={() => navigateTo('addProperty')}
          />
        );

      case 'builderInquiries':
        return (
          <BuilderInquiriesScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'builderRequests':
        return (
          <BuilderRequestListScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'builderRequestDetail':
        return (
          <BuilderRequestDetailScreen
            navigation={navigation}
            onBack={goBack}
            requestId={selectedRequestId}
          />
        );

      case 'agentDashboard':
        return (
          <AgentDashboard
            navigation={navigation}
            agentName={userData?.name}
            onBack={goBack}
          />
        );

      case 'addProperty':
        return (
          <AddProperty
            onBack={goBack}
            onPropertyAdded={() => {
              navigateTo('builderDashboard');
            }}
          />
        );

      case 'addPropertyAgent':
        return (
          <AddPropertiesAgent
            onBack={goBack}
            onPropertyAdded={() => {
              navigateTo('agentDashboard');
            }}
          />
        );

      case 'myListings':
        return (
          <MyListingsScreen
            navigation={{
              navigate: navigateTo,
              goBack: goBack
            }}
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

      case 'chat':
        return (
          <ChatScreen
            navigation={navigation}
            onBack={goBack}
            route={{
              params: {
                chatId: chatData?.chatId,
                inquiryId: chatData?.inquiryId
              }
            }}
            user={userData}
          />
        );



      case 'chatList':
        return (
          <ChatListScreen
            navigation={navigation}
            onBack={goBack}
            user={userData}
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