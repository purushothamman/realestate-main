import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// API Configuration - CORRECTED FOR LOCAL DEVELOPMENT
// For local development, use http:// (not https://)
// For production, use your actual domain with https://
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development - NO SSL
  : 'https://api.yourdomain.com/api'; // Production - WITH SSL

// Alternative: Use your computer's local IP for testing on physical devices
// const API_BASE_URL = 'http://192.168.1.100:5000/api'; // Replace with your IP

export default function ResetPasswordScreen({
  email = '', // Email from previous screen (forgot password flow)
  otp = '', // OTP from previous screen (if already verified)
  onResetSuccess,
  onBack,
  navigation,
}) {
  const [otpCode, setOtpCode] = useState(otp || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    '',
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#16A34A',
  ];

  // Password requirements matching backend validation
  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'Contains a number', met: /[0-9]/.test(newPassword) },
    {
      label: 'Contains special character',
      met: /[^a-zA-Z0-9]/.test(newPassword),
    },
  ];

  const passwordsMatch =
    confirmPassword !== '' && newPassword === confirmPassword;
  const passwordsDontMatch =
    confirmPassword !== '' && newPassword !== confirmPassword;
  
  // Backend requires: at least 8 chars, letters, and numbers
  const meetsBackendRequirements = 
    newPassword.length >= 8 && 
    /[a-zA-Z]/.test(newPassword) && 
    /[0-9]/.test(newPassword);
  
  const allRequirementsMet = requirements.every((req) => req.met);

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#DC2626';
    if (passwordStrength === 3) return '#CA8A04';
    return '#16A34A';
  };

  const handleResetPassword = async () => {
    // Clear previous errors
    setError('');

    // Validate inputs
    if (!email) {
      setError('Email is required. Please go back and start the process again.');
      return;
    }

    if (!otpCode) {
      setError('OTP is required. Please enter the code sent to your email.');
      return;
    }

    if (otpCode.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    // Validate against backend requirements
    if (!meetsBackendRequirements) {
      setError('Password must be at least 8 characters with letters and numbers');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting password reset to:', `${API_BASE_URL}/auth/reset-password`);
      
      // Make API call to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otpCode.trim(),
          newPassword: newPassword,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Get response text first for better error handling
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!response.ok) {
        // Handle specific error messages from backend
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      // Success - Show confirmation and navigate
      Alert.alert(
        'Success! ✓',
        data.message || 'Your password has been reset successfully. Please login with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => {
              // Clear form
              setOtpCode('');
              setNewPassword('');
              setConfirmPassword('');
              
              if (onResetSuccess) {
                onResetSuccess(data);
              } else if (navigation) {
                navigation.navigate('Login');
              }
            },
          },
        ],
        { cancelable: false }
      );

    } catch (error) {
      console.error('Reset Password Error:', error);
      
      // Display user-friendly error messages
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        errorMessage = `Cannot connect to server. Please ensure:\n\n1. Your backend server is running on port 5000\n2. You're using the correct API URL: ${API_BASE_URL}\n3. Your network connection is stable`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Show alert for network errors
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error',
          `Cannot reach the server at:\n${API_BASE_URL}\n\nPlease check:\n• Backend server is running\n• API URL is correct\n• Network connection is active`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern} />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D6A4F" />
            <Text style={styles.loadingText}>Resetting Password...</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoInner} />
            </View>
            <Text style={styles.logoText}>RealEstate Pro</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Security Icon */}
          <View style={styles.securityIconContainer}>
            <View style={styles.securityIcon}>
              <Lock color="#FFFFFF" size={40} strokeWidth={1.5} />
            </View>
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Reset Your Password</Text>

          {/* Supporting text */}
          <Text style={styles.subtext}>
            Please create a new strong password for your account
          </Text>

          {/* Email Display (for confirmation) */}
          {email && (
            <View style={styles.emailDisplay}>
              <Text style={styles.emailLabel}>Resetting password for:</Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>
          )}

          {/* API URL Display (Development only) 
          {__DEV__ && (
            // <View style={styles.debugInfo}>
            //   <Text style={styles.debugLabel}>API URL:</Text>
            //   <Text style={styles.debugText}>{API_BASE_URL}</Text>
            // </View>
          )}*/}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle color="#DC2626" size={20} strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* OTP Field (if not pre-filled) */}
            {!otp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={otpCode}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const numericText = text.replace(/[^0-9]/g, '');
                      setOtpCode(numericText);
                      if (error) setError('');
                    }}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                  />
                </View>
                <Text style={styles.helperText}>
                  Enter the code we sent to your email
                </Text>
              </View>
            )}

            {/* New Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (error) setError('');
                  }}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                  disabled={isLoading}
                >
                  {showNewPassword ? (
                    <EyeOff color="#6B7280" size={20} strokeWidth={2} />
                  ) : (
                    <Eye color="#6B7280" size={20} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {newPassword ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthLabel}>Password Strength:</Text>
                    <Text
                      style={[
                        styles.strengthValue,
                        { color: getStrengthColor() },
                      ]}
                    >
                      {strengthLabels[passwordStrength]}
                    </Text>
                  </View>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              level <= passwordStrength
                                ? strengthColors[passwordStrength]
                                : '#E5E7EB',
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  passwordsMatch && styles.inputWrapperSuccess,
                  passwordsDontMatch && styles.inputWrapperError,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error) setError('');
                  }}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff color="#6B7280" size={20} strokeWidth={2} />
                  ) : (
                    <Eye color="#6B7280" size={20} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {confirmPassword ? (
                <View style={styles.matchIndicator}>
                  {passwordsMatch ? (
                    <View style={styles.matchSuccess}>
                      <Check color="#16A34A" size={16} strokeWidth={2} />
                      <Text style={styles.matchSuccessText}>
                        Passwords match
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.matchError}>
                      <X color="#DC2626" size={16} strokeWidth={2} />
                      <Text style={styles.matchErrorText}>
                        Passwords don't match
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>
                Password Requirements:
              </Text>
              <View style={styles.requirementsList}>
                {requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <View
                      style={[
                        styles.requirementIcon,
                        {
                          backgroundColor: req.met ? '#22C55E' : '#D1D5DB',
                        },
                      ]}
                    >
                      {req.met && (
                        <Check color="#FFFFFF" size={12} strokeWidth={3} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.requirementText,
                        { color: req.met ? '#374151' : '#6B7280' },
                      ]}
                    >
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.resetButton,
              (!passwordsMatch || !meetsBackendRequirements || isLoading) &&
                styles.resetButtonDisabled,
            ]}
            disabled={!passwordsMatch || !meetsBackendRequirements || isLoading}
            activeOpacity={0.8}
            onPress={handleResetPassword}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <ShieldCheck color="#FFFFFF" size={20} strokeWidth={2} />
                <Text style={styles.resetButtonText}>Reset Password</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Lock color="#2D6A4F" size={16} strokeWidth={2} />
            <Text style={styles.securityNoteText}>
              Your password is encrypted and secure
            </Text>
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBackToLogin}
            disabled={isLoading}
          >
            <ArrowLeft color="#6B7280" size={16} strokeWidth={2} />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 RealEstate Pro. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundColor: '#2D6A4F',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 12,
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoInner: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  mainContent: {
    paddingHorizontal: 24,
  },
  securityIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  securityIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emailDisplay: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  debugInfo: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE047',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  debugLabel: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 2,
  },
  debugText: {
    fontSize: 10,
    color: '#78350F',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  inputWrapperSuccess: {
    borderColor: '#22C55E',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingRight: 48,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  matchIndicator: {
    marginTop: 8,
  },
  matchSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchSuccessText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#16A34A',
  },
  matchError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchErrorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DC2626',
  },
  requirementsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  securityNoteText: {
    fontSize: 12,
    color: '#2D6A4F',
    lineHeight: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});