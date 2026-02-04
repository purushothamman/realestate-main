import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Camera,
  Upload,
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
  Home,
  AlertCircle,
  X,
  TrendingUp,
  MapPin,
  Briefcase,
  FileText,
  MessageSquare,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Backend API configuration - UPDATE THIS WITH YOUR ACTUAL API URL
const API_BASE_URL = 'http://localhost:5000/api'; // For local development
// const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api'; // For mobile testing
// const API_BASE_URL = 'https://your-production-api.com/api'; // For production

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

export default function RegisterScreen({ navigation, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    profileImage: null,
    companyName: '',
    gstNo: '',
    panNo: '',
    website: '',
    description: '',
    experienceYears: '',
    totalProjects: '',
    registrationCertificate: null,
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showroleModal, setShowroleModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-15 digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8+ characters with letters and numbers';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    // Builder-specific client-side validation
    if (formData.role === 'builder') {
      if (!formData.companyName || !formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required for builders';
      }
      if (!formData.panNo || !formData.panNo.trim()) {
        newErrors.panNo = 'PAN number is required for builders';
      } else {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
        if (!panRegex.test(formData.panNo.trim())) {
          newErrors.panNo = 'Please enter a valid PAN (e.g. AAAAA1111A)';
        }
      }
      if (formData.gstNo && formData.gstNo.trim()) {
        const gstRegex = /^[0-9A-Z]{15}$/i;
        if (!gstRegex.test(formData.gstNo.trim())) {
          newErrors.gstNo = 'Please enter a valid GST number (15 characters)';
        }
      }
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setApiError('');
  };

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          setErrors((prev) => ({ ...prev, profileImage: 'Image must be less than 5MB' }));
          return;
        }

        setUploadingImage(true);
        setErrors((prev) => ({ ...prev, profileImage: '' }));

        try {
          const formDataUpload = new FormData();
          formDataUpload.append('profileImage', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'profile.jpg',
          });

          const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
            method: 'POST',
            body: formDataUpload,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to upload image');
          }

          setFormData((prev) => ({
            ...prev,
            profileImage: data.imageUrl || data.url || asset.uri,
          }));
        } catch (error) {
          console.error('Image upload error:', error);
          // Fallback: use local URI if backend fails
          setFormData((prev) => ({ ...prev, profileImage: asset.uri }));
          Alert.alert('Info', 'Image will be uploaded after registration');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: null }));
    setErrors((prev) => ({ ...prev, profileImage: '' }));
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') {
        return;
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.size && asset.size > 10 * 1024 * 1024) {
          setErrors((prev) => ({ ...prev, registrationCertificate: 'Document must be less than 10MB' }));
          return;
        }

        setUploadingDocument(true);
        setErrors((prev) => ({ ...prev, registrationCertificate: '' }));

        try {
          const formDataUpload = new FormData();
          formDataUpload.append('registrationCertificate', {
            uri: asset.uri,
            type: asset.mimeType || 'application/pdf',
            name: asset.name || 'certificate.pdf',
          });

          const response = await fetch(`${API_BASE_URL}/upload/registration-certificate`, {
            method: 'POST',
            body: formDataUpload,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to upload document');
          }

          setFormData((prev) => ({
            ...prev,
            registrationCertificate: {
              uri: data.documentUrl || data.url || asset.uri,
              name: asset.name,
              size: asset.size,
            },
          }));
        } catch (error) {
          console.error('Document upload error:', error);
          // Fallback: use local data if backend fails
          setFormData((prev) => ({
            ...prev,
            registrationCertificate: {
              uri: asset.uri,
              name: asset.name,
              size: asset.size,
            },
          }));
          Alert.alert('Info', 'Document will be uploaded after registration');
        } finally {
          setUploadingDocument(false);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      setUploadingDocument(false);
    }
  };

  const handleRemoveDocument = () => {
    setFormData((prev) => ({ ...prev, registrationCertificate: null }));
    setErrors((prev) => ({ ...prev, registrationCertificate: '' }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleRegister = async () => {
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) {
      setApiError('Please fix all errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/[\s\-\(\)]/g, ''),
        password: formData.password,
        role: formData.role,
      };

      // Add builder-specific fields if role is builder
      if (formData.role === 'builder') {
        registrationData.companyName = formData.companyName?.trim() || null;
        registrationData.gstNo = formData.gstNo?.trim() || null;
        registrationData.panNo = formData.panNo?.trim() || null;
        registrationData.website = formData.website?.trim() || null;
        registrationData.description = formData.description?.trim() || null;
        registrationData.experienceYears = formData.experienceYears || null;
        registrationData.totalProjects = formData.totalProjects || null;
        registrationData.registrationCertificate = formData.registrationCertificate?.uri || null;
        registrationData.address = formData.address?.trim() || null;
        registrationData.city = formData.city?.trim() || null;
        registrationData.state = formData.state?.trim() || null;
        registrationData.pincode = formData.pincode?.trim() || null;
      }

      console.log('Sending registration request:', { ...registrationData, password: '***' });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      // Clone response to avoid "Body already read" error
      const responseClone = response.clone();
      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        // Try to get text if JSON parsing fails
        const text = await responseClone.text();
        console.log('Response text:', text);
        throw new Error('Invalid server response');
      }

      console.log('Server response:', data);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(data.message || 'This email is already registered. Please login instead.');
        } else if (response.status === 400) {
          throw new Error(data.message || 'Invalid registration data');
        } else if (response.status === 500) {
          throw new Error(data.message || 'Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Registration failed');
        }
      }

      // Registration successful
      setSuccessMessage(data.message || 'Registration successful! Redirecting to login...');

      // Store authentication token and user data for immediate login
      if (data.token) {
        try {
          await AsyncStorage.setItem('authToken', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          console.log('✅ Token and user data stored successfully');
        } catch (storageError) {
          console.error('Storage error:', storageError);
        }
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        profileImage: null,
        companyName: '',
        gstNo: '',
        panNo: '',
        website: '',
        description: '',
        experienceYears: '',
        totalProjects: '',
        registrationCertificate: null,
        address: '',
        city: '',
        state: '',
        pincode: '',
      });
      setTermsAccepted(false);

      // Navigate to Login page after 1.5 seconds, then to Home if token exists
      setTimeout(() => {
        if (data.token && navigation) {
          // If registration includes auto-login, go directly to Home
          console.log('🏠 Auto-login: Navigating to Home');
          navigation.navigate('home');
        } else if (navigation) {
          // Otherwise navigate to Login
          console.log('🔐 Navigating to Login');
          navigation.navigate('login');
        } else if (onNavigateToLogin) {
          onNavigateToLogin();
        }
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectrole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setShowroleModal(false);
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  const selectedrole = USER_TYPES.find((type) => type.value === formData.role);

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.backgroundOverlay} />
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Home color="#FFFFFF" size={28} strokeWidth={2.5} />
            </View>
            <Text style={styles.logoText}>EstateHub</Text>
          </View>

          {/* Headline */}
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Create Your Account</Text>
            <Text style={styles.subheadline}>
              Join thousands of users to buy, sell, and rent properties with ease
            </Text>
          </View>

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.successMessage}>
              <Check color="#059669" size={20} strokeWidth={2} />
              <Text style={styles.successMessageText}>{successMessage}</Text>
            </View>
          ) : null}

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

          {/* Form */}
          <View style={styles.form}>
            {/* Profile Image Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Profile Picture{' '}
                <Text style={styles.labelOptional}>(Optional)</Text>
              </Text>
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageWrapper}>
                  {formData.profileImage ? (
                    <Image
                      source={{ uri: formData.profileImage }}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <User color="#9CA3AF" size={32} strokeWidth={2} />
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={handleImageUpload}
                    disabled={uploadingImage}
                    style={styles.cameraButton}
                    activeOpacity={0.8}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Camera color="#FFFFFF" size={16} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.profileImageInfo}>
                  <Text style={styles.profileImageTitle}>
                    {formData.profileImage ? 'Change Photo' : 'Upload Photo'}
                  </Text>
                  <Text style={styles.profileImageSubtitle}>
                    JPG, PNG or GIF • Max 5MB
                  </Text>
                  <View style={styles.profileImageButtons}>
                    <TouchableOpacity
                      onPress={handleImageUpload}
                      disabled={uploadingImage}
                      style={styles.chooseFileButton}
                      activeOpacity={0.8}
                    >
                      <Upload color="#2D6A4F" size={14} strokeWidth={2} />
                      <Text style={styles.chooseFileButtonText}>
                        {uploadingImage ? 'Uploading...' : 'Choose File'}
                      </Text>
                    </TouchableOpacity>
                    {formData.profileImage && (
                      <TouchableOpacity
                        onPress={handleRemoveImage}
                        style={styles.removeButton}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {errors.profileImage && (
                    <View style={styles.errorContainer}>
                      <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                      <Text style={styles.errorText}>{errors.profileImage}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'name' && styles.inputWrapperFocused,
                  errors.name && styles.inputWrapperError,
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
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                />
              </View>
              {errors.name && (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                  <Text style={styles.errorText}>{errors.name}</Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputWrapperFocused,
                  errors.email && styles.inputWrapperError,
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
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
              {errors.email && (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              )}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'phone' && styles.inputWrapperFocused,
                  errors.phone && styles.inputWrapperError,
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
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />
              </View>
              {errors.phone && (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                  <Text style={styles.errorText}>{errors.phone}</Text>
                </View>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputWrapperFocused,
                  errors.password && styles.inputWrapperError,
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
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff color="#9CA3AF" size={20} strokeWidth={2} />
                  ) : (
                    <Eye color="#9CA3AF" size={20} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              ) : (
                <Text style={styles.passwordHint}>
                  Must be at least 8 characters with letters and numbers
                </Text>
              )}
            </View>

            {/* User Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                I am a... <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowroleModal(true)}
                style={[
                  styles.roleButton,
                  formData.role && styles.roleButtonSelected,
                  errors.role && styles.roleButtonError,
                ]}
                activeOpacity={0.8}
              >
                {selectedrole ? (
                  <View style={styles.roleSelected}>
                    <View
                      style={[
                        styles.roleIcon,
                        { backgroundColor: `${selectedrole.color}15` },
                      ]}
                    >
                      <selectedrole.icon
                        color={selectedrole.color}
                        size={20}
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.roleText}>
                      <Text style={styles.roleLabel}>
                        {selectedrole.label}
                      </Text>
                      <Text style={styles.roleDescription}>
                        {selectedrole.description}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.rolePlaceholder}>Select your role</Text>
                )}
                <ChevronDown color="#9CA3AF" size={20} strokeWidth={2} />
              </TouchableOpacity>
              {errors.role && (
                <View style={styles.errorContainer}>
                  <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                  <Text style={styles.errorText}>{errors.role}</Text>
                </View>
              )}
            </View>



            {/* Builder Specific Fields */}
            {formData.role === 'builder' && (
              <View style={styles.builderFieldsContainer}>
                <Text style={styles.sectionHeader}>Builder Details</Text>

                {/* Company Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Company Name <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, focusedInput === 'companyName' && styles.inputWrapperFocused, errors.companyName && styles.inputWrapperError]}>
                    <Building2
                      color={focusedInput === 'companyName' ? '#2D6A4F' : '#9CA3AF'}
                      size={20}
                      strokeWidth={2}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter company name"
                      placeholderTextColor="#9CA3AF"
                      value={formData.companyName}
                      onChangeText={(value) => handleInputChange('companyName', value)}
                      onFocus={() => setFocusedInput('companyName')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                  {errors.companyName && (
                    <View style={styles.errorContainer}>
                      <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                      <Text style={styles.errorText}>{errors.companyName}</Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Company Description <Text style={styles.labelOptional}>(Optional)</Text>
                  </Text>
                  <View style={[styles.textAreaWrapper, focusedInput === 'description' && styles.inputWrapperFocused]}>
                    <MessageSquare
                      color={focusedInput === 'description' ? '#2D6A4F' : '#9CA3AF'}
                      size={20}
                      strokeWidth={2}
                      style={styles.textAreaIcon}
                    />
                    <TextInput
                      style={styles.textArea}
                      placeholder="Brief description about your company and projects..."
                      placeholderTextColor="#9CA3AF"
                      value={formData.description}
                      onChangeText={(value) => handleInputChange('description', value)}
                      onFocus={() => setFocusedInput('description')}
                      onBlur={() => setFocusedInput(null)}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                {/* GST Number (Optional) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    GST Number <Text style={styles.labelOptional}>(Optional)</Text>
                  </Text>
                  <View style={[styles.inputWrapper, focusedInput === 'gstNo' && styles.inputWrapperFocused, errors.gstNo && styles.inputWrapperError]}>
                    <Shield
                      color={focusedInput === 'gstNo' ? '#2D6A4F' : '#9CA3AF'}
                      size={20}
                      strokeWidth={2}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter GST number"
                      placeholderTextColor="#9CA3AF"
                      value={formData.gstNo}
                      onChangeText={(value) => handleInputChange('gstNo', value)}
                      onFocus={() => setFocusedInput('gstNo')}
                      onBlur={() => setFocusedInput(null)}
                      autoCapitalize="characters"
                    />
                  </View>
                  {errors.gstNo && (
                    <View style={styles.errorContainer}>
                      <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                      <Text style={styles.errorText}>{errors.gstNo}</Text>
                    </View>
                  )}
                </View>

                {/* PAN Number (Required for builders) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    PAN Number <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, focusedInput === 'panNo' && styles.inputWrapperFocused, errors.panNo && styles.inputWrapperError]}>
                    <Shield
                      color={focusedInput === 'panNo' ? '#2D6A4F' : '#9CA3AF'}
                      size={20}
                      strokeWidth={2}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter PAN number (e.g. AAAAA1111A)"
                      placeholderTextColor="#9CA3AF"
                      value={formData.panNo}
                      onChangeText={(value) => handleInputChange('panNo', value)}
                      onFocus={() => setFocusedInput('panNo')}
                      onBlur={() => setFocusedInput(null)}
                      autoCapitalize="characters"
                    />
                  </View>
                  {errors.panNo && (
                    <View style={styles.errorContainer}>
                      <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                      <Text style={styles.errorText}>{errors.panNo}</Text>
                    </View>
                  )}
                </View>

                {/* Registration Certificate Upload */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Registration Certificate <Text style={styles.labelOptional}>(Optional)</Text>
                  </Text>
                  <View style={styles.documentUploadContainer}>
                    {formData.registrationCertificate ? (
                      <View style={styles.documentPreview}>
                        <View style={styles.documentInfo}>
                          <FileText color="#2D6A4F" size={24} strokeWidth={2} />
                          <View style={styles.documentDetails}>
                            <Text style={styles.documentName} numberOfLines={1}>
                              {formData.registrationCertificate.name}
                            </Text>
                            <Text style={styles.documentSize}>
                              {formatFileSize(formData.registrationCertificate.size || 0)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={handleRemoveDocument}
                          style={styles.documentRemoveButton}
                          activeOpacity={0.8}
                        >
                          <X color="#DC2626" size={18} strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={handleDocumentUpload}
                        disabled={uploadingDocument}
                        style={styles.documentUploadButton}
                        activeOpacity={0.8}
                      >
                        {uploadingDocument ? (
                          <ActivityIndicator color="#2D6A4F" size="small" />
                        ) : (
                          <>
                            <Upload color="#2D6A4F" size={20} strokeWidth={2} />
                            <Text style={styles.documentUploadText}>
                              Upload Certificate (PDF or Image)
                            </Text>
                            <Text style={styles.documentUploadSubtext}>
                              Max 10MB
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                    {errors.registrationCertificate && (
                      <View style={styles.errorContainer}>
                        <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                        <Text style={styles.errorText}>{errors.registrationCertificate}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Website */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Website <Text style={styles.labelOptional}>(Optional)</Text>
                  </Text>
                  <View style={[styles.inputWrapper, focusedInput === 'website' && styles.inputWrapperFocused]}>
                    <TrendingUp
                      color={focusedInput === 'website' ? '#2D6A4F' : '#9CA3AF'}
                      size={20}
                      strokeWidth={2}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="https://example.com"
                      placeholderTextColor="#9CA3AF"
                      value={formData.website}
                      onChangeText={(value) => handleInputChange('website', value)}
                      onFocus={() => setFocusedInput('website')}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Experience Years and Total Projects in a row */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Experience (Years) <Text style={styles.labelOptional}>(Optional)</Text></Text>
                    <View style={[styles.inputWrapper, focusedInput === 'experienceYears' && styles.inputWrapperFocused]}>
                      <Briefcase
                        color={focusedInput === 'experienceYears' ? '#2D6A4F' : '#9CA3AF'}
                        size={20}
                        strokeWidth={2}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 5"
                        placeholderTextColor="#9CA3AF"
                        value={formData.experienceYears}
                        onChangeText={(value) => handleInputChange('experienceYears', value)}
                        onFocus={() => setFocusedInput('experienceYears')}
                        onBlur={() => setFocusedInput(null)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Total Projects <Text style={styles.labelOptional}>(Optional)</Text></Text>
                    <View style={[styles.inputWrapper, focusedInput === 'totalProjects' && styles.inputWrapperFocused]}>
                      <Building2
                        color={focusedInput === 'totalProjects' ? '#2D6A4F' : '#9CA3AF'}
                        size={20}
                        strokeWidth={2}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 10"
                        placeholderTextColor="#9CA3AF"
                        value={formData.totalProjects}
                        onChangeText={(value) => handleInputChange('totalProjects', value)}
                        onFocus={() => setFocusedInput('totalProjects')}
                        onBlur={() => setFocusedInput(null)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* Address Section */}
                <Text style={[styles.label, { marginTop: 8 }]}>Street Address / Building <Text style={styles.labelOptional}>(Optional)</Text></Text>

                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, focusedInput === 'address' && styles.inputWrapperFocused]}>
                    <MapPin
                      color={focusedInput === 'address' ? '#2D6A4F' : '#9CA3AF'}
                      size={20}
                      strokeWidth={2}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Floor, Building Name, Street"
                      placeholderTextColor="#9CA3AF"
                      value={formData.address}
                      onChangeText={(value) => handleInputChange('address', value)}
                      onFocus={() => setFocusedInput('address')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                {/* City and State in a row */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>City <Text style={styles.labelOptional}>(Optional)</Text></Text>
                    <View style={[styles.inputWrapper, focusedInput === 'city' && styles.inputWrapperFocused]}>
                      <TextInput
                        style={styles.input}
                        placeholder="City"
                        placeholderTextColor="#9CA3AF"
                        value={formData.city}
                        onChangeText={(value) => handleInputChange('city', value)}
                        onFocus={() => setFocusedInput('city')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>State <Text style={styles.labelOptional}>(Optional)</Text></Text>
                    <View style={[styles.inputWrapper, focusedInput === 'state' && styles.inputWrapperFocused]}>
                      <TextInput
                        style={styles.input}
                        placeholder="State"
                        placeholderTextColor="#9CA3AF"
                        value={formData.state}
                        onChangeText={(value) => handleInputChange('state', value)}
                        onFocus={() => setFocusedInput('state')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                  </View>
                </View>

                {/* Pincode */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Pincode <Text style={styles.labelOptional}>(Optional)</Text></Text>
                  <View style={[styles.inputWrapper, focusedInput === 'pincode' && styles.inputWrapperFocused]}>
                    <MapPin
                      color={focusedInput === 'pincode' ? '#2D6A4F' : '#9CA3AF'}
                      size={20}
                      strokeWidth={2}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Pincode"
                      placeholderTextColor="#9CA3AF"
                      value={formData.pincode}
                      onChangeText={(value) => handleInputChange('pincode', value)}
                      onFocus={() => setFocusedInput('pincode')}
                      onBlur={() => setFocusedInput(null)}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Terms and Conditions */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                onPress={() => {
                  setTermsAccepted(!termsAccepted);
                  if (errors.terms) {
                    setErrors((prev) => ({ ...prev, terms: '' }));
                  }
                }}
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

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  if (navigation) {
                    navigation.navigate('login');
                  } else if (onNavigateToLogin) {
                    onNavigateToLogin();
                  }
                }}
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Badge */}
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

      {/* User Type Modal */}
      <Modal
        visible={showroleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowroleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowroleModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Your Role</Text>
                <Text style={styles.modalSubtitle}>
                  Choose how you want to use EstateHub
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowroleModal(false)}
                style={styles.modalCloseButton}
              >
                <X color="#6B7280" size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {USER_TYPES.map((type) => {
                const IconComponent = type.icon;
                return (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => handleSelectrole(type.value)}
                    style={[
                      styles.roleOption,
                      formData.role === type.value &&
                      styles.roleOptionSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.roleOptionIcon,
                        { backgroundColor: `${type.color}15` },
                      ]}
                    >
                      <IconComponent
                        color={type.color}
                        size={24}
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.roleOptionText}>
                      <Text style={styles.roleOptionLabel}>{type.label}</Text>
                      <Text style={styles.roleOptionDescription}>
                        {type.description}
                      </Text>
                    </View>
                    {formData.role === type.value && (
                      <View style={styles.roleOptionCheck}>
                        <Check color="#FFFFFF" size={14} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
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
    height: 192,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
  successMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelOptional: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
  required: {
    color: '#EF4444',
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileImageInfo: {
    flex: 1,
  },
  profileImageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileImageSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  profileImageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chooseFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2D6A4F',
    borderRadius: 8,
  },
  chooseFileButtonText: {
    color: '#2D6A4F',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
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
  inputWrapperError: {
    borderColor: '#FECACA',
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
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
  },
  documentUploadContainer: {
    marginTop: 4,
  },
  documentUploadButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  documentUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D6A4F',
    marginTop: 8,
  },
  documentUploadSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  documentRemoveButton: {
    padding: 8,
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
  passwordHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  roleButtonSelected: {
    borderColor: '#2D6A4F',
    backgroundColor: '#FFFFFF',
  },
  roleButtonError: {
    borderColor: '#FECACA',
  },
  roleSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  roleDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  rolePlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
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
  registerButton: {
    height: 56,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
  },
  roleOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2D6A4F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleOptionText: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  roleOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleOptionCheck: {
    width: 24,
    height: 24,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  builderFieldsContainer: {
    gap: 16,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
});