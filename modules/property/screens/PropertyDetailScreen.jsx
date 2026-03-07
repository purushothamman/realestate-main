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
    useWindowDimensions,
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
    Edit,
} from 'lucide-react-native';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';

// ─── Responsive Helpers ──────────────────────────────────────────────────────

const BASE_WIDTH = 375; // iPhone 14 base

/** Scale a size linearly with screen width, clamped between min/max */
const scale = (size, min, max) => {
    const { width } = Dimensions.get('window');
    const scaled = (width / BASE_WIDTH) * size;
    if (min !== undefined && scaled < min) return min;
    if (max !== undefined && scaled > max) return max;
    return scaled;
};

/** Determine device class from window width */
const getDeviceClass = (width) => {
    if (width < 480) return 'phone';
    if (width < 768) return 'phablet';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

/** Return number of columns for spec / score grids */
const getSpecColumns = (width) => {
    if (width >= 1024) return 4;
    if (width >= 600) return 4;
    return 4; // always 4 but cards scale
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const FeatureChip = ({ icon, label }) => {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    return (
        <View style={[styles.featureChip, isTablet && styles.featureChipTablet]}>
            <View style={styles.featureIconWrapper}>{icon}</View>
            <Text style={[styles.featureChipText, isTablet && styles.featureChipTextTablet]}>
                {label}
            </Text>
        </View>
    );
};

const SpecCard = ({ icon, label, value }) => {
    const scaleAnim = useState(new Animated.Value(0))[0];
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.specCard,
                isTablet && styles.specCardTablet,
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <View style={styles.specIconContainer}>
                <View style={[styles.specIconCircle, isTablet && styles.specIconCircleTablet]}>
                    {icon}
                </View>
            </View>
            <Text style={[styles.specValue, isTablet && styles.specValueTablet]}>{value}</Text>
            <Text style={[styles.specLabel, isTablet && styles.specLabelTablet]}>{label}</Text>
        </Animated.View>
    );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PropertyDetailScreen({ navigation, onBack, route, user }) {
    const { width, height } = useWindowDimensions();
    const deviceClass = getDeviceClass(width);
    const isTablet = width >= 768;
    const isDesktop = width >= 1024;

    const heroHeight = isDesktop ? Math.min(height * 0.55, 520)
        : isTablet ? Math.min(height * 0.5, 460)
            : Math.min(height * 0.45, 400);

    const horizontalPad = isDesktop ? 48 : isTablet ? 32 : 24;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [scrollY] = useState(new Animated.Value(0));
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];
    const [fullProperty, setFullProperty] = useState(route?.params?.property || {});
    const property = fullProperty;
    const userRole = user?.role ? String(user.role).toLowerCase() : null;
    const isBuyer = userRole === 'buyer';

    const ownerId = property.owner?.id || property.uploaded_by || property.uploadedBy;
    const canEdit = property?.can_edit;

    useEffect(() => {
        const propertyIdToFetch =
            route?.params?.property?.id || route?.params?.property?.property_id;
        if (propertyIdToFetch) {
            (async () => {
                try {
                    const token = await AsyncStorage.getItem('authToken');
                    const res = await fetch(`${API_BASE_URL}/properties/${propertyIdToFetch}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.property) {
                            setFullProperty((prev) => ({ ...prev, ...data.property }));
                        }
                    }
                } catch (e) {}
            })();
        }
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const propertyId = property.id || property.property_id;
    const propertyName = property.title || property.name;
    const propertyAddress = [property.address, property.city, property.state]
        .filter(Boolean)
        .join(', ');
    const propertyPrice =
        property.price != null
            ? typeof property.price === 'number'
                ? `$${Number(property.price).toLocaleString()}`
                : String(property.price)
            : null;
    const propertyStatus = property.status || 'active';
    const listingType = property.listingType || property.listing_type || 'sale';

    const bedrooms = property.bedrooms ?? 4;
    const bathrooms = property.bathrooms ?? 3;
    const area = property.areaSqft ?? property.area ?? property.area_sqft ?? '3,400';
    const builtYear = property.builtYear ?? property.built_year ?? 2021;
    const description =
        property.description ||
        'Step into luxury with this stunning modern villa. This architectural masterpiece features an open floor plan with floor-to-ceiling windows that flood the space with natural light.';

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
            : listingAgent?.role
                ? String(listingAgent.role)
                : 'Real Estate Agent';
    const agentInitials =
        String(agentName || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('') || 'AG';

    // Images
    let propertyImages = [];
    if (property.images) {
        try {
            const parsedImages =
                typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                propertyImages = parsedImages
                    .map((img) => {
                        const path =
                            typeof img === 'object' && img !== null
                                ? img.url || img.image_url
                                : img;
                        return getImageUrl(path);
                    })
                    .filter(Boolean);
            }
        } catch (e) {}
    }
    if (propertyImages.length === 0) {
        const single = property.primaryImage || property.imageUrl || property.image;
        if (single) {
            const url = getImageUrl(single);
            if (url) propertyImages = [url];
        }
    }
    if (propertyImages.length === 0) propertyImages = [DEFAULT_PROPERTY_IMAGE];

    // ── Handlers (unchanged) ──────────────────────────────────────────────────
    const handleBack = () => {
        if (navigation?.goBack) navigation.goBack();
        else if (onBack) onBack();
    };

    const handleAgentCall = () => {
        if (!agentPhone) return Alert.alert('Agent', 'Phone number not available.');
        Alert.alert('Call Agent', agentPhone);
    };
    const handleAgentEmail = () => {
        if (!agentEmail) return Alert.alert('Agent', 'Email not available.');
        Alert.alert('Email Agent', agentEmail);
    };
    const handleAgentChat = () => Alert.alert('Chat', 'Chat feature coming soon.');

    const handleMakeOffer = async () => {
        try {
            const prop = route?.params?.property || {};
            const pid = prop.id || prop.property_id;
            if (!pid) return Alert.alert('Error', 'Property information is missing');
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return Alert.alert('Authentication Required', 'Please log in to make an offer');
            const response = await fetch(`${API_BASE_URL}/inquiries/create`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    property_id: pid,
                    initial_message: `I am interested in ${propertyName}. I would like to discuss this property with you.`,
                }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
                if (!data.chat_id) return Alert.alert('Error', 'Chat not created properly');
                navigation.navigate('messages', { chatId: data.chat_id, inquiryId: data.inquiry_id });
            } else {
                Alert.alert('Error', data.message || 'Failed to send inquiry');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send inquiry. Please try again.');
        }
    };

    const handleReportProperty = () => {
        if (navigation?.navigate) {
            try {
                navigation.navigate('ReportPropertyScreen', {
                    propertyId,
                    propertyName,
                    propertyAddress,
                    propertyPrice,
                    propertyImage: propertyImages[0],
                });
            } catch (error) {
                Alert.alert('Navigation Error', 'Unable to open Report Property screen.', [{ text: 'OK' }]);
            }
        } else {
            Alert.alert('Error', 'Navigation is not available.', [{ text: 'OK' }]);
        }
    };

    const handleScheduleViewing = () => {
        Alert.alert('Schedule Viewing', 'When would you like to schedule a viewing?', [
            { text: 'This Week', onPress: () => Alert.alert('Confirmed', 'Viewing scheduled for this week.') },
            { text: 'Next Week', onPress: () => Alert.alert('Confirmed', 'Viewing scheduled for next week.') },
            { text: 'Choose Date', onPress: () => Alert.alert('Coming Soon', 'Calendar picker coming soon.') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleVirtualTour = () => {
        Alert.alert('Virtual Tour', 'Experience this property in 360° virtual reality', [
            { text: 'Start Tour', onPress: () => Alert.alert('Success', 'Virtual tour is loading...') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleEditProperty = () => {
        navigation.navigate('PropertyEditScreen', {
            property,
            onSaved: (updatedProperty) => {
                if (updatedProperty) setFullProperty((prev) => ({ ...prev, ...updatedProperty }));
            },
        });
    };

    // ── Interpolations ────────────────────────────────────────────────────────
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // ── Bottom CTA height for scroll spacer ──────────────────────────────────
    const bottomCTAHeight = isBuyer
        ? property.status === 'sold' || property.status === 'rented'
            ? 100
            : 200
        : canEdit
            ? 100
            : 0;

    // ── Two-column layout for tablet/desktop ─────────────────────────────────
    const contentMaxWidth = isDesktop ? 1200 : '100%';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── Hero ───────────────────────────────────────────────────── */}
            <View style={[styles.heroContainer, { height: heroHeight }]}>
                <Image
                    source={{ uri: propertyImages[currentImageIndex] }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.4)']}
                    style={styles.heroGradient}
                />

                {/* Top Nav */}
                <View style={[styles.topNav, { paddingHorizontal: horizontalPad }]}>
                    <TouchableOpacity style={styles.navButton} onPress={handleBack} activeOpacity={0.8}>
                        <ArrowLeft size={isTablet ? 24 : 22} color="#111827" strokeWidth={2.5} />
                    </TouchableOpacity>

                    <View style={styles.navCenter}>
                        <View style={styles.homeIconContainer}>
                            <LinearGradient colors={['#2D6A4F', '#1e4d38']} style={styles.homeIconGradient}>
                                <Home size={isTablet ? 20 : 18} color="#fff" strokeWidth={2.5} />
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
                                size={isTablet ? 24 : 22}
                                color={isSaved ? '#EF4444' : '#111827'}
                                fill={isSaved ? '#EF4444' : 'none'}
                                strokeWidth={2.5}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
                            <Share2 size={isTablet ? 24 : 22} color="#111827" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Image Counter */}
                <View style={styles.imageCounter}>
                    <Camera size={16} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.imageCounterText}>
                        {currentImageIndex + 1} / {propertyImages.length}
                    </Text>
                </View>

                {/* Thumbnail Strip */}
                <View style={styles.thumbnailStrip}>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.thumbnailGradient}
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.thumbnailContent,
                            { paddingHorizontal: horizontalPad },
                        ]}
                    >
                        {propertyImages.map((image, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setCurrentImageIndex(index)}
                                style={[
                                    styles.thumbnail,
                                    isTablet && styles.thumbnailTablet,
                                    currentImageIndex === index && styles.thumbnailActive,
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

            {/* ── Scrollable Content ─────────────────────────────────────── */}
            <Animated.ScrollView
                style={styles.content}
                contentContainerStyle={[
                    styles.contentContainer,
                    isDesktop && styles.contentContainerDesktop,
                ]}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <Animated.View
                    style={[
                        styles.innerContent,
                        isDesktop && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    {/* Tablet/Desktop: two-column layout wrapper */}
                    {isDesktop ? (
                        <View style={styles.desktopLayout}>
                            {/* Left Column */}
                            <View style={styles.desktopLeft}>
                                <PropertyHeader
                                    property={property}
                                    propertyName={propertyName}
                                    propertyAddress={propertyAddress}
                                    propertyPrice={propertyPrice}
                                    propertyStatus={propertyStatus}
                                    listingType={listingType}
                                    horizontalPad={horizontalPad}
                                    isTablet={isTablet}
                                    isDesktop={isDesktop}
                                />
                                <SpecsSection
                                    bedrooms={bedrooms}
                                    bathrooms={bathrooms}
                                    area={area}
                                    builtYear={builtYear}
                                    horizontalPad={horizontalPad}
                                    isTablet={isTablet}
                                />
                                <DescriptionSection
                                    description={description}
                                    horizontalPad={horizontalPad}
                                    isTablet={isTablet}
                                />
                                <FeaturesSection
                                    property={property}
                                    horizontalPad={horizontalPad}
                                    isTablet={isTablet}
                                />
                            </View>

                            {/* Right Column */}
                            <View style={styles.desktopRight}>
                                <LocationSection
                                    propertyAddress={propertyAddress}
                                    propertyImages={propertyImages}
                                    horizontalPad={horizontalPad}
                                    isTablet={isTablet}
                                    width={width}
                                />
                                <AgentSection
                                    agentInitials={agentInitials}
                                    agentName={agentName}
                                    agentRole={agentRole}
                                    handleAgentCall={handleAgentCall}
                                    handleAgentEmail={handleAgentEmail}
                                    handleAgentChat={handleAgentChat}
                                    horizontalPad={horizontalPad}
                                    isTablet={isTablet}
                                />
                            </View>
                        </View>
                    ) : (
                        <>
                            <PropertyHeader
                                property={property}
                                propertyName={propertyName}
                                propertyAddress={propertyAddress}
                                propertyPrice={propertyPrice}
                                propertyStatus={propertyStatus}
                                listingType={listingType}
                                horizontalPad={horizontalPad}
                                isTablet={isTablet}
                                isDesktop={isDesktop}
                            />
                            <SpecsSection
                                bedrooms={bedrooms}
                                bathrooms={bathrooms}
                                area={area}
                                builtYear={builtYear}
                                horizontalPad={horizontalPad}
                                isTablet={isTablet}
                            />
                            <DescriptionSection
                                description={description}
                                horizontalPad={horizontalPad}
                                isTablet={isTablet}
                            />
                            <FeaturesSection
                                property={property}
                                horizontalPad={horizontalPad}
                                isTablet={isTablet}
                            />
                            <LocationSection
                                propertyAddress={propertyAddress}
                                propertyImages={propertyImages}
                                horizontalPad={horizontalPad}
                                isTablet={isTablet}
                                width={width}
                            />
                            <AgentSection
                                agentInitials={agentInitials}
                                agentName={agentName}
                                agentRole={agentRole}
                                handleAgentCall={handleAgentCall}
                                handleAgentEmail={handleAgentEmail}
                                handleAgentChat={handleAgentChat}
                                horizontalPad={horizontalPad}
                                isTablet={isTablet}
                            />
                        </>
                    )}

                    <View style={{ height: bottomCTAHeight + 40 }} />
                </Animated.View>
            </Animated.ScrollView>

            {/* ── Bottom CTA ─────────────────────────────────────────────── */}
            {isBuyer && (
                <View
                    style={[
                        styles.bottomCTA,
                        { paddingHorizontal: horizontalPad },
                        isTablet && styles.bottomCTATablet,
                    ]}
                >
                    {property.status === 'sold' || property.status === 'rented' ? (
                        <View style={styles.unavailableContainer}>
                            <AlertCircle color="#DC2626" size={20} />
                            <Text style={styles.unavailableText}>This property is no longer available</Text>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.ctaRow, isTablet && styles.ctaRowTablet]}>
                                <TouchableOpacity
                                    style={styles.ctaButtonGreen}
                                    onPress={handleScheduleViewing}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#2D6A4F', '#1e4d38']}
                                        style={styles.ctaButtonGradient}
                                    >
                                        <Text style={[styles.ctaButtonText, isTablet && styles.ctaButtonTextTablet]}>
                                            Schedule Viewing
                                        </Text>
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
                                        <Text style={[styles.ctaButtonText, isTablet && styles.ctaButtonTextTablet]}>
                                            Make an Offer
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.ctaRow, isTablet && styles.ctaRowTablet]}>
                                <TouchableOpacity
                                    style={styles.ctaButtonOutline}
                                    onPress={handleVirtualTour}
                                    activeOpacity={0.7}
                                >
                                    <Video size={isTablet ? 22 : 20} color="#2D6A4F" strokeWidth={2.5} />
                                    <Text style={[styles.ctaButtonOutlineText, isTablet && styles.ctaButtonTextTablet]}>
                                        Virtual Tour
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.ctaButtonReport}
                                    onPress={handleReportProperty}
                                    activeOpacity={0.7}
                                >
                                    <Flag size={isTablet ? 22 : 20} color="#DC2626" strokeWidth={2.5} />
                                    <Text style={[styles.ctaButtonReportText, isTablet && styles.ctaButtonTextTablet]}>
                                        Report
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            )}

            {canEdit && (
                <View
                    style={[
                        styles.bottomCTA,
                        { paddingHorizontal: horizontalPad },
                        isTablet && styles.bottomCTATablet,
                    ]}
                >
                    <TouchableOpacity
                        style={styles.ctaButtonGreen}
                        onPress={handleEditProperty}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#2D6A4F', '#1e4d38']}
                            style={[styles.ctaButtonGradient, { flexDirection: 'row', gap: 8 }]}
                        >
                            <Edit size={20} color="#fff" strokeWidth={2.5} />
                            <Text style={styles.ctaButtonText}>Edit Property Listing</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

// ─── Section Sub-Components ───────────────────────────────────────────────────

function PropertyHeader({ property, propertyName, propertyAddress, propertyPrice, propertyStatus, listingType, horizontalPad, isTablet, isDesktop }) {
    return (
        <View style={[styles.propertyHeader, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.badgeRow}>
                <LinearGradient colors={['#2D6A4F', '#1e4d38']} style={styles.badgeGreen}>
                    <Text style={[styles.badgeGreenText, isTablet && styles.badgeTextTablet]}>
                        {listingType === 'rent' ? 'For Rent' : 'For Sale'}
                    </Text>
                </LinearGradient>
                {(property.status === 'sold' || property.status === 'rented') && (
                    <View
                        style={[
                            styles.statusBadgeDetail,
                            { backgroundColor: property.status === 'sold' ? '#EF4444' : '#3B82F6' },
                        ]}
                    >
                        <Text style={styles.statusBadgeDetailText}>
                            {property.status === 'sold' ? 'Sold' : 'Rented'}
                        </Text>
                    </View>
                )}
                <View style={styles.badgeBlue}>
                    <View style={styles.statusDot} />
                    <Text style={[styles.badgeBlueText, isTablet && styles.badgeTextTablet]}>
                        {String(propertyStatus).charAt(0).toUpperCase() + String(propertyStatus).slice(1).toLowerCase()}
                    </Text>
                </View>
                <View style={styles.verifiedBadge}>
                    <Award size={isTablet ? 16 : 14} color="#2D6A4F" strokeWidth={2} />
                    <Text style={[styles.verifiedText, isTablet && styles.badgeTextTablet]}>Verified</Text>
                </View>
            </View>

            <Text style={[styles.title, isTablet && styles.titleTablet, isDesktop && styles.titleDesktop]}>
                {propertyName}
            </Text>

            <View style={styles.addressRow}>
                <View style={styles.addressIconCircle}>
                    <MapPin size={isTablet ? 16 : 14} color="#2D6A4F" strokeWidth={2} />
                </View>
                <Text style={[styles.address, isTablet && styles.addressTablet]}>{propertyAddress}</Text>
            </View>

            <View style={styles.priceContainer}>
                <Text style={[styles.price, isTablet && styles.priceTablet]}>{propertyPrice}</Text>
                <View style={styles.priceTag}>
                    <TrendingUp size={isTablet ? 18 : 16} color="#10b981" strokeWidth={2.5} />
                    <Text style={[styles.priceChange, isTablet && styles.priceChangeTablet]}>+2.5%</Text>
                </View>
            </View>
        </View>
    );
}

function SpecsSection({ bedrooms, bathrooms, area, builtYear, horizontalPad, isTablet }) {
    return (
        <View style={[styles.specsSection, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.specsGrid}>
                <SpecCard icon={<Bed size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />} label="Bedrooms" value={bedrooms} />
                <SpecCard icon={<Bath size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />} label="Bathrooms" value={bathrooms} />
                <SpecCard icon={<Maximize size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />} label="Area" value={area} />
                <SpecCard icon={<Calendar size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />} label="Built" value={builtYear} />
            </View>
        </View>
    );
}

function DescriptionSection({ description, horizontalPad, isTablet }) {
    return (
        <View style={[styles.section, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Description</Text>
                <View style={styles.sectionDivider} />
            </View>
            <Text style={[styles.description, isTablet && styles.descriptionTablet]}>{description}</Text>
        </View>
    );
}

function FeaturesSection({ property, horizontalPad, isTablet }) {
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

    let featuresList = [];
    try {
        const raw = property.features;
        if (raw) {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed)) featuresList = parsed.filter((f) => f && f.name);
        }
    } catch (e) {}

    return (
        <View style={[styles.featuresSection, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                    Features & Amenities
                </Text>
                <View style={styles.sectionDivider} />
            </View>
            <View style={styles.featuresGrid}>
                {featuresList.length > 0 ? (
                    featuresList.map((feature, idx) => (
                        <FeatureChip
                            key={idx}
                            icon={getIcon(feature.name)}
                            label={feature.value ? `${feature.name}: ${feature.value}` : feature.name}
                        />
                    ))
                ) : (
                    <Text style={{ color: '#9CA3AF', fontSize: isTablet ? 16 : 14, paddingVertical: 8 }}>
                        No features listed for this property.
                    </Text>
                )}
            </View>
        </View>
    );
}

function LocationSection({ propertyAddress, propertyImages, horizontalPad, isTablet, width }) {
    const mapHeight = isTablet ? 280 : 200;
    return (
        <View style={[styles.section, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.locationHeader}>
                <View style={[styles.sectionHeader, { flex: 1, marginBottom: 0 }]}>
                    <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Location</Text>
                    <View style={styles.sectionDivider} />
                </View>
                <TouchableOpacity style={styles.directionsButton} activeOpacity={0.7}>
                    <Navigation size={isTablet ? 18 : 16} color="#2D6A4F" strokeWidth={2.5} />
                    <Text style={[styles.directionsText, isTablet && styles.directionsTextTablet]}>
                        Get Directions
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.mapPlaceholder, { height: mapHeight, marginTop: 16 }]}>
                <Image source={{ uri: propertyImages[0] }} style={styles.mapImage} blurRadius={10} />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                    style={styles.mapOverlay}
                >
                    <View style={[styles.mapLabel, { maxWidth: width - horizontalPad * 2 - 40 }]}>
                        <MapPin size={isTablet ? 22 : 20} color="#2D6A4F" strokeWidth={2.5} />
                        <Text style={[styles.mapLabelText, isTablet && styles.mapLabelTextTablet]} numberOfLines={1}>
                            {propertyAddress}
                        </Text>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.scoreGrid}>
                {[
                    { value: '9.5', label: 'Walkability' },
                    { value: '8.7', label: 'Transit' },
                    { value: '9.2', label: 'Schools' },
                ].map((s) => (
                    <View key={s.label} style={[styles.scoreCard, isTablet && styles.scoreCardTablet]}>
                        <View style={[styles.scoreCircle, isTablet && styles.scoreCircleTablet]}>
                            <Text style={[styles.scoreValue, isTablet && styles.scoreValueTablet]}>{s.value}</Text>
                        </View>
                        <Text style={[styles.scoreLabel, isTablet && styles.scoreLabelTablet]}>{s.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function AgentSection({ agentInitials, agentName, agentRole, handleAgentCall, handleAgentEmail, handleAgentChat, horizontalPad, isTablet }) {
    return (
        <View style={[styles.agentSection, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Contact Agent</Text>
                <View style={styles.sectionDivider} />
            </View>
            <View style={styles.agentCard}>
                <View style={styles.agentHeader}>
                    <LinearGradient
                        colors={['#2D6A4F', '#1e4d38']}
                        style={[styles.agentAvatar, isTablet && styles.agentAvatarTablet]}
                    >
                        <Text style={[styles.agentInitials, isTablet && styles.agentInitialsTablet]}>
                            {agentInitials}
                        </Text>
                    </LinearGradient>
                    <View style={styles.agentInfo}>
                        <Text style={[styles.agentName, isTablet && styles.agentNameTablet]}>{agentName}</Text>
                        <Text style={[styles.agentRole, isTablet && styles.agentRoleTablet]}>{agentRole}</Text>
                    </View>
                </View>
                <View style={styles.contactButtons}>
                    {[
                        { label: 'Call', icon: <Phone size={isTablet ? 20 : 18} color="#2D6A4F" strokeWidth={2.5} />, onPress: handleAgentCall },
                        { label: 'Email', icon: <Mail size={isTablet ? 20 : 18} color="#2D6A4F" strokeWidth={2.5} />, onPress: handleAgentEmail },
                        { label: 'Chat', icon: <MessageCircle size={isTablet ? 20 : 18} color="#2D6A4F" strokeWidth={2.5} />, onPress: handleAgentChat },
                    ].map(({ label, icon, onPress }) => (
                        <TouchableOpacity
                            key={label}
                            style={[styles.contactButton, isTablet && styles.contactButtonTablet]}
                            activeOpacity={0.7}
                            onPress={onPress}
                        >
                            <View style={[styles.contactIconCircle, isTablet && styles.contactIconCircleTablet]}>
                                {icon}
                            </View>
                            <Text style={[styles.contactButtonText, isTablet && styles.contactButtonTextTablet]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Container
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    // Hero
    heroContainer: { backgroundColor: '#000', position: 'relative', width: '100%' },
    heroImage: { width: '100%', height: '100%' },
    heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

    // Top Nav
    topNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
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
        elevation: 5,
    },
    navCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    homeIconContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    homeIconGradient: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    navRight: { flexDirection: 'row', gap: 10 },

    // Image Counter
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
    imageCounterText: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },

    // Thumbnails
    thumbnailStrip: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 40,
        paddingBottom: 16,
    },
    thumbnailGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    thumbnailContent: { gap: 12 },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'transparent',
        opacity: 0.5,
    },
    thumbnailTablet: { width: 88, height: 88, borderRadius: 18 },
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
    thumbnailImage: { width: '100%', height: '100%' },
    thumbnailActiveOverlay: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
    },

    // Scrollable content
    content: { flex: 1 },
    contentContainer: { flexGrow: 1 },
    contentContainerDesktop: { paddingHorizontal: 0 },
    innerContent: { width: '100%' },

    // Desktop two-column layout
    desktopLayout: {
        flexDirection: 'row',
        gap: 0,
        alignItems: 'flex-start',
        paddingHorizontal: 0,
    },
    desktopLeft: { flex: 1.4 },
    desktopRight: { flex: 1, borderLeftWidth: 1, borderLeftColor: '#F3F4F6' },

    // Property Header
    propertyHeader: {
        backgroundColor: '#FFFFFF',
        paddingTop: 24,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
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
    badgeGreenText: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    badgeTextTablet: { fontSize: 14 },
    badgeBlue: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2D6A4F' },
    badgeBlueText: { color: '#2D6A4F', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    verifiedBadge: {
        backgroundColor: 'rgba(45,106,79,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: { color: '#2D6A4F', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        letterSpacing: -0.5,
        lineHeight: 32,
        flexShrink: 1,
    },
    titleTablet: { fontSize: 30, lineHeight: 38 },
    titleDesktop: { fontSize: 34, lineHeight: 42 },
    addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
    addressIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(45,106,79,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    address: { flex: 1, fontSize: 15, color: '#6B7280', lineHeight: 22, fontWeight: '500' },
    addressTablet: { fontSize: 16, lineHeight: 24 },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    price: { fontSize: 34, fontWeight: '900', color: '#2D6A4F', letterSpacing: -1 },
    priceTablet: { fontSize: 40 },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16,185,129,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    priceChange: { fontSize: 14, fontWeight: '700', color: '#10b981' },
    priceChangeTablet: { fontSize: 16 },

    // Specs
    specsSection: { paddingVertical: 20, backgroundColor: '#F9FAFB' },
    specsGrid: { flexDirection: 'row', gap: 10, flexWrap: 'nowrap' },
    specCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        minWidth: 0,
    },
    specCardTablet: { padding: 20, borderRadius: 20 },
    specIconContainer: { marginBottom: 8 },
    specIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(45,106,79,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    specIconCircleTablet: { width: 48, height: 48, borderRadius: 24 },
    specValue: {
        fontSize: 17,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 2,
        letterSpacing: -0.3,
        textAlign: 'center',
    },
    specValueTablet: { fontSize: 22 },
    specLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', letterSpacing: 0.2, textAlign: 'center' },
    specLabelTablet: { fontSize: 13 },

    // Generic Section
    section: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 24,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
    sectionTitleTablet: { fontSize: 24 },
    sectionDivider: { flex: 1, height: 2, backgroundColor: '#E5E7EB', borderRadius: 1 },
    description: { fontSize: 15, color: '#6B7280', lineHeight: 24, fontWeight: '400' },
    descriptionTablet: { fontSize: 16, lineHeight: 28 },

    // Features
    featuresSection: { backgroundColor: '#FFFFFF', paddingVertical: 24, marginTop: 2 },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    featureChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    featureChipTablet: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16 },
    featureIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(45,106,79,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureChipText: { fontSize: 14, color: '#374151', fontWeight: '600' },
    featureChipTextTablet: { fontSize: 15 },

    // Location
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    directionsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(45,106,79,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginLeft: 8,
        flexShrink: 0,
    },
    directionsText: { fontSize: 14, color: '#2D6A4F', fontWeight: '700' },
    directionsTextTablet: { fontSize: 16 },
    mapPlaceholder: {
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
        width: '100%',
    },
    mapImage: { width: '100%', height: '100%', opacity: 0.5 },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    mapLabelText: { fontSize: 15, color: '#111827', fontWeight: '700', flex: 1 },
    mapLabelTextTablet: { fontSize: 17 },
    scoreGrid: { flexDirection: 'row', gap: 12 },
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
    scoreCardTablet: { padding: 20, borderRadius: 20 },
    scoreCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(45,106,79,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreCircleTablet: { width: 72, height: 72, borderRadius: 36 },
    scoreValue: { fontSize: 22, fontWeight: '800', color: '#2D6A4F', letterSpacing: -0.5 },
    scoreValueTablet: { fontSize: 26 },
    scoreLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
    scoreLabelTablet: { fontSize: 14 },

    // Agent
    agentSection: { backgroundColor: '#FFFFFF', paddingVertical: 24, marginTop: 2 },
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
    agentHeader: { flexDirection: 'row', gap: 16, marginBottom: 20 },
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
        flexShrink: 0,
    },
    agentAvatarTablet: { width: 84, height: 84, borderRadius: 42 },
    agentInitials: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
    agentInitialsTablet: { fontSize: 28 },
    agentInfo: { flex: 1, justifyContent: 'center' },
    agentName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4, letterSpacing: -0.3 },
    agentNameTablet: { fontSize: 22 },
    agentRole: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' },
    agentRoleTablet: { fontSize: 16 },
    contactButtons: { flexDirection: 'row', gap: 10 },
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
    contactButtonTablet: { paddingVertical: 18, borderRadius: 16 },
    contactIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(45,106,79,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactIconCircleTablet: { width: 40, height: 40, borderRadius: 20 },
    contactButtonText: { fontSize: 13, color: '#374151', fontWeight: '700', letterSpacing: 0.3 },
    contactButtonTextTablet: { fontSize: 15 },

    // Bottom CTA
    bottomCTA: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 28 : 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    bottomCTATablet: { paddingTop: 20, paddingBottom: 32 },
    ctaRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    ctaRowTablet: { gap: 16, marginBottom: 14 },
    ctaButtonGreen: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaButtonDark: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    ctaButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
    ctaButtonTextTablet: { fontSize: 18 },
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
        backgroundColor: 'rgba(45,106,79,0.05)',
    },
    ctaButtonOutlineText: { color: '#2D6A4F', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
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
        backgroundColor: 'rgba(220,38,38,0.05)',
    },
    ctaButtonReportText: { color: '#DC2626', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

    // Status / Unavailable
    statusBadgeDetail: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginLeft: 8 },
    statusBadgeDetailText: { color: '#FFF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
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
    unavailableText: { color: '#DC2626', fontSize: 16, fontWeight: '700' },
});