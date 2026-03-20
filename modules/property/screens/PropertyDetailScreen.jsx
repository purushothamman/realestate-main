import React, { useState, useEffect, useRef } from 'react';
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
    FlatList,
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
    ChevronLeft,
    ChevronRight,
} from 'lucide-react-native';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';

// ─── Responsive Helpers ──────────────────────────────────────────────────────

const BASE_WIDTH = 375;

const scale = (size, min, max) => {
    const { width } = Dimensions.get('window');
    const scaled = (width / BASE_WIDTH) * size;
    if (min !== undefined && scaled < min) return min;
    if (max !== undefined && scaled > max) return max;
    return scaled;
};

const getDeviceClass = (width) => {
    if (width < 480) return 'phone';
    if (width < 768) return 'phablet';
    if (width < 1024) return 'tablet';
    return 'desktop';
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
            <Text 
                style={[styles.specValue, isTablet && styles.specValueTablet]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {String(value).replace(/sq\s*ft/gi, '').trim()}
            </Text>
            <Text 
                style={[styles.specLabel, isTablet && styles.specLabelTablet]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {label === 'Area' ? 'Area (sq ft)' : label}
            </Text>
        </Animated.View>
    );
};

// ─── Image Gallery ────────────────────────────────────────────────────────────

const ImageGallery = ({ images, heroHeight, horizontalPad, isTablet, onBack, isSaved, setIsSaved }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { width } = useWindowDimensions();

    const goNext = () => {
        if (currentIndex < images.length - 1) {
            const next = currentIndex + 1;
            setCurrentIndex(next);
            flatListRef.current?.scrollToIndex({ index: next, animated: true });
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            const prev = currentIndex - 1;
            setCurrentIndex(prev);
            flatListRef.current?.scrollToIndex({ index: prev, animated: true });
        }
    };

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 100,
    }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const getItemLayout = (_, index) => ({
        length: width,
        offset: width * index,
        index,
    });

    return (
        <View style={{ height: heroHeight }}>
            <FlatList
                ref={flatListRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => String(i)}
                getItemLayout={getItemLayout}
                snapToInterval={width}
                snapToAlignment="center"
                decelerationRate="fast"
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
                renderItem={({ item }) => (
                    <View style={{ width, height: heroHeight }}>
                        <Image
                            source={{ uri: item }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.3)']}
                            style={StyleSheet.absoluteFill}
                        />
                    </View>
                )}
            />

            {/* Top Nav */}
            <View style={[styles.topNav, { paddingHorizontal: horizontalPad }]}>
                <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.8}>
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

            {/* Prev / Next arrows */}
            {images.length > 1 && (
                <>
                    {currentIndex > 0 && (
                        <TouchableOpacity style={styles.arrowLeft} onPress={goPrev} activeOpacity={0.8}>
                            <ChevronLeft size={22} color="#fff" strokeWidth={2.5} />
                        </TouchableOpacity>
                    )}
                    {currentIndex < images.length - 1 && (
                        <TouchableOpacity style={styles.arrowRight} onPress={goNext} activeOpacity={0.8}>
                            <ChevronRight size={22} color="#fff" strokeWidth={2.5} />
                        </TouchableOpacity>
                    )}
                </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
                <View style={styles.dotsRow}>
                    {images.map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                                setCurrentIndex(i);
                                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                            }}
                            style={[styles.dot, i === currentIndex && styles.dotActive]}
                        />
                    ))}
                </View>
            )}

            {/* Counter badge */}
            <View style={styles.imageCounter}>
                <Camera size={14} color="#fff" strokeWidth={2.5} />
                <Text style={styles.imageCounterText}>
                    {currentIndex + 1} / {images.length}
                </Text>
            </View>
        </View>
    );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PropertyDetailScreen({ navigation, onBack, route, user }) {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;
    const isDesktop = width >= 1024;

    const heroHeight = isDesktop
        ? Math.min(height * 0.55, 520)
        : isTablet
            ? Math.min(height * 0.5, 460)
            : Math.min(height * 0.45, 400);

    const horizontalPad = isDesktop ? 48 : isTablet ? 32 : 20;

    const [isSaved, setIsSaved] = useState(false);
    const [scrollY] = useState(new Animated.Value(0));
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];
    const [fullProperty, setFullProperty] = useState(route?.params?.property || {});
    const property = fullProperty;
    const userRole = user?.role ? String(user.role).toLowerCase() : null;
    const isBuyer = userRole === 'buyer';
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
                } catch (e) { }
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
    
    // Parse uploaded date or default to current year
    let builtYear = new Date().getFullYear();
    if (property.created_at) {
        const d = new Date(property.created_at);
        builtYear = !isNaN(d) ? d.getFullYear() : String(property.created_at).substring(0, 4);
    } else if (property.builtYear || property.built_year) {
        builtYear = property.builtYear ?? property.built_year;
    }

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
                            typeof img === 'object' && img !== null ? img.url || img.image_url : img;
                        return getImageUrl(path);
                    })
                    .filter(Boolean);
            }
        } catch (e) { }
    }
    if (propertyImages.length === 0) {
        const single = property.primaryImage || property.imageUrl || property.image;
        if (single) {
            const url = getImageUrl(single);
            if (url) propertyImages = [url];
        }
    }
    if (propertyImages.length === 0) propertyImages = [DEFAULT_PROPERTY_IMAGE];

    // ── Handlers ──────────────────────────────────────────────────────────────
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

    // ── Sticky header opacity ─────────────────────────────────────────────────
    const stickyHeaderOpacity = scrollY.interpolate({
        inputRange: [heroHeight - 80, heroHeight],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    // ── CTA Section (rendered inside scroll) ─────────────────────────────────
    const renderCTA = () => {
        if (!isBuyer && !canEdit) return null;

        return (
            <View style={[styles.ctaSection, { paddingHorizontal: horizontalPad }]}>
                {isBuyer && (
                    <>
                        {property.status === 'sold' || property.status === 'rented' ? (
                            <View style={styles.unavailableContainer}>
                                <AlertCircle color="#DC2626" size={20} />
                                <Text style={styles.unavailableText}>
                                    This property is no longer available
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={[styles.ctaRow, isTablet && styles.ctaRowTablet]}>
                                    <TouchableOpacity
                                        style={styles.ctaButtonGreen}
                                        onPress={handleScheduleViewing}
                                        activeOpacity={0.85}
                                    >
                                        <LinearGradient
                                            colors={['#2D6A4F', '#1e4d38']}
                                            style={styles.ctaButtonGradient}
                                        >
                                            <Calendar size={18} color="#fff" strokeWidth={2.5} />
                                            <Text style={[styles.ctaButtonText, isTablet && styles.ctaButtonTextTablet]}>
                                                Schedule Viewing
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.ctaButtonDark}
                                        onPress={handleMakeOffer}
                                        activeOpacity={0.85}
                                    >
                                        <LinearGradient
                                            colors={['#111827', '#000000']}
                                            style={styles.ctaButtonGradient}
                                        >
                                            <TrendingUp size={18} color="#fff" strokeWidth={2.5} />
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
                                        <Video size={isTablet ? 20 : 18} color="#2D6A4F" strokeWidth={2.5} />
                                        <Text style={[styles.ctaButtonOutlineText, isTablet && styles.ctaButtonTextTablet]}>
                                            Virtual Tour
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.ctaButtonReport}
                                        onPress={handleReportProperty}
                                        activeOpacity={0.7}
                                    >
                                        <Flag size={isTablet ? 20 : 18} color="#DC2626" strokeWidth={2.5} />
                                        <Text style={[styles.ctaButtonReportText, isTablet && styles.ctaButtonTextTablet]}>
                                            Report
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </>
                )}

                {canEdit && (
                    <TouchableOpacity
                        style={styles.ctaButtonGreen}
                        onPress={handleEditProperty}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#2D6A4F', '#1e4d38']}
                            style={[styles.ctaButtonGradient, { gap: 8 }]}
                        >
                            <Edit size={20} color="#fff" strokeWidth={2.5} />
                            <Text style={styles.ctaButtonText}>Edit Property Listing</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Sticky Header (appears on scroll) ─────────────────────── */}
            <Animated.View
                style={[
                    styles.stickyHeader,
                    { opacity: stickyHeaderOpacity, paddingHorizontal: horizontalPad },
                ]}
                pointerEvents={stickyHeaderOpacity === 1 ? 'auto' : 'none'}
            >
                <TouchableOpacity style={styles.stickyBackBtn} onPress={handleBack} activeOpacity={0.8}>
                    <ArrowLeft size={20} color="#111827" strokeWidth={2.5} />
                </TouchableOpacity>
                <Text style={styles.stickyTitle} numberOfLines={1}>
                    {propertyName}
                </Text>
                <TouchableOpacity
                    style={styles.stickyBackBtn}
                    onPress={() => setIsSaved(!isSaved)}
                    activeOpacity={0.8}
                >
                    <Heart
                        size={20}
                        color={isSaved ? '#EF4444' : '#111827'}
                        fill={isSaved ? '#EF4444' : 'none'}
                        strokeWidth={2.5}
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* ── Main Scroll View ───────────────────────────────────────── */}
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                bounces
            >
                {/* Image Gallery — full bleed, part of scroll */}
                <ImageGallery
                    images={propertyImages}
                    heroHeight={heroHeight}
                    horizontalPad={horizontalPad}
                    isTablet={isTablet}
                    onBack={handleBack}
                    isSaved={isSaved}
                    setIsSaved={setIsSaved}
                />

                {/* Content */}
                <Animated.View
                    style={[
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%' },
                    ]}
                >
                    {isDesktop ? (
                        <View style={styles.desktopLayout}>
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

                    {/* CTA inline — no absolute positioning */}
                    {renderCTA()}

                    {/* Safe-area bottom spacing */}
                    <View style={{ height: Platform.OS === 'ios' ? 40 : 28 }} />
                </Animated.View>
            </Animated.ScrollView>
        </View>
    );
}

// ─── Section Sub-Components ───────────────────────────────────────────────────

function PropertyHeader({
    property,
    propertyName,
    propertyAddress,
    propertyPrice,
    propertyStatus,
    listingType,
    horizontalPad,
    isTablet,
    isDesktop,
}) {
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
                        {String(propertyStatus).charAt(0).toUpperCase() +
                            String(propertyStatus).slice(1).toLowerCase()}
                    </Text>
                </View>
                <View style={styles.verifiedBadge}>
                    <Award size={isTablet ? 16 : 14} color="#2D6A4F" strokeWidth={2} />
                    <Text style={[styles.verifiedText, isTablet && styles.badgeTextTablet]}>Verified</Text>
                </View>
            </View>

            <Text
                style={[
                    styles.title,
                    isTablet && styles.titleTablet,
                    isDesktop && styles.titleDesktop,
                ]}
            >
                {propertyName}
            </Text>

            <View style={styles.addressRow}>
                <View style={styles.addressIconCircle}>
                    <MapPin size={isTablet ? 16 : 14} color="#2D6A4F" strokeWidth={2} />
                </View>
                <Text style={[styles.address, isTablet && styles.addressTablet]}>
                    {propertyAddress}
                </Text>
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
                <SpecCard
                    icon={<Bed size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />}
                    label="Bedrooms"
                    value={bedrooms}
                />
                <SpecCard
                    icon={<Bath size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />}
                    label="Bathrooms"
                    value={bathrooms}
                />
                <SpecCard
                    icon={<Maximize size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />}
                    label="Area"
                    value={area}
                />
                <SpecCard
                    icon={<Calendar size={isTablet ? 26 : 22} color="#2D6A4F" strokeWidth={2.5} />}
                    label="Built"
                    value={builtYear}
                />
            </View>
        </View>
    );
}

function DescriptionSection({ description, horizontalPad, isTablet }) {
    const [expanded, setExpanded] = useState(false);
    const TRUNCATE = 180;
    const shouldTruncate = description.length > TRUNCATE;

    return (
        <View style={[styles.section, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                    Description
                </Text>
                <View style={styles.sectionDivider} />
            </View>
            <Text style={[styles.description, isTablet && styles.descriptionTablet]}>
                {shouldTruncate && !expanded
                    ? description.slice(0, TRUNCATE) + '…'
                    : description}
            </Text>
            {shouldTruncate && (
                <TouchableOpacity
                    onPress={() => setExpanded(!expanded)}
                    style={styles.readMoreBtn}
                    activeOpacity={0.7}
                >
                    <Text style={styles.readMoreText}>
                        {expanded ? 'Show Less' : 'Read More'}
                    </Text>
                </TouchableOpacity>
            )}
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
    } catch (e) { }

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
                            label={
                                feature.value ? `${feature.name}: ${feature.value}` : feature.name
                            }
                        />
                    ))
                ) : (
                    <Text
                        style={{
                            color: '#9CA3AF',
                            fontSize: isTablet ? 16 : 14,
                            paddingVertical: 8,
                        }}
                    >
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
                    <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                        Location
                    </Text>
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
                <Image
                    source={{ uri: propertyImages[0] }}
                    style={styles.mapImage}
                    blurRadius={10}
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                    style={styles.mapOverlay}
                >
                    <View style={[styles.mapLabel, { maxWidth: width - horizontalPad * 2 - 40 }]}>
                        <MapPin size={isTablet ? 22 : 20} color="#2D6A4F" strokeWidth={2.5} />
                        <Text
                            style={[styles.mapLabelText, isTablet && styles.mapLabelTextTablet]}
                            numberOfLines={1}
                        >
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
                    <View
                        key={s.label}
                        style={[styles.scoreCard, isTablet && styles.scoreCardTablet]}
                    >
                        <View
                            style={[styles.scoreCircle, isTablet && styles.scoreCircleTablet]}
                        >
                            <Text
                                style={[
                                    styles.scoreValue,
                                    isTablet && styles.scoreValueTablet,
                                ]}
                            >
                                {s.value}
                            </Text>
                        </View>
                        <Text
                            style={[styles.scoreLabel, isTablet && styles.scoreLabelTablet]}
                        >
                            {s.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function AgentSection({
    agentInitials,
    agentName,
    agentRole,
    handleAgentCall,
    handleAgentEmail,
    handleAgentChat,
    horizontalPad,
    isTablet,
}) {
    return (
        <View style={[styles.agentSection, { paddingHorizontal: horizontalPad }]}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                    Contact Agent
                </Text>
                <View style={styles.sectionDivider} />
            </View>
            <View style={styles.agentCard}>
                <View style={styles.agentHeader}>
                    <LinearGradient
                        colors={['#2D6A4F', '#1e4d38']}
                        style={[styles.agentAvatar, isTablet && styles.agentAvatarTablet]}
                    >
                        <Text
                            style={[
                                styles.agentInitials,
                                isTablet && styles.agentInitialsTablet,
                            ]}
                        >
                            {agentInitials}
                        </Text>
                    </LinearGradient>
                    <View style={styles.agentInfo}>
                        <Text style={[styles.agentName, isTablet && styles.agentNameTablet]}>
                            {agentName}
                        </Text>
                        <Text style={[styles.agentRole, isTablet && styles.agentRoleTablet]}>
                            {agentRole}
                        </Text>
                        <View style={styles.agentRatingRow}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    color="#F59E0B"
                                    fill="#F59E0B"
                                    strokeWidth={1.5}
                                />
                            ))}
                            <Text style={styles.agentRatingText}>5.0 · 48 reviews</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.contactButtons}>
                    {[
                        {
                            label: 'Call',
                            icon: (
                                <Phone
                                    size={isTablet ? 20 : 18}
                                    color="#2D6A4F"
                                    strokeWidth={2.5}
                                />
                            ),
                            onPress: handleAgentCall,
                        },
                        {
                            label: 'Email',
                            icon: (
                                <Mail
                                    size={isTablet ? 20 : 18}
                                    color="#2D6A4F"
                                    strokeWidth={2.5}
                                />
                            ),
                            onPress: handleAgentEmail,
                        },
                        {
                            label: 'Chat',
                            icon: (
                                <MessageCircle
                                    size={isTablet ? 20 : 18}
                                    color="#2D6A4F"
                                    strokeWidth={2.5}
                                />
                            ),
                            onPress: handleAgentChat,
                        },
                    ].map(({ label, icon, onPress }) => (
                        <TouchableOpacity
                            key={label}
                            style={[
                                styles.contactButton,
                                isTablet && styles.contactButtonTablet,
                            ]}
                            activeOpacity={0.7}
                            onPress={onPress}
                        >
                            <View
                                style={[
                                    styles.contactIconCircle,
                                    isTablet && styles.contactIconCircleTablet,
                                ]}
                            >
                                {icon}
                            </View>
                            <Text
                                style={[
                                    styles.contactButtonText,
                                    isTablet && styles.contactButtonTextTablet,
                                ]}
                            >
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
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    // Sticky Header
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 52 : 42,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
    },
    stickyBackBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginHorizontal: 12,
    },

    // Top Nav (over hero)
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
        zIndex: 10,
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

    // Gallery arrows
    arrowLeft: {
        position: 'absolute',
        left: 16,
        top: '50%',
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    arrowRight: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    // Dot indicators
    dotsRow: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
        backgroundColor: '#fff',
        width: 20,
    },

    // Image Counter
    imageCounter: {
        position: 'absolute',
        bottom: 16,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        zIndex: 10,
    },
    imageCounterText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

    // Desktop layout
    desktopLayout: {
        flexDirection: 'row',
        gap: 0,
        alignItems: 'flex-start',
    },
    desktopLeft: { flex: 1.4 },
    desktopRight: { flex: 1, borderLeftWidth: 1, borderLeftColor: '#F3F4F6' },

    // Property Header
    propertyHeader: {
        backgroundColor: '#FFFFFF',
        paddingTop: 24,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    badgeGreen: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 14,
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
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 10,
        letterSpacing: -0.5,
        lineHeight: 32,
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
        flexShrink: 0,
    },
    address: { flex: 1, fontSize: 14, color: '#6B7280', lineHeight: 22, fontWeight: '500' },
    addressTablet: { fontSize: 16, lineHeight: 24 },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    price: { fontSize: 32, fontWeight: '900', color: '#2D6A4F', letterSpacing: -1 },
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
    priceChange: { fontSize: 13, fontWeight: '700', color: '#10b981' },
    priceChangeTablet: { fontSize: 15 },

    // Specs
    specsSection: {
        paddingVertical: 20,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    specsGrid: { flexDirection: 'row', gap: 6, flexWrap: 'nowrap' },
    specCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
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
    specLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    specLabelTablet: { fontSize: 13 },

    // Generic Section
    section: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 24,
        marginTop: 8,
        borderRadius: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
    sectionTitleTablet: { fontSize: 22 },
    sectionDivider: { flex: 1, height: 2, backgroundColor: '#E5E7EB', borderRadius: 1 },
    description: { fontSize: 15, color: '#4B5563', lineHeight: 26, fontWeight: '400' },
    descriptionTablet: { fontSize: 16, lineHeight: 28 },

    // Read More
    readMoreBtn: { marginTop: 10, alignSelf: 'flex-start' },
    readMoreText: { color: '#2D6A4F', fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },

    // Features
    featuresSection: { backgroundColor: '#FFFFFF', paddingVertical: 24, marginTop: 8 },
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
    featureChipText: { fontSize: 13, color: '#374151', fontWeight: '600' },
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
    directionsText: { fontSize: 13, color: '#2D6A4F', fontWeight: '700' },
    directionsTextTablet: { fontSize: 15 },
    mapPlaceholder: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
        position: 'relative',
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
    mapLabelText: { fontSize: 14, color: '#111827', fontWeight: '700', flex: 1 },
    mapLabelTextTablet: { fontSize: 16 },
    scoreGrid: { flexDirection: 'row', gap: 12 },
    scoreCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    scoreCardTablet: { padding: 20, borderRadius: 20 },
    scoreCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(45,106,79,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreCircleTablet: { width: 68, height: 68, borderRadius: 34 },
    scoreValue: { fontSize: 20, fontWeight: '800', color: '#2D6A4F', letterSpacing: -0.5 },
    scoreValueTablet: { fontSize: 24 },
    scoreLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
    scoreLabelTablet: { fontSize: 14 },

    // Agent
    agentSection: { backgroundColor: '#FFFFFF', paddingVertical: 24, marginTop: 8 },
    agentCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    agentHeader: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    agentAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    agentAvatarTablet: { width: 80, height: 80, borderRadius: 40 },
    agentInitials: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
    agentInitialsTablet: { fontSize: 26 },
    agentInfo: { flex: 1, justifyContent: 'center' },
    agentName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 2 },
    agentNameTablet: { fontSize: 21 },
    agentRole: { fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: '500' },
    agentRoleTablet: { fontSize: 15 },
    agentRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    agentRatingText: { fontSize: 12, color: '#6B7280', marginLeft: 4, fontWeight: '600' },
    contactButtons: { flexDirection: 'row', gap: 10 },
    contactButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
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
    contactButtonText: { fontSize: 12, color: '#374151', fontWeight: '700' },
    contactButtonTextTablet: { fontSize: 14 },

    // CTA Section (inline in scroll)
    ctaSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 24,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    ctaRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    ctaRowTablet: { gap: 16, marginBottom: 14 },
    ctaButtonGreen: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    ctaButtonDark: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    ctaButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    ctaButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
    ctaButtonTextTablet: { fontSize: 17 },
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
    ctaButtonOutlineText: { color: '#2D6A4F', fontSize: 15, fontWeight: '700' },
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
    ctaButtonReportText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },

    // Unavailable
    statusBadgeDetail: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusBadgeDetailText: {
        color: '#FFF',
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
    unavailableText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});