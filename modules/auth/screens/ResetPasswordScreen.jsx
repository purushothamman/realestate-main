import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Password requirements
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

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#DC2626';
    if (passwordStrength === 3) return '#CA8A04';
    return '#16A34A';
  };

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
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

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* New Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
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
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
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
              (!passwordsMatch || passwordStrength < 3) &&
                styles.resetButtonDisabled,
            ]}
            disabled={!passwordsMatch || passwordStrength < 3}
            activeOpacity={0.8}
          >
            <ShieldCheck color="#FFFFFF" size={20} strokeWidth={2} />
            <Text style={styles.resetButtonText}>Reset Password</Text>
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Lock color="#2D6A4F" size={16} strokeWidth={2} />
            <Text style={styles.securityNoteText}>
              Your password is encrypted and secure
            </Text>
          </View>

          {/* Back to Login */}
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
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
    backgroundColor: '#3B82F6',
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
    shadowColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
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
    marginBottom: 32,
    paddingHorizontal: 8,
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
    shadowColor: '#3B82F6',
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
    color: '#1D4ED8',
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