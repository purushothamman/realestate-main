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
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Mail, Lock, Eye, EyeOff, AlertCircle, X, ArrowLeft } from 'lucide-react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getDebugInfo, printSetupInstructions } from '../context/GoogleLoginConfig';
import GOOGLE_CONFIG from '../context/GoogleLoginConfig';
import { API_BASE_URL } from '../../../utils/api';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IOS_TOP = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24);
const HEADER_HEIGHT = Math.round(SCREEN_HEIGHT * 0.4);
const CARD_OVERLAP = 32;

// ✅ THE REAL FIX: This style object completely kills every possible
// black border/outline that React Native & web can produce on TextInput.
const INPUT_NO_OUTLINE = Platform.select({
  web: {
    outline: 'none',
    outlineWidth: 0,
    outlineStyle: 'none',
    boxShadow: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
  },
  default: {},
});

export default function LoginScreen({
  navigation,
  onNavigateToLoginSuccess,
  onRegister,
  onForgotPassword,
  onBack,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  // ==================== NAVIGATION HELPER ====================
  const navigateByRole = (user) => {
    if (onNavigateToLoginSuccess) {
      onNavigateToLoginSuccess(user);
    }
  };

  // ==================== GOOGLE AUTH HOOK ====================
  // Using responseType 'id_token' so Google returns a JWT that the backend
  // can verify directly with verifyIdToken() — this eliminates the token type
  // mismatch that caused the previous 401 invalid_client errors.
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CONFIG.WEB_CLIENT_ID,
    responseType: 'id_token',
    scopes: ['profile', 'email'],
    // Android client ID (optional — only needed for native EAS builds)
    ...(GOOGLE_CONFIG.ANDROID_CLIENT_ID ? { androidClientId: GOOGLE_CONFIG.ANDROID_CLIENT_ID } : {}),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // id_token is a signed JWT — preferred. accessToken is a fallback.
      const idToken = response.params?.id_token || response.authentication?.idToken;
      const accessToken = response.authentication?.accessToken;
      const tokenToSend = idToken || accessToken;
      console.log('✅ Google Authentication Success');
      console.log('   Token type:', idToken ? 'id_token (JWT) ✅' : 'access_token (fallback)');
      if (tokenToSend) {
        handleGoogleLoginSuccess(tokenToSend, !!idToken);
      } else {
        setApiError('Google sign-in did not return a token. Please try again.');
        setIsGoogleLoading(false);
      }
    } else if (response?.type === 'cancel' || response?.type === 'error') {
      if (response?.type === 'error') {
        console.error('Google auth error:', response.error);
        setApiError('Google sign-in was denied or failed. Please try again.');
      }
      setIsGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setApiError('Google sign-in failed');
      setIsGoogleLoading(false);
    }
  };

  // isIdToken=true → backend verifyIdToken() path (best)
  // isIdToken=false → backend will call Google tokeninfo endpoint (fallback)
  const handleGoogleLoginSuccess = async (token, isIdToken = false) => {
    setIsGoogleLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, isIdToken }),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.multiSet([
          ['authToken', data.token],
          ['user', JSON.stringify(data.user)],
          ['userRole', data.user.role],
          ['userId', String(data.user.id)],
        ]);
        navigateByRole(data.user);
      } else {
        console.error('Google login backend error:', data);
        setApiError(data.message || 'Google login failed on server');
      }
    } catch (error) {
      console.error('Backend Google login error:', error);
      setApiError('Could not connect to server');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ==================== EMAIL/PASSWORD LOGIN ====================
  const handleLogin = async () => {
    setApiError('');
    if (!email.trim() || !password) {
      setApiError('Please enter email and password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      console.log('Calling:', `${API_BASE_URL}/auth/login`);
      console.log('STATUS:', response.status);

      const data = await response.json();
      console.log('RAW RESPONSE:', data);

      if (!response.ok) {
        setApiError(data.message || 'Login failed');
        return;
      }

      await AsyncStorage.multiSet([
        ['authToken', data.token],
        ['user', JSON.stringify(data.user)],
        ['userRole', data.user.role],
        ['userId', String(data.user.id)],
      ]);

      navigateByRole(data.user);
    } catch (error) {
      console.log('FETCH ERROR:', error);
      setApiError('Server connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    if (onRegister) onRegister();
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Fixed background image ── */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay} />

        {/* Top bar: back + logo + brand */}
        <View style={[styles.topBar, { paddingTop: IOS_TOP + 10 }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => onBack && onBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft color="#FFFFFF" size={20} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Home color="#FFFFFF" size={20} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>EstateHub</Text>
          </View>

          <View style={styles.topBarSpacer} />
        </View>

        {/* Hero tagline */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Welcome Back 👋</Text>
          <Text style={styles.heroSubtitle}>
            Sign in to explore and manage your properties
          </Text>
        </View>
      </ImageBackground>

      {/* ── Scrollable card overlapping the image ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.card}>

          {/* Error Banner */}
          {apiError ? (
            <View style={styles.errorBanner}>
              <AlertCircle color="#DC2626" size={17} strokeWidth={2} />
              <Text style={styles.errorBannerText}>{apiError}</Text>
              <TouchableOpacity
                onPress={() => setApiError('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X color="#EF4444" size={15} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Email */}
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
                size={18}
                strokeWidth={2}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, INPUT_NO_OUTLINE]}
                placeholder="Enter your email"
                placeholderTextColor="#B0B8C4"
                value={email}
                onChangeText={(text) => { setEmail(text); setApiError(''); }}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !isGoogleLoading}
                underlineColorAndroid="transparent"
                selectionColor="#2D6A4F"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => onForgotPassword && onForgotPassword()}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === 'password' && styles.inputWrapperFocused,
              ]}
            >
              <Lock
                color={focusedInput === 'password' ? '#2D6A4F' : '#9CA3AF'}
                size={18}
                strokeWidth={2}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.passwordInput, INPUT_NO_OUTLINE]}
                placeholder="Enter your password"
                placeholderTextColor="#B0B8C4"
                value={password}
                onChangeText={(text) => { setPassword(text); setApiError(''); }}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !isGoogleLoading}
                underlineColorAndroid="transparent"
                selectionColor="#2D6A4F"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword ? (
                  <EyeOff color="#9CA3AF" size={18} strokeWidth={2} />
                ) : (
                  <Eye color="#9CA3AF" size={18} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading || isGoogleLoading}
            style={[
              styles.loginButton,
              (isLoading || isGoogleLoading) && styles.loginButtonDisabled,
            ]}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              onPress={handleGoogleLogin}
              style={[styles.socialBtn, styles.googleBtn]}
              disabled={isLoading || isGoogleLoading}
              activeOpacity={0.8}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <>
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                  <Text style={[styles.socialBtnText, { color: '#4285F4' }]}>Google</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialBtn, styles.appleBtn]}
              onPress={() =>
                Alert.alert('Coming Soon', 'Apple Sign-In is not yet available.')
              }
              activeOpacity={0.8}
            >
              <Text style={styles.appleEmoji}>🍎</Text>
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleNavigateToRegister}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Background image ─────────────────────────────────────
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },

  // ── Top bar ──────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoBox: {
    width: 38,
    height: 38,
    backgroundColor: '#2D6A4F',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  topBarSpacer: {
    width: 38,
  },

  // ── Hero text ────────────────────────────────────────────
  heroTextContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 20,
  },

  // ── ScrollView ───────────────────────────────────────────
  scrollView: {
    flex: 1,
    marginTop: HEADER_HEIGHT - CARD_OVERLAP,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Card ─────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    minHeight: SCREEN_HEIGHT - HEADER_HEIGHT + CARD_OVERLAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 8,
  },

  // ── Error ────────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  errorBannerText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Inputs ───────────────────────────────────────────────
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    color: '#2D6A4F',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#F8FAF9',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 13,
    paddingHorizontal: 14,
    // Prevent any overflow from showing a border
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: '#2D6A4F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#111827',
    height: '100%',
    // Removes any residual border/padding that native adds
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  passwordInput: {
    paddingRight: 36,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },

  // ── Login Button ─────────────────────────────────────────
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2D6A4F',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Divider ──────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginHorizontal: 14,
    fontWeight: '500',
  },

  // ── Social ───────────────────────────────────────────────
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1.5,
    borderRadius: 13,
    gap: 8,
  },
  googleBtn: {
    borderColor: '#D0E3FF',
    backgroundColor: '#F5F8FF',
  },
  appleBtn: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  googleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  appleEmoji: {
    fontSize: 18,
  },
  socialBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Register ─────────────────────────────────────────────
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  registerLink: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '700',
  },
});