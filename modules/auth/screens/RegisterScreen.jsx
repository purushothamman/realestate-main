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
  Animated,
  Modal,
} from 'react-native';
import { 
  Home, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronDown,
  ShoppingBag,
  Building2,
  UserCheck,
  Check,
  Shield,
  Apple
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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

export default function RegisterScreen({ onRegister, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    userType: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for register button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    console.log('Register with:', formData);
    if (onRegister) onRegister();
  };

  const handleSelectUserType = (userType) => {
    setFormData((prev) => ({ ...prev, userType }));
    setShowUserTypeModal(false);
  };

  const selectedUserType = USER_TYPES.find((type) => type.value === formData.userType);

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <View style={styles.backgroundContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBza3lsaW5lJTIwY2l0eXxlbnwxfHx8fDE3NjYwNzI4NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.gradientOverlay} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and App Name with Animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoBox}>
            <Home color="#FFFFFF" size={32} strokeWidth={2.5} />
          </View>
          <Text style={styles.appName}>EstateHub</Text>
        </Animated.View>

        {/* Headline and Subtext with Slide Animation */}
        <Animated.View
          style={[
            styles.headlineContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headline}>Create Your Account</Text>
          <Text style={styles.subtext}>
            Join thousands of users to buy, sell, and rent properties with ease
          </Text>
        </Animated.View>

        {/* Registration Form */}
        <Animated.View
          style={[
            styles.form,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === 'name' && styles.inputWrapperFocused,
              ]}
            >
              <User
                color={focusedInput === 'name' ? '#2D6A4F' : '#9CA3AF'}
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
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
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
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === 'phone' && styles.inputWrapperFocused,
              ]}
            >
              <Phone
                color={focusedInput === 'phone' ? '#2D6A4F' : '#9CA3AF'}
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
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="phone-pad"
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
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
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

          {/* User Type Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>I am a...</Text>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                formData.userType && styles.dropdownButtonSelected,
              ]}
              onPress={() => setShowUserTypeModal(true)}
              activeOpacity={0.7}
            >
              {selectedUserType ? (
                <View style={styles.dropdownSelected}>
                  <View
                    style={[
                      styles.dropdownIconBox,
                      { backgroundColor: `${selectedUserType.color}15` },
                    ]}
                  >
                    <selectedUserType.icon
                      size={20}
                      color={selectedUserType.color}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.dropdownTextContainer}>
                    <Text style={styles.dropdownLabel}>
                      {selectedUserType.label}
                    </Text>
                    <Text style={styles.dropdownDescription}>
                      {selectedUserType.description}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.dropdownPlaceholder}>Select your role</Text>
              )}
              <ChevronDown color="#9CA3AF" size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked,
              ]}
            >
              {termsAccepted && <Check color="#FFFFFF" size={12} strokeWidth={3} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Register Button with Pulse Animation */}
          <Animated.View style={{ transform: [{ scale: termsAccepted ? pulseAnim : 1 }] }}>
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
          </Animated.View>
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Registration Buttons */}
        <View style={styles.socialButtonsContainer}>
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

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => console.log('Register with Apple')}
            activeOpacity={0.7}
          >
            <View style={styles.appleIconContainer}>
              <Apple color="#000000" size={20} strokeWidth={2} fill="#000000" />
            </View>
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
            <Shield color="#FFFFFF" size={12} strokeWidth={2.5} />
          </View>
          <Text style={styles.trustText}>
            Secure registration • Your data is protected
          </Text>
        </View>
      </ScrollView>

      {/* User Type Selection Modal */}
      <Modal
        visible={showUserTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Role</Text>
              <Text style={styles.modalSubtitle}>
                Choose how you want to use EstateHub
              </Text>
            </View>

            <View style={styles.userTypeList}>
              {USER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.userTypeCard,
                    formData.userType === type.value && styles.userTypeCardSelected,
                  ]}
                  onPress={() => handleSelectUserType(type.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.userTypeIconBox,
                      { backgroundColor: `${type.color}15` },
                    ]}
                  >
                    <type.icon size={24} color={type.color} strokeWidth={2} />
                  </View>
                  <View style={styles.userTypeInfo}>
                    <Text style={styles.userTypeLabel}>{type.label}</Text>
                    <Text style={styles.userTypeDescription}>
                      {type.description}
                    </Text>
                  </View>
                  {formData.userType === type.value && (
                    <View style={styles.selectedCheckmark}>
                      <Check color="#FFFFFF" size={14} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    height: 200,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(45, 106, 79, 0.3)',
    marginBottom: 12,
  },
  appName: {
    color: '#2D6A4F',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headline: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtext: {
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    transition: 'all 0.3s ease',
  },
  inputWrapperFocused: {
    borderColor: '#2D6A4F',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 0px 0px 4px rgba(45, 106, 79, 0.1)',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 52,
    paddingLeft: 46,
    paddingRight: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: 'transparent',
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  passwordHint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dropdownButtonSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2D6A4F',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  dropdownSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dropdownIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownTextContainer: {
    flex: 1,
  },
  dropdownLabel: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  dropdownDescription: {
    color: '#6B7280',
    fontSize: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },
  termsText: {
    flex: 1,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
  },
  termsLink: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  registerButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(45, 106, 79, 0.3)',
  },
  registerButtonDisabled: {
    opacity: 0.5,
    boxShadow: 'none',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    gap: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  appleIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
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
    width: 18,
    height: 18,
    backgroundColor: '#2D6A4F',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustText: {
    color: '#6B7280',
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    boxShadow: '0px -4px 24px rgba(0, 0, 0, 0.15)',
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  userTypeList: {
    padding: 16,
    gap: 12,
  },
  userTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    gap: 12,
  },
  userTypeCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2D6A4F',
    boxShadow: '0px 4px 12px rgba(45, 106, 79, 0.15)',
  },
  userTypeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTypeInfo: {
    flex: 1,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userTypeDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  selectedCheckmark: {
    width: 24,
    height: 24,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});