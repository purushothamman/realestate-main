import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  Image,
} from 'react-native';
import {
  Home,
  Search,
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
} from 'lucide-react-native';
import ProfileScreen from './ProfileScreen';
import ChatListScreen from '../../chat/screens/ChatListScreen';
import SearchResultsScreen from '../../property/screens/SearchResultsScreen';
import FavoritesScreen from './FavoritesScreen';
const { width, height } = Dimensions.get('window');

export default function HomeScreen({
  navigation,
  userName = 'Sarah',
  onHomeScreen,
  onSearchPress,
  onPropertyClick,
  onProfilePress,
  onMessagePress,
  onFavoritesPress,
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [screen, setScreen] = useState('home'); // ✅ FIX 1: Added missing screen state

  // ✅ FIX 2: Profile screen rendering with correct state management
  if (screen === 'home') {
    return (
      <HomeScreen
        onBack={() => setScreen('home')} // Go back to home screen
      />
    );
  }

  if (screen === 'profile') {
    return (
      <ProfileScreen
        onBack={() => setScreen('home')} // Go back to home screen
      />
    );
  }

  if (screen === 'message') {
    return (
      <ChatListScreen
        onBack={() => setScreen('home')} // Go back to home screen
      />
    )
  }

  if (screen === 'search') {
    return (
      <SearchResultsScreen
      onBack={() => setScreen('home')}
      />
    )
  }

  if (screen === 'favorites') {
    return (
      <FavoritesScreen
        onBack={() => setScreen('home')}
      />
    )
  }

  // Featured properties data
  const featuredProperties = [
    {
      id: '1',
      title: 'Modern Luxury Villa',
      price: '$2,450,000',
      location: 'Beverly Hills, CA',
      image:
        'https://images.unsplash.com/photo-1638369022547-1c763b1b9b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZXxlbnwxfHx8fDE3NjYxNzI2Njd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bedrooms: 5,
      bathrooms: 4,
      area: '4,200 sq ft',
      type: 'For Sale',
      description: 'Step into luxury with this stunning modern villa located in the heart of Beverly Hills.',
    },
    {
      id: '2',
      title: 'Luxury Apartment',
      price: '$3,800/mo',
      location: 'Manhattan, NY',
      image:
        'https://images.unsplash.com/photo-1654506012740-09321c969dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZ3xlbnwxfHx8fDE3NjYyMDg2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      bedrooms: 2,
      bathrooms: 2,
      area: '1,450 sq ft',
      type: 'For Rent',
      description: 'Beautiful luxury apartment in the heart of Manhattan with stunning city views.',
    },
    {
      id: '3',
      title: 'Contemporary Villa',
      price: '$1,850,000',
      location: 'Miami Beach, FL',
      image:
        'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NjE2NjI5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      bedrooms: 4,
      bathrooms: 3,
      area: '3,500 sq ft',
      type: 'For Sale',
      description: 'Contemporary villa with ocean views and modern amenities.',
    },
    {
      id: '4',
      title: 'Penthouse Suite',
      price: '$5,200/mo',
      location: 'Downtown LA',
      image:
        'https://images.unsplash.com/photo-1568115286680-d203e08a8be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjB2aWV3fGVufDF8fHx8MTc2NjEyNzI0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      bedrooms: 3,
      bathrooms: 2,
      area: '2,100 sq ft',
      type: 'For Rent',
      description: 'Stunning penthouse with panoramic city views and luxury finishes.',
    },
    {
      id: '5',
      title: 'Cozy Family Home',
      price: '$950,000',
      location: 'Austin, TX',
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      bedrooms: 3,
      bathrooms: 2,
      area: '1,850 sq ft',
      type: 'For Sale',
      description: 'Perfect family home in a quiet neighborhood with great schools.',
    },
    {
      id: '6',
      title: 'Beachside Condo',
      price: '$4,200/mo',
      location: 'San Diego, CA',
      image:
        'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      bedrooms: 2,
      bathrooms: 2,
      area: '1,300 sq ft',
      type: 'For Rent',
      description: 'Beachfront condo with direct beach access and ocean views.',
    },
    {
      id: '7',
      title: 'Mountain View Cabin',
      price: '$1,250,000',
      location: 'Aspen, CO',
      image:
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      bedrooms: 4,
      bathrooms: 3,
      area: '2,800 sq ft',
      type: 'For Sale',
      description: 'Luxury mountain cabin with breathtaking views and ski-in/ski-out access.',
    },
  ];

  const quickActions = [
    { id: 'buy', label: 'Buy', icon: Home, color: '#2D6A4F' },
    { id: 'rent', label: 'Rent', icon: Key, color: '#4A90E2' },
    { id: 'sell', label: 'Sell', icon: TrendingUp, color: '#E27D4A' },
    { id: 'agents', label: 'Agents', icon: Users, color: '#9B59B6' },
  ];

  // ✅ FIX 3: Updated handleTabPress to handle profile navigation
  const handleTabPress = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'home') {
      setScreen('home');
      if (onHomeScreen) {
        onHomeScreen(); // Call the callback if provided
      }
    }

    if (tab === 'profile') {
      setScreen('profile'); // Switch to profile screen
      if (onProfilePress) {
        onProfilePress(); // Also call the callback if provided
      }
    }

    if (tab === 'messages') {
      setScreen('message'); // Switch to message screen
      if (onMessagePress) {
        onMessagePress();
      }
    }

    if (tab === 'search') {
      setScreen('search');
      if (onSearchPress) {
        onSearchPress();
      }
    }
    
    if (tab === 'favorites') {
      setScreen('favorites');
      if (onFavoritesPress) {
        onFavoritesPress();
      }
    }

  };

  

  // Handle property click - navigate to PropertyDetail screen
  const handlePropertyClick = (property) => {
    console.log('Property clicked in HomeScreen:', property.title);
    
    // Check if navigation object exists and has navigate method
    if (navigation && navigation.navigate) {
      navigation.navigate('PropertyDetail', { property });
    } else if (onPropertyClick) {
      // Fallback to callback if navigation is not available
      onPropertyClick(property);
    } else {
      console.warn('Navigation not configured properly');
    }
  };

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
        <TouchableOpacity style={styles.notificationButton}>
          <Bell color="#374151" size={24} strokeWidth={2} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Background */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1757233451731-9a34e164b208?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMGJ1aWxkaW5nc3xlbnwxfHx8fDE3NjYyMjU3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />

            {/* Welcome Text */}
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Welcome Back, {userName}</Text>
              <Text style={styles.heroSubtitle}>
                Find your dream home from 1,200+ properties
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search
              color="#9CA3AF"
              size={20}
              strokeWidth={2}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location, price, or type..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Saved</Text>
            <Text style={styles.statValue}>24</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Viewed</Text>
            <Text style={styles.statValue}>156</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>New</Text>
            <Text style={styles.statValue}>12</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                activeOpacity={0.7}
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
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Scrollable Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScrollContent}
          >
            {featuredProperties.map((property) => (
              <TouchableOpacity
                key={property.id}
                style={styles.propertyCard}
                onPress={() => handlePropertyClick(property)}
                activeOpacity={0.9}
              >
                {/* Property Image */}
                <View style={styles.propertyImageContainer}>
                  <Image
                    source={{ uri: property.image }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                  />
                  {/* Type Badge */}
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{property.type}</Text>
                  </View>
                  {/* Favorite Button */}
                  <TouchableOpacity 
                    style={styles.favoriteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      console.log('Favorite clicked for:', property.title);
                    }}
                  >
                    <Heart color="#374151" size={16} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                {/* Property Details */}
                <View style={styles.propertyDetails}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {property.title}
                  </Text>
                  <View style={styles.propertyLocation}>
                    <MapPin color="#9CA3AF" size={12} strokeWidth={2} />
                    <Text style={styles.propertyLocationText} numberOfLines={1}>
                      {property.location}
                    </Text>
                  </View>

                  {/* Property Stats */}
                  <View style={styles.propertyStats}>
                    <View style={styles.propertyStat}>
                      <Bed color="#9CA3AF" size={16} strokeWidth={2} />
                      <Text style={styles.propertyStatText}>
                        {property.bedrooms}
                      </Text>
                    </View>
                    <View style={styles.propertyStat}>
                      <Bath color="#9CA3AF" size={16} strokeWidth={2} />
                      <Text style={styles.propertyStatText}>
                        {property.bathrooms}
                      </Text>
                    </View>
                    <View style={styles.propertyStat}>
                      <Maximize color="#9CA3AF" size={16} strokeWidth={2} />
                      <Text style={styles.propertyStatText}>
                        {property.area}
                      </Text>
                    </View>
                  </View>

                  {/* Price */}
                  <Text style={styles.propertyPrice}>{property.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Section */}
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>

          {/* List View Properties */}
          <View style={styles.recommendedList}>
            {featuredProperties.slice(0, 3).map((property) => (
              <TouchableOpacity
                key={property.id}
                style={styles.recommendedCard}
                onPress={() => handlePropertyClick(property)}
                activeOpacity={0.9}
              >
                {/* Image */}
                <Image
                  source={{ uri: property.image }}
                  style={styles.recommendedImage}
                  resizeMode="cover"
                />

                {/* Details */}
                <View style={styles.recommendedDetails}>
                  <View style={styles.recommendedTop}>
                    <Text style={styles.recommendedTitle} numberOfLines={1}>
                      {property.title}
                    </Text>
                    <View style={styles.recommendedLocation}>
                      <MapPin color="#9CA3AF" size={12} strokeWidth={2} />
                      <Text
                        style={styles.recommendedLocationText}
                        numberOfLines={1}
                      >
                        {property.location}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recommendedBottom}>
                    <Text style={styles.recommendedPrice}>
                      {property.price}
                    </Text>
                    <View style={styles.recommendedStats}>
                      <View style={styles.recommendedStat}>
                        <Bed color="#9CA3AF" size={12} strokeWidth={2} />
                        <Text style={styles.recommendedStatText}>
                          {property.bedrooms}
                        </Text>
                      </View>
                      <View style={styles.recommendedStat}>
                        <Bath color="#9CA3AF" size={12} strokeWidth={2} />
                        <Text style={styles.recommendedStatText}>
                          {property.bathrooms}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA Banner */}
        <View style={styles.ctaBanner}>
          <Text style={styles.ctaTitle}>Looking to Sell?</Text>
          <Text style={styles.ctaSubtitle}>
            Get a free property valuation and connect with top agents
          </Text>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
            <Text style={styles.ctaButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('home')}
        >
          <Home
            color={activeTab === 'home' ? '#2D6A4F' : '#9CA3AF'}
            size={24}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'home' && styles.navLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('search')}
        >
          <Search
            color={activeTab === 'search' ? '#2D6A4F' : '#9CA3AF'}
            size={24}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'search' && styles.navLabelActive,
            ]}
          >
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('favorites')}
        >
          <Heart
            color={activeTab === 'favorites' ? '#2D6A4F' : '#9CA3AF'}
            size={24}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'favorites' && styles.navLabelActive,
            ]}
          >
            Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('messages')}
        >
          <View>
            <MessageCircle
              color={activeTab === 'messages' ? '#2D6A4F' : '#9CA3AF'}
              size={24}
              strokeWidth={2}
            />
            <View style={styles.messageBadge}>
              <Text style={styles.messageBadgeText}>2</Text>
            </View>
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === 'messages' && styles.navLabelActive,
            ]}
          >
            Messages
          </Text>
        </TouchableOpacity>

        {/* ✅ FIX 4: Corrected Profile tab with proper onPress handler */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress('profile')}
        >
          <User
            color={activeTab === 'profile' ? '#2D6A4F' : '#9CA3AF'}
            size={24}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === 'profile' && styles.navLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    width: 16,
    height: 16,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
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
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: -24,
    marginBottom: 24,
    zIndex: 10,
  },
  searchWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 14,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
  recommendedImage: {
    width: 112,
    height: 112,
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  navLabelActive: {
    color: '#2D6A4F',
  },
  messageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});