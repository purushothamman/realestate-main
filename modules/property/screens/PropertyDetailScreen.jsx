import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Car,
  Droplet,
  Flame,
  Wifi,
  Dumbbell,
  Trees,
  ShieldCheck,
  Camera,
  Phone,
  Mail,
  MessageCircle,
  Video,
  Navigation,
  Star,
  Home,
  Flag,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const FeatureChip = ({ icon, label }) => (
  <View style={styles.featureChip}>
    {icon}
    <Text style={styles.featureChipText}>{label}</Text>
  </View>
);

const SpecCard = ({ icon, label, value }) => (
  <View style={styles.specCard}>
    <View style={styles.specIconContainer}>{icon}</View>
    <Text style={styles.specValue}>{value}</Text>
    <Text style={styles.specLabel}>{label}</Text>
  </View>
);

export default function PropertyDetailScreen({ navigation, onBack, route }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const propertyImages = [
    'https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NjE0Mzk2MHww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1611094016919-36b65678f3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY2MjExNDU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1682888813795-192fca4a10d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwZGVzaWdufGVufDF8fHx8MTc2NjE2ODI3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzY2MjMwMTM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1625578324458-a106197ff141?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2NjEyNjk4MXww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1711110065918-388182f86e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNreWFyZCUyMHBvb2wlMjBsdXh1cnl8ZW58MXx8fHwxNzY2MjM0NTc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1625496015040-2f461a6a717b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwb2ZmaWNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY2MTc4NzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  const handleBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else if (onBack) {
      onBack();
    }
  };

  const handleMakeOffer = () => {
    if (navigation && navigation.navigate) {
      try {
        navigation.navigate('PaymentScreen');
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Navigation Error', 'Unable to navigate to Payment Screen');
      }
    } else {
      Alert.alert('Info', 'Make an Offer feature coming soon!');
    }
  };

  const handleReportProperty = () => {
    // Show alert with options
    Alert.alert(
      'Report Property',
      'Why are you reporting this property?',
      [
        {
          text: 'Incorrect Information',
          onPress: () => handleReportSubmit('Incorrect Information')
        },
        {
          text: 'Fraudulent Listing',
          onPress: () => handleReportSubmit('Fraudulent Listing')
        },
        {
          text: 'Property Not Available',
          onPress: () => handleReportSubmit('Property Not Available')
        },
        {
          text: 'Inappropriate Content',
          onPress: () => handleReportSubmit('Inappropriate Content')
        },
        {
          text: 'Other',
          onPress: () => handleReportSubmit('Other')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  };

  const handleReportSubmit = (reason) => {
    // Simulate report submission
    console.log('Report submitted with reason:', reason);
    
    // Try to navigate if ReportPropertyScreen exists
    if (navigation?.navigate) {
      try {
        navigation.navigate('ReportPropertyScreen', {
          propertyId: route?.params?.propertyId || 'property-123',
          propertyName: 'Modern Luxury Villa',
          reason: reason
        });
      } catch (error) {
        // If navigation fails, show success message
        console.log('ReportPropertyScreen not found, showing success alert');
        showReportSuccess(reason);
      }
    } else {
      // No navigation available, show success message
      showReportSuccess(reason);
    }
  };

  const showReportSuccess = (reason) => {
    Alert.alert(
      'Report Submitted',
      `Thank you for reporting this property. Our team will review your report regarding "${reason}" and take appropriate action.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleScheduleViewing = () => {
    Alert.alert(
      'Schedule Viewing',
      'When would you like to schedule a viewing?',
      [
        {
          text: 'This Week',
          onPress: () => Alert.alert('Confirmed', 'Viewing scheduled for this week. You will receive a confirmation email shortly.')
        },
        {
          text: 'Next Week',
          onPress: () => Alert.alert('Confirmed', 'Viewing scheduled for next week. You will receive a confirmation email shortly.')
        },
        {
          text: 'Choose Date',
          onPress: () => Alert.alert('Coming Soon', 'Calendar picker will be available soon.')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleVirtualTour = () => {
    Alert.alert(
      'Virtual Tour',
      'Experience this property in 360° virtual reality',
      [
        {
          text: 'Start Tour',
          onPress: () => Alert.alert('Success', 'Virtual tour is loading...')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.heroContainer}>
        <Image source={{ uri: propertyImages[currentImageIndex] }} style={styles.heroImage} resizeMode="cover" />

        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navButton} onPress={handleBack}>
            <ArrowLeft size={20} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <View style={styles.homeIcon}>
              <Home size={20} color="#2D6A4F" strokeWidth={2} />
            </View>
          </View>
          <View style={styles.navRight}>
            <TouchableOpacity style={styles.navButton} onPress={() => setIsSaved(!isSaved)}>
              <Heart size={20} color={isSaved ? '#EF4444' : '#111827'} fill={isSaved ? '#EF4444' : 'none'} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Share2 size={20} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageCounter}>
          <Camera size={16} color="#fff" strokeWidth={2} />
          <Text style={styles.imageCounterText}>{currentImageIndex + 1} / {propertyImages.length}</Text>
        </View>

        <View style={styles.thumbnailStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailContent}>
            {propertyImages.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => setCurrentImageIndex(index)} style={[styles.thumbnail, currentImageIndex === index && styles.thumbnailActive]}>
                <Image source={{ uri: image }} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.propertyHeader}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>For Sale</Text>
            </View>
            <View style={styles.badgeBlue}>
              <Text style={styles.badgeBlueText}>New Listing</Text>
            </View>
          </View>
          <Text style={styles.title}>Modern Luxury Villa</Text>
          <View style={styles.addressRow}>
            <MapPin size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.address}>1245 Sunset Boulevard, Beverly Hills, CA 90210</Text>
          </View>
          <Text style={styles.price}>$789,000</Text>
        </View>

        <View style={styles.specsSection}>
          <View style={styles.specsGrid}>
            <SpecCard icon={<Bed size={24} color="#2D6A4F" strokeWidth={2} />} label="Bedrooms" value="4" />
            <SpecCard icon={<Bath size={24} color="#2D6A4F" strokeWidth={2} />} label="Bathrooms" value="3" />
            <SpecCard icon={<Maximize size={24} color="#2D6A4F" strokeWidth={2} />} label="Area" value="3,400" />
            <SpecCard icon={<Calendar size={24} color="#2D6A4F" strokeWidth={2} />} label="Built" value="2021" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Step into luxury with this stunning modern villa located in the heart of Beverly Hills. This architectural masterpiece features an open floor plan with floor-to-ceiling windows that flood the space with natural light. The gourmet kitchen boasts high-end appliances, custom cabinetry, and a large island perfect for entertaining.
          </Text>
          <Text style={[styles.description, styles.descriptionSpaced]}>
            The master suite includes a spa-like bathroom and private balcony with breathtaking views. Outside, enjoy the resort-style pool, outdoor kitchen, and beautifully landscaped gardens. This home is the epitome of California luxury living.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <View style={styles.featuresGrid}>
            <FeatureChip icon={<Droplet size={16} color="#2D6A4F" strokeWidth={2} />} label="Pool" />
            <FeatureChip icon={<Car size={16} color="#2D6A4F" strokeWidth={2} />} label="3-Car Garage" />
            <FeatureChip icon={<Flame size={16} color="#2D6A4F" strokeWidth={2} />} label="Fireplace" />
            <FeatureChip icon={<Wifi size={16} color="#2D6A4F" strokeWidth={2} />} label="Smart Home" />
            <FeatureChip icon={<Dumbbell size={16} color="#2D6A4F" strokeWidth={2} />} label="Home Gym" />
            <FeatureChip icon={<Trees size={16} color="#2D6A4F" strokeWidth={2} />} label="Garden" />
            <FeatureChip icon={<ShieldCheck size={16} color="#2D6A4F" strokeWidth={2} />} label="Security System" />
            <FeatureChip icon={<Video size={16} color="#2D6A4F" strokeWidth={2} />} label="Home Theater" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity style={styles.directionsButton}>
              <Navigation size={16} color="#2D6A4F" strokeWidth={2} />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapPlaceholder}>
            <Image source={{ uri: propertyImages[0] }} style={styles.mapImage} blurRadius={10} />
            <View style={styles.mapOverlay}>
              <View style={styles.mapLabel}>
                <MapPin size={20} color="#2D6A4F" strokeWidth={2} />
                <Text style={styles.mapLabelText}>Beverly Hills, CA</Text>
              </View>
            </View>
          </View>

          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>9.5</Text>
              <Text style={styles.scoreLabel}>Walkability</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>8.7</Text>
              <Text style={styles.scoreLabel}>Transit</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>9.2</Text>
              <Text style={styles.scoreLabel}>Schools</Text>
            </View>
          </View>
        </View>

        <View style={styles.agentSection}>
          <Text style={styles.sectionTitle}>Contact Agent</Text>
          <View style={styles.agentCard}>
            <View style={styles.agentHeader}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentInitials}>JD</Text>
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>Jessica Davis</Text>
                <Text style={styles.agentRole}>Senior Real Estate Agent</Text>
                <View style={styles.agentRating}>
                  <Star size={16} color="#F39C12" fill="#F39C12" strokeWidth={2} />
                  <Text style={styles.agentRatingValue}>4.9</Text>
                  <Text style={styles.agentRatingCount}>(127 reviews)</Text>
                </View>
              </View>
            </View>

            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <Phone size={20} color="#2D6A4F" strokeWidth={2} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <Mail size={20} color="#2D6A4F" strokeWidth={2} />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <MessageCircle size={20} color="#2D6A4F" strokeWidth={2} />
                <Text style={styles.contactButtonText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomCTA}>
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButtonGreen} onPress={handleScheduleViewing}>
            <Text style={styles.ctaButtonText}>Schedule Viewing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaButtonDark} onPress={handleMakeOffer}>
            <Text style={styles.ctaButtonText}>Make an Offer</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButtonOutline} onPress={handleVirtualTour}>
            <Video size={20} color="#2D6A4F" strokeWidth={2} />
            <Text style={styles.ctaButtonOutlineText}>Virtual Tour</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaButtonReport} onPress={handleReportProperty} activeOpacity={0.7}>
            <Flag size={20} color="#DC2626" strokeWidth={2} />
            <Text style={styles.ctaButtonReportText}>Report Property</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  heroContainer: { height: 384, backgroundColor: '#000', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  topNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(0,0,0,0.6)' },
  navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  navCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  homeIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  navRight: { flexDirection: 'row', gap: 8 },
  imageCounter: { position: 'absolute', bottom: 76, right: 16, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  imageCounterText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  thumbnailStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: 32, paddingBottom: 16 },
  thumbnailContent: { paddingHorizontal: 16, gap: 8 },
  thumbnail: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', opacity: 0.6, marginRight: 8 },
  thumbnailActive: { borderColor: '#2D6A4F', opacity: 1, transform: [{ scale: 1.05 }] },
  thumbnailImage: { width: '100%', height: '100%' },
  content: { flex: 1 },
  propertyHeader: { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badgeGreen: { backgroundColor: '#2D6A4F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeGreenText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  badgeBlue: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeBlueText: { color: '#2D6A4F', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 12 },
  address: { flex: 1, fontSize: 14, color: '#6B7280', lineHeight: 20 },
  price: { fontSize: 32, fontWeight: '700', color: '#2D6A4F' },
  specsSection: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#F9FAFB' },
  specsGrid: { flexDirection: 'row', gap: 12 },
  specCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  specIconContainer: { marginBottom: 8 },
  specValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  specLabel: { fontSize: 12, color: '#6B7280' },
  section: { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 20, marginTop: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  descriptionSpaced: { marginTop: 12 },
  featuresSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 20, marginTop: 1 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  featureChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  directionsButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  directionsText: { fontSize: 14, color: '#2D6A4F', fontWeight: '600' },
  mapPlaceholder: { height: 192, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E5E7EB', marginBottom: 16, position: 'relative' },
  mapImage: { width: '100%', height: '100%', opacity: 0.4 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  mapLabel: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  mapLabelText: { fontSize: 16, color: '#111827', fontWeight: '600' },
  scoreGrid: { flexDirection: 'row', gap: 12 },
  scoreCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  scoreValue: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  scoreLabel: { fontSize: 12, color: '#6B7280' },
  agentSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 20, marginTop: 1 },
  agentCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  agentHeader: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  agentAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#2D6A4F', justifyContent: 'center', alignItems: 'center' },
  agentInitials: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  agentRole: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  agentRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  agentRatingValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  agentRatingCount: { fontSize: 14, color: '#9CA3AF' },
  contactButtons: { flexDirection: 'row', gap: 8 },
  contactButton: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  contactButtonText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  bottomSpacer: { height: 200 },
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 24, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  ctaRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  ctaButtonGreen: { flex: 1, backgroundColor: '#2D6A4F', borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  ctaButtonDark: { flex: 1, backgroundColor: '#111827', borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  ctaButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  ctaButtonOutline: { flex: 1, borderWidth: 2, borderColor: '#2D6A4F', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaButtonOutlineText: { color: '#2D6A4F', fontSize: 16, fontWeight: '600' },
  ctaButtonReport: { flex: 1, borderWidth: 2, borderColor: '#DC2626', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaButtonReportText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
});