import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import EditScreen from './modules/user/screens/EditScreen';
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
import PropertyEditScreen from './modules/property/screens/PropertyEditScreen';

import UserNavigator from './navigation/UserNavigator';
import FavoritesScreen from './modules/user/screens/FavoritesScreen';
import AssignAgentScreen from './modules/builder/screens/AssignAgentScreen';
import AgentNotificationsScreen from './modules/agent/AgentNotificationsScreen';
import BuilderNotificationsScreen from './modules/builder/screens/BuilderNotificationsScreen';
import AgentInquiriesScreen from './modules/agent/AgentInquiriesScreen';
import BuyerNotificationsScreen from './modules/user/screens/BuyerNotificationsScreen';
import ScheduleViewingScreen from './modules/property/screens/ScheduleViewingScreen';
import VirtualTourScreen from './modules/property/screens/VirtualTourScreen';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from './utils/api';

// Screens that should always hard-navigate to 'home' when back is pressed
const SCREENS_BACK_TO_HOME = [
  'agentNotifications',
  'builderNotifications',
  'buyerNotifications',
];

const PRE_AUTH_SCREENS = ['splash', 'welcome', 'login', 'register', 'otp', 'forgotPassword'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [screenStack, setScreenStack] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageCount, setMessageCount] = useState(0);

  const [reportPropertyData, setReportPropertyData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [editPropertyData, setEditPropertyData] = useState(null);
  const [scheduleViewingData, setScheduleViewingData] = useState(null);
  const [virtualTourData, setVirtualTourData] = useState(null);

  // Keep a ref to userData so goBack/navigate can read it without
  // needing it as a useCallback dependency (avoids stale closures).
  const userDataRef = React.useRef(userData);
  useEffect(() => { userDataRef.current = userData; }, [userData]);

  // 🔹 Fetch Unread Messages Count
  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const totalUnread = data.reduce((sum, chat) => sum + (chat.unread || 0), 0);
        setMessageCount(totalUnread);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userData]);

  // 🔹 Load persisted user session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) setUserData(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to load user session:', e);
      }
    };
    loadUser();
  }, []);

  const refreshUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const fullProfile = await response.json();
        setUserData(fullProfile);
        await AsyncStorage.setItem('user', JSON.stringify(fullProfile));
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  // 🔹 Splash Screen Timeout (fallback)
  useEffect(() => {
    if (currentScreen === 'splash') {
      const t = setTimeout(() => setCurrentScreen('welcome'), 5000);
      return () => clearTimeout(t);
    }
  }, [currentScreen]);

  // ─────────────────────────────────────────────────────────────────
  // navigate — uses functional state updaters so it NEVER needs to
  // close over currentScreen/screenStack, making it safe with an
  // empty dependency array. This gives it a stable identity for the
  // lifetime of the app, which in turn makes the `navigation` useMemo
  // stable and prevents child screens from receiving stale callbacks.
  // ─────────────────────────────────────────────────────────────────
  const navigate = useCallback((screen, params = {}) => {
    const normalizedScreen =
      screen === 'PropertyDetailScreen' ? 'propertyDetail' : screen;

    if (normalizedScreen === 'propertyDetail' && !params.property) {
      console.warn('⚠️ Tried to open propertyDetail without property.');
      return;
    }

    if (normalizedScreen !== 'propertyDetail') {
      setSelectedProperty(null);
    }

    // Push the screen we are LEAVING onto the stack, then switch.
    // Using a single setCurrentScreen functional updater ensures the
    // pushed value is always the true current screen, not a stale one.
    setCurrentScreen(prev => {
      setScreenStack(stack => [...stack, prev]);
      return normalizedScreen;
    });

    if (normalizedScreen === 'propertyDetail') setSelectedProperty(params.property);
    if (params.requestId  !== undefined)        setSelectedRequestId(params.requestId);
    if (params.query      !== undefined)        setSearchQuery(params.query);

    if (params.propertyId || params.propertyName || params.propertyAddress ||
        params.propertyPrice || params.propertyImage) {
      setReportPropertyData({
        propertyId:      params.propertyId,
        propertyName:    params.propertyName,
        propertyAddress: params.propertyAddress,
        propertyPrice:   params.propertyPrice,
        propertyImage:   params.propertyImage,
      });
    }

    if (params.propertyPrice) {
      setPaymentData({
        propertyId:   params.propertyId,
        propertyName: params.propertyName,
        propertyPrice: params.propertyPrice,
      });
    }

    if (normalizedScreen === 'chat') {
      setChatData({ chatId: params.chatId, inquiryId: params.inquiryId });
    }

    if (normalizedScreen === 'PropertyEditScreen') {
      setEditPropertyData({ property: params.property, userRole: params.userRole });
    }

    if (normalizedScreen === 'ScheduleViewingScreen') {
      setScheduleViewingData({
        propertyId:      params.propertyId,
        propertyName:    params.propertyName,
        propertyAddress: params.propertyAddress,
        propertyPrice:   params.propertyPrice,
        propertyImage:   params.propertyImage,
        property:        params.property,
      });
    }

    if (normalizedScreen === 'VirtualTourScreen') {
      setVirtualTourData({
        propertyId:      params.propertyId,
        propertyName:    params.propertyName,
        propertyAddress: params.propertyAddress,
        propertyPrice:   params.propertyPrice,
        propertyImages:  params.propertyImages,
        property:        params.property,
      });
    }
  }, []); // ← intentionally empty: functional updaters + ref keep this safe

  // ─────────────────────────────────────────────────────────────────
  // ROOT CAUSE OF THE BUG — and the fix:
  //
  // The original goBack was a plain function defined in the component
  // body (no useCallback). This meant:
  //
  //   1. It was re-created on every render.
  //   2. It captured `screenStack`, `currentScreen`, and `userData`
  //      from the render closure at the moment the `navigation` useMemo
  //      last ran.
  //   3. Because `navigateTo` was also a plain function (new ref every
  //      render), the useMemo([navigateTo, goBack]) dependency array
  //      changed on every render — but React batches state updates, so
  //      the memo sometimes ran before the new stack value was
  //      committed, leaving goBack with a snapshot of the OLD stack.
  //   4. When AssignAgentScreen's back button called navigation.goBack(),
  //      goBack saw `screenStack = []` (the stale initial value), hit
  //      the "stack empty" branch, found `userData` was truthy (the
  //      builder was logged in), and redirected to 'home'.
  //
  // FIX: wrap goBack in useCallback with an EMPTY dependency array and
  // use functional state updaters throughout. Functional updaters
  // always receive the latest committed state, so goBack never needs
  // to read screenStack or currentScreen from the closure. userData is
  // accessed via userDataRef (kept in sync by a useEffect) for the
  // same reason.
  // ─────────────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    setCurrentScreen(currentScreen => {
      // Hard override: certain screens always bounce to home
      if (SCREENS_BACK_TO_HOME.includes(currentScreen)) {
        setScreenStack([]);
        return 'home';
      }

      let nextScreen = currentScreen; // fallback

      setScreenStack(prevStack => {
        if (prevStack.length === 0) {
          // Empty stack — infer destination from auth state
          nextScreen = userDataRef.current ? 'home' : 'welcome';
          return prevStack;
        }

        const last = prevStack[prevStack.length - 1];

        if (PRE_AUTH_SCREENS.includes(last)) {
          // Returning to a pre-auth screen: only skip to home when the
          // user is authenticated AND the current screen is not itself
          // a pre-auth screen (preserves the forgot-password flow).
          if (userDataRef.current && !PRE_AUTH_SCREENS.includes(currentScreen)) {
            nextScreen = 'home';
            return [];
          }
          nextScreen = last;
          return prevStack.slice(0, -1);
        }

        // Normal pop
        nextScreen = last;
        return prevStack.slice(0, -1);
      });

      return nextScreen;
    });
  }, []); // ← intentionally empty: functional updaters + ref keep this safe

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
      setScheduleViewingData(null);
      setVirtualTourData(null);
    } catch (e) {
      console.error('Error during logout:', e);
    }
  };

  // navigation object is now truly stable for the app's lifetime
  const navigation = useMemo(() => ({ navigate, goBack }), [navigate, goBack]);

  const handleRegisterSuccess = useCallback((user) => {
    if (user) setUserData(user);
    navigate('home');
  }, [navigate]);

  const handleNavigateToLogin = useCallback(() => navigate('login'), [navigate]);

  const showNavbarScreens = [
    'home', 'messages', 'profile', 'searchResults',
    'favorites', 'builderDashboard', 'agentDashboard',
  ];

  const renderScreen = () => {
    console.log('🎬 Rendering screen:', currentScreen);

    switch (currentScreen) {

      case 'splash':
        return <SplashScreen onComplete={() => setCurrentScreen('welcome')} />;

      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={() => navigate('register')}
            onExploreAsBuilder={() => navigate('exploreProperties')}
            onNavigateToLogin={() => navigate('login')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            navigation={navigation}
            onBack={goBack}
            onNavigateToLoginSuccess={(user) => {
              if (user) setUserData(user);
              navigate('home');
            }}
            onForgotPassword={() => navigate('forgotPassword')}
            onRegister={() => navigate('register')}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            navigation={navigation}
            onBack={goBack}
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={handleNavigateToLogin}
          />
        );

      case 'otp':
        return (
          <OTPVerificationScreen
            navigation={navigation}
            onBack={goBack}
            onVerifySuccess={() => navigate('home')}
          />
        );

      case 'forgotPassword':
        return (
          <ForgotPassword
            navigation={navigation}
            onBack={goBack}
            onBackToLogin={() => navigate('login')}
            onResetSuccess={() => navigate('login')}
          />
        );

      case 'home':
        return (
          <HomeScreen
            navigation={navigation}
            userName={userData?.name}
            onProfilePress={() => navigate('profile')}
            onLogout={resetApp}
            onSearch={(query) => navigate('searchResults', { query })}
            onPropertyClick={(property) => navigate('propertyDetail', { property })}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            navigation={navigation}
            userData={userData}
            onBack={goBack}
            onLogout={resetApp}
            onEditProfile={() => navigate('editProfile')}
            onDashboard={() => {
              if (userData?.role === 'builder') navigate('builderDashboard');
              else if (userData?.role === 'agent') navigate('agentDashboard');
            }}
          />
        );

      case 'propertyDetail':
        return (
          <PropertyDetailScreen
            navigation={navigation}
            onBack={goBack}
            user={userData}
            route={{ params: { property: selectedProperty } }}
          />
        );

      case 'searchResults':
        return (
          <SearchResultsScreen
            navigation={navigation}
            searchQuery={searchQuery}
            onBack={goBack}
            onPropertyClick={(property) => navigate('propertyDetail', { property })}
          />
        );

      case 'exploreProperties':
        return (
          <ExploreProperties
            navigation={navigation}
            onBack={goBack}
            onPropertyClick={(property) => navigate('propertyDetail', { property })}
          />
        );

      case 'builderDashboard':
        return (
          <BuilderDashboard
            navigation={navigation}
            builderName={userData?.name}
            onBack={goBack}
            onPropertyClick={(property) => navigate('propertyDetail', { property })}
            onAddProperty={() => navigate('addProperty')}
            onAssignAgent={() => navigate('assignAgent')}
          />
        );

      case 'assignAgent':
        return (
          <AssignAgentScreen
            navigation={navigation}
            onBack={goBack}
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

      case 'agentInquiries':
        return (
          <AgentInquiriesScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'editProfile':
        return (
          <EditScreen
            navigation={navigation}
            onBack={goBack}
            userData={userData}
            onUpdate={refreshUserData}
          />
        );

      case 'agentNotifications':
        return (
          <AgentNotificationsScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'builderNotifications':
        return (
          <BuilderNotificationsScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'buyerNotifications':
        return (
          <BuyerNotificationsScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'addProperty':
        return (
          <AddProperty
            onBack={goBack}
            onPropertyAdded={() => navigate('builderDashboard')}
          />
        );

      case 'addPropertyAgent':
        return (
          <AddPropertiesAgent
            onBack={goBack}
            onPropertyAdded={() => navigate('agentDashboard')}
          />
        );

      case 'myListings':
        return (
          <MyListingsScreen
            navigation={{ navigate, goBack }}
          />
        );

      case 'PropertyEditScreen':
        return (
          <PropertyEditScreen
            navigation={navigation}
            onBack={goBack}
            property={editPropertyData?.property}
            userRole={editPropertyData?.userRole}
            onSaved={() => {
              setEditPropertyData(prev => ({ ...prev, savedAt: Date.now() }));
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
                propertyId:      reportPropertyData?.propertyId      || 'property-001',
                propertyName:    reportPropertyData?.propertyName    || 'Modern Luxury Villa',
                propertyAddress: reportPropertyData?.propertyAddress || '1245 Sunset Boulevard, Beverly Hills, CA 90210',
                propertyPrice:   reportPropertyData?.propertyPrice   || '$789,000',
                propertyImage:   reportPropertyData?.propertyImage   || 'https://images.unsplash.com/photo-1706808849780-7a04fbac83ef',
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
                propertyId:   paymentData?.propertyId   || 'property-001',
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
            route={{ params: { chatId: chatData?.chatId, inquiryId: chatData?.inquiryId } }}
            user={userData}
          />
        );

      case 'messages':
        return (
          <ChatListScreen
            navigation={navigation}
            onBack={goBack}
            user={userData}
          />
        );

      case 'favorites':
        return (
          <FavoritesScreen
            navigation={navigation}
            onBack={goBack}
          />
        );

      case 'ScheduleViewingScreen':
        return (
          <ScheduleViewingScreen
            navigation={navigation}
            onBack={goBack}
            route={{
              params: {
                propertyId:      scheduleViewingData?.propertyId,
                propertyName:    scheduleViewingData?.propertyName,
                propertyAddress: scheduleViewingData?.propertyAddress,
                propertyPrice:   scheduleViewingData?.propertyPrice,
                propertyImage:   scheduleViewingData?.propertyImage,
                property:        scheduleViewingData?.property,
              },
            }}
            user={userData}
          />
        );

      case 'VirtualTourScreen':
        return (
          <VirtualTourScreen
            navigation={navigation}
            onBack={goBack}
            route={{
              params: {
                propertyId:     virtualTourData?.propertyId,
                propertyName:   virtualTourData?.propertyName,
                propertyAddress: virtualTourData?.propertyAddress,
                propertyPrice:  virtualTourData?.propertyPrice,
                propertyImages: virtualTourData?.propertyImages,
                property:       virtualTourData?.property,
              },
            }}
            user={userData}
          />
        );

      default:
        console.warn('⚠️ Unknown screen:', currentScreen);
        return (
          <WelcomeScreen
            onGetStarted={() => navigate('register')}
            onExploreAsBuilder={() => navigate('exploreProperties')}
            onNavigateToLogin={() => navigate('login')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={StyleSheet.create({ c: { flex: 1, backgroundColor: '#fff' } }).c}>
          {renderScreen()}

          {showNavbarScreens.includes(currentScreen) && (
            <UserNavigator
              activeTab={currentScreen}
              onTabPress={(tab) => {
                if (tab === 'home')     navigate('home');
                if (tab === 'search')   navigate('searchResults');
                if (tab === 'favorites') navigate('favorites');
                if (tab === 'messages') navigate('messages');
                if (tab === 'profile')  navigate('profile');
              }}
              messageCount={messageCount}
              userRole={userData?.role}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}