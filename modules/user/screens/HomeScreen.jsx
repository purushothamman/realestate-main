import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Home,
  Heart,
  MessageCircle,
  User,
  Bell,
  MapPin,
  TrendingUp,
  Key,
  Users,
  Bed,
  Bath,
  Maximize,
  AlertCircle,
} from 'lucide-react-native';

// Import UserNavigator component
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';



export default function HomeScreen({ navigation }) {
  // State Management
  const [selectedProperty, setSelectedProperty] = useState(null);


  // User State
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Data State
  const [properties, setProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load user data and fetch initial data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user data from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      const userStr = await AsyncStorage.getItem('user');

      if (!token || !userStr) {
        // User not logged in, redirect to login
        console.log('❌ No auth token found, redirecting to login');
        navigation.replace('Login');
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);
      setAuthToken(token);

      console.log('✅ User loaded:', userData.name);

      // Fetch all initial data
      await Promise.all([
        fetchProperties(token),
        // fetchUserStats(token, userData.id),
        // fetchNotifications(token, userData.id),
        // fetchMessages(token, userData.id),
      ]);

    } catch (err) {
      console.error('❌ Initialization error:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Properties
  const fetchProperties = async (token) => {
    try {
      console.log('📥 Fetching properties...');

      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch properties`);
      }

      const data = await response.json();
      console.log('✅ Properties loaded:', data.properties?.length || 0);

      setProperties(data.properties || []);
    } catch (err) {
      console.error('❌ Error fetching properties:', err);
      // Use fallback mock data if API fails
      // setProperties(mockProperties);
      setProperties([]);
    }
  };

  // Fetch User Stats
  // const fetchUserStats = async (token, userId) => {
  //   try {
  //     console.log('📊 Fetching user stats...');

  //     const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch stats');
  //     }

  //     const data = await response.json();
  //     console.log('✅ Stats loaded:', data.stats);

  //     setStats(data.stats || { saved: 0, viewed: 0, new: 0 });
  //   } catch (err) {
  //     console.error('❌ Error fetching stats:', err);
  //     // Keep default stats
  //   }
  // };

  // Fetch Notifications
  // const fetchNotifications = async (token, userId) => {
  //   try {
  //     console.log('🔔 Fetching notifications...');

  //     const response = await fetch(`${API_BASE_URL}/users/${userId}/notifications`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch notifications');
  //     }

  //     const data = await response.json();
  //     console.log('✅ Notifications loaded:', data.notifications?.length || 0);

  //     setNotifications(data.notifications || []);
  //   } catch (err) {
  //     console.error('❌ Error fetching notifications:', err);
  //   }
  // };

  // Fetch Messages
  // const fetchMessages = async (token, userId) => {
  //   try {
  //     console.log('💬 Fetching messages...');

  //     const response = await fetch(`${API_BASE_URL}/users/${userId}/messages/unread`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch messages');
  //     }

  //     const data = await response.json();
  //     console.log('✅ Unread messages:', data.unreadCount || 0);

  //     setMessages(data.messages || []);
  //   } catch (err) {
  //     console.error('❌ Error fetching messages:', err);
  //   }
  // };

  // Handle Pull to Refresh
  const onRefresh = useCallback(async () => {
    if (!authToken || !user) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchProperties(authToken),
        // fetchUserStats(authToken, user.id),
        // fetchNotifications(authToken, user.id),
        // fetchMessages(authToken, user.id),
      ]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [authToken, user]);

  // Toggle Favorite
  const toggleFavorite = async (propertyId) => {
    try {
      console.log('❤️ Toggling favorite for property:', propertyId);

      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      console.log('✅ Favorite toggled:', data.isFavorited);

      // Update local state
      setProperties(prevProperties =>
        prevProperties.map(prop =>
          prop.id === propertyId
            ? { ...prop, isFavorited: data.isFavorited }
            : prop
        )
      );

    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  // Handle Tab Press
  const handleTabPress = (tab) => {
    console.log('Tab pressed:', tab);
    setActiveTab(tab);
    setScreen(tab);
  };

  // Handle Property Click
  const handlePropertyClick = async (property) => {
    console.log('🏠 Property clicked:', property.title);

    try {
      // Track property view
      await fetch(`${API_BASE_URL}/properties/${property.id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }

    if (navigation?.navigate) {
      navigation.navigate('propertyDetail', { property });
    }
  };


  // Quick Actions Data
  const quickActions = [
    { id: 'buy', label: 'Buy', icon: Home, color: '#2D6A4F' },
    { id: 'rent', label: 'Rent', icon: Key, color: '#4A90E2' },
    { id: 'sell', label: 'Sell', icon: TrendingUp, color: '#E27D4A' },
    { id: 'agents', label: 'Agents', icon: Users, color: '#9B59B6' },
  ];

  // Loading State
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.loadingText}>Loading your properties...</Text>
      </View>
    );
  }

  // Error State
  if (error && !user) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle color="#EF4444" size={48} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Otherwise render the home screen

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Home color="#FFFFFF" size={20} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>EstateHub</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              const role = user?.role;
              if (role === 'agent') navigation.navigate('agentNotifications');
              else if (role === 'builder') navigation.navigate('builderNotifications');
              else navigation.navigate('buyerNotifications');
            }}
          >
            <Bell color="#374151" size={24} strokeWidth={2} />

            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#2D6A4F']}
            tintColor="#2D6A4F"
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1757233451731-9a34e164b208?w=1080',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                Welcome Back, {user?.name || 'User'}
              </Text>
              <Text style={styles.heroSubtitle}>
                Find your dream home from {properties.length}+ properties
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions
            .filter(action => {
              // Only show 'Sell' to builders and agents
              if (action.id === 'sell') {
                return user?.role === 'builder' || user?.role === 'agent';
              }
              return true;
            })
            .map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickAction}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Quick action:', action.id);
                    // Navigate based on action
                    if (action.id === 'sell') {
                      // Navigate to sell property screen
                    }
                  }}
                >
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${action.color}15` },
                    ]}
                  >
                    <IconComponent color={action.color} size={24} strokeWidth={2} />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* Featured Properties */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Properties</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('searchResults')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>

          </View>

          {properties.length === 0 ? (
            <View style={styles.emptyState}>
              <Home color="#9CA3AF" size={48} />
              <Text style={styles.emptyStateText}>No properties available</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScrollContent}
            >
              {properties.slice(0, 7).map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.propertyCard}
                  onPress={() => handlePropertyClick(property)}
                  activeOpacity={0.9}
                >
                  {/* Property Image */}
                  <View style={[styles.propertyImageContainer, (property.status === 'sold' || property.status === 'rented') && { opacity: 0.6 }]}>
                    <Image
                      source={{ uri: getImageUrl(property.image || property.imageUrl) || DEFAULT_PROPERTY_IMAGE }}
                      style={styles.propertyImage}
                      resizeMode="cover"
                    />
                    {/* Status Badge */}
                    {(property.status === 'sold' || property.status === 'rented') && (
                      <View style={[styles.statusBadge, { backgroundColor: property.status === 'sold' ? '#EF4444' : '#3B82F6' }]}>
                        <Text style={styles.statusBadgeText}>
                          {property.status === 'sold' ? 'Sold' : 'Rented'}
                        </Text>
                      </View>
                    )}
                    {/* Type Badge */}
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {property.type || property.listingType}
                      </Text>
                    </View>
                    {/* Favorite Button */}
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                    >
                      <Heart
                        color={property.isFavorited ? '#EF4444' : '#374151'}
                        size={16}
                        strokeWidth={2}
                        fill={property.isFavorited ? '#EF4444' : 'none'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Property Details */}
                  <View style={styles.propertyDetails}>
                    <Text style={styles.propertyTitle} numberOfLines={1}>
                      {property.title || property.name}
                    </Text>
                    <View style={styles.propertyLocation}>
                      <MapPin color="#9CA3AF" size={12} strokeWidth={2} />
                      <Text style={styles.propertyLocationText} numberOfLines={1}>
                        {property.location || property.address}
                      </Text>
                    </View>

                    {/* Property Stats */}
                    <View style={styles.propertyStats}>
                      <View style={styles.propertyStat}>
                        <Bed color="#9CA3AF" size={16} strokeWidth={2} />
                        <Text style={styles.propertyStatText}>
                          {property.bedrooms || property.beds}
                        </Text>
                      </View>
                      <View style={styles.propertyStat}>
                        <Bath color="#9CA3AF" size={16} strokeWidth={2} />
                        <Text style={styles.propertyStatText}>
                          {property.bathrooms || property.baths}
                        </Text>
                      </View>
                      <View style={styles.propertyStat}>
                        <Maximize color="#9CA3AF" size={16} strokeWidth={2} />
                        <Text style={styles.propertyStatText}>
                          {property.area || property.sqft}
                        </Text>
                      </View>
                    </View>

                    {/* Price */}
                    <Text style={styles.propertyPrice}>
                      ${property.price?.toLocaleString() || property.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recommended Section */}
        {properties.length > 0 && (
          <View style={styles.recommendedSection}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <View style={styles.recommendedList}>
              {properties.slice(0, 3).map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.recommendedCard}
                  onPress={() => handlePropertyClick(property)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.recommendedImageContainer, (property.status === 'sold' || property.status === 'rented') && { opacity: 0.6 }]}>
                    <Image
                      source={{ uri: getImageUrl(property.image || property.imageUrl) || DEFAULT_PROPERTY_IMAGE }}
                      style={styles.recommendedImage}
                      resizeMode="cover"
                    />
                    {/* Status Badge */}
                    {(property.status === 'sold' || property.status === 'rented') && (
                      <View style={[styles.statusBadgeSmall, { backgroundColor: property.status === 'sold' ? '#EF4444' : '#3B82F6' }]}>
                        <Text style={styles.statusBadgeTextSmall}>
                          {property.status === 'sold' ? 'Sold' : 'Rented'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.recommendedDetails}>
                    <View style={styles.recommendedTop}>
                      <Text style={styles.recommendedTitle} numberOfLines={1}>
                        {property.title || property.name}
                      </Text>
                      <View style={styles.recommendedLocation}>
                        <MapPin color="#9CA3AF" size={12} strokeWidth={2} />
                        <Text style={styles.recommendedLocationText} numberOfLines={1}>
                          {property.location || property.address}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.recommendedBottom}>
                      <Text style={styles.recommendedPrice}>
                        ${property.price?.toLocaleString() || property.price}
                      </Text>
                      <View style={styles.recommendedStats}>
                        <View style={styles.recommendedStat}>
                          <Bed color="#9CA3AF" size={12} strokeWidth={2} />
                          <Text style={styles.recommendedStatText}>
                            {property.bedrooms || property.beds}
                          </Text>
                        </View>
                        <View style={styles.recommendedStat}>
                          <Bath color="#9CA3AF" size={12} strokeWidth={2} />
                          <Text style={styles.recommendedStatText}>
                            {property.bathrooms || property.baths}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* CTA Banner - Only show for Builders and Agents */}
        {(user?.role === 'builder' || user?.role === 'agent') && (
          <View style={styles.ctaBanner}>
            <Text style={styles.ctaTitle}>Looking to Sell?</Text>
            <Text style={styles.ctaSubtitle}>
              Get a free property valuation and connect with top agents
            </Text>
            <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>


  );
}

// Mock data fallback
const mockProperties = [
  {
    id: '1',
    title: 'Modern Luxury Villa',
    price: 2450000,
    location: 'Beverly Hills, CA',
    image: 'https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b?w=1080',
    bedrooms: 5,
    bathrooms: 4,
    area: '4,200 sq ft',
    type: 'For Sale',
    isFavorited: false,
  },
  {
    id: '2',
    title: 'Luxury Apartment',
    price: 3800,
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1654506012740-09321c969dc2?w=1080',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,450 sq ft',
    type: 'For Rent',
    isFavorited: false,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: '#2D6A4F',
    fontSize: 18,
    fontWeight: '600',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    backgroundColor: '#2D6A4F',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 90,
  },
  heroSection: {
    height: 192,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 24,
    gap: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    color: '#374151',
    fontSize: 12,
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllButton: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  featuredScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  propertyCard: {
    width: 256,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  propertyImageContainer: {
    position: 'relative',
    height: 160,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyDetails: {
    padding: 16,
  },
  propertyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  propertyLocationText: {
    color: '#6B7280',
    fontSize: 12,
    flex: 1,
  },
  propertyStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  propertyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  propertyStatText: {
    color: '#6B7280',
    fontSize: 12,
  },
  propertyPrice: {
    color: '#2D6A4F',
    fontSize: 20,
    fontWeight: '700',
  },
  recommendedSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  recommendedList: {
    marginTop: 16,
    gap: 12,
  },
  recommendedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedImageContainer: {
    width: 112,
    height: 112,
    position: 'relative',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
  },
  statusBadgeSmall: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 2,
  },
  statusBadgeTextSmall: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  recommendedDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recommendedTop: {
    flex: 1,
  },
  recommendedTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendedLocationText: {
    color: '#6B7280',
    fontSize: 12,
    flex: 1,
  },
  recommendedBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedPrice: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: '700',
  },
  recommendedStats: {
    flexDirection: 'row',
    gap: 8,
  },
  recommendedStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendedStatText: {
    color: '#6B7280',
    fontSize: 12,
  },
  ctaBanner: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    color: '#2D6A4F',
    fontSize: 14,
    fontWeight: '600',
  },
});