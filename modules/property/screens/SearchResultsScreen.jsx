import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL, getImageUrl } from '../../../utils/api';
import {
  Search,
  Home,
  Heart,
  MessageCircle,
  User,
  ArrowLeft,
  SlidersHorizontal,
  Map,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Camera,
  Star,
  X,
  ChevronDown,
  TrendingUp,
  Sparkles
} from 'lucide-react-native';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';
const isSmallScreen = SCREEN_WIDTH < 768;
const isMediumScreen = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;
const isLargeScreen = SCREEN_WIDTH >= 1024;

// Responsive dimensions
const getResponsiveValue = (small, medium, large) => {
  if (isLargeScreen) return large;
  if (isMediumScreen) return medium;
  return small;
};

const CARD_WIDTH = getResponsiveValue(
  SCREEN_WIDTH - 32,
  (SCREEN_WIDTH - 48) / 2,
  (SCREEN_WIDTH - 80) / 3
);

const PropertyResultCard = ({
  image,
  price,
  title,
  location,
  beds,
  baths,
  sqft,
  highlights,
  imageCount = 1,
  featured = false,
  saved = false,
  onToggleSave,
  onQuickView,
  index,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer effect for featured cards
    if (featured) {
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
    }
  }, []);

  const handleSave = () => {
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.5,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation effect
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => rotateAnim.setValue(0));

    onToggleSave();
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const cardRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.propertyCard,
        {
          width: CARD_WIDTH,
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.95} onPress={onQuickView}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.propertyImage} resizeMode="cover" />

          {/* Animated gradient overlay */}
          <View style={styles.imageGradient} />

          {/* Shimmer effect for featured */}
          {featured && (
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerTranslate }],
                }
              ]}
            />
          )}

          {featured && (
            <View style={styles.featuredBadge}>
              <Sparkles size={14} color="#FFF" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}

          {imageCount > 1 && (
            <View style={styles.imageCountBadge}>
              <Camera size={12} color="#FFF" />
              <Text style={styles.imageCountText}>{imageCount}</Text>
            </View>
          )}

          <Animated.View style={{ transform: [{ scale: heartScale }, { rotate: cardRotate }] }}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Heart
                size={20}
                color={saved ? "#EF4444" : "#6B7280"}
                fill={saved ? "#EF4444" : "transparent"}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{price}</Text>
              <View style={styles.trendingBadge}>
                <TrendingUp size={12} color="#10B981" />
              </View>
            </View>
            <TouchableOpacity onPress={onQuickView} style={styles.quickViewButton}>
              <Text style={styles.quickViewText}>View</Text>
              <ArrowLeft size={14} color="#2D6A4F" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>

          <Text style={styles.titleText} numberOfLines={2}>{title}</Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          </View>

          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Bed size={16} color="#6B7280" />
              <Text style={styles.specText}>{beds}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Bath size={16} color="#6B7280" />
              <Text style={styles.specText}>{baths}</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
              <Maximize2 size={16} color="#6B7280" />
              <Text style={styles.specText}>{sqft}</Text>
            </View>
          </View>

          <Text style={styles.highlightsText} numberOfLines={2}>{highlights}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FilterChip = ({ label, onRemove, index }) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.filterChip,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.filterChipText}>{label}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.filterChipRemove}>
        <X size={14} color="#2D6A4F" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SearchResultsScreen({ navigation, onPropertyClick, onBack }) {
  const [savedProperties, setSavedProperties] = useState([]);
  const [activeFilters, setActiveFilters] = useState(['$400k - $800k', '3+ Beds', 'Modern']);
  const [sortOption, setSortOption] = useState('Relevance');
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('search');

  // City autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Search results states
  const [allProperties, setAllProperties] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef(null);

  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerHeight = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAllProperties();

    // FAB entrance with bounce
    Animated.spring(fabScale, {
      toValue: 1,
      tension: 50,
      friction: 6,
      delay: 1200,
      useNativeDriver: true,
    }).start();

    // Pulse animation for notification
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);

    const newOpacity = offsetY > 20 ? 0.98 : 1;
    const newHeight = offsetY > 100 ? -20 : 0;

    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: newOpacity,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerHeight, {
        toValue: newHeight,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleSave = (index) => {
    setSavedProperties((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const removeFilter = (filter) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    if (tab === 'home' && onBack) {
      onBack();
    }
  };

  const fetchAllProperties = async () => {
    try {
      setIsLoadingAll(true);
      const res = await fetch(`${API_BASE_URL}/properties`);
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        setAllProperties(data.properties);
      }
    } catch (e) {
      console.warn('Fetch all properties error:', e.message);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const fetchCitySuggestions = async (text) => {
    if (!text || text.trim().length === 0) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/properties/cities?search=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.cities)) {
        setCitySuggestions(data.cities);
        setShowSuggestions(data.cities.length > 0);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    } catch (e) {
      console.warn('City suggestion fetch error:', e.message);
    }
  };

  const handleSearchQueryChange = (text) => {
    setSearchQuery(text);
    setSelectedCity(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCitySuggestions(text), 350);
  };

  const handleCitySelect = (city) => {
    setSearchQuery(city);
    setSelectedCity(city);
    setCitySuggestions([]);
    setShowSuggestions(false);
    searchByCity(city);
  };

  const searchByCity = async (city) => {
    const target = city || selectedCity || searchQuery;
    if (!target || target.trim().length === 0) return;
    try {
      setIsSearching(true);
      setSearchError(null);
      setHasSearched(true);
      const res = await fetch(`${API_BASE_URL}/properties/search?city=${encodeURIComponent(target.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        setSearchResults(data.properties);
      } else {
        setSearchResults([]);
        setSearchError(data.message || 'No results found');
      }
    } catch (e) {
      console.warn('Search error:', e.message);
      setSearchError('Failed to fetch properties. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  };


  const handleBackPress = () => {
    // First try onBack callback (for non-navigation scenarios)
    if (onBack) {
      onBack();
    }
    // Then try navigation.goBack() (for React Navigation)
    else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
    // Fallback: try to navigate to home
    else if (navigation && navigation.navigate) {
      navigation.navigate('home');
    }
  };

  // Determine what to display
  const displayProperties = hasSearched ? searchResults : allProperties;

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerHeight }],
          }
        ]}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#111827" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.logoBox,
                  { transform: [{ rotate: logoRotation }] }
                ]}
              >
                <Home size={20} color="#FFF" />
              </Animated.View>
              <Text style={styles.logoText}>EStateHub</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapButton} activeOpacity={0.7}>
            <Map size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { zIndex: showSuggestions ? 1000 : 1 }]}>
          <View style={[styles.searchBar, { position: 'relative', zIndex: showSuggestions ? 999 : 1 }]}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchText}
              placeholder="Search by city..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearchQueryChange}
              onSubmitEditing={() => searchByCity()}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCity(null);
                  setCitySuggestions([]);
                  setShowSuggestions(false);
                }}
                style={{ marginRight: 4 }}
              >
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.8}
              onPress={() => searchByCity()}
            >
              {isSearching
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Search size={18} color="#FFF" />
              }
            </TouchableOpacity>
          </View>

          {/* City suggestions dropdown */}
          {showSuggestions && (
            <View style={styles.suggestionDropdown}>
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 220 }}
                showsVerticalScrollIndicator={false}
              >
                {citySuggestions.map((city, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.suggestionItem,
                      idx < citySuggestions.length - 1 && styles.suggestionBorder,
                    ]}
                    onPress={() => handleCitySelect(city)}
                    activeOpacity={0.7}
                  >
                    <MapPin size={14} color="#3B82F6" style={{ marginRight: 8 }} />
                    <Text style={styles.suggestionText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.resultsHeader}>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsTitle}>
              {hasSearched ? `Results in ${selectedCity || searchQuery}` : 'Search Results'}
            </Text>
            <View style={styles.resultsCountRow}>
              <View style={styles.pulse} />
              <Text style={styles.resultsCount}>
                {isSearching || isLoadingAll
                  ? 'Searching...'
                  : hasSearched
                    ? `${searchResults.length} Propert${searchResults.length === 1 ? 'y' : 'ies'} Found`
                    : `${allProperties.length} Properties Available`
                }
              </Text>
            </View>
          </View>

          <View style={styles.sortRow}>
            <TouchableOpacity style={styles.sortButton} activeOpacity={0.7}>
              <Text style={styles.sortText}>Sort: {sortOption}</Text>
              <ChevronDown size={16} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAllFilters} activeOpacity={0.7}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {activeFilters.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScroll}
              contentContainerStyle={styles.filtersContainer}
            >
              {activeFilters.map((filter, index) => (
                <FilterChip
                  key={index}
                  index={index}
                  label={filter}
                  onRemove={() => removeFilter(filter)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          isWeb && styles.webScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.gridContainer}>
          {isSearching || isLoadingAll ? (
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#2D6A4F" />
              <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 15, fontWeight: '600' }}>
                {isLoadingAll ? 'Loading lifestyle homes...' : `Finding properties in ${searchQuery}...`}
              </Text>
            </View>
          ) : searchError && hasSearched ? (
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 60 }}>
              <MapPin size={48} color="#D1D5DB" />
              <Text style={{ marginTop: 12, color: '#374151', fontSize: 17, fontWeight: '700' }}>No results</Text>
              <Text style={{ marginTop: 6, color: '#9CA3AF', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>
                {searchError}
              </Text>
            </View>
          ) : displayProperties.length === 0 && hasSearched ? (
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 60 }}>
              <MapPin size={48} color="#D1D5DB" />
              <Text style={{ marginTop: 12, color: '#374151', fontSize: 17, fontWeight: '700' }}>
                No properties in {selectedCity || searchQuery}
              </Text>
              <Text style={{ marginTop: 6, color: '#9CA3AF', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>
                Try searching a different city.
              </Text>
            </View>
          ) : (
            displayProperties.map((property, index) => (
              <PropertyResultCard
                key={property.id ?? index}
                index={index}
                image={getImageUrl(property.image) || getImageUrl(property.imageUrl) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                price={property.price ? `₹${Number(property.price).toLocaleString('en-IN')}` : property.price || 'N/A'}
                title={property.title || 'Property'}
                location={[property.address, property.city, property.state].filter(Boolean).join(', ') || property.location || ''}
                beds={property.bedrooms ?? property.beds ?? '—'}
                baths={property.bathrooms ?? property.baths ?? '—'}
                sqft={property.area || property.sqft || '—'}
                highlights={property.description || property.highlights || ''}
                imageCount={property.imageCount ?? 1}
                featured={property.featured ?? false}
                saved={savedProperties.includes(property.id ?? index)}
                onToggleSave={() => toggleSave(property.id ?? index)}
                onQuickView={() => onPropertyClick && onPropertyClick(property)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Refine Button with glow */}
      <Animated.View
        style={[
          styles.refineButton,
          {
            transform: [{ scale: fabScale }],
            bottom: isWeb ? 120 : 100,
          }
        ]}
      >
        <TouchableOpacity style={styles.refineButtonInner} activeOpacity={0.9}>
          <SlidersHorizontal size={18} color="#FFF" />
          <Text style={styles.refineButtonText}>Refine Search</Text>
        </TouchableOpacity>
      </Animated.View>

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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 1000,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveValue(16, 24, 32),
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 16,
    paddingBottom: 12,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)',
      },
    }),
  },
  logoText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    letterSpacing: -0.5,
  },
  mapButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    paddingHorizontal: getResponsiveValue(16, 24, 32),
    paddingBottom: 12,
    position: 'relative',
    overflow: 'visible',
  },
  searchBar: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: '#2D6A4F',
    padding: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(45, 106, 79, 0.3)',
      },
    }),
  },
  resultsHeader: {
    paddingHorizontal: getResponsiveValue(16, 24, 32),
    paddingBottom: 12,
  },
  resultsInfo: {
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: getResponsiveValue(22, 24, 26),
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  resultsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
  },
  clearAllText: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '800',
  },
  filtersScroll: {
    marginBottom: 4,
  },
  filtersContainer: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  filterChipText: {
    fontSize: 13,
    color: '#2D6A4F',
    fontWeight: '700',
  },
  filterChipRemove: {
    padding: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 16,
    paddingBottom: 140,
  },
  webScrollContent: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveValue(16, 16, 20),
    paddingHorizontal: getResponsiveValue(16, 24, 32),
    justifyContent: isLargeScreen ? 'flex-start' : 'center',
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      },
    }),
  },
  imageContainer: {
    height: CARD_WIDTH * 0.7,
    position: 'relative',
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 100,
  },
  featuredBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 2px 12px rgba(45, 106, 79, 0.5)',
      },
    }),
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  saveButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      },
    }),
  },
  cardContent: {
    padding: getResponsiveValue(16, 18, 20),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: getResponsiveValue(22, 24, 26),
    fontWeight: '900',
    color: '#2D6A4F',
    letterSpacing: -0.5,
  },
  trendingBadge: {
    backgroundColor: '#D1FAE5',
    padding: 4,
    borderRadius: 8,
  },
  quickViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quickViewText: {
    fontSize: 13,
    color: '#2D6A4F',
    fontWeight: '800',
  },
  titleText: {
    fontSize: getResponsiveValue(16, 17, 18),
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  specText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
  },
  highlightsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '500',
  },
  refineButton: {
    position: 'absolute',
    right: getResponsiveValue(20, 30, 40),
    zIndex: 999,
  },
  refineButtonInner: {
    backgroundColor: '#2D6A4F',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 6px 30px rgba(45, 106, 79, 0.5)',
      },
    }),
  },
  refineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // City autocomplete suggestion dropdown
  suggestionDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 14,
    zIndex: 9999,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
});