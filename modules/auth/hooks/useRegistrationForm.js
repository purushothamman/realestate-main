import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '../../../utils/api';

const INITIAL_FORM_DATA = {
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
};

export const useRegistrationForm = (navigation, onNavigateToLogin, onRegisterSuccess) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleInputChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
            if (prev[field]) {
                return { ...prev, [field]: '' };
            }
            return prev;
        });
        setApiError('');
    }, []);

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

    const handleImageUpload = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an image.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
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
                    if (Platform.OS === 'web') {
                        if (asset.file) {
                            formDataUpload.append('profileImage', asset.file);
                        } else {
                            const response = await fetch(asset.uri);
                            const blob = await response.blob();
                            const name = asset.fileName || `profile-${Date.now()}.jpg`;
                            formDataUpload.append('profileImage', blob, name);
                        }
                    } else {
                        const name = asset.fileName || `profile-${Date.now()}.jpg`;
                        const type = asset.mimeType || 'image/jpeg';
                        formDataUpload.append('profileImage', {
                            uri: asset.uri,
                            name,
                            type,
                        });
                    }

                    const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
                        method: 'POST',
                        body: formDataUpload,
                    });

                    const data = await response.json();
                    if (!response.ok || !data.success) {
                        throw new Error(data.message || 'Failed to upload image');
                    }

                    const imageUrl = data.url || data.imageUrl;
                    if (!imageUrl) throw new Error('No image URL returned from server');

                    setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
                } catch (error) {
                    console.error('Image upload error:', error);
                    Alert.alert('Upload Failed', error.message || 'Failed to upload image. Please try again.');
                    setFormData((prev) => ({ ...prev, profileImage: null }));
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

    const handleRemoveImage = useCallback(() => {
        setFormData((prev) => ({ ...prev, profileImage: null }));
        setErrors((prev) => ({ ...prev, profileImage: '' }));
    }, []);

    const handleDocumentUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.type === 'cancel' || result.canceled) return;

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
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Failed to upload document');

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
                    setFormData((prev) => ({
                        ...prev,
                        registrationCertificate: { uri: asset.uri, name: asset.name, size: asset.size },
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

    const handleRemoveDocument = useCallback(() => {
        setFormData((prev) => ({ ...prev, registrationCertificate: null }));
        setErrors((prev) => ({ ...prev, registrationCertificate: '' }));
    }, []);

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
                profileImage: formData.profileImage || null,
            };

            if (formData.role === 'builder') {
                Object.assign(registrationData, {
                    companyName: formData.companyName?.trim() || null,
                    gstNo: formData.gstNo?.trim() || null,
                    panNo: formData.panNo?.trim() || null,
                    website: formData.website?.trim() || null,
                    description: formData.description?.trim() || null,
                    experienceYears: formData.experienceYears || null,
                    totalProjects: formData.totalProjects || null,
                    registrationCertificate: formData.registrationCertificate?.uri || null,
                    address: formData.address?.trim() || null,
                    city: formData.city?.trim() || null,
                    state: formData.state?.trim() || null,
                    pincode: formData.pincode?.trim() || null,
                });
            }

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            const responseClone = response.clone();
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                const text = await responseClone.text();
                console.log('Response text:', text);
                throw new Error('Invalid server response');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccessMessage(data.message || 'Registration successful! Redirecting...');

            if (data.token) {
                await AsyncStorage.setItem('authToken', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
            }

            setFormData(INITIAL_FORM_DATA);
            setTermsAccepted(false);

            setTimeout(() => {
                if (data.token && onRegisterSuccess) {
                    onRegisterSuccess(data.user);
                } else if (data.token && navigation) {
                    navigation.navigate('home');
                } else if (navigation) {
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

    return {
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
    };
};
