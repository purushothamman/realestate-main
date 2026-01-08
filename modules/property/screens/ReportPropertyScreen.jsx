import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Home,
  X,
  Upload,
  Save,
  HelpCircle,
  MapPin,
  FileText,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PropertyTypeButton = ({ label, Icon, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.propertyTypeButton,
      selected ? styles.propertyTypeButtonSelected : styles.propertyTypeButtonUnselected,
    ]}
  >
    <Icon
      size={20}
      color={selected ? '#FFFFFF' : '#2563EB'}
      strokeWidth={2}
    />
    <Text style={[styles.propertyTypeLabel, selected && styles.propertyTypeLabelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ImageUploadCard = ({ image, onRemove, onAdd, isPlaceholder }) => {
  if (isPlaceholder) {
    return (
      <TouchableOpacity onPress={onAdd} style={styles.imageUploadPlaceholder}>
        <Upload size={32} color="#9CA3AF" strokeWidth={2} />
        <Text style={styles.uploadText}>Upload Image</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.imageUploadCard}>
      <Image source={{ uri: image }} style={styles.uploadedImage} />
      <TouchableOpacity onPress={onRemove} style={styles.removeImageButton}>
        <X size={16} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

const RecentReportCard = ({ propertyName, location, status, date }) => {
  const statusConfig = {
    pending: { Icon: Clock, color: '#D97706', bg: '#FEF3C7', label: 'Pending' },
    approved: { Icon: Check, color: '#059669', bg: '#D1FAE5', label: 'Approved' },
    review: { Icon: AlertCircle, color: '#2563EB', bg: '#DBEAFE', label: 'In Review' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.Icon;

  return (
    <View style={styles.recentReportCard}>
      <View style={styles.reportCardHeader}>
        <View style={styles.reportCardContent}>
          <Text style={styles.reportPropertyName}>{propertyName}</Text>
          <View style={styles.reportLocation}>
            <MapPin size={12} color="#6B7280" strokeWidth={2} />
            <Text style={styles.reportLocationText}>{location}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <StatusIcon size={12} color={config.color} strokeWidth={2} />
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={styles.reportDate}>{date}</Text>
    </View>
  );
};

const ReportPropertyScreen = () => {
  const [propertyType, setPropertyType] = useState('house');
  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [sqft, setSqft] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState([
    'https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NjE0Mzk2MHww&ixlib=rb-4.1.0&q=80&w=1080',
  ]);

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const addImage = () => {
    console.log('Add image clicked');
  };

  const handleSubmit = () => {
    console.log('Report submitted');
  };

  const handleSaveDraft = () => {
    console.log('Draft saved');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMGJ1aWxkaW5nc3xlbnwxfHx8fDE3NjYyMjM4NTh8MA&ixlib=rb-4.1.0&q=80&w=1080' }}
          style={styles.headerBackground}
        />
        <View style={styles.headerOverlay} />
        
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Home size={20} color="#2563EB" strokeWidth={2} />
            </View>
            <Text style={styles.logoText}>DreamHome</Text>
          </View>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Report a Property</Text>
          <Text style={styles.headerSubtitle}>
            Provide property details and submit your report for verification
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Type</Text>
          <View style={styles.propertyTypeGrid}>
            <PropertyTypeButton
              label="Apartment"
              Icon={Home}
              selected={propertyType === 'apartment'}
              onPress={() => setPropertyType('apartment')}
            />
            <PropertyTypeButton
              label="House"
              Icon={Home}
              selected={propertyType === 'house'}
              onPress={() => setPropertyType('house')}
            />
            <PropertyTypeButton
              label="Commercial"
              Icon={Home}
              selected={propertyType === 'commercial'}
              onPress={() => setPropertyType('commercial')}
            />
            <PropertyTypeButton
              label="Land"
              Icon={Home}
              selected={propertyType === 'land'}
              onPress={() => setPropertyType('land')}
            />
          </View>
        </View>

        {/* Basic Information */}
        <View style={[styles.section, styles.sectionGray]}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Property Name / Title</Text>
            <View style={styles.inputWrapper}>
              <FileText size={20} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                value={propertyName}
                onChangeText={setPropertyName}
                placeholder="e.g., Modern Luxury Villa"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location / Address</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={20} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Enter full address"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Bedrooms</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperGray]}>
                <Bed size={20} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  placeholder="3"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="numeric"
                />
                <ChevronDown size={16} color="#9CA3AF" strokeWidth={2} />
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Bathrooms</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperGray]}>
                <Bath size={20} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  placeholder="2"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="numeric"
                />
                <ChevronDown size={16} color="#9CA3AF" strokeWidth={2} />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Square Feet</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperGray]}>
                <Maximize size={20} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  value={sqft}
                  onChangeText={setSqft}
                  placeholder="e.g., 2,500"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Price</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperGray]}>
                <DollarSign size={20} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g., 750,000"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.section, styles.sectionGray]}>
          <View style={styles.descriptionHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.optionalText}>(Optional)</Text>
          </View>
          <Text style={styles.descriptionSubtext}>
            Add additional details about the property
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe key features, amenities, location highlights..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            style={styles.textArea}
            textAlignVertical="top"
          />
        </View>

        {/* Property Images */}
        <View style={styles.section}>
          <View style={styles.imagesHeader}>
            <View>
              <Text style={styles.sectionTitle}>Property Images</Text>
              <Text style={styles.imagesSubtext}>Upload up to 6 photos</Text>
            </View>
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{uploadedImages.length}/6</Text>
            </View>
          </View>
          
          <View style={styles.imagesGrid}>
            {uploadedImages.map((img, index) => (
              <ImageUploadCard
                key={index}
                image={img}
                onRemove={() => removeImage(index)}
              />
            ))}
            {uploadedImages.length < 6 && (
              <ImageUploadCard isPlaceholder onAdd={addImage} />
            )}
          </View>
        </View>

        {/* Recent Reports */}
        <View style={[styles.section, styles.sectionGray, styles.lastSection]}>
          <View style={styles.recentReportsHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <View style={styles.pendingBadge}>
              <Clock size={12} color="#B45309" strokeWidth={2} />
              <Text style={styles.pendingText}>2 Pending</Text>
            </View>
          </View>
          
          <View style={styles.reportsContainer}>
            <RecentReportCard
              propertyName="Sunset Boulevard Villa"
              location="Beverly Hills, CA"
              status="pending"
              date="Submitted 2 days ago"
            />
            <RecentReportCard
              propertyName="Downtown Luxury Apartment"
              location="Manhattan, NY"
              status="review"
              date="Submitted 1 week ago"
            />
            <RecentReportCard
              propertyName="Modern Beachfront House"
              location="Miami Beach, FL"
              status="approved"
              date="Approved 2 weeks ago"
            />
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.bottomActionsRow}>
          <TouchableOpacity onPress={handleSaveDraft} style={styles.saveDraftButton}>
            <Save size={20} color="#374151" strokeWidth={2} />
            <Text style={styles.saveDraftText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <HelpCircle size={20} color="#374151" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Check size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    height: 176,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
  headerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 9999,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionGray: {
    backgroundColor: '#F9FAFB',
  },
  lastSection: {
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  propertyTypeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  propertyTypeButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  propertyTypeButtonSelected: {
    backgroundColor: '#2563EB',
  },
  propertyTypeButtonUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propertyTypeLabel: {
    fontSize: 12,
    color: '#374151',
  },
  propertyTypeLabelSelected: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputWrapperGray: {
    backgroundColor: '#F9FAFB',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  optionalText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  descriptionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#374151',
    height: 128,
  },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagesSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  imageCounter: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  imageCounterText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageUploadCard: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    padding: 6,
    borderRadius: 9999,
  },
  imageUploadPlaceholder: {
    width: (width - 64) / 3,
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentReportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
  },
  reportsContainer: {
    gap: 12,
  },
  recentReportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportCardContent: {
    flex: 1,
  },
  reportPropertyName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4,
  },
  reportLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  saveDraftButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveDraftText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  helpButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ReportPropertyScreen;