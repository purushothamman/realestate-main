import React, { useState } from 'react';
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
} from 'react-native';
import {
  Search,
  Home,
  Heart,
  MessageCircle,
  User,
  ArrowLeft,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Map,
  ChevronDown,
  X,
  Camera,
  Star,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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
}) => (
  <View style={styles.propertyCard}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: image }} style={styles.propertyImage} resizeMode="cover" />
      {featured && (
        <View style={styles.featuredBadge}>
          <Star size={12} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      {imageCount > 1 && (
        <View style={styles.imageCountBadge}>
          <Camera size={12} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.imageCountText}>{imageCount}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.saveButton} onPress={onToggleSave}>
        <Heart
          size={20}
          color={saved ? '#EF4444' : '#374151'}
          fill={saved ? '#EF4444' : 'none'}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.priceText}>{price}</Text>
        <TouchableOpacity onPress={onQuickView}>
          <Text style={styles.quickViewText}>Quick View</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.titleText}>{title}</Text>
      <View style={styles.locationRow}>
        <MapPin size={16} color="#6B7280" strokeWidth={2} />
        <Text style={styles.locationText}>{location}</Text>
      </View>
      <View style={styles.specsRow}>
        <View style={styles.specItem}>
          <Bed size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.specText}>{beds} Beds</Text>
        </View>
        <View style={styles.specItem}>
          <Bath size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.specText}>{baths} Baths</Text>
        </View>
        <View style={styles.specItem}>
          <Maximize size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.specText}>{sqft}</Text>
        </View>
      </View>
      <Text style={styles.highlightsText}>{highlights}</Text>
    </View>
  </View>
);

const FilterChip = ({ label, onRemove }) => (
  <View style={styles.filterChip}>
    <Text style={styles.filterChipText}>{label}</Text>
    <TouchableOpacity onPress={onRemove} style={styles.filterChipRemove}>
      <X size={14} color="#2563EB" strokeWidth={2} />
    </TouchableOpacity>
  </View>
);

export default function SearchResultsScreen({ navigation, onPropertyClick }) {
  const [savedProperties, setSavedProperties] = useState([0, 3]);
  const [activeFilters, setActiveFilters] = useState([
    '$400k - $800k',
    '3+ Beds',
    'Modern',
  ]);
  const [sortOption, setSortOption] = useState('Relevance');

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

  const properties = [
    {
      image:
        'https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NjE0Mzk2MHww&ixlib=rb-4.1.0&q=80&w=1080',
      price: '$789,000',
      title: 'Modern Architectural Masterpiece',
      location: '1245 Sunset Blvd, Los Angeles, CA',
      beds: 4,
      baths: 3,
      sqft: '3,400 sqft',
      highlights: 'Modern kitchen, open floor plan, rooftop terrace',
      imageCount: 24,
      featured: true,
    },
    {
      image:
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjYyMTE0NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      price: '$525,000',
      title: 'Luxury High-Rise Apartment',
      location: '890 Park Avenue, New York, NY',
      beds: 3,
      baths: 2,
      sqft: '2,100 sqft',
      highlights: 'City views, doorman, modern finishes, gym access',
      imageCount: 18,
      featured: false,
    },
    {
      image:
        'https://images.unsplash.com/photo-1630404515111-2fc17457daa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjB0b3duaG91c2V8ZW58MXx8fHwxNzY2MjM0MDk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
      price: '$645,000',
      title: 'Contemporary Townhouse',
      location: '567 Maple Street, Seattle, WA',
      beds: 3,
      baths: 2,
      sqft: '2,500 sqft',
      highlights: 'Private garage, backyard, newly renovated',
      imageCount: 15,
      featured: false,
    },
    {
      image:
        'https://images.unsplash.com/photo-1677553512940-f79af72efd1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjYxNDMzMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      price: '$1,150,000',
      title: 'Stunning Penthouse Suite',
      location: '234 Ocean Drive, Miami, FL',
      beds: 4,
      baths: 4,
      sqft: '3,800 sqft',
      highlights: 'Ocean views, marble finishes, wine cellar, pool',
      imageCount: 32,
      featured: true,
    },
    {
      image:
        'https://images.unsplash.com/photo-1765765234094-bc009a3bba62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWJ1cmJhbiUyMGZhbWlseSUyMGhvbWV8ZW58MXx8fHwxNzY2MTcyNjY4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      price: '$575,000',
      title: 'Spacious Family Home',
      location: '789 Oak Lane, Austin, TX',
      beds: 5,
      baths: 3,
      sqft: '3,200 sqft',
      highlights: 'Large yard, updated kitchen, home office, pool',
      imageCount: 20,
      featured: false,
    },
    {
      image:
        'https://images.unsplash.com/photo-1614115863913-b04024ec4ed1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwYXBhcnRtZW50fGVufDF8fHx8MTc2NjIzNDA5NXww&ixlib=rb-4.1.0&q=80&w=1080',
      price: '$485,000',
      title: 'Modern Downtown Loft',
      location: '456 Broadway, Chicago, IL',
      beds: 2,
      baths: 2,
      sqft: '1,900 sqft',
      highlights: 'High ceilings, exposed brick, hardwood floors',
      imageCount: 16,
      featured: false,
    },
  ];

  const handleQuickView = (property) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Fixed Header */}
      <View style={styles.header}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation && navigation.goBack()}
            >
              <ArrowLeft size={20} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Home size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text style={styles.logoText}>DreamHome</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapButton}>
            <Map size={20} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.searchText}>Los Angeles, CA</Text>
            <TouchableOpacity style={styles.filterButton}>
              <SlidersHorizontal size={20} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsTitle}>Search Results</Text>
            <Text style={styles.resultsCount}>248 Properties Found</Text>
          </View>

          {/* Sort & Clear Row */}
          <View style={styles.sortRow}>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortText}>Sort: {sortOption}</Text>
              <ChevronDown size={16} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <View style={styles.filtersContainer}>
              {activeFilters.map((filter, index) => (
                <FilterChip
                  key={index}
                  label={filter}
                  onRemove={() => removeFilter(filter)}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Scrollable Results */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {properties.map((property, index) => (
          <PropertyResultCard
            key={index}
            {...property}
            saved={savedProperties.includes(index)}
            onToggleSave={() => toggleSave(index)}
            onQuickView={() => handleQuickView(property)}
          />
        ))}
      </ScrollView>

      {/* Floating Refine Button */}
      <TouchableOpacity style={styles.refineButton} activeOpacity={0.8}>
        <SlidersHorizontal size={20} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.refineButtonText}>Refine Search</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <Search size={24} color="#2563EB" strokeWidth={2} />
          <Text style={styles.navLabelActive}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Heart size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MessageCircle size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navLabel}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <User size={24} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.navLabel}>Profile</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
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
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mapButton: {
    padding: 8,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  filterButton: {
    backgroundColor: '#2563EB',
    padding: 8,
    borderRadius: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsInfo: {
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
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
  },
  sortText: {
    fontSize: 14,
    color: '#374151',
  },
  clearAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  filterChipRemove: {
    padding: 2,
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    height: 224,
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  quickViewText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 14,
    color: '#6B7280',
  },
  highlightsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  refineButton: {
    position: 'absolute',
    bottom: 90,
    right: 32,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  refineButtonText: {
    color: '#FFFFFF',
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
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  navLabelActive: {
    fontSize: 12,
    color: '#2563EB',
  },
});