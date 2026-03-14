import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Heart,
  Share2,
  Maximize2,
  ChevronDown,
  Home as HomeIcon,
  Bed,
  Bath,
  Ruler,
  MapPin,
  Star,
  Info,
  MessageCircle,
  Calendar,
  Phone,
  Check,
  Eye,
  Shield,
  Clock,
  Play,
  Grid3x3,
  Map,
  Home,
  Building2,
  Search,
  User
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const VirtualTourScreen = ({
  onBack,
  onScheduleVisit,
  onContactAgent,
  onBook
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const bottomSheetHeight = useRef(new Animated.Value(160)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const property = {
    id: 'prop-001',
    title: 'Downtown Luxury Penthouse',
    location: 'Downtown LA, California',
    price: '$2,450,000',
    type: 'Penthouse',
    rating: 4.8,
    beds: 4,
    baths: 3,
    area: '3,450',
    description: 'Stunning luxury penthouse with panoramic city views, modern finishes, and premium amenities.',
    updatedDays: 2,
  };

  const rooms = [
    {
      id: 'living',
      name: 'Living Room',
      image: 'https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?w=800',
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      image: 'https://images.unsplash.com/photo-1668026694348-b73c5eb5e299?w=800',
    },
    {
      id: 'master',
      name: 'Master Bedroom',
      image: 'https://images.unsplash.com/photo-1572742482459-e04d6cfdd6f3?w=800',
    },
    { id: 'bathroom', name: 'Bathroom', image: 'https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?w=800' },
    { id: 'balcony', name: 'Balcony', image: 'https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?w=800' },
    { id: 'exterior', name: 'Exterior', image: 'https://images.unsplash.com/photo-1758957530781-4ff54e09bee2?w=800' },
  ];

  const hotspots = [
    {
      id: 'h1',
      x: 30,
      y: 40,
      title: 'Italian Marble Flooring',
      description: 'Premium imported marble throughout',
    },
    {
      id: 'h2',
      x: 70,
      y: 35,
      title: 'Smart Lighting',
      description: 'Voice-controlled LED lighting system',
    },
    {
      id: 'h3',
      x: 50,
      y: 60,
      title: 'Custom Built-ins',
      description: 'Designer furniture included',
    },
  ];

  const [currentRoom, setCurrentRoom] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaMode, setMediaMode] = useState('360');
  const [selectedFloor, setSelectedFloor] = useState('Floor 1');
  const [showFloorMenu, setShowFloorMenu] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const toggleExpanded = () => {
    const newHeight = isExpanded ? 160 : 500;
    setIsExpanded(!isExpanded);
    
    Animated.spring(bottomSheetHeight, {
      toValue: newHeight,
      useNativeDriver: false,
      friction: 8
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Virtual Tour Viewer */}
      <View style={styles.tourViewer}>
        <Image
          source={{ uri: rooms[currentRoom].image }}
          style={styles.tourImage}
        />

        {/* Gradient Overlays */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topGradient}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.bottomGradient}
        />

        {/* Top Controls */}
        <Animated.View
          style={[
            styles.topControls,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity onPress={onBack} style={styles.controlButton}>
            <ArrowLeft width={20} height={20} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {property.title}
            </Text>
          </View>

          <View style={styles.topRightControls}>
            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              style={styles.controlButton}
            >
              <Heart
                width={20}
                height={20}
                color={isFavorite ? '#ef4444' : '#ffffff'}
                fill={isFavorite ? '#ef4444' : 'none'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton}>
              <Share2 width={20} height={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Interactive Hotspots */}
        {mediaMode === '360' && hotspots.map((hotspot) => (
          <TouchableOpacity
            key={hotspot.id}
            onPress={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
            style={[
              styles.hotspot,
              {
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`
              }
            ]}
          >
            <View style={styles.hotspotPulse} />
            
            {activeHotspot === hotspot.id && (
              <View style={styles.hotspotTooltip}>
                <View style={styles.hotspotArrow} />
                <Text style={styles.hotspotTitle}>{hotspot.title}</Text>
                <Text style={styles.hotspotDesc}>{hotspot.description}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Bottom Tour Controls */}
        <View style={styles.tourControls}>
          <View style={styles.tourControlsInner}>
            {/* 360° Badge */}
            <View style={styles.badge360}>
              <Eye width={16} height={16} color="#ffffff" />
              <Text style={styles.badge360Text}>360°</Text>
            </View>

            {/* Floor Selector */}
            <TouchableOpacity
              onPress={() => setShowFloorMenu(!showFloorMenu)}
              style={styles.floorSelector}
            >
              <Text style={styles.floorText}>{selectedFloor}</Text>
              <ChevronDown width={12} height={12} color="#ffffff" />
            </TouchableOpacity>

            {/* Room Selector */}
            <TouchableOpacity
              onPress={() => setShowRoomMenu(!showRoomMenu)}
              style={styles.roomSelector}
            >
              <Text style={styles.roomText}>{rooms[currentRoom].name}</Text>
              <ChevronDown width={12} height={12} color="#ffffff" />
            </TouchableOpacity>

            {/* Fullscreen */}
            <TouchableOpacity style={styles.fullscreenButton}>
              <Maximize2 width={16} height={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            Room {currentRoom + 1} of {rooms.length}
          </Text>
        </View>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        {/* Media Mode Toggle */}
        <View style={styles.mediaModeToggle}>
          <TouchableOpacity
            onPress={() => setMediaMode('360')}
            style={styles.mediaModeButton}
          >
            <Eye width={20} height={20} color={mediaMode === '360' ? '#2D6A4F' : '#9ca3af'} />
            <Text style={[
              styles.mediaModeText,
              mediaMode === '360' && styles.mediaModeTextActive
            ]}>
              360° View
            </Text>
            {mediaMode === '360' && <View style={styles.mediaModeIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMediaMode('gallery')}
            style={styles.mediaModeButton}
          >
            <Grid3x3 width={20} height={20} color={mediaMode === 'gallery' ? '#2D6A4F' : '#9ca3af'} />
            <Text style={[
              styles.mediaModeText,
              mediaMode === 'gallery' && styles.mediaModeTextActive
            ]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMediaMode('video')}
            style={styles.mediaModeButton}
          >
            <Play width={20} height={20} color={mediaMode === 'video' ? '#2D6A4F' : '#9ca3af'} />
            <Text style={[
              styles.mediaModeText,
              mediaMode === 'video' && styles.mediaModeTextActive
            ]}>
              Video
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMediaMode('floorplan')}
            style={styles.mediaModeButton}
          >
            <Map width={20} height={20} color={mediaMode === 'floorplan' ? '#2D6A4F' : '#9ca3af'} />
            <Text style={[
              styles.mediaModeText,
              mediaMode === 'floorplan' && styles.mediaModeTextActive
            ]}>
              Floor Plan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Room Navigation */}
        <View style={styles.roomNavigation}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roomNavScroll}
          >
            {rooms.map((room, index) => (
              <TouchableOpacity
                key={room.id}
                onPress={() => setCurrentRoom(index)}
                style={[
                  styles.roomNavButton,
                  currentRoom === index && styles.roomNavButtonActive
                ]}
              >
                <Text style={[
                  styles.roomNavText,
                  currentRoom === index && styles.roomNavTextActive
                ]}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Draggable Bottom Sheet */}
        <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
          <TouchableOpacity
            onPress={toggleExpanded}
            style={styles.dragHandle}
          >
            <View style={styles.dragIndicator} />
          </TouchableOpacity>

          <ScrollView
            style={styles.bottomSheetScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.bottomSheetContent}>
              {/* Property Header */}
              <View style={styles.propertyHeader}>
                <View style={styles.propertyHeaderLeft}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>
                  
                  <View style={styles.propertyLocation}>
                    <MapPin width={16} height={16} color="#9ca3af" />
                    <Text style={styles.propertyLocationText}>{property.location}</Text>
                  </View>

                  <View style={styles.propertyPriceRow}>
                    <Text style={styles.propertyPrice}>{property.price}</Text>
                    <View style={styles.ratingBadge}>
                      <Star width={16} height={16} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingText}>{property.rating}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.propertyTypeBadge}>
                  <Text style={styles.propertyTypeText}>{property.type}</Text>
                </View>
              </View>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.propertyDescription}>
                    {property.description}
                  </Text>

                  {/* Property Stats */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Bed width={20} height={20} color="#2D6A4F" />
                      <Text style={styles.statValue}>{property.beds}</Text>
                      <Text style={styles.statLabel}>Beds</Text>
                    </View>

                    <View style={styles.statCard}>
                      <Bath width={20} height={20} color="#2D6A4F" />
                      <Text style={styles.statValue}>{property.baths}</Text>
                      <Text style={styles.statLabel}>Baths</Text>
                    </View>

                    <View style={styles.statCard}>
                      <Ruler width={20} height={20} color="#2D6A4F" />
                      <Text style={styles.statValue}>{property.area}</Text>
                      <Text style={styles.statLabel}>Sq Ft</Text>
                    </View>
                  </View>

                  {/* Trust Indicators */}
                  <View style={styles.trustIndicators}>
                    <View style={styles.trustItem}>
                      <Shield width={16} height={16} color="#2563eb" />
                      <Text style={styles.trustText}>Verified Listing</Text>
                    </View>
                    <View style={styles.trustItem}>
                      <Eye width={16} height={16} color="#2563eb" />
                      <Text style={styles.trustText}>HD Quality Tour</Text>
                    </View>
                    <View style={styles.trustItem}>
                      <Clock width={16} height={16} color="#2563eb" />
                      <Text style={styles.trustText}>Updated {property.updatedDays}d ago</Text>
                    </View>
                    <View style={styles.trustItem}>
                      <Check width={16} height={16} color="#2563eb" />
                      <Text style={styles.trustText}>Secure Viewing</Text>
                    </View>
                  </View>

                  {/* CTA Card */}
                  <LinearGradient
                    colors={['#2D6A4F', '#245A42']}
                    style={styles.ctaCard}
                  >
                    <Text style={styles.ctaTitle}>Like what you see?</Text>
                    
                    <TouchableOpacity
                      onPress={onScheduleVisit}
                      style={styles.ctaButtonPrimary}
                    >
                      <Calendar width={20} height={20} color="#2D6A4F" />
                      <Text style={styles.ctaButtonPrimaryText}>Schedule In-Person Visit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onContactAgent}
                      style={styles.ctaButtonSecondary}
                    >
                      <Phone width={20} height={20} color="#ffffff" />
                      <Text style={styles.ctaButtonSecondaryText}>Contact Agent</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Sticky Action Bar */}
        {!isExpanded && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              onPress={onBook}
              style={styles.bookButton}
            >
              <LinearGradient
                colors={['#2D6A4F', '#245A42']}
                style={styles.bookButtonGradient}
              >
                <Check width={20} height={20} color="#ffffff" />
                <Text style={styles.bookButtonText}>Book This Property</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              style={styles.favoriteActionButton}
            >
              <Heart
                width={24}
                height={24}
                color={isFavorite ? '#ef4444' : '#6b7280'}
                fill={isFavorite ? '#ef4444' : 'none'}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Floating Chat Button */}
        <TouchableOpacity
          onPress={() => setShowChat(!showChat)}
          style={styles.chatButton}
        >
          <LinearGradient
            colors={['#2D6A4F', '#245A42']}
            style={styles.chatButtonGradient}
          >
            <MessageCircle width={24} height={24} color="#ffffff" />
            <View style={styles.chatBadge} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Floor Menu Modal */}
      <Modal
        visible={showFloorMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFloorMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFloorMenu(false)}
        >
          <View style={styles.floorMenu}>
            {['Floor 1', 'Floor 2', 'Rooftop'].map((floor) => (
              <TouchableOpacity
                key={floor}
                onPress={() => {
                  setSelectedFloor(floor);
                  setShowFloorMenu(false);
                }}
                style={[
                  styles.menuItem,
                  selectedFloor === floor && styles.menuItemActive
                ]}
              >
                <Text style={[
                  styles.menuItemText,
                  selectedFloor === floor && styles.menuItemTextActive
                ]}>
                  {floor}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Room Menu Modal */}
      <Modal
        visible={showRoomMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoomMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRoomMenu(false)}
        >
          <View style={styles.roomMenu}>
            {rooms.map((room, index) => (
              <TouchableOpacity
                key={room.id}
                onPress={() => {
                  setCurrentRoom(index);
                  setShowRoomMenu(false);
                }}
                style={[
                  styles.menuItem,
                  currentRoom === index && styles.menuItemActive
                ]}
              >
                <Text style={[
                  styles.menuItemText,
                  currentRoom === index && styles.menuItemTextActive
                ]}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={showChat}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChat(false)}
      >
        <View style={styles.chatModal}>
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat with Agent</Text>
              <TouchableOpacity
                onPress={() => setShowChat(false)}
                style={styles.chatCloseButton}
              >
                <Text style={styles.chatCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chatMessages}>
              <View style={styles.chatMessage}>
                <Text style={styles.chatMessageText}>
                  Hi! I'm here to help you with this property. What would you like to know?
                </Text>
                <Text style={styles.chatMessageTime}>Agent • Now</Text>
              </View>
            </View>

            <View style={styles.chatInputContainer}>
              <TextInput
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                style={styles.chatInput}
              />
              <TouchableOpacity style={styles.chatSendButton}>
                <LinearGradient
                  colors={['#2D6A4F', '#245A42']}
                  style={styles.chatSendGradient}
                >
                  <MessageCircle width={20} height={20} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home width={24} height={24} color="#9ca3af" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Building2 width={24} height={24} color="#9ca3af" />
          <Text style={styles.navText}>Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Search width={24} height={24} color="#9ca3af" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MessageCircle width={24} height={24} color="#9ca3af" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <User width={24} height={24} color="#9ca3af" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },

  // Tour Viewer
  tourViewer: {
    height: '65%',
    position: 'relative',
    backgroundColor: '#1f2937'
  },
  tourImage: {
    width: '100%',
    height: '100%'
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 128
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 128
  },

  // Top Controls
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  titleText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500'
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 8
  },

  // Hotspots
  hotspot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D6A4F',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  hotspotPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: '#2D6A4F',
    opacity: 0.5
  },
  hotspotTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    marginLeft: -96,
    marginBottom: 8,
    width: 192,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  hotspotArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '45deg' }]
  },
  hotspotTitle: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 4,
    fontWeight: '600'
  },
  hotspotDesc: {
    fontSize: 12,
    color: '#6b7280'
  },

  // Tour Controls
  tourControls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16
  },
  tourControlsInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  badge360: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  badge360Text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
  floorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  floorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
  roomSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  roomText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
  fullscreenButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Progress Badge
  progressBadge: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },

  // Bottom Content
  bottomContent: {
    flex: 1,
    backgroundColor: '#f9fafb',
    position: 'relative'
  },

  // Media Mode Toggle
  mediaModeToggle: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  mediaModeButton: {
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  mediaModeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500'
  },
  mediaModeTextActive: {
    color: '#2D6A4F'
  },
  mediaModeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2D6A4F'
  },

  // Room Navigation
  roomNavigation: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  roomNavScroll: {
    gap: 8
  },
  roomNavButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6'
  },
  roomNavButtonActive: {
    backgroundColor: '#2D6A4F',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  roomNavText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  roomNavTextActive: {
    color: '#ffffff'
  },

  // Bottom Sheet
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden'
  },
  dragHandle: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center'
  },
  dragIndicator: {
    width: 48,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2
  },
  bottomSheetScroll: {
    flex: 1
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 24
  },

  // Property Header
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  propertyHeaderLeft: {
    flex: 1
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  propertyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  propertyLocationText: {
    fontSize: 14,
    color: '#6b7280'
  },
  propertyPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D6A4F'
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  ratingText: {
    fontSize: 14,
    color: '#b45309',
    fontWeight: '600'
  },
  propertyTypeBadge: {
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8
  },
  propertyTypeText: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '500'
  },

  // Expanded Content
  expandedContent: {
    gap: 16
  },
  propertyDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827'
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },

  // Trust Indicators
  trustIndicators: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%'
  },
  trustText: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '500'
  },

  // CTA Card
  ctaCard: {
    borderRadius: 16,
    padding: 20,
    gap: 8
  },
  ctaTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12
  },
  ctaButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12
  },
  ctaButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D6A4F'
  },
  ctaButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12
  },
  ctaButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  },

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8
  },
  bookButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden'
  },
  bookButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  },
  favoriteActionButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Floating Chat
  chatButton: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  chatButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28
  },
  chatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff'
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  floorMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  roomMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  menuItemActive: {
    backgroundColor: '#2D6A4F'
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  menuItemTextActive: {
    color: '#ffffff'
  },

  // Chat Modal
  chatModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  chatContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: 400
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  chatCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chatCloseText: {
    fontSize: 24,
    color: '#6b7280'
  },
  chatMessages: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  chatMessage: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  chatMessageText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4
  },
  chatMessageTime: {
    fontSize: 12,
    color: '#9ca3af'
  },
  chatInputContainer: {
    flexDirection: 'row',
    gap: 8
  },
  chatInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827'
  },
  chatSendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden'
  },
  chatSendGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  navItem: {
    alignItems: 'center',
    gap: 4
  },
  navText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500'
  }
});

export default VirtualTourScreen;
