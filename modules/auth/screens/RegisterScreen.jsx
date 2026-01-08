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
} from 'react-native';
import { Home, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ onRegister, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    console.log('Register with:', formData);
    if (onRegister) onRegister();
  };

  return (
    <View style={styles.container}>
      {/* Subtle Background Element */}
      <View style={styles.backgroundContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBza3lsaW5lJTIwY2l0eXxlbnwxfHx8fDE3NjYwNzI4NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Home color="#FFFFFF" size={32} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>EstateHub</Text>
        </View>

        {/* Headline and Subtext */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>Create Your Account</Text>
          <Text style={styles.subtext}>
            Join thousands of users to buy, sell, and rent properties with ease
          </Text>
        </View>

        {/* Registration Form */}
        <View style={styles.form}>
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User
                color="#9CA3AF"
                size={20}
                strokeWidth={2}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
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
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone
                color="#9CA3AF"
                size={20}
                strokeWidth={2}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
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
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff color="#9CA3AF" size={20} strokeWidth={2} />
                ) : (
                  <Eye color="#9CA3AF" size={20} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordHint}>
              Must be at least 8 characters with letters and numbers
            </Text>
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={styles.checkbox}>
              {termsAccepted && <View style={styles.checkboxChecked} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            style={[
              styles.registerButton,
              !termsAccepted && styles.registerButtonDisabled,
            ]}
            activeOpacity={0.8}
            disabled={!termsAccepted}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Registration Buttons */}
        <View style={styles.socialButtonsContainer}>
          {/* Google Sign Up */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => console.log('Register with Google')}
            activeOpacity={0.7}
          >
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          {/* Apple Sign Up */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => console.log('Register with Apple')}
            activeOpacity={0.7}
          >
            <Text style={styles.appleIcon}>🍎</Text>
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <View style={styles.trustIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.trustText}>
            Secure registration • Your data is protected
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 128,
    opacity: 0.1,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  appName: {
    color: '#2D6A4F',
    fontSize: 20,
    fontWeight: '600',
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headline: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
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
  passwordHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    backgroundColor: '#2D6A4F',
    borderRadius: 2,
  },
  termsText: {
    flex: 1,
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
  },
  termsLink: {
    color: '#2D6A4F',
    fontWeight: '500',
  },
  registerButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
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
    height: 44,
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
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginLinkText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '600',
  },
  trustBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  trustIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  trustText: {
    color: '#6B7280',
    fontSize: 12,
  },
});