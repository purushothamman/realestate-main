import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import { Home, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import RegisterScreen from './RegisterScreen';
import OTPVerificationScreen from './OTPVerificationScreen';
import ForgotPassword from './ForgotPassword';
import HomeScreen from '../../user/screens/HomeScreen';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ onBack, navigation }) {
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle Login Function with proper validation
  const handleLogin = () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && !/^\d{10}$/.test(email)) {
      Alert.alert('Invalid Input', 'Please enter a valid email or 10-digit phone number');
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    console.log('Login with:', { email, password });
    
    // Method 1: Using navigation prop (if using React Navigation)
    if (navigation) {
      navigation.navigate('home');
    } else {
      // Method 2: Using state (fallback)
      setScreen('home');
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    Alert.alert('Social Login', `Logging in with ${provider}...`);
    
    // After successful social login
    if (navigation) {
      navigation.navigate('home');
    } else {
      setScreen('home');
    }
  };

  const handleForgotPassword = () => {
    console.log('Navigate to Forgot Password');
    setScreen('forgotPassword');
  };

  // Screen Navigation Logic
  if (screen === 'register') {
    return (
      <RegisterScreen
        onNavigateToLogin={() => setScreen('login')}
        onBack={() => setScreen('login')}
        navigation={navigation}
      />
    );
  }

  if (screen === 'otp') {
    return (
      <OTPVerificationScreen
        phoneNumber={email}
        onBack={() => setScreen('login')}
        onVerify={(otpCode) => {
          console.log('OTP Verified:', otpCode);
          Alert.alert('Success', 'OTP Verified Successfully!');
          setScreen('login');
        }}
        navigation={navigation}
      />
    );
  }

  if (screen === 'forgotPassword') {
    return (
      <ForgotPassword
        onBack={() => setScreen('login')}
        navigation={navigation}
      />
    );
  }

  if (screen === 'home') {
    return <HomeScreen navigation={navigation} />;
  }

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
            {/* Gradient Overlay */}
            <View style={styles.headerOverlay} />

            {/* Logo on Header */}
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

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or Phone</Text>
              <View style={styles.inputWrapper}>
                <Mail
                  color="#9CA3AF"
                  size={20}
                  strokeWidth={2}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock
                  color="#9CA3AF"
                  size={20}
                  strokeWidth={2}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff color="#9CA3AF" size={20} strokeWidth={2} />
                  ) : (
                    <Eye color="#9CA3AF" size={20} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.loginButton}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
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
            {/* Google Login */}
            <TouchableOpacity
              onPress={() => handleSocialLogin('google')}
              style={styles.socialButton}
              activeOpacity={0.7}
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            {/* Apple Login */}
            <TouchableOpacity
              onPress={() => handleSocialLogin('apple')}
              style={styles.socialButton}
              activeOpacity={0.7}
            >
              <Text style={styles.appleIcon}>🍎</Text>
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                console.log('Navigate to sign up');
                setScreen('register');
              }}
              activeOpacity={0.7}
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
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: -4,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 12,
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 44,
    paddingRight: 12,
    fontSize: 14,
    color: '#111827',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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