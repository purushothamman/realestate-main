import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import {
  Building2,
  MapPin,
  Edit3,
  Phone,
  Mail,
  Calendar,
  Award,
  FileText,
  Home,
  CheckCircle2,
  Briefcase,
  ClipboardList,
  Bell,
  HelpCircle,
  LogOut,
  Plus,
  ChevronRight,
  Star,
  Users,
  BarChart3,
  Shield,
  BedDouble,
  Bath,
  Maximize,
  ArrowLeft,
  Heart,
  Share2,
  Camera,
  ChevronLeft,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Property Card Component
function PropertyCard({ property, onClick }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.propertyCard}
      activeOpacity={0.9}
    >
      <View style={styles.propertyImageContainer}>
        <Image
          source={{ uri: property.image }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <View style={styles.propertyStatusBadge}>
          <Text style={styles.propertyStatusText}>{property.status}</Text>
        </View>
        <TouchableOpacity style={styles.propertyFavoriteButton}>
          <Heart color="#374151" size={16} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.propertyDetails}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.propertyLocation}>
          <MapPin color="#6B7280" size={16} strokeWidth={2} />
          <Text style={styles.propertyLocationText} numberOfLines={1}>
            {property.location}
          </Text>
        </View>

        <View style={styles.propertyFeatures}>
          <View style={styles.propertyFeature}>
            <BedDouble color="#6B7280" size={16} strokeWidth={2} />
            <Text style={styles.propertyFeatureText}>{property.beds}</Text>
          </View>
          <View style={styles.propertyFeature}>
            <Bath color="#6B7280" size={16} strokeWidth={2} />
            <Text style={styles.propertyFeatureText}>{property.baths}</Text>
          </View>
          <View style={styles.propertyFeature}>
            <Maximize color="#6B7280" size={16} strokeWidth={2} />
            <Text style={styles.propertyFeatureText}>{property.area}</Text>
          </View>
        </View>

        <View style={styles.propertyFooter}>
          <View>
            <Text style={styles.propertyPrice}>{property.price}</Text>
            {property.pricePerSqft && (
              <Text style={styles.propertyPricePerSqft}>
                {property.pricePerSqft}/sq ft
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Property Detail Screen Component
function PropertyDetailScreen({ property, visible, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = [
    property.image,
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.detailBackButton}>
            <ArrowLeft color="#374151" size={20} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Property Details</Text>
          <View style={styles.detailHeaderActions}>
            <TouchableOpacity style={styles.detailHeaderAction}>
              <Share2 color="#374151" size={20} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailHeaderAction}>
              <Heart color="#374151" size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.detailScrollView}>
          {/* Image Gallery */}
          <View style={styles.detailImageGallery}>
            <Image
              source={{ uri: allImages[activeImageIndex] }}
              style={styles.detailImage}
              resizeMode="cover"
            />

            {/* Image Counter */}
            <View style={styles.detailImageCounter}>
              <Camera color="#FFFFFF" size={16} strokeWidth={2} />
              <Text style={styles.detailImageCounterText}>
                {activeImageIndex + 1}/{allImages.length}
              </Text>
            </View>

            {/* Navigation Arrows */}
            {activeImageIndex > 0 && (
              <TouchableOpacity
                onPress={() => setActiveImageIndex((prev) => prev - 1)}
                style={styles.detailImageNavLeft}
              >
                <ChevronLeft color="#111827" size={20} strokeWidth={2} />
              </TouchableOpacity>
            )}

            {activeImageIndex < allImages.length - 1 && (
              <TouchableOpacity
                onPress={() => setActiveImageIndex((prev) => prev + 1)}
                style={styles.detailImageNavRight}
              >
                <ChevronRight color="#111827" size={20} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={styles.detailContent}>
            {/* Price & Title */}
            <View style={styles.detailPriceSection}>
              <View>
                <Text style={styles.detailPrice}>{property.price}</Text>
                {property.pricePerSqft && (
                  <Text style={styles.detailPricePerSqft}>
                    {property.pricePerSqft}/sq ft
                  </Text>
                )}
              </View>
              <View style={styles.detailStatusBadge}>
                <Text style={styles.detailStatusText}>{property.status}</Text>
              </View>
            </View>

            <Text style={styles.detailTitle}>{property.title}</Text>

            <View style={styles.detailLocationContainer}>
              <MapPin color="#6B7280" size={20} strokeWidth={2} />
              <Text style={styles.detailLocationText}>{property.location}</Text>
            </View>

            {/* Key Features */}
            <View style={styles.detailFeaturesSection}>
              <Text style={styles.detailSectionTitle}>Key Features</Text>
              <View style={styles.detailFeaturesGrid}>
                <View style={styles.detailFeatureItem}>
                  <View style={styles.detailFeatureIcon}>
                    <BedDouble color="#2D6A4F" size={28} strokeWidth={2} />
                  </View>
                  <Text style={styles.detailFeatureLabel}>Bedrooms</Text>
                  <Text style={styles.detailFeatureValue}>{property.beds}</Text>
                </View>
                <View style={styles.detailFeatureItem}>
                  <View style={styles.detailFeatureIcon}>
                    <Bath color="#2D6A4F" size={28} strokeWidth={2} />
                  </View>
                  <Text style={styles.detailFeatureLabel}>Bathrooms</Text>
                  <Text style={styles.detailFeatureValue}>{property.baths}</Text>
                </View>
                <View style={styles.detailFeatureItem}>
                  <View style={styles.detailFeatureIcon}>
                    <Maximize color="#2D6A4F" size={28} strokeWidth={2} />
                  </View>
                  <Text style={styles.detailFeatureLabel}>Area</Text>
                  <Text style={styles.detailFeatureValue}>{property.area}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.detailDescriptionSection}>
              <Text style={styles.detailSectionTitle}>Description</Text>
              <Text style={styles.detailDescription}>
                {property.description ||
                  `Beautiful ${property.beds} bedroom property located in the heart of ${property.location}. This stunning home features modern amenities, spacious rooms, and premium finishes throughout. Perfect for families looking for comfort and style.`}
              </Text>
            </View>

            {/* Amenities */}
            <View style={styles.detailAmenitiesSection}>
              <Text style={styles.detailSectionTitle}>Amenities</Text>
              <View style={styles.detailAmenitiesGrid}>
                {[
                  '24/7 Security',
                  'Swimming Pool',
                  'Gym',
                  'Parking',
                  'Garden',
                  'Play Area',
                ].map((amenity, idx) => (
                  <View key={idx} style={styles.detailAmenityItem}>
                    <CheckCircle2 color="#059669" size={20} strokeWidth={2} />
                    <Text style={styles.detailAmenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Builder Info */}
            <View style={styles.detailBuilderSection}>
              <Text style={styles.detailSectionTitle}>Listed By</Text>
              <View style={styles.detailBuilderInfo}>
                <View style={styles.detailBuilderIcon}>
                  <Building2 color="#FFFFFF" size={24} strokeWidth={2} />
                </View>
                <View style={styles.detailBuilderText}>
                  <Text style={styles.detailBuilderName}>
                    Anderson Real Estate Group
                  </Text>
                  <Text style={styles.detailBuilderBadge}>Verified Builder</Text>
                </View>
                <TouchableOpacity style={styles.detailContactButton}>
                  <Text style={styles.detailContactButtonText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom CTA */}
        <View style={styles.detailBottomCTA}>
          <TouchableOpacity style={styles.detailCallButton} activeOpacity={0.8}>
            <Phone color="#FFFFFF" size={20} strokeWidth={2} />
            <Text style={styles.detailCallButtonText}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailEmailButton} activeOpacity={0.8}>
            <Mail color="#2D6A4F" size={20} strokeWidth={2} />
            <Text style={styles.detailEmailButtonText}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Main Builder Profile Screen
export default function BuilderProfileScreen({
  onEditProfile,
  onMyListings,
  onMyProjects,
  onDocuments,
  onNotifications,
  onHelpSupport,
  onLogout,
  onAddListing,
}) {
  const [showFullBio, setShowFullBio] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Mock builder data
  const builderData = {
    name: 'Anderson Real Estate Group',
    ownerName: 'John Anderson',
    role: 'Verified Builder',
    verified: true,
    location: 'Beverly Hills, CA',
    profileImage:
      'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2Nzc3Mzc3NHww&ixlib=rb-4.1.0&q=80&w=1080',
    headerBackground:
      'https://images.unsplash.com/photo-1711720743865-10787dd6934a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMGJ1aWxkaW5ncyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Njc4MDEyNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    business: {
      companyName: 'Anderson Real Estate Group LLC',
      yearsOfExperience: 15,
      phone: '+1 (555) 123-4567',
      email: 'contact@andersonrealestate.com',
      reraId: 'RERA-CA-2024-12345',
      established: '2009',
    },
    stats: {
      totalListings: 24,
      activeProjects: 8,
      completedProjects: 42,
      rating: 4.8,
      reviews: 156,
    },
    bio: 'Anderson Real Estate Group is a premier luxury property developer with over 15 years of experience in creating exceptional residential and commercial spaces across California. We pride ourselves on quality craftsmanship, innovative design, and delivering projects that exceed expectations. Our portfolio includes award-winning developments in Beverly Hills, Los Angeles, and San Francisco.',
    achievements: [
      { icon: Award, label: 'Top Builder 2024' },
      { icon: Star, label: '4.8 Rating' },
      { icon: Shield, label: 'RERA Verified' },
      { icon: Users, label: '100+ Happy Clients' },
    ],
  };

  // Mock properties data
  const properties = [
    {
      id: 1,
      title: 'Luxury Villa with Pool',
      location: 'Beverly Hills, CA',
      price: '$2,450,000',
      pricePerSqft: '$850',
      beds: 4,
      baths: 3,
      area: '2,880 sq ft',
      status: 'For Sale',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    },
    {
      id: 2,
      title: 'Modern Penthouse',
      location: 'Downtown LA, CA',
      price: '$3,200,000',
      pricePerSqft: '$1,100',
      beds: 3,
      baths: 3,
      area: '2,910 sq ft',
      status: 'New Launch',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    },
    {
      id: 3,
      title: 'Beachfront Estate',
      location: 'Malibu, CA',
      price: '$5,800,000',
      pricePerSqft: '$1,450',
      beds: 5,
      baths: 4,
      area: '4,000 sq ft',
      status: 'For Sale',
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    },
  ];

  const quickActions = [
    {
      icon: Home,
      label: 'My Listings',
      value: builderData.stats.totalListings,
      color: '#2D6A4F',
      action: onMyListings,
    },
    {
      icon: Briefcase,
      label: 'My Projects',
      value: builderData.stats.activeProjects,
      color: '#3498DB',
      action: onMyProjects,
    },
    {
      icon: FileText,
      label: 'Documents & Verification',
      value: null,
      color: '#9B59B6',
      action: onDocuments,
    },
    {
      icon: BarChart3,
      label: 'Analytics & Reports',
      value: null,
      color: '#E67E22',
      action: () => {},
    },
  ];

  const secondaryOptions = [
    { icon: Bell, label: 'Notifications', action: onNotifications },
    { icon: HelpCircle, label: 'Help & Support', action: onHelpSupport },
    { icon: ClipboardList, label: 'Terms & Policies', action: () => {} },
  ];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => onLogout && onLogout(), style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header with Background */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: builderData.headerBackground }}
          style={styles.headerBackgroundImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />

        {/* App Header */}
        <View style={styles.appHeader}>
          <View style={styles.appHeaderLeft}>
            <View style={styles.appHeaderLogo}>
              <Building2 color="#2D6A4F" size={16} strokeWidth={2} />
            </View>
            <Text style={styles.appHeaderTitle}>EstateHub</Text>
          </View>
          <TouchableOpacity
            onPress={onEditProfile}
            style={styles.editButton}
            activeOpacity={0.8}
          >
            <Edit3 color="#FFFFFF" size={16} strokeWidth={2} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card - Overlapping */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardContent}>
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: builderData.profileImage }}
                style={styles.profileImage}
                resizeMode="cover"
              />
              {builderData.verified && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 color="#FFFFFF" size={16} strokeWidth={2} />
                </View>
              )}
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {builderData.name}
              </Text>
              <View style={styles.profileRoleBadge}>
                <Shield color="#15803D" size={12} strokeWidth={2} />
                <Text style={styles.profileRoleText}>{builderData.role}</Text>
              </View>
              <View style={styles.profileLocation}>
                <MapPin color="#6B7280" size={16} strokeWidth={2} />
                <Text style={styles.profileLocationText}>
                  {builderData.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Rating & Reviews */}
          <View style={styles.profileRating}>
            <View style={styles.ratingContainer}>
              <Star
                color="#F59E0B"
                size={20}
                strokeWidth={2}
                fill="#F59E0B"
              />
              <Text style={styles.ratingValue}>{builderData.stats.rating}</Text>
              <Text style={styles.ratingReviews}>
                ({builderData.stats.reviews} reviews)
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          {builderData.achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <View key={index} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <IconComponent color="#2D6A4F" size={24} strokeWidth={2} />
                </View>
                <Text style={styles.achievementLabel}>{achievement.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Project Overview Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Project Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {builderData.stats.totalListings}
              </Text>
              <Text style={styles.statLabel}>Total Listings</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxGreen]}>
              <Text style={styles.statValueGreen}>
                {builderData.stats.activeProjects}
              </Text>
              <Text style={styles.statLabelGreen}>Active Projects</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxPurple]}>
              <Text style={styles.statValuePurple}>
                {builderData.stats.completedProjects}
              </Text>
              <Text style={styles.statLabelPurple}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Featured Properties */}
        <View style={styles.propertiesSection}>
          <View style={styles.propertiesHeader}>
            <Text style={styles.cardTitle}>Featured Properties</Text>
            <TouchableOpacity onPress={onMyListings}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.propertiesList}>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => setSelectedProperty(property)}
              />
            ))}
          </View>
        </View>

        {/* Business Information */}
        <View style={styles.businessInfoCard}>
          <Text style={styles.cardTitle}>Business Information</Text>
          <View style={styles.businessInfoList}>
            <View style={styles.businessInfoItem}>
              <Building2 color="#9CA3AF" size={20} strokeWidth={2} />
              <View style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>Company Name</Text>
                <Text style={styles.businessInfoValue}>
                  {builderData.business.companyName}
                </Text>
              </View>
            </View>
            <View style={styles.businessInfoItem}>
              <Calendar color="#9CA3AF" size={20} strokeWidth={2} />
              <View style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>Years of Experience</Text>
                <Text style={styles.businessInfoValue}>
                  {builderData.business.yearsOfExperience} years (Est.{' '}
                  {builderData.business.established})
                </Text>
              </View>
            </View>
            <View style={styles.businessInfoItem}>
              <Phone color="#9CA3AF" size={20} strokeWidth={2} />
              <View style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>Contact Number</Text>
                <Text style={styles.businessInfoValue}>
                  {builderData.business.phone}
                </Text>
              </View>
            </View>
            <View style={styles.businessInfoItem}>
              <Mail color="#9CA3AF" size={20} strokeWidth={2} />
              <View style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>Email Address</Text>
                <Text style={styles.businessInfoValue} numberOfLines={1}>
                  {builderData.business.email}
                </Text>
              </View>
            </View>
            <View style={styles.businessInfoItem}>
              <Shield color="#9CA3AF" size={20} strokeWidth={2} />
              <View style={styles.businessInfoText}>
                <Text style={styles.businessInfoLabel}>RERA ID</Text>
                <Text style={styles.businessInfoValue}>
                  {builderData.business.reraId}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Builder */}
        <View style={styles.aboutCard}>
          <Text style={styles.cardTitle}>About Builder</Text>
          <Text
            style={styles.aboutText}
            numberOfLines={showFullBio ? undefined : 3}
          >
            {builderData.bio}
          </Text>
          <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
            <Text style={styles.readMoreButton}>
              {showFullBio ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActionsList}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={action.action}
                  style={styles.quickActionItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickActionLeft}>
                    <View
                      style={[
                        styles.quickActionIcon,
                        { backgroundColor: `${action.color}15` },
                      ]}
                    >
                      <IconComponent
                        color={action.color}
                        size={24}
                        strokeWidth={2}
                      />
                    </View>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </View>
                  <View style={styles.quickActionRight}>
                    {action.value !== null && (
                      <View style={styles.quickActionBadge}>
                        <Text style={styles.quickActionBadgeText}>
                          {action.value}
                        </Text>
                      </View>
                    )}
                    <ChevronRight color="#9CA3AF" size={20} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Secondary Options */}
        <View style={styles.secondaryOptionsCard}>
          <Text style={styles.cardTitle}>Settings & Support</Text>
          <View style={styles.secondaryOptionsList}>
            {secondaryOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={option.action}
                  style={styles.secondaryOptionItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.secondaryOptionLeft}>
                    <IconComponent color="#9CA3AF" size={20} strokeWidth={2} />
                    <Text style={styles.secondaryOptionLabel}>
                      {option.label}
                    </Text>
                  </View>
                  <ChevronRight color="#9CA3AF" size={20} strokeWidth={2} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <LogOut color="#374151" size={20} strokeWidth={2} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          onPress={onAddListing}
          style={styles.addListingButton}
          activeOpacity={0.8}
        >
          <Plus color="#FFFFFF" size={24} strokeWidth={2} />
          <Text style={styles.addListingButtonText}>Add New Listing</Text>
        </TouchableOpacity>
      </View>

      {/* Property Detail Screen Overlay */}
      {selectedProperty && (
        <PropertyDetailScreen
          property={selectedProperty}
          visible={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </View>
  );
}

// ✅ STYLES (COMPLETED)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* ================= HEADER ================= */
  headerContainer: {
    position: 'relative',
    height: 256,
    backgroundColor: '#2D6A4F',
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45,106,79,0.6)',
  },

  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appHeaderLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  /* ================= PROFILE CARD ================= */
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginTop: -60,
    elevation: 4,
  },
  profileCardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#16A34A',
    padding: 4,
    borderRadius: 12,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  profileRoleText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  profileLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  profileLocationText: {
    color: '#6B7280',
    fontSize: 14,
  },

  profileRating: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  ratingReviews: {
    color: '#6B7280',
    fontSize: 14,
  },

  /* ================= SCROLL ================= */
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120,
  },

  /* ================= ACHIEVEMENTS ================= */
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 12,
  },
  achievementItem: {
    alignItems: 'center',
    gap: 6,
  },
  achievementIcon: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 16,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },

  /* ================= CARDS ================= */
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  /* ================= LOGOUT ================= */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  /* ================= BOTTOM CTA ================= */
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addListingButton: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addListingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
