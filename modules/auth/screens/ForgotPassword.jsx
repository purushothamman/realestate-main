import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Building2,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react-native';
import OTPVerificationScreen from './OTPVerificationScreen';
import { API_CONFIG, buildUrl, handleApiError } from '../config/apiConfig';

export default function ForgetPassword({ onBack, onBackToLogin }) {
  const [screen, setScreen] = useState('forgotPassword');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If OTP screen should be shown
  if (screen === 'otp') {
    return (
      <OTPVerificationScreen
        email={email}
        purpose="password_reset"
        onBack={() => {
          setScreen('forgotPassword');
          setStatus('idle');
          setSuccessMessage('');
        }}
        onVerify={(otpCode) => {
          console.log('OTP Verified:', otpCode);
          // After successful OTP verification, you might want to:
          // 1. Navigate to reset password screen
          // 2. Or go back to login
          if (onBackToLogin) {
            onBackToLogin();
          } else if (onBack) {
            onBack();
          }
        }}
      />
    );
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Reset states
    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    // Validate email
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      // Build the URL
      const url = buildUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD);
      
      // Debug logging - remove in production
      console.log('🔍 API Request Details:');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', API_CONFIG.HEADERS);
      console.log('Body:', { email: email.toLowerCase().trim() });

      // Call the backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Debug logging
      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);

      // Handle 404 specifically
      if (response.status === 404) {
        setStatus('error');
        setErrorMessage(
          'The password reset endpoint is not available. Please contact support or try again later.'
        );
        console.error('❌ 404 Error: Endpoint not found at', url);
        
        // Show detailed error in development
        if (__DEV__) {
          Alert.alert(
            'Development Error',
            `404 Not Found\n\nURL: ${url}\n\nPlease check:\n1. API_CONFIG.ENDPOINTS.FORGOT_PASSWORD is correct\n2. Backend server is running\n3. Route exists on backend`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      const data = await response.json();
      console.log('📦 Response Data:', data);

      if (response.ok) {
        // Success - OTP has been sent
        setStatus('success');
        setSuccessMessage(
          data.message || 
          'If an account exists with this email, you will receive a password reset OTP.'
        );

        // Navigate to OTP screen after 2 seconds
        setTimeout(() => {
          setScreen('otp');
        }, 2000);
      } else if (response.status === 429) {
        // Rate limit exceeded
        setStatus('error');
        setErrorMessage(
          data.message || 
          'Too many password reset requests. Please try again after 15 minutes.'
        );
      } else if (response.status === 400) {
        // Bad request
        setStatus('error');
        setErrorMessage(data.message || 'Invalid request. Please check your email address.');
      } else if (response.status === 500) {
        // Server error
        setStatus('error');
        setErrorMessage('Server error. Please try again later or contact support.');
      } else {
        // Other errors
        setStatus('error');
        const errorInfo = handleApiError(null, response);
        setErrorMessage(data.message || errorInfo.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      setStatus('error');
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        setErrorMessage('Request timeout. Please check your internet connection and try again.');
      } else if (error.message === 'Network request failed' || error.message.includes('fetch')) {
        setErrorMessage(
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }

      // Show detailed error in development
      if (__DEV__) {
        console.error('Full error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    }
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else if (onBack) {
      onBack();
    }
  };

  const handleTryAgain = () => {
    if (status === 'error') {
      // If there's an error, allow immediate retry
      handleSubmit();
    } else {
      // If previous attempt was successful, confirm before retrying
      Alert.alert(
        'Resend OTP',
        'Are you sure you want to request another OTP?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Resend', onPress: handleSubmit },
        ]
      );
    }
  };

  const handleSendToDifferentEmail = () => {
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#374151" size={20} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.headerLogo}>
                <Building2 color="#FFFFFF" size={16} strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>EstateHub</Text>
            </View>

            <TouchableOpacity style={styles.helpButton}>
              <HelpCircle color="#9CA3AF" size={24} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Mail color="#2D6A4F" size={40} strokeWidth={2} />
              </View>
            </View>

            {/* Title & Description */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.description}>
                Enter your email address and we'll send you an OTP to reset your
                password
              </Text>
            </View>

            {/* Success Message */}
            {status === 'success' && successMessage && (
              <View style={styles.successContainer}>
                <CheckCircle
                  color="#059669"
                  size={20}
                  strokeWidth={2}
                  style={styles.successIcon}
                />
                <View style={styles.successTextContainer}>
                  <Text style={styles.successText}>
                    <Text style={styles.successTextBold}>Success!</Text>{' '}
                    {successMessage}
                  </Text>
                  <Text style={styles.successSubtext}>
                    Redirecting to OTP verification...
                  </Text>
                </View>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={styles.inputWrapper}>
                  <Mail
                    color="#9CA3AF"
                    size={20}
                    strokeWidth={2}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      status === 'error' && styles.inputError,
                      status === 'success' && styles.inputDisabled,
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (status === 'error') {
                        setStatus('idle');
                        setErrorMessage('');
                      }
                    }}
                    editable={status !== 'loading' && status !== 'success'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit}
                  />
                </View>

                {/* Error Message */}
                {status === 'error' && errorMessage && (
                  <View style={styles.errorContainer}>
                    <AlertCircle
                      color="#DC2626"
                      size={16}
                      strokeWidth={2}
                      style={styles.errorIcon}
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={status === 'loading' || status === 'success'}
                style={[
                  styles.submitButton,
                  (status === 'loading' || status === 'success') &&
                    styles.submitButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                {status === 'loading' ? (
                  <View style={styles.submitButtonContent}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                      Sending OTP...
                    </Text>
                  </View>
                ) : status === 'success' ? (
                  <View style={styles.submitButtonContent}>
                    <CheckCircle color="#6B7280" size={20} strokeWidth={2} />
                    <Text style={styles.submitButtonTextDisabled}>
                      OTP Sent
                    </Text>
                  </View>
                ) : (
                  <View style={styles.submitButtonContent}>
                    <Send color="#FFFFFF" size={20} strokeWidth={2} />
                    <Text style={styles.submitButtonText}>Send OTP</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Additional Info */}
            {status !== 'success' && (
              <View style={styles.additionalInfo}>
                <Text style={styles.additionalInfoText}>
                  Didn't receive the OTP? Check your spam folder or{' '}
                </Text>
                <TouchableOpacity
                  onPress={handleTryAgain}
                  disabled={status === 'loading'}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tryAgainText,
                      status === 'loading' && styles.tryAgainTextDisabled,
                    ]}
                  >
                    try again
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Resend Success Action */}
            {status === 'success' && (
              <View style={styles.resendContainer}>
                <TouchableOpacity
                  onPress={handleSendToDifferentEmail}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendText}>
                    Send to a different email
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Rate Limit Information */}
            {status === 'error' && errorMessage.includes('15 minutes') && (
              <View style={styles.rateLimitInfo}>
                <AlertCircle color="#F59E0B" size={16} strokeWidth={2} />
                <Text style={styles.rateLimitText}>
                  For security reasons, password reset attempts are limited to 3
                  per 15 minutes.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer - Back to Login */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backToLoginButton}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#2D6A4F" size={16} strokeWidth={2} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#2D6A4F',
    fontSize: 18,
    fontWeight: '600',
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  contentContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  successContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  successIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  successTextContainer: {
    flex: 1,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
  },
  successTextBold: {
    fontWeight: '600',
  },
  successSubtext: {
    color: '#15803D',
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
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
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 14,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  additionalInfoText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  tryAgainText: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  tryAgainTextDisabled: {
    opacity: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '500',
  },
  rateLimitInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  rateLimitText: {
    flex: 1,
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backToLoginText: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: '500',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 160,
    right: -80,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(45, 106, 79, 0.05)',
    borderRadius: 80,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 160,
    left: -80,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 80,
  },
});