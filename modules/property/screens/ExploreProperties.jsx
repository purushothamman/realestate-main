import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Building2,
  Search,
  MapPin,
  Heart,
  Eye,
  Home,
  Bell,
  User,
  Plus,
  TrendingUp,
  Star,
  Maximize2,
  Calendar,
  ChevronRight,
  Filter,
  Grid3x3,
  List,
  Award,
  Sparkles
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ExploreProperties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const properties = [
    {
      id: 1,
      name: 'Skyline Residences',
      location: 'Beverly Hills, CA',
      type: 'Apartment',
      bhk: '3 BHK',
      price: 850000,
      status: 'Featured',
      image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800',
      size: '2,450 sq ft',
      bathrooms: 3,
      parking: 2,
      yearBuilt: 2023,
      views: 245,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Ocean View Villa',
      location: 'Miami Beach, FL',
      type: 'Villa',
      bhk: '5 BHK',
      price: 2500000,
      status: 'Ready',
      image: 'https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?w=800',
      size: '4,850 sq ft',
      bathrooms: 5,
      parking: 4,
      yearBuilt: 2024,
      views: 389,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Green Valley Apartments',
      location: 'Austin, TX',
      type: 'Apartment',
      bhk: '2 BHK',
      price: 425000,
      status: 'Under Construction',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      size: '1,650 sq ft',
      bathrooms: 2,
      parking: 1,
      yearBuilt: 2025,
      views: 178,
      rating: 4.6,
    },
    {
      id: 4,
      name: 'Corporate Heights',
      location: 'New York, NY',
      type: 'Commercial',
      bhk: 'Office Space',
      price: 1200000,
      status: 'New',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      size: '3,200 sq ft',
      bathrooms: 4,
      parking: 6,
      yearBuilt: 2024,
      views: 412,
      rating: 4.7,
    },
    {
      id: 5,
      name: 'Sunset Paradise',
      location: 'Los Angeles, CA',
      type: 'Villa',
      bhk: '4 BHK',
      price: 1850000,
      status: 'Featured',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      size: '3,800 sq ft',
      bathrooms: 4,
      parking: 3,
      yearBuilt: 2023,
      views: 567,
      rating: 4.9,
    },
    {
      id: 6,
      name: 'Urban Loft Studios',
      location: 'Seattle, WA',
      type: 'Apartment',
      bhk: '1 BHK',
      price: 325000,
      status: 'Ready',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      size: '850 sq ft',
      bathrooms: 1,
      parking: 1,
      yearBuilt: 2024,
      views: 203,
      rating: 4.5,
    },
  ];

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Commercial', 'Plot'];
  const statusOptions = ['All', 'Ready', 'Under Construction', 'New', 'Featured'];

  const toggleFavorite = (propertyId) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Featured':
        return { colors: ['#f59e0b', '#f97316'], icon: Sparkles };
      case 'New':
        return { colors: ['#10b981', '#14b8a6'], icon: Award };
      case 'Ready':
        return { colors: ['#3b82f6', '#6366f1'], icon: Home };
      case 'Under Construction':
        return { colors: ['#f97316', '#ef4444'], icon: Building2 };
      default:
        return { colors: ['#6b7280', '#4b5563'], icon: Star };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProperties = properties.filter((property) => {
    const matchesType = selectedType === 'All' || property.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || property.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const clearFilters = () => {
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedType !== 'All' || selectedStatus !== 'All' || searchQuery !== '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Animated Background */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.backgroundBlob, styles.backgroundBlob1]} />
        <View style={[styles.backgroundBlob, styles.backgroundBlob2]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#2563eb', '#6366f1']}
                style={styles.logoGradient}
              >
                <Building2 width={24} height={24} color="#ffffff" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </View>
            <View>
              <Text style={styles.appName}>EstateHub</Text>
              <Text style={styles.appTagline}>Premium Properties</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.favoritesButton}>
            <Heart width={20} height={20} color="#374151" strokeWidth={2} />
            {favorites.length > 0 && (
              <LinearGradient
                colors={['#ef4444', '#ec4899']}
                style={styles.favoritesBadge}
              >
                <Text style={styles.favoritesBadgeText}>{favorites.length}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Discover Your <Text style={styles.heroTitleGradient}>Dream Home</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Explore premium properties curated just for you
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Search width={20} height={20} color="#9ca3af" strokeWidth={2} style={styles.searchIcon} />
            <TextInput
              placeholder="Search by location, project name..."
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.searchActions}>
              <TouchableOpacity style={styles.nearMeButton}>
                <MapPin width={16} height={16} color="#6b7280" strokeWidth={2} />
                <Text style={styles.nearMeText}>Near me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <LinearGradient
                  colors={['#2563eb', '#6366f1']}
                  style={styles.searchActionButton}
                >
                  <Search width={18} height={18} color="#ffffff" strokeWidth={2} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeFiltersScroll}
        >
          <TouchableOpacity style={styles.filtersMainButton}>
            <LinearGradient
              colors={['#2563eb', '#6366f1']}
              style={styles.filtersMainButtonGradient}
            >
              <Filter width={18} height={18} color="#ffffff" strokeWidth={2} />
              <Text style={styles.filtersMainButtonText}>Filters</Text>
              {hasActiveFilters && <View style={styles.activeFilterDot} />}
            </LinearGradient>
          </TouchableOpacity>
          
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              style={[
                styles.typeFilterButton,
                selectedType === type && styles.typeFilterButtonActive
              ]}
            >
              <Text style={[
                styles.typeFilterText,
                selectedType === type && styles.typeFilterTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filters & View Mode */}
        <View style={styles.statusFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusFiltersScroll}
            contentContainerStyle={styles.statusFiltersContent}
          >
            {statusOptions.map((status) => {
              const config = getStatusConfig(status);
              const StatusIcon = config.icon;
              const isActive = selectedStatus === status;
              
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  style={styles.statusFilterButton}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={config.colors}
                      style={styles.statusFilterActive}
                    >
                      <StatusIcon width={14} height={14} color="#ffffff" strokeWidth={2} />
                      <Text style={styles.statusFilterTextActive}>{status}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.statusFilterInactive}>
                      <Text style={styles.statusFilterTextInactive}>{status}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <View style={styles.viewModeButtons}>
            <TouchableOpacity
              onPress={() => setViewMode('grid')}
              style={[
                styles.viewModeButton,
                viewMode === 'grid' && styles.viewModeButtonActive
              ]}
            >
              <Grid3x3 
                width={18} 
                height={18} 
                color={viewMode === 'grid' ? '#ffffff' : '#6b7280'} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              style={[
                styles.viewModeButton,
                viewMode === 'list' && styles.viewModeButtonActive
              ]}
            >
              <List 
                width={18} 
                height={18} 
                color={viewMode === 'list' ? '#ffffff' : '#6b7280'} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryLeft}>
            <LinearGradient
              colors={['#3b82f6', '#6366f1']}
              style={styles.summaryIcon}
            >
              <TrendingUp width={18} height={18} color="#ffffff" strokeWidth={2} />
            </LinearGradient>
            <View>
              <Text style={styles.summaryLabel}>Found Properties</Text>
              <Text style={styles.summaryValue}>{filteredProperties.length} listings</Text>
            </View>
          </View>
          
          {hasActiveFilters && (
            <TouchableOpacity
              onPress={clearFilters}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Property Grid */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredProperties.length > 0 ? (
          <View style={styles.propertyGrid}>
            {filteredProperties.map((property) => {
              const statusConfig = getStatusConfig(property.status);
              const StatusIcon = statusConfig.icon;
              const isFavorite = favorites.includes(property.id);
              
              return (
                <TouchableOpacity
                  key={property.id}
                  style={styles.propertyCard}
                  activeOpacity={0.9}
                >
                  {/* Image */}
                  <View style={styles.propertyImageContainer}>
                    <Image
                      source={{ uri: property.image }}
                      style={styles.propertyImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.propertyImageGradient}
                    />
                    
                    {/* Status Badge */}
                    <View style={styles.statusBadgeContainer}>
                      <LinearGradient
                        colors={statusConfig.colors}
                        style={styles.statusBadge}
                      >
                        <StatusIcon width={14} height={14} color="#ffffff" strokeWidth={2} />
                        <Text style={styles.statusBadgeText}>{property.status}</Text>
                      </LinearGradient>
                    </View>

                    {/* Favorite Button */}
                    <TouchableOpacity
                      onPress={() => toggleFavorite(property.id)}
                      style={styles.favoriteButton}
                    >
                      <Heart
                        width={20}
                        height={20}
                        color={isFavorite ? '#ef4444' : '#374151'}
                        fill={isFavorite ? '#ef4444' : 'none'}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>

                    {/* Rating */}
                    <View style={styles.ratingBadge}>
                      <Star width={14} height={14} color="#eab308" fill="#eab308" strokeWidth={2} />
                      <Text style={styles.ratingText}>{property.rating}</Text>
                    </View>

                    {/* Views */}
                    <View style={styles.viewsBadge}>
                      <Eye width={14} height={14} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.viewsText}>{property.views}</Text>
                    </View>
                  </View>

                  {/* Content */}
                  <View style={styles.propertyContent}>
                    <Text style={styles.propertyName} numberOfLines={1}>
                      {property.name}
                    </Text>
                    
                    <View style={styles.propertyLocation}>
                      <MapPin width={16} height={16} color="#9ca3af" strokeWidth={2} />
                      <Text style={styles.propertyLocationText} numberOfLines={1}>
                        {property.location}
                      </Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.propertyStats}>
                      <View style={styles.propertyStat}>
                        <View style={styles.propertyStatIconBlue}>
                          <Home width={18} height={18} color="#2563eb" strokeWidth={2} />
                        </View>
                        <Text style={styles.propertyStatText}>{property.bhk}</Text>
                      </View>
                      
                      <View style={styles.propertyStat}>
                        <View style={styles.propertyStatIconIndigo}>
                          <Text style={styles.bathIcon}>🚿</Text>
                        </View>
                        <Text style={styles.propertyStatText}>{property.bathrooms} Bath</Text>
                      </View>
                      
                      <View style={styles.propertyStat}>
                        <View style={styles.propertyStatIconPurple}>
                          <Text style={styles.parkIcon}>🚗</Text>
                        </View>
                        <Text style={styles.propertyStatText}>{property.parking} Park</Text>
                      </View>
                    </View>

                    {/* Size & Year */}
                    <View style={styles.propertyDetails}>
                      <View style={styles.propertyDetail}>
                        <Maximize2 width={16} height={16} color="#9ca3af" strokeWidth={2} />
                        <Text style={styles.propertyDetailText}>{property.size}</Text>
                      </View>
                      <View style={styles.propertyDetail}>
                        <Calendar width={16} height={16} color="#9ca3af" strokeWidth={2} />
                        <Text style={styles.propertyDetailText}>{property.yearBuilt}</Text>
                      </View>
                    </View>

                    {/* Price & CTA */}
                    <View style={styles.propertyFooter}>
                      <View>
                        <Text style={styles.priceLabel}>Starting from</Text>
                        <Text style={styles.priceValue}>{formatPrice(property.price)}</Text>
                      </View>
                      
                      <TouchableOpacity>
                        <LinearGradient
                          colors={['#2563eb', '#6366f1']}
                          style={styles.viewButton}
                        >
                          <Text style={styles.viewButtonText}>View</Text>
                          <ChevronRight width={18} height={18} color="#ffffff" strokeWidth={2} />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconContainer}>
              <View style={styles.emptyStateIconBg}>
                <Search width={64} height={64} color="#2563eb" strokeWidth={1.5} />
              </View>
              <View style={styles.emptyStateIconBadge}>
                <LinearGradient
                  colors={['#2563eb', '#6366f1']}
                  style={styles.emptyStateIconBadgeGradient}
                >
                  <Heart width={24} height={24} color="#ffffff" strokeWidth={2} />
                </LinearGradient>
              </View>
            </View>
            
            <Text style={styles.emptyStateTitle}>No Properties Found</Text>
            <Text style={styles.emptyStateText}>
              We couldn't find any properties matching your criteria. Try adjusting your filters.
            </Text>
            
            <TouchableOpacity onPress={clearFilters}>
              <LinearGradient
                colors={['#2563eb', '#6366f1']}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>Clear All Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#2563eb', '#6366f1']}
          style={styles.fabGradient}
        >
          <Plus width={28} height={28} color="#ffffff" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <LinearGradient
            colors={['#2563eb', '#6366f1']}
            style={styles.navItemActive}
          >
            <Home width={24} height={24} color="#ffffff" strokeWidth={2} />
          </LinearGradient>
          <Text style={styles.navItemTextActive}>Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navItemInactive}>
            <Heart width={24} height={24} color="#9ca3af" strokeWidth={2} />
            {favorites.length > 0 && (
              <LinearGradient
                colors={['#ef4444', '#ec4899']}
                style={styles.navBadge}
              >
                <Text style={styles.navBadgeText}>{favorites.length}</Text>
              </LinearGradient>
            )}
          </View>
          <Text style={styles.navItemTextInactive}>Saved</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navItemInactive}>
            <Bell width={24} height={24} color="#9ca3af" strokeWidth={2} />
          </View>
          <Text style={styles.navItemTextInactive}>Alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navItemInactive}>
            <User width={24} height={24} color="#9ca3af" strokeWidth={2} />
          </View>
          <Text style={styles.navItemTextInactive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  
  // Background
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  backgroundBlob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.3
  },
  backgroundBlob1: {
    top: 80,
    left: 40,
    width: 288,
    height: 288,
    backgroundColor: '#bfdbfe'
  },
  backgroundBlob2: {
    bottom: 80,
    right: 40,
    width: 384,
    height: 384,
    backgroundColor: '#c7d2fe'
  },
  
  // Header
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoContainer: {
    position: 'relative'
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  onlineIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: '#10b981',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb'
  },
  appTagline: {
    fontSize: 12,
    color: '#9ca3af'
  },
  favoritesButton: {
    position: 'relative',
    width: 44,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  favoritesBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  favoritesBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  
  // Hero
  heroSection: {
    marginBottom: 24
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  heroTitleGradient: {
    color: '#2563eb'
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280'
  },
  
  // Search
  searchContainer: {
    marginBottom: 20
  },
  searchWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  searchIcon: {
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827'
  },
  searchActions: {
    flexDirection: 'row',
    gap: 8
  },
  nearMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12
  },
  nearMeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  searchActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // Type Filters
  typeFiltersScroll: {
    paddingVertical: 8,
    paddingRight: 16,
    gap: 12
  },
  filtersMainButton: {
    marginRight: 12
  },
  filtersMainButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  filtersMainButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500'
  },
  activeFilterDot: {
    width: 8,
    height: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 4
  },
  typeFilterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    marginRight: 8
  },
  typeFilterButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  typeFilterText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151'
  },
  typeFilterTextActive: {
    color: '#2563eb'
  },
  
  // Status Filters & View Mode
  statusFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginVertical: 16
  },
  statusFiltersScroll: {
    flex: 1
  },
  statusFiltersContent: {
    paddingRight: 16,
    gap: 8
  },
  statusFilterButton: {
    marginRight: 8
  },
  statusFilterActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  statusFilterTextActive: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500'
  },
  statusFilterInactive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12
  },
  statusFilterTextInactive: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: 8
  },
  viewModeButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewModeButtonActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  
  // Summary
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  clearButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500'
  },
  
  // Scroll View
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120
  },
  
  // Property Grid
  propertyGrid: {
    gap: 24
  },
  propertyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  propertyImageContainer: {
    height: 256,
    position: 'relative'
  },
  propertyImage: {
    width: '100%',
    height: '100%'
  },
  propertyImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%'
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827'
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  viewsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'
  },
  
  // Property Content
  propertyContent: {
    padding: 20
  },
  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  propertyLocationText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1
  },
  propertyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  propertyStat: {
    alignItems: 'center',
    flex: 1
  },
  propertyStatIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#eff6ff'
  },
  propertyStatIconIndigo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#eef2ff'
  },
  propertyStatIconPurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#faf5ff'
  },
  bathIcon: {
    fontSize: 18
  },
  parkIcon: {
    fontSize: 18
  },
  propertyStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827'
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  propertyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  propertyDetailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb'
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80
  },
  emptyStateIconContainer: {
    position: 'relative',
    marginBottom: 24
  },
  emptyStateIconBg: {
    width: 128,
    height: 128,
    backgroundColor: '#eff6ff',
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyStateIconBadge: {
    position: 'absolute',
    top: -8,
    right: -8
  },
  emptyStateIconBadgeGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 24
  },
  emptyStateButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 112,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8
  },
  navItem: {
    alignItems: 'center',
    gap: 6
  },
  navItemActive: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  navItemInactive: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  navBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  navBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  navItemTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb'
  },
  navItemTextInactive: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af'
  }
});

export default ExploreProperties;