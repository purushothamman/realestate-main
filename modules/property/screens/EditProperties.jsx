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
import {
  ArrowLeft,
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
  Bed,
  Bath,
  ArrowUpDown,
  Wind,
  Zap,
  Gamepad2,
  Building,
  Building2,
  Store,
  Briefcase,
  Package,
  Sprout,
  Users,
  Tent,
  Layers,
  ShoppingBag,
  Laptop,
  Factory,
  Hotel,
  BookOpen,
  Film,
  Shirt,
  Phone,
  Flame,
  Droplet,
  Wrench,
  Dog,
  Utensils,
  Sofa,
  Square,
  Edit3,
  Save,
  Trash2,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const EditProperty = ({ onBack, propertyToEdit, onSaveProperty, onDeleteProperty }) => {
  // Initialize with existing property data or empty values
  const [propertyData, setPropertyData] = useState({
    id: propertyToEdit?.id || '',
    title: propertyToEdit?.title || '',
    propertyType: propertyToEdit?.propertyType || '',
    purpose: propertyToEdit?.purpose || 'sale',
    status: propertyToEdit?.status || 'sale',
    city: propertyToEdit?.city || '',
    state: propertyToEdit?.state || '',
    address: propertyToEdit?.address || '',
    pincode: propertyToEdit?.pincode || '',
    price: propertyToEdit?.price || '',
    area: propertyToEdit?.area || '',
    bedrooms: propertyToEdit?.bedrooms || '',
    bathrooms: propertyToEdit?.bathrooms || '',
    description: propertyToEdit?.description || '',
    features: propertyToEdit?.features || [],
    amenities: propertyToEdit?.amenities || [],
    images: propertyToEdit?.images || [],
  });

  const [uploadedImages, setUploadedImages] = useState(propertyToEdit?.images || []);
  const [focusedInput, setFocusedInput] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

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
    { id: 'house', label: 'Independent House', icon: Home },
    { id: 'penthouse', label: 'Penthouse', icon: Building },
    { id: 'studio', label: 'Studio Apartment', icon: Square },
    { id: 'farmhouse', label: 'Farmhouse', icon: Trees },
    { id: 'office', label: 'Office Space', icon: Briefcase },
    { id: 'shop', label: 'Shop/Showroom', icon: Store },
    { id: 'warehouse', label: 'Warehouse', icon: Package },
    { id: 'land', label: 'Agricultural Land', icon: Sprout },
    { id: 'pgHostel', label: 'PG/Hostel', icon: Users },
    { id: 'cottage', label: 'Cottage', icon: Tent },
    { id: 'duplex', label: 'Duplex', icon: Layers },
    { id: 'rowhouse', label: 'Row House', icon: Home },
    { id: 'retail', label: 'Retail Space', icon: ShoppingBag },
    { id: 'coworking', label: 'Co-working Space', icon: Laptop },
    { id: 'industrial', label: 'Industrial Building', icon: Factory },
    { id: 'hotel', label: 'Hotel/Resort', icon: Hotel },
  ];

  const featuresList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'garden', label: 'Garden', icon: Trees },
    { id: 'security', label: '24/7 Security', icon: ShieldCheck },
    { id: 'pool', label: 'Swimming Pool', icon: Droplets },
    { id: 'elevator', label: 'Elevator', icon: ArrowUpDown },
    { id: 'ac', label: 'Air Conditioning', icon: Wind },
    { id: 'powerBackup', label: 'Power Backup', icon: Zap },
    { id: 'cctv', label: 'CCTV', icon: Camera },
    { id: 'clubhouse', label: 'Clubhouse', icon: Home },
    { id: 'playground', label: 'Playground', icon: Gamepad2 },
    { id: 'balcony', label: 'Balcony', icon: Building },
    { id: 'modularKitchen', label: 'Modular Kitchen', icon: Utensils },
    { id: 'furnished', label: 'Furnished', icon: Sofa },
    { id: 'intercom', label: 'Intercom', icon: Phone },
    { id: 'fireSystem', label: 'Fire Safety', icon: Flame },
    { id: 'waterSupply', label: 'Water Supply 24/7', icon: Droplet },
    { id: 'maintenance', label: 'Maintenance Staff', icon: Wrench },
    { id: 'petFriendly', label: 'Pet Friendly', icon: Dog },
    { id: 'visitor', label: 'Visitor Parking', icon: Car },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'spa', label: 'Spa', icon: Sparkles },
    { id: 'cinema', label: 'Mini Theatre', icon: Film },
    { id: 'laundry', label: 'Laundry Service', icon: Shirt },
  ];

  const handleImageUpload = async () => {
    Alert.alert(
      'Image Upload',
      'Please integrate expo-image-picker or react-native-image-picker library for image upload functionality.',
      [{ text: 'OK' }]
    );
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
      setHasChanges(true);
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
    setHasChanges(true);
  };

  const handleInputChange = (field, value) => {
    setPropertyData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleUpdate = () => {
    // Validate first before updating
    if (!propertyData.title) {
      Alert.alert('Validation Error', 'Please enter a property title');
      return;
    }
    if (!propertyData.propertyType) {
      Alert.alert('Validation Error', 'Please select a property type');
      return;
    }
    if (!propertyData.city || !propertyData.address || !propertyData.state || !propertyData.pincode) {
      Alert.alert('Validation Error', 'Please fill in all location details');
      return;
    }
    if (!propertyData.price || !propertyData.area) {
      Alert.alert('Validation Error', 'Please fill in all pricing and size details');
      return;
    }
    if (!propertyData.description) {
      Alert.alert('Validation Error', 'Please add a property description');
      return;
    }

    // Animate button then show success
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

    setTimeout(() => {
      Alert.alert(
        'Updated Successfully! ✓',
        'Your property has been updated successfully!',
        [
          {
            text: 'Great!',
            style: 'default',
            onPress: () => {
              // Call the callback if provided
              if (onSaveProperty) {
                onSaveProperty({ ...propertyData, images: uploadedImages });
              }
              setHasChanges(false);
            },
          },
        ]
      );
      console.log('Updated Property Data:', propertyData);
      console.log('Updated Images:', uploadedImages);
    }, 200);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDeleteProperty) {
              onDeleteProperty(propertyData.id);
            }
            Alert.alert('Deleted', 'Property has been deleted successfully.');
          },
        },
      ]
    );
  };

  const handleSaveDraft = () => {
    Alert.alert('Saved ✓', 'Changes saved as draft!');
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          {
            text: 'Stay',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              if (onBack) {
                onBack();
              }
            },
          },
        ]
      );
    } else {
      if (onBack) {
        onBack();
      }
    }
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
              onPress={handleCancel}
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
              <Edit3 color="#FCD34D" size={24} />
              <Text style={styles.title}>Edit Property</Text>
            </View>
            <Text style={styles.subtitle}>
              Update your property details and reach more buyers
            </Text>
            {hasChanges && (
              <View style={styles.unsavedBadge}>
                <Text style={styles.unsavedText}>• Unsaved changes</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          {/* Property ID Badge */}
          {propertyData.id && (
            <View style={styles.propertyIdBadge}>
              <Text style={styles.propertyIdText}>ID: {propertyData.id}</Text>
            </View>
          )}

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
                  focusedInput === 'title' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Modern Luxury Villa"
                  placeholderTextColor="#9CA3AF"
                  value={propertyData.title}
                  onChangeText={(value) => handleInputChange('title', value)}
                  onFocus={() => setFocusedInput('title')}
                  onBlur={() => setFocusedInput(null)}
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
              <Text style={styles.label}>Property Purpose *</Text>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  onPress={() => handleInputChange('purpose', 'sale')}
                  style={[
                    styles.statusButton,
                    propertyData.purpose === 'sale' && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <DollarSign
                    color={propertyData.purpose === 'sale' ? '#2D6A4F' : '#6B7280'}
                    size={18}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      propertyData.purpose === 'sale' && styles.optionTextActive,
                    ]}
                  >
                    For Sale
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleInputChange('purpose', 'rent')}
                  style={[
                    styles.statusButton,
                    propertyData.purpose === 'rent' && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Home
                    color={propertyData.purpose === 'rent' ? '#2D6A4F' : '#6B7280'}
                    size={18}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      propertyData.purpose === 'rent' && styles.optionTextActive,
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

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>City *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'city' && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Mumbai"
                    placeholderTextColor="#9CA3AF"
                    value={propertyData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                    onFocus={() => setFocusedInput('city')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>State *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'state' && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Maharashtra"
                    placeholderTextColor="#9CA3AF"
                    value={propertyData.state}
                    onChangeText={(value) => handleInputChange('state', value)}
                    onFocus={() => setFocusedInput('state')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'address' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 123 Main Street, Bandra West"
                  placeholderTextColor="#9CA3AF"
                  value={propertyData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  onFocus={() => setFocusedInput('address')}
                  onBlur={() => setFocusedInput(null)}
                />
                <MapPin color="#9CA3AF" size={18} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'pincode' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 400050"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={6}
                  value={propertyData.pincode}
                  onChangeText={(value) => handleInputChange('pincode', value)}
                  onFocus={() => setFocusedInput('pincode')}
                  onBlur={() => setFocusedInput(null)}
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
                  Price * {propertyData.purpose === 'rent' ? '(per month)' : ''}
                </Text>
                <View
                  style={[
                    styles.priceInputWrapper,
                    focusedInput === 'price' && styles.inputWrapperFocused,
                  ]}
                >
                  <Text style={styles.priceSymbol}>₹</Text>
                  <TextInput
                    style={styles.priceInputField}
                    placeholder="2,450,000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={propertyData.price}
                    onChangeText={(value) => handleInputChange('price', value)}
                    onFocus={() => setFocusedInput('price')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Area (sq ft) *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'area' && styles.inputWrapperFocused,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="4,200"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={propertyData.area}
                    onChangeText={(value) => handleInputChange('area', value)}
                    onFocus={() => setFocusedInput('area')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Bedrooms</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'bedrooms' && styles.inputWrapperFocused,
                  ]}
                >
                  <Bed color="#9CA3AF" size={18} />
                  <TextInput
                    style={[styles.input, { marginLeft: 8 }]}
                    placeholder="e.g., 3"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={propertyData.bedrooms}
                    onChangeText={(value) => handleInputChange('bedrooms', value)}
                    onFocus={() => setFocusedInput('bedrooms')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Bathrooms</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'bathrooms' && styles.inputWrapperFocused,
                  ]}
                >
                  <Bath color="#9CA3AF" size={18} />
                  <TextInput
                    style={[styles.input, { marginLeft: 8 }]}
                    placeholder="e.g., 2"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={propertyData.bathrooms}
                    onChangeText={(value) => handleInputChange('bathrooms', value)}
                    onFocus={() => setFocusedInput('bathrooms')}
                    onBlur={() => setFocusedInput(null)}
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
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: '#FEE2E2' }]}>
                <Sparkles color="#EF4444" size={20} />
              </View>
              <Text style={styles.sectionTitle}>Additional Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <View
                style={[
                  styles.textAreaWrapper,
                  focusedInput === 'description' && styles.inputWrapperFocused,
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
                  onFocus={() => setFocusedInput('description')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amenities (Optional)</Text>
              <View style={styles.amenitiesGrid}>
                {featuresList.map((amenity) => {
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
            onPress={handleUpdate}
            style={styles.updateButton}
            activeOpacity={0.85}
          >
            <View style={styles.updateButtonContent}>
              <Save color="#fff" size={20} />
              <Text style={styles.updateButtonText}>Update Property</Text>
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
            onPress={handleDelete}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Trash2 color="#EF4444" size={16} />
            <Text style={styles.deleteButtonText}>Delete</Text>
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
  unsavedBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  unsavedText: {
    color: '#FCD34D',
    fontSize: 13,
    fontWeight: '600',
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
  propertyIdBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propertyIdText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
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
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 18,
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
    marginBottom: 18,
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
  updateButton: {
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
  updateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateButtonText: {
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
  deleteButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default EditProperty;