import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  House,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  Bell,
  Globe,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  Camera,
  CheckCircle,
  Home,
  Heart,
  Trash2,
  ArrowLeft,
  AlertCircle,
  XCircle,
} from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual API URL

// Responsive breakpoints
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

const ProfileScreen = ({
  onEditProfile = () => { },
  onMyProperties = () => { },
  onNotifications = () => { },
  onHelpSupport = () => { },
  onLogout = () => { },
  onChangePassword = () => { },
  onBack = () => { },
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user data
  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      // Optimitically set from storage first
      if (userStr) {
        setUserData(JSON.parse(userStr));
        setIsLoading(false);
      }

      // Then fetch fresh data from API
      if (token) {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const freshData = await response.json();
          setUserData(freshData);
          await AsyncStorage.setItem('user', JSON.stringify(freshData));
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['authToken', 'user']);
              onLogout();
            } catch (error) {
              console.error('Logout error:', error);
              onLogout(); // Force logout anyway
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280' }}>Please login to view profile</Text>
      </View>
    );
  }

  // Helper to render verification badge
  const renderVerificationBadge = () => {
    const status = userData.verificationStatus || userData.verificationType; // Fallback or adjust based on API

    if (userData.isVerified || status === 'verified') {
      return <CheckCircle size={isSmallDevice ? 16 : 20} color="#60A5FA" fill="#E6F2FF" />;
    }

    if (userData.role === 'builder') {
      if (status === 'pending') {
        return (
          <View style={styles.badgeContainer}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/9502/9502332.png' }}
              style={{ width: 16, height: 16, tintColor: '#F59E0B' }}
            />
          </View>
        );
      } else if (status === 'rejected') {
        return <XCircle size={isSmallDevice ? 16 : 20} color="#EF4444" />;
      }
    }
    return null;
  };


  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { icon: User, label: 'Full Name', value: userData.name },
        { icon: Mail, label: 'Email Address', value: userData.email },
        { icon: Phone, label: 'Phone Number', value: userData.phone || 'Not provided' },
      ],
    },
  ];

  // Add Business Information for Builders
  if (userData.role === 'builder') {
    profileSections.push({
      title: 'Business Information',
      items: [
        { icon: House, label: 'Company Name', value: userData.companyName || 'N/A' },
        { icon: MapPin, label: 'Business Address', value: [userData.businessAddress, userData.city, userData.state].filter(Boolean).join(', ') || 'N/A' },
        { icon: Shield, label: 'GST Number', value: userData.gstNo || 'N/A' },
        { icon: Shield, label: 'PAN Number', value: userData.panNo || 'N/A' },
        {
          icon: userData.verificationStatus === 'verified' ? CheckCircle : (userData.verificationStatus === 'rejected' ? XCircle : AlertCircle),
          label: 'Verification Status',
          value: (userData.verificationStatus || 'Pending').charAt(0).toUpperCase() + (userData.verificationStatus || 'pending').slice(1),
          valueColor: userData.verificationStatus === 'verified' ? '#10B981' : (userData.verificationStatus === 'rejected' ? '#EF4444' : '#F59E0B')
        },
      ],
    });
  }

  // ... (stats and quickActions setup remains similar) ...

  // Ensure stats object exists
  const stats = userData.stats || {
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
  };

  const quickActions = [
    {
      icon: Home,
      label: 'My Properties',
      value: stats.totalProperties,
      color: '#2D6A4F',
      action: onMyProperties,
    },
    { icon: Heart, label: 'Saved Listings', value: 12, color: '#E74C3C' },
    { icon: Bell, label: 'Notifications', value: 3, color: '#F39C12', action: onNotifications },
    { icon: HelpCircle, label: 'Help & Support', value: null, color: '#3498DB', action: onHelpSupport },
  ];

  const legalLinks = [
    { icon: FileText, label: 'Privacy Policy' },
    { icon: FileText, label: 'Terms & Conditions' },
    { icon: Shield, label: 'Security Settings' },
  ];

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          {/* ... (Logo and Back button code - no changes) ... */}
          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.logoBox}>
              <House size={isSmallDevice ? 14 : 16} color="#2D6A4F" />
            </View>
            <Text style={styles.logoText}>EstateHub</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
            <Edit3 size={isSmallDevice ? 14 : 16} color="#FFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={userData.profileImage ? { uri: userData.profileImage } : { uri: 'https://via.placeholder.com/150' }}
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={isSmallDevice ? 14 : 16} color="#2D6A4F" />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {userData.name}
              </Text>
              {renderVerificationBadge()}
            </View>
            <View style={styles.contactRow}>
              <Mail size={isSmallDevice ? 10 : 12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.contactText} numberOfLines={1}>
                {userData.email}
              </Text>
            </View>
            {/* ... */}
            <View style={styles.contactRow}>
              <Phone size={isSmallDevice ? 10 : 12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.contactText} numberOfLines={1}>
                {userData.phone || 'No phone provided'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2D6A4F']} />
        }
      >
        {/* ... (Rest of the JSX) ... */}

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalProperties}</Text>
            <Text style={styles.statLabel}>Total{isSmallDevice ? '' : ' Properties'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {stats.activeListings}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {stats.soldProperties}
            </Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.cardContent}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={styles.actionLeft}>
                  <View
                    style={[
                      styles.actionIconBox,
                      { backgroundColor: `${action.color}15` },
                    ]}
                  >
                    <action.icon size={isSmallDevice ? 18 : 20} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </View>
                <View style={styles.actionRight}>
                  {action.value !== null && (
                    <Text style={styles.actionValue}>{action.value}</Text>
                  )}
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profile Details Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <View style={styles.cardContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.detailItem}
                  onPress={item.action}
                  activeOpacity={0.7}
                  disabled={!item.action}
                >
                  <View style={styles.detailLeft}>
                    <item.icon size={16} color="#9CA3AF" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={[styles.detailValue, item.valueColor ? { color: item.valueColor, fontWeight: '600' } : {}]} numberOfLines={isSmallDevice ? 2 : 1}>
                        {item.value}
                      </Text>
                    </View>
                  </View>
                  {item.action && <ChevronRight size={16} color="#9CA3AF" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Legal Links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal & Privacy</Text>
          <View style={styles.cardContent}>
            {legalLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.legalItem}
                activeOpacity={0.7}
              >
                <View style={styles.legalLeft}>
                  <link.icon size={16} color="#9CA3AF" />
                  <Text style={styles.legalLabel}>{link.label}</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout & Delete Account */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#374151" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionText}>© 2025 EstateHub. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    maxWidth: isLargeDevice ? 768 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingBottom: isSmallDevice ? 20 : 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 16 : 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 : 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: isSmallDevice ? 28 : 32,
    height: isSmallDevice ? 28 : 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 : 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 12 : 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 12 : 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImageWrapper: {
    width: isSmallDevice ? 70 : 80,
    height: isSmallDevice ? 70 : 80,
    borderRadius: isSmallDevice ? 35 : 40,
    overflow: 'hidden',
    borderWidth: isSmallDevice ? 3 : 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: isSmallDevice ? 24 : 28,
    height: isSmallDevice ? 24 : 28,
    backgroundColor: '#FFF',
    borderRadius: isSmallDevice ? 12 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 : 8,
    marginBottom: 4,
  },
  name: {
    color: '#FFF',
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '600',
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  contactText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: isSmallDevice ? 12 : 14,
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingTop: isSmallDevice ? 16 : 24,
    paddingBottom: isSmallDevice ? 80 : 96,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 12,
    marginBottom: isSmallDevice ? 16 : 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: isSmallDevice ? 12 : 16,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isSmallDevice ? 10 : 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: isSmallDevice ? 12 : 16,
    padding: isSmallDevice ? 12 : 16,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    marginBottom: isSmallDevice ? 12 : 16,
  },
  cardTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: isSmallDevice ? 12 : 16,
  },
  cardContent: {
    gap: isSmallDevice ? 4 : 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    flex: 1,
  },
  actionIconBox: {
    width: isSmallDevice ? 36 : 40,
    height: isSmallDevice ? 36 : 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#111827',
    flex: 1,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionValue: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6B7280',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    flex: 1,
    minWidth: 0,
  },
  detailTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#111827',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmallDevice ? 10 : 12,
    borderRadius: 12,
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
  },
  legalLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#111827',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: isSmallDevice ? 20 : 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: isSmallDevice ? 44 : 48,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#EF4444',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 20 : 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ProfileScreen;