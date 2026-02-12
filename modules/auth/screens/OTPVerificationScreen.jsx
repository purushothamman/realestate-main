import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ResetPasswordScreen from './ResetPasswordScreen';

const { width, height } = Dimensions.get('window');

// API Configuration - FIXED: Use http for localhost or your production URL
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api', // Android emulator localhost
  default: 'http://localhost:5000/api',
});

// For production, use your actual API URL:
// const API_BASE_URL = 'https://your-api-domain.com/api';

export default function OTPVerificationScreen({
  email = '', // Email from registration/login
  phoneNumber = '+1 (555) 123-4567',
  purpose = 'email_verification', // 'email_verification', 'phone_verification', or 'password_reset'
  onVerifySuccess,
  onResendOTP,
  onChangeNumber,
  onBack,
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const inputRefs = useRef([]);

  // Timer countdown for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Clear error when user starts typing
    if (error) setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index, e) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // FIXED: Added timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otpValue,
          purpose: purpose,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please check if the API is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from backend
        throw new Error(data.message || `Verification failed (${response.status})`);
      }

      // FIXED: Handle password reset flow
      if (purpose === 'password_reset') {
        // Store the reset token if provided
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        
        // Navigate to ResetPasswordScreen
        setShowResetPassword(true);
        return;
      }

      // Success - store token and user data for email/phone verification
      if (data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }

      // Show success message for non-password-reset flows
      Alert.alert(
        'Success',
        data.message || 'Verification successful!',
        [
          {
            text: 'Continue',
            onPress: () => {
              if (onVerifySuccess) {
                onVerifySuccess(data);
              }
            },
          },
        ]
      );

    } catch (error) {
      console.error('OTP Verification Error:', error);
      
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the API is running and your network connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      // FIXED: Added timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          purpose: purpose,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response. Please check if the API is running.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      // Reset timer and OTP inputs
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // Show success message
      Alert.alert('Success', data.message || 'OTP has been resent to your email');

      // Call custom onResendOTP callback if provided
      if (onResendOTP) onResendOTP();

    } catch (error) {
      console.error('Resend OTP Error:', error);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your internet connection.';
      } else if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the API is running.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSuccess = () => {
    // Navigate back to login or handle success
    if (onVerifySuccess) {
      onVerifySuccess({ passwordReset: true });
    }
  };

  const handleBackFromReset = () => {
    // Go back to OTP screen
    setShowResetPassword(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  // FIXED: Show ResetPasswordScreen when needed
  if (showResetPassword) {
    return (
      <ResetPasswordScreen
        email={email}
        resetToken={resetToken}
        onResetSuccess={handleResetPasswordSuccess}
        onBack={handleBackFromReset}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Subtle Background */}
      <View style={styles.backgroundContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NjE2MDQ1M3ww&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2D6A4F" />
            <Text style={styles.loadingText}>Verifying...</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <ArrowLeft color="#374151" size={20} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Shield color="#FFFFFF" size={32} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>EstateHub</Text>
        </View>

        {/* Headline */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>
            {purpose === 'password_reset' 
              ? 'Verify Your Email' 
              : `Verify Your ${purpose === 'phone_verification' ? 'Number' : 'Email'}`
            }
          </Text>
          <Text style={styles.subtext}>
            Enter the 6-digit code we sent to
          </Text>
          <Text style={styles.contactInfo}>
            {purpose === 'phone_verification' ? phoneNumber : email}
          </Text>
        </View>

        {/* Change Number/Email Link */}
        {onChangeNumber && (
          <View style={styles.changeNumberContainer}>
            <TouchableOpacity 
              onPress={onChangeNumber} 
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.changeNumberText}>
                Change {purpose === 'phone_verification' ? 'Phone Number' : 'Email'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle color="#DC2626" size={20} strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          <View style={styles.otpInputsWrapper}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
                onKeyPress={(e) => handleKeyPress(index, e)}
                selectionColor="#2D6A4F"
                textAlign="center"
                editable={!isLoading}
                autoComplete="off"
                autoCorrect={false}
              />
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleVerify}
            disabled={!isOtpComplete || isLoading}
            style={[
              styles.verifyButton,
              (!isOtpComplete || isLoading) && styles.verifyButtonDisabled,
            ]}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>
                {purpose === 'password_reset' ? 'Verify & Reset Password' : 'Verify & Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Resend OTP Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendQuestion}>Didn't receive the code?</Text>
          {canResend ? (
            <TouchableOpacity 
              onPress={handleResendOTP} 
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={[
                styles.resendLink,
                isLoading && styles.resendLinkDisabled
              ]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>
              Resend OTP in{' '}
              <Text style={styles.resendTimerHighlight}>
                {Math.floor(resendTimer / 60)}:
                {(resendTimer % 60).toString().padStart(2, '0')}
              </Text>
            </Text>
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <View style={styles.securityIconContainer}>
            <Shield color="#2D6A4F" size={20} strokeWidth={2} />
          </View>
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>Secure Verification</Text>
            <Text style={styles.securityDescription}>
              This OTP is valid for 10 minutes. Never share this code with
              anyone for your security.
            </Text>
          </View>
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <View style={styles.trustIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.trustText}>
            Your information is safe and encrypted
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
    height: 160,
    opacity: 0.05,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
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
    marginBottom: 12,
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
    paddingHorizontal: 16,
  },
  contactInfo: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  changeNumberContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  changeNumberText: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '500',
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
  otpContainer: {
    marginBottom: 32,
  },
  otpInputsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#2D6A4F',
    backgroundColor: '#FFFFFF',
  },
  otpInputError: {
    borderColor: '#DC2626',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  verifyButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendQuestion: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  resendLink: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  resendTimer: {
    color: '#6B7280',
    fontSize: 14,
  },
  resendTimerHighlight: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(45, 106, 79, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 79, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityDescription: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
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