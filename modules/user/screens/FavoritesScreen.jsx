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
} from 'react-native';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Home,
  Heart,
  MessageCircle,
  User,
  Bed,
  Bath,
  Maximize,
  MapPin,
  ChevronLeft,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const FavoritesScreen = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('favorites');

  const favoriteProperties = [
    {
      id: '1',
      title: 'Luxury Downtown Apartment',
      location: 'Manhattan, New York',
      price: '$3,200/month',
      image: 'https://images.unsplash.com/photo-1662454419736-de132ff75638?w=400',
      beds: 2,
      baths: 2,
      area: 1200,
      tag: 'For Rent',
      savedDate: '2 days ago',
    },
    {
      id: '2',
      title: 'Modern Penthouse Suite',
      location: 'Downtown, Los Angeles',
      price: '$1,850,000',
      image: 'https://images.unsplash.com/photo-1568115286680-d203e08a8be6?w=400',
      beds: 3,
      baths: 3,
      area: 2400,
      tag: 'For Sale',
      savedDate: '5 days ago',
    },
    {
      id: '3',
      title: 'Contemporary Family Home',
      location: 'Suburban Hills, Seattle',
      price: '$925,000',
      image: 'https://images.unsplash.com/photo-1706808849777-96e0d7be3bb7?w=400',
      beds: 4,
      baths: 3,
      area: 3200,
      tag: 'New',
      savedDate: '1 week ago',
    },
    {
      id: '4',
      title: 'Beachfront Luxury Villa',
      location: 'Malibu Beach, California',
      price: '$4,500,000',
      image: 'https://images.unsplash.com/photo-1729808641871-8d8b5ade6bbe?w=400',
      beds: 5,
      baths: 4,
      area: 4800,
      tag: 'For Sale',
      savedDate: '2 weeks ago',
    },
    {
      id: '5',
      title: 'Industrial Loft Studio',
      location: 'Arts District, Chicago',
      price: '$2,100/month',
      image: 'https://images.unsplash.com/photo-1668438712649-ffd85f756de5?w=400',
      beds: 1,
      baths: 1,
      area: 850,
      tag: 'For Rent',
      savedDate: '3 weeks ago',
    },
  ];

  // Animation values - Initialize with proper dependencies
  const fadeAnims = useRef(
    favoriteProperties.map(() => new Animated.Value(0))
  ).current;
  const slideAnims = useRef(
    favoriteProperties.map(() => new Animated.Value(30))
  ).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const heartScales = useRef(
    favoriteProperties.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Scale in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Stagger animation for cards
    const animations = fadeAnims.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnims[index], {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(50, animations).start();

    // FAB pulse animation
    const pulseFab = () => {
      Animated.sequence([
        Animated.timing(fabScale, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start(() => pulseFab());
    };
    pulseFab();
  }, []);

  const filteredProperties = favoriteProperties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTagColor = (tag) => {
    switch (tag) {
      case 'For Sale':
        return '#3B82F6';
      case 'For Rent':
        return '#2D6A4F';
      case 'New':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const handleHeartPress = (index) => {
    Animated.sequence([
      Animated.spring(heartScales[index], {
        toValue: 1.3,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(heartScales[index], {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header with Background Image */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600',
          }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContent}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              {onBack && (
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>
              )}
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Home color="#fff" size={24} />
                </View>
                <Text style={styles.logoText}>EstateHub</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
              <SlidersHorizontal color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Heart color="#F87171" size={28} fill="#F87171" />
              <Text style={styles.title}>Your Favorites</Text>
            </View>
            <Text style={styles.subtitle}>
              Properties you love, saved for quick access
            </Text>
            <Text style={styles.propertyCount}>
              {favoriteProperties.length} saved properties
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={[styles.searchContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.searchBox}>
          <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved properties..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </Animated.View>

      {/* Properties List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart color="#D1D5DB" size={64} />
            <Text style={styles.emptyTitle}>No favorites found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Start exploring properties and save your favorites!'}
            </Text>
          </View>
        ) : (
          filteredProperties.map((property, index) => (
            <Animated.View
              key={property.id}
              style={[
                styles.card,
                {
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }],
                },
              ]}
            >
              {/* Property Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: property.image }}
                  style={styles.propertyImage}
                />

                {/* Tag */}
                {property.tag && (
                  <View
                    style={[
                      styles.tag,
                      { backgroundColor: getTagColor(property.tag) },
                    ]}
                  >
                    <Text style={styles.tagText}>{property.tag}</Text>
                  </View>
                )}

                {/* Favorite Button */}
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => handleHeartPress(index)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={{ transform: [{ scale: heartScales[index] }] }}
                  >
                    <Heart color="#EF4444" size={20} fill="#EF4444" />
                  </Animated.View>
                </TouchableOpacity>

                {/* Bottom Gradient Overlay */}
                <View style={styles.imageGradient} />
              </View>

              {/* Property Details */}
              <View style={styles.cardContent}>
                {/* Title and Location */}
                <View style={styles.titleContainer}>
                  <Text style={styles.propertyTitle} numberOfLines={1}>
                    {property.title}
                  </Text>
                  <View style={styles.locationRow}>
                    <MapPin color="#6B7280" size={16} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {property.location}
                    </Text>
                  </View>
                </View>

                {/* Price */}
                <Text style={styles.price}>{property.price}</Text>

                {/* Property Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Bed color="#6B7280" size={16} />
                    <Text style={styles.statText}>{property.beds} Beds</Text>
                  </View>
                  <View style={styles.stat}>
                    <Bath color="#6B7280" size={16} />
                    <Text style={styles.statText}>{property.baths} Baths</Text>
                  </View>
                  <View style={styles.stat}>
                    <Maximize color="#6B7280" size={16} />
                    <Text style={styles.statText}>
                      {property.area.toLocaleString()} sqft
                    </Text>
                  </View>
                </View>

                {/* Saved Date */}
                {property.savedDate && (
                  <View style={styles.savedDateContainer}>
                    <Text style={styles.savedDate}>
                      Saved {property.savedDate}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={[styles.fab, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity style={styles.fabButton} activeOpacity={0.8}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Home color="#9CA3AF" size={24} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Heart color="#2D6A4F" size={24} fill="#2D6A4F" />
          <Text style={[styles.navText, styles.navTextActive]}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <MessageCircle color="#9CA3AF" size={24} />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <User color="#9CA3AF" size={24} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
  },
  headerContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
  },
  filterButton: {
    padding: 8,
  },
  titleSection: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  subtitle: {
    color: '#E5E7EB',
    fontSize: 14,
    marginBottom: 8,
  },
  propertyCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
  },
  cardContent: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 12,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginLeft: 6,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 6,
  },
  savedDateContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  savedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  navTextActive: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
});

export default FavoritesScreen;