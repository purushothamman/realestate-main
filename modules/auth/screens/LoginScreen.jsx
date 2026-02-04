import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Mail, Lock, Eye, EyeOff, AlertCircle, X } from 'lucide-react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  GOOGLE_CONFIG,
  getGoogleSignInConfig,
  validateGoogleConfig,
  logGoogleConfig,
  getDebugInfo,
  printSetupInstructions
} from '../context/GoogleLoginConfig';

// ==================== API CONFIGURATION ====================
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    // For Android Emulator
    return 'http://10.0.2.2:5000/api';
    // For physical Android device, replace with your computer's IP:
    // return 'http://192.168.1.XXX:5000/api';
  } else {
    // For iOS Simulator
    return 'http://localhost:5000/api';
    // For physical iOS device, replace with your computer's IP:
    // return 'http://192.168.1.XXX:5000/api';
  }
};

const API_BASE_URL = getApiUrl();

export default function LoginScreen({
  navigation,
  onNavigateToLoginSuccess,
  onRegister,
  onForgotPassword,
  onBack
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // ==================== INITIALIZE GOOGLE SIGNIN ====================
  useEffect(() => {
    initializeGoogleSignIn();
  }, []);

  const initializeGoogleSignIn = async () => {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 INITIALIZING GOOGLE SIGN-IN');
      console.log('='.repeat(60));
      console.log(`📱 Platform: ${Platform.OS} (v${Platform.Version})`);
      console.log(`🌐 API URL: ${API_BASE_URL}`);
      console.log('');

      // Step 1: Validate configuration
      console.log('STEP 1: Validating Configuration...');
      const isValid = validateGoogleConfig();

      if (!isValid) {
        console.error('\n❌ Configuration validation FAILED\n');
        setIsConfigured(false);

        // Show setup instructions
        printSetupInstructions();

        Alert.alert(
          'Configuration Error',
          'Google Sign-In is not properly configured.\n\nCheck the console logs for setup instructions.',
          [
            { text: 'Show Debug Info', onPress: showDebugInfo },
            { text: 'OK' }
          ]
        );
        return;
      }

      console.log('✅ Configuration validated\n');

      // Step 2: Log configuration
      console.log('STEP 2: Logging Configuration...');
      logGoogleConfig();

      // Step 3: Configure Google Sign-In SDK
      console.log('STEP 3: Configuring Google Sign-In SDK...');
      const config = getGoogleSignInConfig();

      console.log('Configuration object:');
      console.log(`  webClientId: ${config.webClientId.substring(0, 20)}...`);
      console.log(`  offlineAccess: ${config.offlineAccess}`);
      console.log(`  iosClientId: ${config.iosClientId || 'Not set'}`);
      console.log(`  scopes: ${config.scopes?.join(', ')}`);
      console.log('');

      GoogleSignin.configure(config);
      console.log('✅ SDK configured successfully\n');

      // Step 4: Check current sign-in status
      console.log('STEP 4: Checking Sign-In Status...');
      const isSignedIn = await GoogleSignin.isSignedIn();
      console.log(`Status: ${isSignedIn ? '✅ Signed In' : '⭕ Not Signed In'}`);

      if (isSignedIn) {
        try {
          const userInfo = await GoogleSignin.getCurrentUser();
          console.log(`Current user: ${userInfo?.user?.email || 'Unknown'}`);
        } catch (err) {
          console.log('Could not get current user info');
        }
      }
      console.log('');

      setIsConfigured(true);
      console.log('✅ GOOGLE SIGN-IN INITIALIZATION COMPLETE');
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('❌ INITIALIZATION FAILED');
      console.error('='.repeat(60));
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Stack Trace:', error.stack);
      console.error('='.repeat(60) + '\n');

      setIsConfigured(false);

      Alert.alert(
        'Setup Error',
        `Failed to initialize Google Sign-In.\n\nError: ${error.message}\n\nPlease check the console for details.`,
        [
          { text: 'Show Debug Info', onPress: showDebugInfo },
          { text: 'OK' }
        ]
      );
    }
  };

  // ==================== SHOW DEBUG INFO ====================
  const showDebugInfo = () => {
    const debugInfo = getDebugInfo();
    Alert.alert(
      'Debug Information',
      `Platform: ${debugInfo.platform}\n` +
      `Web Client ID: ${debugInfo.webClientId.substring(0, 30)}...\n` +
      `iOS Client ID: ${debugInfo.iosClientId}\n` +
      `API URL: ${API_BASE_URL}\n` +
      `Config Valid: ${debugInfo.configValid ? 'Yes' : 'No'}`,
      [
        { text: 'OK' },
        {
          text: 'View Instructions',
          onPress: () => {
            printSetupInstructions();
            Alert.alert('Instructions', 'Check console for detailed setup instructions');
          }
        }
      ]
    );
  };

  // ==================== GOOGLE LOGIN IMPLEMENTATION ====================
  const handleGoogleLogin = async () => {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 GOOGLE LOGIN STARTED');
    console.log('='.repeat(60) + '\n');

    setApiError('');
    setIsGoogleLoading(true);

    try {
      // Pre-flight checks
      if (!isConfigured) {
        throw new Error('Google Sign-In not configured. Please restart the app.');
      }

      // STEP 1: Check Play Services (Android only)
      if (Platform.OS === 'android') {
        console.log('STEP 1: Checking Google Play Services...');
        try {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true
          });
          console.log('✅ Play Services available\n');
        } catch (playError) {
          console.error('❌ Play Services error:', playError.message);
          throw new Error('Google Play Services not available. Please update Google Play Services.');
        }
      } else {
        console.log('STEP 1: Skipping Play Services check (iOS)\n');
      }

      // STEP 2: Clear previous session
      console.log('STEP 2: Clearing Previous Session...');
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          console.log('Signing out previous session...');
          await GoogleSignin.signOut();
          console.log('✅ Previous session cleared\n');
        } else {
          console.log('No previous session to clear\n');
        }
      } catch (signOutError) {
        console.warn('⚠️  Sign out warning:', signOutError.message);
        console.log('Continuing anyway...\n');
      }

      // STEP 3: Initiate Google Sign-In
      console.log('STEP 3: Launching Google Sign-In...');
      console.log('Waiting for user to select account...');

      const userInfo = await GoogleSignin.signIn();

      console.log('\n✅ User selected account');
      console.log('User data received:', {
        hasUser: !!userInfo?.user,
        hasId: !!userInfo?.user?.id,
        hasEmail: !!userInfo?.user?.email,
        hasName: !!userInfo?.user?.name,
      });

      if (!userInfo?.user) {
        throw new Error('No user information received from Google');
      }

      const { user } = userInfo;
      console.log('User details:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Photo: ${user.photo ? 'Yes' : 'No'}`);
      console.log('');

      // STEP 4: Get ID Token
      console.log('STEP 4: Getting ID Token...');
      const tokens = await GoogleSignin.getTokens();

      console.log('Tokens received:');
      console.log(`  ID Token: ${tokens?.idToken ? 'Yes' : 'No'}`);
      console.log(`  Access Token: ${tokens?.accessToken ? 'Yes' : 'No'}`);
      if (tokens?.idToken) {
        console.log(`  ID Token preview: ${tokens.idToken.substring(0, 30)}...`);
      }
      console.log('');

      if (!tokens?.idToken) {
        throw new Error('Failed to get Google ID token');
      }

      // STEP 5: Send to Backend
      console.log('STEP 5: Authenticating with Backend...');
      console.log(`Backend URL: ${API_BASE_URL}/auth/google-login`);
      console.log('Sending POST request...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: tokens.idToken,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log('Response headers:');
      console.log(`  Content-Type: ${response.headers.get('content-type')}`);
      console.log('');

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Invalid content type:', contentType);
        const textResponse = await response.text();
        console.error('Response body (first 200 chars):', textResponse.substring(0, 200));
        throw new Error('Server returned non-JSON response. Backend may be misconfigured or not running.');
      }

      const data = await response.json();

      console.log('Backend response:');
      console.log(`  Status: ${response.status} ${response.ok ? '(OK)' : '(ERROR)'}`);
      console.log(`  Message: ${data.message}`);
      console.log(`  Has Token: ${!!data.token}`);
      console.log(`  Has User: ${!!data.user}`);
      console.log('');

      // Handle backend errors
      if (!response.ok) {
        console.error('❌ Backend rejected request');
        console.error('Error message:', data.message);
        console.error('Error details:', data.error);
        throw new Error(data.message || `Backend error (${response.status})`);
      }

      // Validate response
      if (!data.token) {
        console.error('❌ Missing token in response');
        throw new Error('Server did not return authentication token');
      }

      if (!data.user) {
        console.error('❌ Missing user data in response');
        throw new Error('Server did not return user information');
      }

      if (!data.user.id || !data.user.email || !data.user.role) {
        console.error('❌ Incomplete user data');
        console.error('User data:', JSON.stringify(data.user, null, 2));
        throw new Error('Incomplete user information from server');
      }

      console.log('✅ Backend authentication successful');
      console.log('Authenticated user:');
      console.log(`  ID: ${data.user.id}`);
      console.log(`  Name: ${data.user.name}`);
      console.log(`  Email: ${data.user.email}`);
      console.log(`  Role: ${data.user.role}`);
      console.log('');

      // STEP 6: Store authentication data
      console.log('STEP 6: Storing Authentication Data...');
      await AsyncStorage.multiSet([
        ['authToken', data.token],
        ['user', JSON.stringify(data.user)],
        ['userRole', data.user.role],
        ['userId', String(data.user.id)],
        ['loginMethod', 'google'],
      ]);
      console.log('✅ Authentication data stored\n');

      // STEP 7: Navigate
      console.log('STEP 7: Navigating to app...');
      console.log(`User role: ${data.user.role}`);

      console.log('\n' + '='.repeat(60));
      console.log('✅ GOOGLE LOGIN COMPLETED SUCCESSFULLY');
      console.log('='.repeat(60) + '\n');

      Alert.alert(
        'Welcome! 🎉',
        `Successfully logged in as ${data.user.name || data.user.email}`,
        [
          {
            text: 'Continue',
            onPress: () => navigateByRole(data.user.role, data.user)
          }
        ]
      );

    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('❌ GOOGLE LOGIN FAILED');
      console.error('='.repeat(60));
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Code:', error.code);
      if (error.stack) {
        console.error('Stack Trace:', error.stack);
      }
      console.error('='.repeat(60) + '\n');

      let errorMessage = 'Google login failed. Please try again.';
      let shouldShowAlert = true;

      // Handle specific errors
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
        console.error('❌ Request timed out');
      } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign-in cancelled';
        shouldShowAlert = false;
        console.log('ℹ️  User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign-in already in progress. Please wait.';
        console.log('ℹ️  Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available or outdated.\n\nPlease update Google Play Services and try again.';
        console.error('❌ Play Services issue');
      } else if (error.message?.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server.\n\nPlease check:\n• Internet connection\n• Backend server is running\n• API URL is correct';
        console.error('❌ Network error - cannot reach backend');
      } else if (error.message?.includes('12501') || error.message?.includes('DEVELOPER_ERROR')) {
        errorMessage = 'Google Sign-In configuration error.\n\nPossible causes:\n• SHA-1 fingerprint not added (Android)\n• Wrong OAuth client configuration\n• Client ID mismatch\n\nCheck console for setup instructions.';
        console.error('❌ Error 12501/DEVELOPER_ERROR - Configuration issue');
        printSetupInstructions();
      } else if (error.message) {
        errorMessage = error.message;
      }

      setApiError(errorMessage);

      if (shouldShowAlert) {
        Alert.alert(
          'Google Login Failed',
          errorMessage,
          [
            { text: 'OK' },
            {
              text: 'Debug Info',
              onPress: showDebugInfo
            }
          ]
        );
      }

    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ==================== EMAIL/PASSWORD LOGIN ====================
  const handleLogin = async () => {
    setApiError('');

    // Validation
    if (!email.trim()) {
      setApiError('Please enter your email or phone number');
      return;
    }

    if (!password) {
      setApiError('Please enter your password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;

    if (!emailRegex.test(email.trim()) && !phoneRegex.test(email.trim())) {
      setApiError('Please enter a valid email address or phone number');
      return;
    }

    if (password.length < 6) {
      setApiError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const loginData = {
        email: email.trim().toLowerCase(),
        password: password,
      };

      console.log('\n🔐 Email login attempt for:', loginData.email);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(loginData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Server returned invalid response. Please check if backend is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error(data.message || 'Invalid email or password');
          case 401:
            throw new Error(data.message || 'Incorrect email or password');
          case 403:
            throw new Error(data.message || 'Account is blocked or locked');
          case 404:
            throw new Error(data.message || 'Account not found');
          case 429:
            throw new Error(data.message || 'Too many login attempts. Please try again later.');
          case 500:
            throw new Error(data.message || 'Server error. Please try again.');
          default:
            throw new Error(data.message || `Login failed (${response.status})`);
        }
      }

      if (!data.token || !data.user || !data.user.role) {
        throw new Error('Invalid server response');
      }

      console.log('✅ Email login successful');

      // Store authentication data
      await AsyncStorage.multiSet([
        ['authToken', data.token],
        ['user', JSON.stringify(data.user)],
        ['userRole', data.user.role],
        ['userId', String(data.user.id)],
        ['loginMethod', 'email'],
      ]);

      setEmail('');
      setPassword('');

      console.log('✅ About to call navigateByRole with role:', data.user.role);
      console.log('✅ User data:', data.user);

      // Navigate immediately without showing alert
      setTimeout(() => {
        navigateByRole(data.user.role, data.user);
      }, 500);

      // Show alert after navigating
      setTimeout(() => {
        Alert.alert(
          'Login Successful',
          `Welcome back, ${data.user.name || 'User'}!`,
          [{ text: 'OK' }]
        );
      }, 600);

    } catch (error) {
      console.error('❌ Email login error:', error);

      if (error.name === 'AbortError') {
        setApiError('Request timeout. Please check your internet connection.');
      } else if (error.message?.includes('Network request failed')) {
        setApiError('Cannot connect to server. Please ensure backend is running.');
      } else {
        setApiError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== APPLE LOGIN ====================
  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices');
      return;
    }

    Alert.alert(
      'Coming Soon',
      'Apple Sign-In will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  // ==================== NAVIGATION BY ROLE ====================
  const navigateByRole = (userRole, userData) => {
    console.log('\n' + '='.repeat(60));
    console.log('🧭 NAVIGATE BY ROLE FUNCTION CALLED');
    console.log('='.repeat(60));
    console.log('User Role:', userRole);
    console.log('User Data:', userData);
    console.log('onNavigateToLoginSuccess available:', !!onNavigateToLoginSuccess);
    console.log('='.repeat(60) + '\n');

    // Use callback-based navigation from App.jsx
    if (onNavigateToLoginSuccess) {
      console.log('✅ Executing onNavigateToLoginSuccess callback');
      console.log('→ This should trigger: setUserData(user) + navigateTo("home" or "dashboard")');
      onNavigateToLoginSuccess(userData);
      console.log('✅ Callback executed');
      return;
    }

    // Fallback for modern React Navigation
    if (navigation?.replace) {
      try {
        switch (userRole.toLowerCase()) {
          case 'buyer':
          case 'user':
            console.log('→ Navigating to Home');
            navigation.replace('Home', { user: userData });
            break;
          case 'builder':
          case 'developer':
            console.log('→ Navigating to BuilderDashboard');
            navigation.replace('BuilderDashboard', { user: userData });
            break;
          case 'agent':
          case 'realtor':
            console.log('→ Navigating to AgentDashboard');
            navigation.replace('AgentDashboard', { user: userData });
            break;
          case 'admin':
            console.log('→ Navigating to AdminDashboard');
            navigation.replace('AdminDashboard', { user: userData });
            break;
          default:
            console.log('→ Navigating to Home (default)');
            navigation.replace('Home', { user: userData });
            break;
        }
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        Alert.alert('Navigation Error', 'Failed to navigate. Please restart the app.');
      }
    } else {
      console.error('❌ Navigation callbacks/methods not available');
      console.log('Please ensure onNavigateToLoginSuccess is passed to LoginScreen');
      Alert.alert('Error', 'Navigation error. Please restart the app.');
    }
  };


  // ==================== NAVIGATE TO REGISTER ====================
  const handleNavigateToRegister = () => {
    console.log('📝 Navigating to Register screen');

    // Use callback-based navigation from App.jsx
    if (onRegister) {
      console.log('→ Using onRegister callback');
      onRegister();
    } else if (navigation?.navigate) {
      // Fallback for modern React Navigation
      console.log('→ Using navigation.navigate');
      navigation.navigate('Register');
    } else {
      console.error('❌ Navigation not available');
      Alert.alert('Error', 'Navigation not available');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Image Section */}
        <View style={styles.headerImageContainer}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            }}
            style={styles.headerImage}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay} />
            <View style={styles.headerLogoContainer}>
              <View style={styles.headerLogo}>
                <Home color="#FFFFFF" size={24} strokeWidth={2} />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* App Name */}
          <View style={styles.appNameContainer}>
            <Text style={styles.appName}>EstateHub</Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue exploring and managing your properties
            </Text>
          </View>

          {/* API Error Message */}
          {apiError ? (
            <View style={styles.errorMessage}>
              <AlertCircle color="#DC2626" size={20} strokeWidth={2} />
              <Text style={styles.errorMessageText}>{apiError}</Text>
              <TouchableOpacity onPress={() => setApiError('')}>
                <X color="#EF4444" size={16} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Phone</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputWrapperFocused,
                ]}
              >
                <Mail
                  color={focusedInput === 'email' ? '#2D6A4F' : '#9CA3AF'}
                  size={20}
                  strokeWidth={2}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setApiError('');
                  }}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !isGoogleLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <Lock
                  color={focusedInput === 'password' ? '#2D6A4F' : '#9CA3AF'}
                  size={20}
                  strokeWidth={2}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setApiError('');
                  }}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !isGoogleLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                  disabled={isLoading || isGoogleLoading}
                >
                  {showPassword ? (
                    <EyeOff color="#9CA3AF" size={20} strokeWidth={2} />
                  ) : (
                    <Eye color="#9CA3AF" size={20} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading || isGoogleLoading}
              style={[
                styles.loginButton,
                (isLoading || isGoogleLoading) && styles.loginButtonDisabled,
              ]}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.loginButtonContent}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loginButtonText}>Logging in...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            {/* Google Login Button */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              style={[
                styles.socialButton,
                styles.googleButton,
                (isLoading || isGoogleLoading) && styles.socialButtonDisabled
              ]}
              activeOpacity={0.7}
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={styles.socialButtonText}>Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple Login Button */}
            <TouchableOpacity
              onPress={handleAppleLogin}
              style={[
                styles.socialButton,
                (isLoading || isGoogleLoading) && styles.socialButtonDisabled
              ]}
              activeOpacity={0.7}
              disabled={isLoading || isGoogleLoading}
            >
              <Text style={styles.appleIcon}>🍎</Text>
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={handleNavigateToRegister}
              activeOpacity={0.7}
              disabled={isLoading || isGoogleLoading}
            >
              <Text style={styles.signUpLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  headerImageContainer: {
    height: 256,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerLogoContainer: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  headerLogo: {
    width: 40,
    height: 40,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  appNameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorMessageText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: '#2D6A4F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    height: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    gap: 8,
  },
  googleButton: {
    borderColor: '#4285F4',
    backgroundColor: '#F8FAFF',
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  appleIcon: {
    fontSize: 20,
  },
  socialButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signUpLink: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '600',
  },
});