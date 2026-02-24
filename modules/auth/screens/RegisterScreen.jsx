import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ShoppingBag,
  Building2,
  UserCheck,
  Check,
  Shield,
  Home,
  AlertCircle,
  X,
} from 'lucide-react-native';

import { useRegistrationForm } from '../hooks/useRegistrationForm';
import { ProfileImageSection } from '../components/ProfileImageSection';
import { CoreRegistrationFields } from '../components/CoreRegistrationFields';
import { RoleSelector } from '../components/RoleSelector';
import { BuilderFields } from '../components/BuilderFields';

// 🔹 Constants outside component to prevent recreation on re-render
const USER_TYPES = [
  {
    value: 'buyer',
    label: 'Buyer',
    description: 'Looking to buy property',
    icon: ShoppingBag,
    color: '#2D6A4F',
  },
  {
    value: 'builder',
    label: 'Builder',
    description: 'Looking to sell property',
    icon: Building2,
    color: '#E27D4A',
  },
  {
    value: 'agent',
    label: 'Real Estate Agent',
    description: 'Professional agent',
    icon: UserCheck,
    color: '#4A90E2',
  },
];

// 🔹 Optimized sub-components for zero-flicker
const LogoSection = React.memo(() => (
  <View style={styles.logoContainer}>
    <View style={styles.logoBox}>
      <Home color="#FFFFFF" size={28} strokeWidth={2.5} />
    </View>
    <Text style={styles.logoText}>EstateHub</Text>
  </View>
));

const RegisterScreen = React.memo(({
  navigation,
  onNavigateToLogin,
  onBack,
  onRegisterSuccess
}) => {
  const isAndroid = Platform.OS === 'android';
  const {
    formData,
    errors,
    isLoading,
    apiError,
    successMessage,
    uploadingImage,
    uploadingDocument,
    termsAccepted,
    setTermsAccepted,
    setApiError,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleDocumentUpload,
    handleRemoveDocument,
    handleRegister,
  } = useRegistrationForm(navigation, onNavigateToLogin || onBack, onRegisterSuccess);

  const [showRoleModal, setShowRoleModal] = useState(false);

  // Memoized selection logic
  const selectedRole = React.useMemo(
    () => USER_TYPES.find((type) => type.value === formData.role),
    [formData.role]
  );

  const formatFileSize = React.useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const handleSelectRole = React.useCallback((role) => {
    handleInputChange('role', role);
    setShowRoleModal(false);
  }, [handleInputChange]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LogoSection />

          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Create Your Account</Text>
            <Text style={styles.subheadline}>
              Join thousands of users to buy, sell, and rent properties with ease
            </Text>
          </View>

          {/* Messages Container - Fixed height or controlled visibility to prevent flickering */}
          <View style={styles.messageContainer}>
            {successMessage ? (
              <View style={styles.successMessage}>
                <Check color="#059669" size={20} strokeWidth={2} />
                <Text style={styles.successMessageText}>{successMessage}</Text>
              </View>
            ) : null}

            {apiError ? (
              <View style={styles.errorMessage}>
                <AlertCircle color="#DC2626" size={20} strokeWidth={2} />
                <Text style={styles.errorMessageText}>{apiError}</Text>
                <TouchableOpacity onPress={() => setApiError('')}>
                  <X color="#EF4444" size={16} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Form */}
          <View
            style={styles.form}
            importantForAutofill={isAndroid ? 'noExcludeDescendants' : 'auto'}
          >
            <ProfileImageSection
              profileImage={formData.profileImage}
              uploadingImage={uploadingImage}
              onUpload={handleImageUpload}
              onRemove={handleRemoveImage}
              error={errors.profileImage}
            />

            <CoreRegistrationFields
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
            />

            <RoleSelector
              userTypes={USER_TYPES}
              formData={formData}
              errors={errors}
              showRoleModal={showRoleModal}
              setShowRoleModal={setShowRoleModal}
              handleSelectRole={handleSelectRole}
              selectedRole={selectedRole}
            />

            {formData.role === 'builder' && (
              <BuilderFields
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleDocumentUpload={handleDocumentUpload}
                handleRemoveDocument={handleRemoveDocument}
                uploadingDocument={uploadingDocument}
                formatFileSize={formatFileSize}
              />
            )}

            {/* Terms and Conditions */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={styles.termsButton}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxChecked,
                  ]}
                >
                  {termsAccepted && (
                    <Check color="#FFFFFF" size={12} strokeWidth={3} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <View style={[styles.errorContainer, styles.errorContainerIndent]}>
                  <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                  <Text style={styles.errorText}>{errors.terms}</Text>
                </View>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={!termsAccepted || isLoading}
              style={[
                styles.registerButton,
                (!termsAccepted || isLoading) && styles.registerButtonDisabled,
              ]}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <View style={styles.registerButtonContent}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.registerButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToLogin) onNavigateToLogin();
                  else if (onBack) onBack();
                  else if (navigation) navigation.navigate('login');
                }}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.trustBadge}>
              <View style={styles.trustIcon}>
                <Shield color="#FFFFFF" size={12} strokeWidth={2} />
              </View>
              <Text style={styles.trustText}>
                Secure registration • Your data is protected
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
});

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: '#2D6A4F',
    fontSize: 24,
    fontWeight: '700',
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    minHeight: 80,
    marginBottom: 8,
    justifyContent: 'center',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
  },
  successMessageText: {
    flex: 1,
    color: '#15803D',
    fontSize: 14,
    fontWeight: '500',
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
  termsButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: 4,
  },
  errorContainerIndent: {
    marginLeft: 32,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  registerButton: {
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    //shadowOpacity: 0.2,
    shadowRadius: 8,
    //elevation: 8,
    marginTop: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginHorizontal: 16,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '700',
  },
  trustBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  trustIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
