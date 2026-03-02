import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar,
    Alert,
    Platform,
    Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    Heart,
    Share2,
    MapPin,
    Bed,
    Bath,
    Maximize,
    Calendar,
    Car,
    Droplet,
    Flame,
    Wifi,
    Dumbbell,
    Trees,
    ShieldCheck,
    Camera,
    Phone,
    Mail,
    MessageCircle,
    Video,
    Navigation,
    Star,
    Home,
    Flag,
    TrendingUp,
    Award,
    CheckCircle,
    AlertCircle,
} from 'lucide-react-native';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';

const { width } = Dimensions.get('window');

const FeatureChip = ({ icon, label }) => (
    <View style={styles.featureChip}>
        <View style={styles.featureIconWrapper}>
            {icon}
        </View>
        <Text style={styles.featureChipText}>{label}</Text>
    </View>
);

const SpecCard = ({ icon, label, value }) => {
    const scaleAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.specCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.specIconContainer}>
                <View style={styles.specIconCircle}>
                    {icon}
                </View>
            </View>
            <Text style={styles.specValue}>{value}</Text>
            <Text style={styles.specLabel}>{label}</Text>
        </Animated.View>
    );
};




export default function PropertyDetailScreen({ navigation, onBack, route, user }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [scrollY] = useState(new Animated.Value(0));
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];
    const isBuyer = user?.role === 'buyer';

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // API Configuration
    // const getApiUrl = () => {
    //     const platform = Platform.OS;
    //     if (platform === 'android') {
    //         return 'http://10.0.2.2:5000/api';
    //     } else if (platform === 'ios') {
    //         return 'http://localhost:5000/api';
    //     } else {
    //         return 'http://localhost:5000/api';
    //     }
    // };

    // const API_BASE_URL = getApiUrl();

    // Extract property data from route params
    const property = route?.params?.property || {};
    const propertyId = property.id || property.property_id;
    const propertyName = property.title || property.name;
    const propertyAddress = [property.address, property.city, property.state].filter(Boolean).join(', ');
    const propertyPrice =
        property.price != null
            ? (typeof property.price === 'number'
                ? `$${Number(property.price).toLocaleString()}`
                : String(property.price))
            : null;
    const propertyStatus = property.status || 'active';
    const listingType = property.listingType || property.listing_type || 'sale';

    // Property specs
    const bedrooms = property.bedrooms ?? 4;
    const bathrooms = property.bathrooms ?? 3;
    const area = property.areaSqft ?? property.area ?? property.area_sqft ?? '3,400';
    const builtYear = property.builtYear ?? property.built_year ?? 2021;
    const description = property.description || "Step into luxury with this stunning modern villa. This architectural masterpiece features an open floor plan with floor-to-ceiling windows that flood the space with natural light.";

    // Agent (for "Contact Agent" card)
    const listingAgent =
        property.agent ||
        route?.params?.agent ||
        property.listingAgent ||
        property.agentDetails ||
        null;

    const agentName = listingAgent?.name || listingAgent?.agent_name || listingAgent?.fullName || 'Agent';
    const agentEmail = listingAgent?.email || listingAgent?.agent_email || null;
    const agentPhone = listingAgent?.phone || listingAgent?.agent_phone || null;
    const agentRole =
        listingAgent?.role === 'agent'
            ? 'Real Estate Agent'
            : (listingAgent?.role ? String(listingAgent.role) : 'Real Estate Agent');

    const agentInitials = String(agentName || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('') || 'AG';

    const handleAgentCall = () => {
        if (!agentPhone) return Alert.alert('Agent', 'Phone number not available.');
        Alert.alert('Call Agent', agentPhone);
    };

    const handleAgentEmail = () => {
        if (!agentEmail) return Alert.alert('Agent', 'Email not available.');
        Alert.alert('Email Agent', agentEmail);
    };

    const handleAgentChat = () => {
        Alert.alert('Chat', 'Chat feature coming soon.');
    };

    // Images
    let propertyImages = [];

    // 1. Try the images array
    if (property.images) {
        try {
            const parsedImages = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                propertyImages = parsedImages.map(img => {
                    const path = (typeof img === 'object' && img !== null) ? (img.url || img.image_url) : img;
                    return getImageUrl(path);
                }).filter(Boolean);
            }
        } catch (e) {
            console.log('Error parsing property images:', e);
        }
    }

    // 2. Fall back to single-image fields
    if (propertyImages.length === 0) {
        const single = property.primaryImage || property.imageUrl || property.image;
        if (single) {
            const url = getImageUrl(single);
            if (url) propertyImages = [url];
        }
    }

    // 3. Last resort: show placeholder
    if (propertyImages.length === 0) {
        propertyImages = [DEFAULT_PROPERTY_IMAGE];
    }

    const handleBack = () => {
        if (navigation && navigation.goBack) {
            navigation.goBack();
        } else if (onBack) {
            onBack();
        }
    };

    const handleMakeOffer = async () => {
        try {
            const property = route?.params?.property || {};
            const propertyId = property.id || property.property_id;

            if (!propertyId) {
                Alert.alert('Error', 'Property information is missing');
                return;
            }

            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Authentication Required', 'Please log in to make an offer');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/inquiries/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    property_id: propertyId,
                    initial_message: `I am interested in ${propertyName}. I would like to discuss this property with you.`
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                if (!data.chat_id) {
                    Alert.alert("Error", "Chat not created properly");
                    return;
                }
                navigation.navigate('messages', {
                    chatId: data.chat_id,
                    inquiryId: data.inquiry_id
                });
            } else {
                Alert.alert('Error', data.message || 'Failed to send inquiry');
            }

        } catch (error) {
            console.error('❌ Make offer error:', error);
            Alert.alert('Error', 'Failed to send inquiry. Please try again.');
        }
    };


    const handleReportProperty = () => {
        // Direct navigation to ReportPropertyScreen
        if (navigation && navigation.navigate) {
            try {
                navigation.navigate('ReportPropertyScreen', {
                    propertyId: propertyId,
                    propertyName: propertyName,
                    propertyAddress: propertyAddress,
                    propertyPrice: propertyPrice,
                    propertyImage: propertyImages[0],
                });
            } catch (error) {
                console.error('Navigation error:', error);
                Alert.alert(
                    'Navigation Error',
                    'Unable to open Report Property screen. Please make sure ReportPropertyScreen is properly configured in your navigation stack.',
                    [{ text: 'OK' }]
                );
            }
        } else {
            Alert.alert(
                'Error',
                'Navigation is not available. Please ensure this screen is part of a navigation stack.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleScheduleViewing = () => {
        Alert.alert(
            'Schedule Viewing',
            'When would you like to schedule a viewing?',
            [
                {
                    text: 'This Week',
                    onPress: () => Alert.alert('Confirmed', 'Viewing scheduled for this week. You will receive a confirmation email shortly.')
                },
                {
                    text: 'Next Week',
                    onPress: () => Alert.alert('Confirmed', 'Viewing scheduled for next week. You will receive a confirmation email shortly.')
                },
                {
                    text: 'Choose Date',
                    onPress: () => Alert.alert('Coming Soon', 'Calendar picker will be available soon.')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const handleVirtualTour = () => {
        Alert.alert(
            'Virtual Tour',
            'Experience this property in 360° virtual reality',
            [
                {
                    text: 'Start Tour',
                    onPress: () => Alert.alert('Success', 'Virtual tour is loading...')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Enhanced Hero Section */}
            <View style={styles.heroContainer}>
                <Image source={{ uri: propertyImages[currentImageIndex] }} style={styles.heroImage} resizeMode="cover" />

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.4)']}
                    style={styles.heroGradient}
                />

                {/* Enhanced Top Navigation */}
                <View style={styles.topNav}>
                    <TouchableOpacity style={styles.navButton} onPress={handleBack} activeOpacity={0.8}>
                        <ArrowLeft size={22} color="#111827" strokeWidth={2.5} />
                    </TouchableOpacity>

                    <View style={styles.navCenter}>
                        <View style={styles.homeIconContainer}>
                            <LinearGradient
                                colors={['#2D6A4F', '#1e4d38']}
                                style={styles.homeIconGradient}
                            >
                                <Home size={18} color="#fff" strokeWidth={2.5} />
                            </LinearGradient>
                        </View>
                    </View>

                    <View style={styles.navRight}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => setIsSaved(!isSaved)}
                            activeOpacity={0.8}
                        >
                            <Heart
                                size={22}
                                color={isSaved ? '#EF4444' : '#111827'}
                                fill={isSaved ? '#EF4444' : 'none'}
                                strokeWidth={2.5}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
                            <Share2 size={22} color="#111827" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Enhanced Image Counter */}
                <View style={styles.imageCounter}>
                    <Camera size={16} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.imageCounterText}>{currentImageIndex + 1} / {propertyImages.length}</Text>
                </View>

                {/* Enhanced Thumbnail Strip */}
                <View style={styles.thumbnailStrip}>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.thumbnailGradient}
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.thumbnailContent}
                    >
                        {propertyImages.map((image, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setCurrentImageIndex(index)}
                                style={[
                                    styles.thumbnail,
                                    currentImageIndex === index && styles.thumbnailActive
                                ]}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: image }} style={styles.thumbnailImage} resizeMode="cover" />
                                {currentImageIndex === index && (
                                    <View style={styles.thumbnailActiveOverlay}>
                                        <CheckCircle size={16} color="#2D6A4F" fill="#fff" strokeWidth={2.5} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* Animated Content */}
            <Animated.ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {/* Enhanced Property Header */}
                    <View style={styles.propertyHeader}>
                        <View style={styles.badgeRow}>
                            <LinearGradient
                                colors={['#2D6A4F', '#1e4d38']}
                                style={styles.badgeGreen}
                            >
                                <Text style={styles.badgeGreenText}>
                                    {listingType === 'rent' ? 'For Rent' : 'For Sale'}
                                </Text>
                            </LinearGradient>
                            {(property.status === 'sold' || property.status === 'rented') && (
                                <View style={[styles.statusBadgeDetail, { backgroundColor: property.status === 'sold' ? '#EF4444' : '#3B82F6' }]}>
                                    <Text style={styles.statusBadgeDetailText}>
                                        {property.status === 'sold' ? 'Sold' : 'Rented'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.badgeBlue}>
                                <View style={styles.statusDot} />
                                <Text style={styles.badgeBlueText}>
                                    {String(propertyStatus).charAt(0).toUpperCase() + String(propertyStatus).slice(1).toLowerCase()}
                                </Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Award size={14} color="#2D6A4F" strokeWidth={2} />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>{propertyName}</Text>

                        <View style={styles.addressRow}>
                            <View style={styles.addressIconCircle}>
                                <MapPin size={14} color="#2D6A4F" strokeWidth={2} />
                            </View>
                            <Text style={styles.address}>{propertyAddress}</Text>
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{propertyPrice}</Text>
                            <View style={styles.priceTag}>
                                <TrendingUp size={16} color="#10b981" strokeWidth={2.5} />
                                <Text style={styles.priceChange}>+2.5%</Text>
                            </View>
                        </View>
                    </View>

                    {/* Enhanced Specs Section */}
                    <View style={styles.specsSection}>
                        <View style={styles.specsGrid}>
                            <SpecCard
                                icon={<Bed size={22} color="#2D6A4F" strokeWidth={2.5} />}
                                label="Bedrooms"
                                value={bedrooms}
                            />
                            <SpecCard
                                icon={<Bath size={22} color="#2D6A4F" strokeWidth={2.5} />}
                                label="Bathrooms"
                                value={bathrooms}
                            />
                            <SpecCard
                                icon={<Maximize size={22} color="#2D6A4F" strokeWidth={2.5} />}
                                label="Area"
                                value={area}
                            />
                            <SpecCard
                                icon={<Calendar size={22} color="#2D6A4F" strokeWidth={2.5} />}
                                label="Built"
                                value={builtYear}
                            />
                        </View>
                    </View>

                    {/* Enhanced Description Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <View style={styles.sectionDivider} />
                        </View>
                        <Text style={styles.description}>{description}</Text>
                    </View>

                    {/* Enhanced Features Section */}
                    <View style={styles.featuresSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Features & Amenities</Text>
                            <View style={styles.sectionDivider} />
                        </View>
                        <View style={styles.featuresGrid}>
                            {(() => {
                                // Parse features from property data
                                let featuresList = [];
                                try {
                                    const raw = property.features;
                                    if (raw) {
                                        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                                        if (Array.isArray(parsed)) {
                                            featuresList = parsed.filter(f => f && f.name);
                                        }
                                    }
                                } catch (e) { /* ignore */ }

                                if (featuresList.length > 0) {
                                    // Icon map – fall back to CheckCircle for unknown features
                                    const iconMap = {
                                        pool: <Droplet size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        garage: <Car size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        parking: <Car size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        fireplace: <Flame size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        wifi: <Wifi size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        internet: <Wifi size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        gym: <Dumbbell size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        garden: <Trees size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        security: <ShieldCheck size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        theater: <Video size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                        home: <Home size={16} color="#2D6A4F" strokeWidth={2.5} />,
                                    };
                                    const getIcon = (name) => {
                                        const key = (name || '').toLowerCase();
                                        for (const k of Object.keys(iconMap)) {
                                            if (key.includes(k)) return iconMap[k];
                                        }
                                        return <CheckCircle size={16} color="#2D6A4F" strokeWidth={2.5} />;
                                    };
                                    return featuresList.map((feature, idx) => (
                                        <FeatureChip
                                            key={idx}
                                            icon={getIcon(feature.name)}
                                            label={feature.value ? `${feature.name}: ${feature.value}` : feature.name}
                                        />
                                    ));
                                } else {
                                    return (
                                        <Text style={{ color: '#9CA3AF', fontSize: 14, paddingVertical: 8 }}>
                                            No features listed for this property.
                                        </Text>
                                    );
                                }
                            })()
                            }
                        </View>
                    </View>

                    {/* Enhanced Location Section */}
                    <View style={styles.section}>
                        <View style={styles.locationHeader}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Location</Text>
                                <View style={styles.sectionDivider} />
                            </View>
                            <TouchableOpacity style={styles.directionsButton} activeOpacity={0.7}>
                                <Navigation size={16} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={styles.directionsText}>Get Directions</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.mapPlaceholder}>
                            <Image source={{ uri: propertyImages[0] }} style={styles.mapImage} blurRadius={10} />
                            <LinearGradient
                                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                                style={styles.mapOverlay}
                            >
                                <View style={styles.mapLabel}>
                                    <MapPin size={20} color="#2D6A4F" strokeWidth={2.5} />
                                    <Text style={styles.mapLabelText} numberOfLines={1}>{propertyAddress}</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={styles.scoreGrid}>
                            <View style={styles.scoreCard}>
                                <View style={styles.scoreCircle}>
                                    <Text style={styles.scoreValue}>9.5</Text>
                                </View>
                                <Text style={styles.scoreLabel}>Walkability</Text>
                            </View>
                            <View style={styles.scoreCard}>
                                <View style={styles.scoreCircle}>
                                    <Text style={styles.scoreValue}>8.7</Text>
                                </View>
                                <Text style={styles.scoreLabel}>Transit</Text>
                            </View>
                            <View style={styles.scoreCard}>
                                <View style={styles.scoreCircle}>
                                    <Text style={styles.scoreValue}>9.2</Text>
                                </View>
                                <Text style={styles.scoreLabel}>Schools</Text>
                            </View>
                        </View>
                    </View>

                    {/* Enhanced Agent Section */}
                    <View style={styles.agentSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Contact Agent</Text>
                            <View style={styles.sectionDivider} />
                        </View>
                        <View style={styles.agentCard}>
                            <View style={styles.agentHeader}>
                                <LinearGradient
                                    colors={['#2D6A4F', '#1e4d38']}
                                    style={styles.agentAvatar}
                                >
                                    <Text style={styles.agentInitials}>{agentInitials}</Text>
                                </LinearGradient>
                                <View style={styles.agentInfo}>
                                    <Text style={styles.agentName}>{agentName}</Text>
                                    <Text style={styles.agentRole}>{agentRole}</Text>
                                </View>
                            </View>

                            <View style={styles.contactButtons}>
                                <TouchableOpacity style={styles.contactButton} activeOpacity={0.7} onPress={handleAgentCall}>
                                    <View style={styles.contactIconCircle}>
                                        <Phone size={18} color="#2D6A4F" strokeWidth={2.5} />
                                    </View>
                                    <Text style={styles.contactButtonText}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactButton} activeOpacity={0.7} onPress={handleAgentEmail}>
                                    <View style={styles.contactIconCircle}>
                                        <Mail size={18} color="#2D6A4F" strokeWidth={2.5} />
                                    </View>
                                    <Text style={styles.contactButtonText}>Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactButton} activeOpacity={0.7} onPress={handleAgentChat}>
                                    <View style={styles.contactIconCircle}>
                                        <MessageCircle size={18} color="#2D6A4F" strokeWidth={2.5} />
                                    </View>
                                    <Text style={styles.contactButtonText}>Chat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomSpacer} />
                </Animated.View>
            </Animated.ScrollView>

            {isBuyer && (
                <View style={styles.bottomCTA}>
                    {(property.status === 'sold' || property.status === 'rented') ? (
                        <View style={styles.unavailableContainer}>
                            <AlertCircle color="#DC2626" size={20} />
                            <Text style={styles.unavailableText}>This property is no longer available</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.ctaRow}>
                                <TouchableOpacity
                                    style={styles.ctaButtonGreen}
                                    onPress={handleScheduleViewing}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#2D6A4F', '#1e4d38']}
                                        style={styles.ctaButtonGradient}
                                    >
                                        <Text style={styles.ctaButtonText}>Schedule Viewing</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.ctaButtonDark}
                                    onPress={handleMakeOffer}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#111827', '#000000']}
                                        style={styles.ctaButtonGradient}
                                    >
                                        <Text style={styles.ctaButtonText}>Make an Offer</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.ctaRow}>
                                <TouchableOpacity
                                    style={styles.ctaButtonOutline}
                                    onPress={handleVirtualTour}
                                    activeOpacity={0.7}
                                >
                                    <Video size={20} color="#2D6A4F" strokeWidth={2.5} />
                                    <Text style={styles.ctaButtonOutlineText}>Virtual Tour</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.ctaButtonReport}
                                    onPress={handleReportProperty}
                                    activeOpacity={0.7}
                                >
                                    <Flag size={20} color="#DC2626" strokeWidth={2.5} />
                                    <Text style={styles.ctaButtonReportText}>Report</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB'
    },
    heroContainer: {
        height: 400,
        backgroundColor: '#000',
        position: 'relative'
    },
    heroImage: {
        width: '100%',
        height: '100%'
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    topNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
    },
    navButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5
    },
    navCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    homeIconContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    homeIconGradient: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navRight: {
        flexDirection: 'row',
        gap: 10
    },
    imageCounter: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    imageCounterText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    thumbnailStrip: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 40,
        paddingBottom: 20,
    },
    thumbnailGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    thumbnailContent: {
        paddingHorizontal: 20,
        gap: 12
    },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'transparent',
        opacity: 0.5,
        position: 'relative',
    },
    thumbnailActive: {
        borderColor: '#2D6A4F',
        opacity: 1,
        transform: [{ scale: 1.08 }],
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%'
    },
    thumbnailActiveOverlay: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
    },
    content: {
        flex: 1
    },
    propertyHeader: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    badgeGreen: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 14,
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    badgeGreenText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    badgeBlue: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2D6A4F',
    },
    badgeBlueText: {
        color: '#2D6A4F',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: {
        color: '#2D6A4F',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        letterSpacing: -0.5,
        lineHeight: 32,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 16
    },
    addressIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    address: {
        flex: 1,
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
        fontWeight: '500',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 34,
        fontWeight: '900',
        color: '#2D6A4F',
        letterSpacing: -1,
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    priceChange: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10b981',
    },
    specsSection: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#F9FAFB'
    },
    specsGrid: {
        flexDirection: 'row',
        gap: 12
    },
    specCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3
    },
    specIconContainer: {
        marginBottom: 10
    },
    specIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    specValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    specLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    section: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 24,
        marginTop: 2
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.3,
    },
    sectionDivider: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        borderRadius: 1,
    },
    description: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 24,
        fontWeight: '400',
    },
    featuresSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 24,
        marginTop: 2
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    featureChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB'
    },
    featureIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureChipText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600'
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    directionsText: {
        fontSize: 14,
        color: '#2D6A4F',
        fontWeight: '700'
    },
    mapPlaceholder: {
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.5
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mapLabel: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        maxWidth: width - 80,
    },
    mapLabelText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '700',
        flex: 1,
    },
    scoreGrid: {
        flexDirection: 'row',
        gap: 12
    },
    scoreCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    scoreCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D6A4F',
        letterSpacing: -0.5,
    },
    scoreLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    agentSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 24,
        marginTop: 2
    },
    agentCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    agentHeader: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20
    },
    agentAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    agentInitials: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    agentInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    agentName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    agentRole: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '500',
    },
    agentRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    agentRatingValue: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '700'
    },
    agentRatingCount: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    contactButtons: {
        flexDirection: 'row',
        gap: 10
    },
    contactButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    contactIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactButtonText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    bottomSpacer: {
        height: 240
    },
    bottomCTA: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10
    },
    ctaRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 10
    },
    ctaButtonGreen: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    ctaButtonDark: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6
    },
    ctaButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    ctaButtonOutline: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#2D6A4F',
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(45, 106, 79, 0.05)',
    },
    ctaButtonOutlineText: {
        color: '#2D6A4F',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    ctaButtonReport: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#DC2626',
        borderRadius: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
    },
    ctaButtonReportText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    statusBadgeDetail: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusBadgeDetailText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    unavailableContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 14,
        gap: 10,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    unavailableText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '700',
    },
});
