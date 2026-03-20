import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Animated,
    StyleSheet,
    Dimensions,
    StatusBar,
    Platform,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
    ArrowLeft,
    Building2,
    MapPin,
    DollarSign,
    Image as ImageIcon,
    Camera,
    Home,
    X,
    Check,
    Wifi,
    Car,
    Dumbbell,
    Trees,
    ShieldCheck,
    Droplets,
    Sparkles,
    CheckCircle2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

import { API_BASE_URL } from '../../../utils/api';


const AddProperty = ({ onBack, onShowEditProperty, onPropertyAdded }) => {
    const [propertyData, setPropertyData] = useState({
        title: '',
        propertyType: '',
        status: 'sale',
        city: '',
        address: '',
        price: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        description: '',
        amenities: [],
        images: [],
        pincode: '',
    });

    const [uploadedImages, setUploadedImages] = useState([]);

    // City autocomplete state
    const [cityQuery, setCityQuery] = useState('');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const cityDebounceRef = useRef(null);

    // Animation values
    const headerAnim = useRef(new Animated.Value(0)).current;
    const contentAnim = useRef(new Animated.Value(50)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const fabAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Section animations
    const sectionAnims = useRef(
        Array(6).fill(0).map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        // Header slide in
        Animated.spring(headerAnim, {
            toValue: 1,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Content cascade animation
        Animated.stagger(100, [
            Animated.spring(contentAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            ...sectionAnims.map((anim) =>
                Animated.spring(anim, {
                    toValue: 1,
                    tension: 40,
                    friction: 8,
                    useNativeDriver: true,
                })
            ),
        ]).start();

        // FAB entrance animation
        Animated.spring(fabAnim, {
            toValue: 1,
            delay: 800,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
        }).start();

        // Shimmer effect loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const propertyTypes = [
        { id: 'apartment', label: 'Apartment', icon: Building2 },
        { id: 'villa', label: 'Villa', icon: Home },
        { id: 'plot', label: 'Plot', icon: Trees },
        { id: 'commercial', label: 'Commercial', icon: Building2 },
    ];

    const amenitiesList = [
        { id: 'wifi', label: 'WiFi', icon: Wifi },
        { id: 'parking', label: 'Parking', icon: Car },
        { id: 'gym', label: 'Gym', icon: Dumbbell },
        { id: 'garden', label: 'Garden', icon: Trees },
        { id: 'security', label: '24/7 Security', icon: ShieldCheck },
        { id: 'pool', label: 'Swimming Pool', icon: Droplets },
    ];

    const uploadImageToServer = async (asset, token) => {
        try {
            const formData = new FormData();

            if (Platform.OS === 'web') {
                if (asset.file) {
                    formData.append('image', asset.file);
                } else {
                    const response = await fetch(asset.uri);
                    const blob = await response.blob();
                    const name = asset.fileName || `property-${Date.now()}.jpg`;
                    formData.append('image', blob, name);
                }
            } else {
                const name = asset.fileName || `property-${Date.now()}.jpg`;
                const type = asset.mimeType || 'image/jpeg';
                formData.append('image', {
                    uri: asset.uri,
                    name,
                    type,
                });
            }

            const response = await fetch(`${API_BASE_URL}/upload/property-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok || !data.success || !data.url) {
                throw new Error(data.message || 'Failed to upload image');
            }

            return data.url;
        } catch (error) {
            console.error('Upload image error:', error);
            throw error;
        }
    };

    const handleImageUpload = async () => {
        try {
            // Request permission to access media library
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to your photo library to upload images.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Check if we already have 6 images
            if (uploadedImages.length >= 6) {
                Alert.alert(
                    'Maximum Images',
                    'You can only upload up to 6 images.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets) {
                // Check total count
                const totalImages = uploadedImages.length + result.assets.length;
                if (totalImages > 6) {
                    Alert.alert(
                        'Too Many Images',
                        `You can only upload ${6 - uploadedImages.length} more image(s).`,
                        [{ text: 'OK' }]
                    );
                    return;
                }

                const token = await AsyncStorage.getItem('authToken');
                if (!token) {
                    Alert.alert('Error', 'You must be logged in to upload images');
                    return;
                }

                // Upload each selected image to backend and store the returned URLs
                const uploadedUrls = [];
                for (const asset of result.assets) {
                    try {
                        const remoteUrl = await uploadImageToServer(asset, token);
                        uploadedUrls.push(remoteUrl);
                    } catch (e) {
                        Alert.alert('Image Upload Failed', 'One of the images could not be uploaded.');
                    }
                }

                if (uploadedUrls.length > 0) {
                    setUploadedImages(prev => [...prev, ...uploadedUrls]);
                }
            }
        } catch (error) {
            console.error('Image upload error:', error);
            Alert.alert('Error', 'Failed to upload images. Please try again.');
        }
    };

    const removeImage = (index) => {
        const removeAnim = new Animated.Value(1);
        Animated.spring(removeAnim, {
            toValue: 0,
            tension: 50,
            friction: 6,
            useNativeDriver: true,
        }).start(() => {
            setUploadedImages((prev) => prev.filter((_, i) => i !== index));
        });
    };

    const toggleAmenity = (amenityId) => {
        const scaleAnim = new Animated.Value(1);
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1.1,
                tension: 100,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();

        setPropertyData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenityId)
                ? prev.amenities.filter((id) => id !== amenityId)
                : [...prev.amenities, amenityId],
        }));
    };

    const handleInputChange = (field, value) => {
        setPropertyData((prev) => ({ ...prev, [field]: value }));
    };

    // --- City Autocomplete ---
    const fetchCitySuggestions = async (query) => {
        if (!query || query.length < 2) {
            setCitySuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
            const res = await fetch(url, {
                headers: { 'Accept-Language': 'en' }
            });
            const results = await res.json();
            setCitySuggestions(results);
            setShowSuggestions(results.length > 0);
        } catch (e) {
            console.warn('Nominatim fetch error:', e);
        }
    };

    const handleCityQueryChange = (text) => {
        setCityQuery(text);
        if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
        cityDebounceRef.current = setTimeout(() => fetchCitySuggestions(text), 400);
    };

    const handleCitySuggestionSelect = (item) => {
        const addr = item.address || {};
        const city = addr.city || addr.town || addr.village || addr.county || '';
        const state = addr.state || '';
        const displayText = [city, state].filter(Boolean).join(', ');
        setCityQuery(displayText);
        setPropertyData(prev => ({ ...prev, city, state }));
        setCitySuggestions([]);
        setShowSuggestions(false);
    };

    const handlePublish = async () => {
        try {
            // Use typed city text as fallback if user didn't pick from dropdown
            const effectiveCity = propertyData.city || cityQuery.trim();

            const beds = parseInt(propertyData.bedrooms, 10);
            const baths = parseInt(propertyData.bathrooms, 10);

            // Validate required fields and report which one is missing
            const missing = [];
            if (!propertyData.title.trim()) missing.push('Property Title');
            if (!propertyData.price.trim()) missing.push('Price');
            if (!effectiveCity) missing.push('City / Area');
            if (!propertyData.address.trim()) missing.push('Address');
            if (!propertyData.bedrooms || isNaN(beds) || beds < 1 || beds > 50) missing.push('Valid Bedrooms (1-50)');
            if (!propertyData.bathrooms || isNaN(baths) || baths < 1 || baths > 50) missing.push('Valid Bathrooms (1-50)');

            if (missing.length > 0) {
                Alert.alert(
                    'Missing Fields',
                    `Please fill in the following required fields:\n• ${missing.join('\n• ')}`
                );
                return;
            }

            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'You must be logged in to add a property');
                return;
            }

            // Map property type to ID (assuming 1=Apartment, 2=Villa, 3=Plot, 4=Commercial)
            // TODO: Fetch real IDs from backend
            const propertyTypeMap = {
                'apartment': 1,
                'villa': 2,
                'plot': 3,
                'commercial': 4
            };

            const areaRaw = (propertyData.area || '0').replace(/,/g, '');

            const payload = {
                title: propertyData.title,
                description: propertyData.description || "No description provided",
                price: parseFloat((propertyData.price || '0').replace(/,/g, '')),
                listing_type: propertyData.status, // 'sale' or 'rent'
                property_type_id: propertyTypeMap[propertyData.propertyType] || 1,
                address: propertyData.address,
                city: effectiveCity,
                state: propertyData.state || 'N/A',
                pincode: propertyData.pincode || "90001",
                area_sqft: parseFloat(areaRaw) || 0,
                bedrooms: beds,
                bathrooms: baths,
                features: propertyData.amenities.map(a => ({ name: a, value: 'true' })),
                images: uploadedImages.map((url, index) => ({
                    image_url: url,
                    is_primary: index === 0, // First image is primary
                    sort_order: index
                }))
            };

            console.log('Sending payload:', payload);

            const response = await fetch(`${API_BASE_URL}/properties/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add property');
            }

            Animated.sequence([
                Animated.spring(buttonScale, {
                    toValue: 0.92,
                    tension: 100,
                    friction: 3,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonScale, {
                    toValue: 1,
                    tension: 100,
                    friction: 3,
                    useNativeDriver: true,
                }),
            ]).start();

            // Redirect back to agent dashboard (or builder/edit/back fallback)
            if (onPropertyAdded) {
                onPropertyAdded();
            } else if (onShowEditProperty) {
                onShowEditProperty();
            } else if (onBack) {
                onBack();
            }

            setTimeout(() => {
                Alert.alert(
                    'Success! 🎉',
                    'Your property has been published successfully!',
                    [{ text: 'OK' }]
                );
            }, 200);

        } catch (error) {
            console.error('Add property error:', error);
            Alert.alert('Error', error.message);
        }
    };

    const handleSaveDraft = () => {
        Alert.alert('Saved ✓', 'Property saved as draft!');
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel',
            'Are you sure you want to cancel? All changes will be lost.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        if (onShowEditProperty) {
                            onShowEditProperty();
                        }
                    },
                },
            ]
        );
    };

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2D6A4F" />

            {/* Animated Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-50, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Image
                    source={{
                        uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
                    }}
                    style={styles.headerImage}
                />
                <View style={styles.headerOverlay} />

                {/* Animated shimmer overlay */}
                <Animated.View
                    style={[
                        styles.shimmerOverlay,
                        {
                            transform: [{ translateX: shimmerTranslate }],
                        },
                    ]}
                />

                <View style={styles.headerContent}>
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            onPress={onBack}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft color="#fff" size={20} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoIcon}>
                                <Building2 color="#2D6A4F" size={18} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.logoText}>EstateHub</Text>
                        </View>
                    </View>

                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <Sparkles color="#FCD34D" size={24} />
                            <Text style={styles.title}>Add New Property</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            List your property in minutes and reach thousands of buyers
                        </Text>
                    </View>
                </View>
            </Animated.View>

            {/* Main Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    style={[
                        styles.formCard,
                        {
                            opacity: headerAnim,
                            transform: [
                                { translateY: contentAnim },
                                {
                                    scale: headerAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.95, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <Animated.View style={[styles.progressFill, { width: '20%' }]} />
                        </View>
                        <Text style={styles.progressText}>Step 1 of 5</Text>
                    </View>

                    {/* Basic Property Details */}
                    <Animated.View
                        style={[
                            styles.section,
                            {
                                opacity: sectionAnims[0],
                                transform: [
                                    {
                                        translateX: sectionAnims[0].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconBox}>
                                <Building2 color="#2D6A4F" size={20} />
                            </View>
                            <Text style={styles.sectionTitle}>Basic Property Details</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Property Title *</Text>
                            <Animated.View
                                style={[
                                    styles.inputWrapper,
                                ]}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Modern Luxury Villa"
                                    placeholderTextColor="#9CA3AF"
                                    value={propertyData.title}
                                    onChangeText={(value) => handleInputChange('title', value)}
                                />
                            </Animated.View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Property Type *</Text>
                            <View style={styles.optionsGrid}>
                                {propertyTypes.map((type) => {
                                    const Icon = type.icon;
                                    const isSelected = propertyData.propertyType === type.id;
                                    return (
                                        <TouchableOpacity
                                            key={type.id}
                                            onPress={() => handleInputChange('propertyType', type.id)}
                                            style={[
                                                styles.optionButton,
                                                isSelected && styles.optionButtonActive,
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                color={isSelected ? '#2D6A4F' : '#6B7280'}
                                                size={18}
                                                strokeWidth={2.5}
                                            />
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    isSelected && styles.optionTextActive,
                                                ]}
                                            >
                                                {type.label}
                                            </Text>
                                            {isSelected && (
                                                <CheckCircle2 color="#2D6A4F" size={16} fill="#2D6A4F" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Property Status *</Text>
                            <View style={styles.optionsGrid}>
                                <TouchableOpacity
                                    onPress={() => handleInputChange('status', 'sale')}
                                    style={[
                                        styles.statusButton,
                                        propertyData.status === 'sale' && styles.optionButtonActive,
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <DollarSign
                                        color={propertyData.status === 'sale' ? '#2D6A4F' : '#6B7280'}
                                        size={18}
                                    />
                                    <Text
                                        style={[
                                            styles.optionText,
                                            propertyData.status === 'sale' && styles.optionTextActive,
                                        ]}
                                    >
                                        For Sale
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleInputChange('status', 'rent')}
                                    style={[
                                        styles.statusButton,
                                        propertyData.status === 'rent' && styles.optionButtonActive,
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Home
                                        color={propertyData.status === 'rent' ? '#2D6A4F' : '#6B7280'}
                                        size={18}
                                    />
                                    <Text
                                        style={[
                                            styles.optionText,
                                            propertyData.status === 'rent' && styles.optionTextActive,
                                        ]}
                                    >
                                        For Rent
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Location Details */}
                    <Animated.View
                        style={[
                            styles.section,
                            styles.sectionBorder,
                            {
                                zIndex: showSuggestions ? 1000 : 1,
                                opacity: sectionAnims[1],
                                transform: [
                                    {
                                        translateX: sectionAnims[1].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIconBox, { backgroundColor: '#EFF6FF' }]}>
                                <MapPin color="#3B82F6" size={20} />
                            </View>
                            <Text style={styles.sectionTitle}>Location Details</Text>
                        </View>

                        <View style={[styles.inputGroup, { zIndex: showSuggestions ? 1000 : 1 }]}>
                            <Text style={styles.label}>City / Area *</Text>
                            {/* Autocomplete city search */}
                            <View style={styles.autocompleteWrapper}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Type to search city..."
                                        placeholderTextColor="#9CA3AF"
                                        value={cityQuery}
                                        onChangeText={handleCityQueryChange}
                                        onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                                    />
                                    {cityQuery.length > 0 ? (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setCityQuery('');
                                                setCitySuggestions([]);
                                                setShowSuggestions(false);
                                                setPropertyData(prev => ({ ...prev, city: '', state: '' }));
                                            }}
                                            style={{ marginRight: 8 }}
                                        >
                                            <X color="#9CA3AF" size={16} />
                                        </TouchableOpacity>
                                    ) : null}
                                    <MapPin color="#9CA3AF" size={18} />
                                </View>
                                {showSuggestions && (
                                    <View style={styles.suggestionDropdown}>
                                        <ScrollView
                                            nestedScrollEnabled={true}
                                            style={styles.suggestionScroll}
                                            showsVerticalScrollIndicator={true}
                                        >
                                            {citySuggestions.map((item, index) => {
                                                const addr = item.address || {};
                                                const city = addr.city || addr.town || addr.village || addr.county || '';
                                                const state = addr.state || '';
                                                const label = [city, state].filter(Boolean).join(', ');
                                                const country = addr.country || '';
                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={[
                                                            styles.suggestionItem,
                                                            index < citySuggestions.length - 1 && styles.suggestionBorder
                                                        ]}
                                                        onPress={() => handleCitySuggestionSelect(item)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <MapPin color="#3B82F6" size={14} style={{ marginRight: 8 }} />
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.suggestionLabel}>{label}</Text>
                                                            {country ? <Text style={styles.suggestionCountry}>{country}</Text> : null}
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address *</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                ]}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 123 Main Street"
                                    placeholderTextColor="#9CA3AF"
                                    value={propertyData.address}
                                    onChangeText={(value) => handleInputChange('address', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Pincode *</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                ]}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 400001"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    value={propertyData.pincode}
                                    onChangeText={(value) => handleInputChange('pincode', value)}
                                />
                            </View>
                        </View>
                    </Animated.View>

                    {/* Pricing & Size */}
                    <Animated.View
                        style={[
                            styles.section,
                            styles.sectionBorder,
                            {
                                opacity: sectionAnims[2],
                                transform: [
                                    {
                                        translateX: sectionAnims[2].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIconBox, { backgroundColor: '#FEF3C7' }]}>
                                <DollarSign color="#F59E0B" size={20} />
                            </View>
                            <Text style={styles.sectionTitle}>Pricing & Size</Text>
                        </View>

                        <View style={styles.rowInputs}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>
                                    Price * {propertyData.status === 'rent' ? '(per month)' : ''}
                                </Text>
                                <View
                                    style={[
                                        styles.priceInputWrapper,
                                    ]}
                                >
                                    <Text style={styles.priceSymbol}>$</Text>
                                    <TextInput
                                        style={styles.priceInputField}
                                        placeholder="2,450,000"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={propertyData.price}
                                        onChangeText={(value) => handleInputChange('price', value)}
                                    />
                                </View>
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Area (sq ft) *</Text>
                                <View
                                    style={[
                                        styles.inputWrapper,
                                    ]}
                                >
                                    <TextInput
                                        style={styles.input}
                                        placeholder="4,200"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={propertyData.area}
                                        onChangeText={(value) => handleInputChange('area', value)}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={[styles.rowInputs, { marginTop: 16 }]}>
                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Bedrooms *</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 3"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={propertyData.bedrooms}
                                        onChangeText={(value) => handleInputChange('bedrooms', value.replace(/[^0-9]/g, ''))}
                                    />
                                </View>
                            </View>

                            <View style={styles.halfInput}>
                                <Text style={styles.label}>Bathrooms *</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 2"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={propertyData.bathrooms}
                                        onChangeText={(value) => handleInputChange('bathrooms', value.replace(/[^0-9]/g, ''))}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Property Images */}
                    <Animated.View
                        style={[
                            styles.section,
                            styles.sectionBorder,
                            {
                                opacity: sectionAnims[3],
                                transform: [
                                    {
                                        translateX: sectionAnims[3].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIconBox, { backgroundColor: '#F3E8FF' }]}>
                                <ImageIcon color="#A855F7" size={20} />
                            </View>
                            <Text style={styles.sectionTitle}>Property Images</Text>
                        </View>

                        <View style={styles.imageGrid}>
                            {uploadedImages.map((image, index) => (
                                <View key={index} style={styles.imageBox}>
                                    <Image source={{ uri: image }} style={styles.uploadedImage} />
                                    <TouchableOpacity
                                        onPress={() => removeImage(index)}
                                        style={styles.removeImageButton}
                                        activeOpacity={0.7}
                                    >
                                        <X color="#fff" size={14} strokeWidth={3} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {Array.from({ length: Math.max(0, 6 - uploadedImages.length) }).map(
                                (_, index) => (
                                    <TouchableOpacity
                                        key={`placeholder-${index}`}
                                        onPress={handleImageUpload}
                                        style={styles.imagePlaceholder}
                                        activeOpacity={0.7}
                                    >
                                        {index === 0 && uploadedImages.length === 0 ? (
                                            <>
                                                <View style={styles.cameraBadge}>
                                                    <Camera color="#2D6A4F" size={24} />
                                                </View>
                                                <Text style={styles.placeholderText}>Add Photos</Text>
                                            </>
                                        ) : (
                                            <ImageIcon color="#9CA3AF" size={24} />
                                        )}
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                        <View style={styles.helperBox}>
                            <CheckCircle2 color="#10B981" size={14} />
                            <Text style={styles.helperText}>
                                Add up to 6 images • First image will be cover photo
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Additional Information */}
                    <Animated.View
                        style={[
                            styles.section,
                            styles.sectionBorder,
                            {
                                opacity: sectionAnims[4],
                                transform: [
                                    {
                                        translateX: sectionAnims[4].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Additional Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description (Optional)</Text>
                            <View
                                style={[
                                    styles.textAreaWrapper,
                                ]}
                            >
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Describe your property, key features, nearby amenities..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={propertyData.description}
                                    onChangeText={(value) => handleInputChange('description', value)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amenities (Optional)</Text>
                            <View style={styles.amenitiesGrid}>
                                {amenitiesList.map((amenity) => {
                                    const Icon = amenity.icon;
                                    const isSelected = propertyData.amenities.includes(amenity.id);
                                    return (
                                        <TouchableOpacity
                                            key={amenity.id}
                                            onPress={() => toggleAmenity(amenity.id)}
                                            style={[
                                                styles.amenityButton,
                                                isSelected && styles.amenityButtonActive,
                                            ]}
                                            activeOpacity={0.7}
                                        >
                                            <Icon
                                                color={isSelected ? '#2D6A4F' : '#6B7280'}
                                                size={16}
                                                strokeWidth={2.5}
                                            />
                                            <Text
                                                style={[
                                                    styles.amenityText,
                                                    isSelected && styles.amenityTextActive,
                                                ]}
                                            >
                                                {amenity.label}
                                            </Text>
                                            {isSelected && (
                                                <Check color="#2D6A4F" size={14} strokeWidth={3} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </Animated.View>
                </Animated.View>

                <View style={{ height: 180 }} />
            </ScrollView>

            {/* Floating Action Buttons */}
            <Animated.View
                style={[
                    styles.bottomActions,
                    {
                        transform: [
                            {
                                translateY: fabAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [100, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                        onPress={handlePublish}
                        style={styles.publishButton}
                        activeOpacity={0.85}
                    >
                        <View style={styles.publishButtonContent}>
                            <Sparkles color="#FCD34D" size={20} />
                            <Text style={styles.publishButtonText}>Publish Property</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.secondaryActions}>
                    <TouchableOpacity
                        onPress={handleSaveDraft}
                        style={styles.draftButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.draftButtonText}>Save Draft</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.cancelButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        height: 180,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(45, 106, 79, 0.85)',
    },
    shimmerOverlay: {
        ...StyleSheet.absoluteFillObject,
        width: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        ...StyleSheet.absoluteFillObject,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logoText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    titleSection: {},
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: 14,
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginTop: -32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    progressContainer: {
        marginBottom: 28,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2D6A4F',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        marginBottom: 28,
        position: 'relative',
        overflow: 'visible',
    },
    sectionBorder: {
        paddingTop: 28,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
    },
    inputGroup: {
        marginBottom: 18,
        position: 'relative',
    },
    label: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 10,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FAFAFA',
        position: 'relative',
        zIndex: 1,
    },
    inputWrapperFocused: {
        borderColor: '#2D6A4F',
        backgroundColor: '#fff',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionButton: {
        flex: 1,
        minWidth: '47%',
        height: 54,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FAFAFA',
    },
    optionButtonActive: {
        borderColor: '#2D6A4F',
        backgroundColor: '#ECFDF5',
    },
    optionText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#2D6A4F',
        fontWeight: '700',
    },
    statusButton: {
        flex: 1,
        height: 54,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FAFAFA',
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 16,
    },
    halfInput: {
        flex: 1,
    },
    priceInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FAFAFA',
    },
    priceSymbol: {
        fontSize: 16,
        color: '#2D6A4F',
        marginRight: 6,
        fontWeight: '700',
    },
    priceInputField: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    imageBox: {
        width: (width - 96) / 3,
        aspectRatio: 1,
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    imagePlaceholder: {
        width: (width - 96) / 3,
        aspectRatio: 1,
        borderRadius: 14,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    cameraBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    placeholderText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
    },
    helperBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
    },
    textAreaWrapper: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        height: 110,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: '#111827',
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    amenityButton: {
        flex: 1,
        minWidth: '47%',
        height: 52,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 10,
        backgroundColor: '#FAFAFA',
    },
    amenityButtonActive: {
        borderColor: '#2D6A4F',
        backgroundColor: '#ECFDF5',
    },
    amenityText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    amenityTextActive: {
        color: '#2D6A4F',
        fontWeight: '700',
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    publishButton: {
        height: 58,
        backgroundColor: '#2D6A4F',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    publishButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    publishButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: 12,
    },
    draftButton: {
        flex: 1,
        height: 50,
        borderWidth: 2,
        borderColor: '#2D6A4F',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
    },
    draftButtonText: {
        color: '#2D6A4F',
        fontSize: 15,
        fontWeight: '700',
    },
    cancelButton: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '600',
    },
    // City autocomplete styles
    autocompleteWrapper: {
        position: 'relative',
        zIndex: 100,
    },
    suggestionDropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 12,
        overflow: 'hidden',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    suggestionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionLabel: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    suggestionCountry: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 1,
    },
    suggestionScroll: {
        maxHeight: 220,
    },
});

export default AddProperty;