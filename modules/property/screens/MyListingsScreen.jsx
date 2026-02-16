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
    RefreshControl
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
    Plus
} from 'lucide-react-native';

const API_BASE_URL = 'http://localhost:5000/api';

const MyListingsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

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
                return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' };
            case 'pending':
                return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' };
            case 'sold':
                return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
            default:
                return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' };
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6A4F" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft width={24} height={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Listings</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('addPropertyAgent')}
                >
                    <Plus width={24} height={24} color="#2D6A4F" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {listings.length > 0 ? (
                    listings.map((item) => {
                        const statusStyle = getStatusStyle(item.status);

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('PropertyDetailScreen', {
                                    property: {
                                        ...item,
                                        image: item.primaryImage
                                    }
                                })}
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={{ uri: item.primaryImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800' }}
                                    style={styles.cardImage}
                                />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.priceContainer}>
                                            <Text style={styles.price}>{formatPrice(item.price)}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                {item.status || 'Active'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

                                    <View style={styles.locationContainer}>
                                        <MapPin width={14} height={14} color="#6b7280" />
                                        <Text style={styles.location} numberOfLines={1}>
                                            {item.address}, {item.city}
                                        </Text>
                                    </View>

                                    <View style={styles.features}>
                                        <View style={styles.feature}>
                                            <Home width={14} height={14} color="#6b7280" />
                                            <Text style={styles.featureText}>{item.bedrooms} Beds</Text>
                                        </View>
                                        <View style={styles.feature}>
                                            <Maximize2 width={14} height={14} color="#6b7280" />
                                            <Text style={styles.featureText}>{item.areaSqft} sqft</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No listings found</Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('addPropertyAgent')}
                        >
                            <Text style={styles.createButtonText}>Add New Property</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ height: 20 }} />
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    addButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D6A4F',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 4,
    },
    location: {
        fontSize: 14,
        color: '#6b7280',
        flex: 1,
    },
    features: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 14,
        color: '#4b5563',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#2D6A4F',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    }
});

export default MyListingsScreen;
