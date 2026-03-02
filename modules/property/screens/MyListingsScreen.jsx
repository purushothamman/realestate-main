import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Animated,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    MapPin,
    Home,
    Maximize2,
    Calendar,
    Edit,
    Trash2,
    Plus,
    MoreVertical,
    Eye
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';


const AnimatedCard = ({ item, navigation, statusStyle, formatPrice, index }) => {
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
        >
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('PropertyDetailScreen', {
                    property: {
                        ...item,
                        image: item.primaryImage
                    }
                })}
                activeOpacity={0.95}
            >
                {/* Image Container with Gradient Overlay */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: getImageUrl(item.primaryImage) || DEFAULT_PROPERTY_IMAGE }}
                        style={styles.cardImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)']}
                        style={styles.imageGradient}
                    />

                    {/* Status Badge on Image */}
                    <View style={[styles.statusBadgeFloat, { backgroundColor: statusStyle.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status || 'Active'}
                        </Text>
                    </View>

                    {/* Quick Action Button */}
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Eye width={18} height={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                    {/* Price and Menu */}
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.priceLabel}>Listing Price</Text>
                            <Text style={styles.price}>{formatPrice(item.price)}</Text>
                        </View>
                        <TouchableOpacity style={styles.menuButton}>
                            <MoreVertical width={20} height={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

                    {/* Location */}
                    <View style={styles.locationContainer}>
                        <View style={styles.iconCircle}>
                            <MapPin width={14} height={14} color="#2D6A4F" />
                        </View>
                        <Text style={styles.location} numberOfLines={1}>
                            {item.address}, {item.city}
                        </Text>
                    </View>

                    {/* Features Grid */}
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureBox}>
                            <View style={styles.featureIconContainer}>
                                <Home width={16} height={16} color="#2D6A4F" />
                            </View>
                            <Text style={styles.featureLabel}>Bedrooms</Text>
                            <Text style={styles.featureValue}>{item.bedrooms}</Text>
                        </View>

                        <View style={styles.featureDivider} />

                        <View style={styles.featureBox}>
                            <View style={styles.featureIconContainer}>
                                <Maximize2 width={16} height={16} color="#2D6A4F" />
                            </View>
                            <Text style={styles.featureLabel}>Area</Text>
                            <Text style={styles.featureValue}>{item.areaSqft} sqft</Text>
                        </View>

                        <View style={styles.featureDivider} />

                        <View style={styles.featureBox}>
                            <View style={styles.featureIconContainer}>
                                <Calendar width={16} height={16} color="#2D6A4F" />
                            </View>
                            <Text style={styles.featureLabel}>Listed</Text>
                            <Text style={styles.featureValue}>12d ago</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButtonPrimary}
                            onPress={() => navigation.navigate('PropertyEditScreen', {
                                property: item,
                                userRole: 'Agent' // Defaulting to Agent here as it's the agent's listings screen
                            })}
                        >
                            <Edit width={16} height={16} color="#fff" />
                            <Text style={styles.actionButtonPrimaryText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButtonSecondary}>
                            <Trash2 width={16} height={16} color="#ef4444" />
                            <Text style={styles.actionButtonSecondaryText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const MyListingsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const headerAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const getAuthToken = async () => {
        try {
            return await AsyncStorage.getItem('authToken');
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    };

    const fetchListings = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch(`${API_BASE_URL}/properties/my-properties`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setListings(data.properties);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch listings');
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            Alert.alert('Error', 'Failed to fetch listings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchListings();
    };

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(2)}M`;
        } else if (price >= 1000) {
            return `$${(price / 1000).toFixed(0)}K`;
        }
        return `$${price}`;
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
            case 'pending':
                return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
            case 'sold':
                return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
            default:
                return { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' };
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={styles.loadingText}>Loading your listings...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Enhanced Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [{
                            translateY: headerAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0]
                            })
                        }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft width={24} height={24} color="#1f2937" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>My Listings</Text>
                    <Text style={styles.headerSubtitle}>{listings.length} Properties</Text>
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('addPropertyAgent')}
                >
                    <LinearGradient
                        colors={['#2D6A4F', '#1e4d38']}
                        style={styles.addButtonGradient}
                    >
                        <Plus width={20} height={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#2D6A4F"
                        colors={['#2D6A4F']}
                    />
                }
            >
                {listings.length > 0 ? (
                    listings.map((item, index) => {
                        const statusStyle = getStatusStyle(item.status);

                        return (
                            <AnimatedCard
                                key={item.id}
                                item={item}
                                navigation={navigation}
                                statusStyle={statusStyle}
                                formatPrice={formatPrice}
                                index={index}
                            />
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Home width={48} height={48} color="#d1d5db" />
                        </View>
                        <Text style={styles.emptyTitle}>No Listings Yet</Text>
                        <Text style={styles.emptyText}>Start building your portfolio by adding your first property</Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('addPropertyAgent')}
                        >
                            <LinearGradient
                                colors={['#2D6A4F', '#1e4d38']}
                                style={styles.createButtonGradient}
                            >
                                <Plus width={20} height={20} color="#fff" />
                                <Text style={styles.createButtonText}>Add New Property</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    addButton: {
        padding: 4,
    },
    addButtonGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 220,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    statusBadgeFloat: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'capitalize',
        letterSpacing: 0.3,
    },
    quickActionButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    priceLabel: {
        fontSize: 11,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        fontWeight: '600',
    },
    price: {
        fontSize: 26,
        fontWeight: '800',
        color: '#2D6A4F',
        letterSpacing: -0.5,
    },
    menuButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
        lineHeight: 24,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    location: {
        fontSize: 14,
        color: '#6b7280',
        flex: 1,
    },
    featuresGrid: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    featureBox: {
        flex: 1,
        alignItems: 'center',
    },
    featureDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
    },
    featureIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    featureLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginBottom: 4,
        fontWeight: '500',
    },
    featureValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1f2937',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButtonPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D6A4F',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonPrimaryText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    actionButtonSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1.5,
        borderColor: '#fee2e2',
    },
    actionButtonSecondaryText: {
        color: '#ef4444',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 120,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    createButton: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 16,
        gap: 8,
    },
    createButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 15,
    },
});

export default MyListingsScreen;
