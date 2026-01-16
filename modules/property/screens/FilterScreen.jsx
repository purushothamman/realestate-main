import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  X,
  ChevronLeft,
  Search,
  MapPin,
  Building2,
  Home,
  Store,
  Warehouse,
  Bed,
  Car,
  Zap,
  Shield,
  Dumbbell,
  Wifi,
  Trees,
  UtensilsCrossed,
  Droplets,
  Wind
} from 'lucide-react-native';

const FilterScreen = ({ onBack, onApplyFilters }) => {
  const [location, setLocation] = useState('');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(10000000);
  const [propertyStatus, setPropertyStatus] = useState([]);
  const [bedrooms, setBedrooms] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const propertyTypeOptions = [
    { value: 'apartment', label: 'Apartment', icon: Building2 },
    { value: 'villa', label: 'Villa', icon: Home },
    { value: 'plot', label: 'Plot', icon: Warehouse },
    { value: 'commercial', label: 'Commercial', icon: Store }
  ];

  const propertyStatusOptions = [
    { value: 'new-launch', label: 'New Launch' },
    { value: 'ready-to-move', label: 'Ready to Move' },
    { value: 'under-construction', label: 'Under Construction' }
  ];

  const bedroomOptions = ['1', '2', '3', '4+'];

  const amenityOptions = [
    { value: 'parking', label: 'Parking', icon: Car },
    { value: 'lift', label: 'Lift', icon: Building2 },
    { value: 'power-backup', label: 'Power Backup', icon: Zap },
    { value: 'security', label: '24/7 Security', icon: Shield },
    { value: 'gym', label: 'Gym', icon: Dumbbell },
    { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { value: 'garden', label: 'Garden', icon: Trees },
    { value: 'clubhouse', label: 'Clubhouse', icon: UtensilsCrossed },
    { value: 'swimming-pool', label: 'Swimming Pool', icon: Droplets },
    { value: 'ac', label: 'Air Conditioning', icon: Wind }
  ];

  const togglePropertyType = (type) => {
    setPropertyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const togglePropertyStatus = (status) => {
    setPropertyStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleBedroom = (bhk) => {
    setBedrooms(prev =>
      prev.includes(bhk) ? prev.filter(b => b !== bhk) : [...prev, bhk]
    );
  };

  const toggleAmenity = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearAllFilters = () => {
    setLocation('');
    setPropertyTypes([]);
    setBudgetMin(0);
    setBudgetMax(10000000);
    setPropertyStatus([]);
    setBedrooms([]);
    setAmenities([]);
  };

  const handleApplyFilters = () => {
    const filters = {
      location,
      propertyTypes,
      budgetRange: { min: budgetMin, max: budgetMax },
      propertyStatus,
      bedrooms,
      amenities
    };
    onApplyFilters?.(filters);
  };

  const formatCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const hasActiveFilters = location || propertyTypes.length > 0 || 
    budgetMin > 0 || budgetMax < 10000000 || 
    propertyStatus.length > 0 || bedrooms.length > 0 || amenities.length > 0;

  const getFilterSummary = () => {
    const parts = [
      location && 'Location',
      propertyTypes.length > 0 && `${propertyTypes.length} Property Type${propertyTypes.length > 1 ? 's' : ''}`,
      (budgetMin > 0 || budgetMax < 10000000) && 'Budget',
      propertyStatus.length > 0 && `${propertyStatus.length} Status`,
      bedrooms.length > 0 && `${bedrooms.length} BHK`,
      amenities.length > 0 && `${amenities.length} Amenity${amenities.length > 1 ? 's' : ''}`
    ].filter(Boolean);
    return parts.join(' • ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <ChevronLeft width={24} height={24} color="#374151" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Filter Properties</Text>
          </View>
          
          <TouchableOpacity
            onPress={clearAllFilters}
            disabled={!hasActiveFilters}
            style={styles.clearButton}
          >
            <Text style={[
              styles.clearButtonText,
              !hasActiveFilters && styles.clearButtonTextDisabled
            ]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Filter Options */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Location Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Location</Text>
          <View style={styles.inputContainer}>
            <MapPin width={20} height={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              placeholder="Select City / Area"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Property Type */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Property Type</Text>
          <View style={styles.gridTwo}>
            {propertyTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = propertyTypes.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => togglePropertyType(option.value)}
                  style={[
                    styles.propertyTypeButton,
                    isSelected && styles.propertyTypeButtonSelected
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon 
                    width={24} 
                    height={24} 
                    color={isSelected ? '#14b8a6' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.propertyTypeLabel,
                    isSelected && styles.propertyTypeLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Budget Range */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Budget Range</Text>
          
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Min</Text>
              <Text style={styles.sliderValue}>{formatCurrency(budgetMin)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10000000}
              step={100000}
              value={budgetMin}
              onValueChange={setBudgetMin}
              minimumTrackTintColor="#14b8a6"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#14b8a6"
            />
          </View>

          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Max</Text>
              <Text style={styles.sliderValue}>{formatCurrency(budgetMax)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10000000}
              step={100000}
              value={budgetMax}
              onValueChange={setBudgetMax}
              minimumTrackTintColor="#14b8a6"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#14b8a6"
            />
          </View>

          <View style={styles.budgetDisplay}>
            <Text style={styles.budgetText}>
              <Text style={styles.budgetTextBold}>{formatCurrency(budgetMin)}</Text>
              {' - '}
              <Text style={styles.budgetTextBold}>{formatCurrency(budgetMax)}</Text>
            </Text>
          </View>
        </View>

        {/* Property Status */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Property Status</Text>
          <View style={styles.chipContainer}>
            {propertyStatusOptions.map((option) => {
              const isSelected = propertyStatus.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => togglePropertyStatus(option.value)}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bedrooms */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Bedrooms (BHK)</Text>
          <View style={styles.gridFour}>
            {bedroomOptions.map((bhk) => {
              const isSelected = bedrooms.includes(bhk);
              return (
                <TouchableOpacity
                  key={bhk}
                  onPress={() => toggleBedroom(bhk)}
                  style={[
                    styles.bedroomButton,
                    isSelected && styles.bedroomButtonSelected
                  ]}
                  activeOpacity={0.7}
                >
                  <Bed 
                    width={20} 
                    height={20} 
                    color={isSelected ? '#14b8a6' : '#6b7280'} 
                  />
                  <Text style={[
                    styles.bedroomLabel,
                    isSelected && styles.bedroomLabelSelected
                  ]}>
                    {bhk} BHK
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Amenities</Text>
          <View style={styles.gridTwo}>
            {amenityOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = amenities.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => toggleAmenity(option.value)}
                  style={[
                    styles.amenityButton,
                    isSelected && styles.amenityButtonSelected
                  ]}
                  activeOpacity={0.7}
                >
                  <Icon 
                    width={20} 
                    height={20} 
                    color={isSelected ? '#14b8a6' : '#6b7280'} 
                  />
                  <Text 
                    style={[
                      styles.amenityLabel,
                      isSelected && styles.amenityLabelSelected
                    ]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={clearAllFilters}
            disabled={!hasActiveFilters}
            style={[
              styles.clearFiltersButton,
              !hasActiveFilters && styles.clearFiltersButtonDisabled
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.clearFiltersText,
              !hasActiveFilters && styles.clearFiltersTextDisabled
            ]}>
              Clear Filters
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleApplyFilters}
            style={styles.applyButton}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
        
        {hasActiveFilters && (
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              {getFilterSummary()}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827'
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626'
  },
  clearButtonTextDisabled: {
    color: '#9ca3af'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  inputContainer: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1
  },
  input: {
    width: '100%',
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    fontSize: 14,
    color: '#111827'
  },
  gridTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  propertyTypeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  propertyTypeButtonSelected: {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa'
  },
  propertyTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  propertyTypeLabelSelected: {
    color: '#0f766e'
  },
  sliderSection: {
    marginBottom: 16
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6'
  },
  slider: {
    width: '100%',
    height: 40
  },
  budgetDisplay: {
    padding: 12,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#99f6e4'
  },
  budgetText: {
    fontSize: 14,
    color: '#0f766e',
    textAlign: 'center'
  },
  budgetTextBold: {
    fontWeight: '600'
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  chipSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  chipTextSelected: {
    color: '#1d4ed8'
  },
  gridFour: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  bedroomButton: {
    flex: 1,
    minWidth: '20%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  bedroomButtonSelected: {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa'
  },
  bedroomLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  bedroomLabelSelected: {
    color: '#0f766e'
  },
  amenityButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  amenityButtonSelected: {
    borderColor: '#14b8a6',
    backgroundColor: '#f0fdfa'
  },
  amenityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1
  },
  amenityLabelSelected: {
    color: '#0f766e'
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center'
  },
  clearFiltersButtonDisabled: {
    borderColor: '#e5e7eb'
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  clearFiltersTextDisabled: {
    color: '#9ca3af'
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    alignItems: 'center'
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  },
  filterSummary: {
    marginTop: 12,
    alignItems: 'center'
  },
  filterSummaryText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center'
  }
});

export default FilterScreen;