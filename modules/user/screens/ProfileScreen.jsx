import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
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
  LayoutDashboard,
  Star,
  Award,
  TrendingUp,
  Settings,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../../utils/api';


const { width, height } = Dimensions.get('window');

const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

const AnimatedStatBox = ({ number, label, color, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statBox, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={[styles.statNumber, color && { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const ProfileScreen = ({
  onEditProfile = () => { },
  onMyProperties = () => { },
  onNotifications = () => { },
  onHelpSupport = () => { },
  onLogout = () => { },
  onChangePassword = () => { },
  onBack = () => { },
  navigation,
  userData: initialUserData = null,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [isLoading, setIsLoading] = useState(!initialUserData);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialUserData) {
      setUserData(initialUserData);
      setIsLoading(false);
    }
  }, [initialUserData]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');

      if (userStr) {
        setUserData(JSON.parse(userStr));
        setIsLoading(false);
      }

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
              onLogout();
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
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.emptyIconContainer}>
          <User size={40} color="#d1d5db" />
        </View>
        <Text style={styles.emptyText}>Please login to view profile</Text>
      </View>
    );
  }

  const renderVerificationBadge = () => {
    const status = userData.verificationStatus || userData.verificationType;

    if (userData.isVerified || status === 'verified') {
      return (
        <View style={styles.verifiedBadge}>
          <CheckCircle size={16} color="#10b981" fill="#d1fae5" strokeWidth={2.5} />
        </View>
      );
    }

    if (userData.role === 'builder') {
      if (status === 'pending') {
        return (
          <View style={styles.pendingBadge}>
            <AlertCircle size={16} color="#F59E0B" strokeWidth={2.5} />
          </View>
        );
      } else if (status === 'rejected') {
        return (
          <View style={styles.rejectedBadge}>
            <XCircle size={16} color="#EF4444" strokeWidth={2.5} />
          </View>
        );
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

  const handleTabPress = (tab) => {
    if (tab === 'profile') return;
    navigation.navigate('home');
  };

  const stats = userData.stats || {
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
  };

  const quickActions = [
    ...(userData.role === 'agent' || userData.role === 'builder'
      ? [{
        icon: LayoutDashboard,
        label: 'Dashboard',
        value: null,
        color: '#3B82F6',
        action: () => {
          if (userData.role === 'agent') {
            navigation?.navigate('agentDashboard');
          } else if (userData.role === 'builder') {
            navigation?.navigate('builderDashboard');
          }
        },
      }]
      : []),
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
    { icon: Shield, label: 'Security Settings', action: onChangePassword },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Enhanced Fixed Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#2D6A4F', '#1e4d38']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Enhanced Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.logoContainer}>
              <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
                <ArrowLeft size={20} color="#FFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <View style={styles.logoBox}>
                <House size={isSmallDevice ? 14 : 16} color="#2D6A4F" strokeWidth={2.5} />
              </View>
              <Text style={styles.logoText}>EstateHub</Text>
            </View>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.settingsButton} activeOpacity={0.8}>
                <Settings size={18} color="#FFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={onEditProfile} activeOpacity={0.8}>
                <Edit3 size={isSmallDevice ? 14 : 16} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                <Image
                  source={{ uri: getImageUrl(userData.profileImage) || DEFAULT_PROFILE_IMAGE }}
                  style={styles.profileImage}
                />
                <View style={styles.onlineIndicator} />
              </View>
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
                <Camera size={isSmallDevice ? 14 : 16} color="#2D6A4F" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {userData.name}
                </Text>
                {renderVerificationBadge()}
              </View>
              <View style={styles.roleBadge}>
                <Award size={12} color="#fbbf24" fill="#fef3c7" strokeWidth={2.5} />
                <Text style={styles.roleText}>
                  {userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1) || 'User'}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <View style={styles.contactIconCircle}>
                  <Mail size={10} color="#2D6A4F" strokeWidth={2.5} />
                </View>
                <Text style={styles.contactText} numberOfLines={1}>
                  {userData.email}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <View style={styles.contactIconCircle}>
                  <Phone size={10} color="#2D6A4F" strokeWidth={2.5} />
                </View>
                <Text style={styles.contactText} numberOfLines={1}>
                  {userData.phone || 'No phone provided'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2D6A4F']} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Enhanced Stats Summary */}
          <View style={styles.statsContainer}>
            <AnimatedStatBox
              number={stats.totalProperties}
              label={isSmallDevice ? 'Total' : 'Total Properties'}
              delay={0}
            />
            <AnimatedStatBox
              number={stats.activeListings}
              label="Active"
              color="#10B981"
              delay={100}
            />
            <AnimatedStatBox
              number={stats.soldProperties}
              label="Sold"
              color="#3B82F6"
              delay={200}
            />
          </View>

          {/* Enhanced Dashboard Access Card */}
          {(userData.role === 'agent' || userData.role === 'builder') && (
            <TouchableOpacity
              style={styles.dashboardCardContainer}
              onPress={() => {
                if (userData.role === 'agent') {
                  navigation?.navigate('agentDashboard');
                } else if (userData.role === 'builder') {
                  navigation?.navigate('builderDashboard');
                }
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#3B82F6', '#8b5cf6']}
                style={styles.dashboardCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.dashboardIconContainer}>
                  <LayoutDashboard size={24} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <View style={styles.dashboardTextContainer}>
                  <Text style={styles.dashboardTitle}>
                    {userData.role === 'agent' ? 'Agent Dashboard' : 'Builder Dashboard'}
                  </Text>
                  <Text style={styles.dashboardSubtitle}>
                    Manage your listings and leads
                  </Text>
                </View>
                <View style={styles.dashboardArrow}>
                  <ChevronRight size={24} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <View style={styles.sparkleIcon}>
                  <Sparkles size={20} color="rgba(255,255,255,0.5)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Enhanced Quick Actions */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.cardDivider} />
            </View>
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
                      <action.icon size={isSmallDevice ? 18 : 20} color={action.color} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                  <View style={styles.actionRight}>
                    {action.value !== null && (
                      <View style={styles.actionValueBadge}>
                        <Text style={styles.actionValue}>{action.value}</Text>
                      </View>
                    )}
                    <ChevronRight size={18} color="#9CA3AF" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Enhanced Profile Details Sections */}
          {profileSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{section.title}</Text>
                <View style={styles.cardDivider} />
              </View>
              <View style={styles.cardContent}>
                {section.items.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    style={styles.detailItem}
                  >
                    <View style={styles.detailLeft}>
                      <View style={styles.detailIconCircle}>
                        <item.icon size={16} color="#2D6A4F" strokeWidth={2.5} />
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>{item.label}</Text>
                        <Text
                          style={[
                            styles.detailValue,
                            item.valueColor ? { color: item.valueColor, fontWeight: '700' } : {}
                          ]}
                          numberOfLines={isSmallDevice ? 2 : 1}
                        >
                          {item.value}
                        </Text>
                      </View>
                    </View>
                    {item.action && (
                      <TouchableOpacity onPress={item.action}>
                        <ChevronRight size={18} color="#9CA3AF" strokeWidth={2.5} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Enhanced Legal Links */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Legal & Privacy</Text>
              <View style={styles.cardDivider} />
            </View>
            <View style={styles.cardContent}>
              {legalLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.legalItem}
                  onPress={link.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.legalLeft}>
                    <View style={styles.legalIconCircle}>
                      <link.icon size={16} color="#6B7280" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.legalLabel}>{link.label}</Text>
                  </View>
                  <ChevronRight size={18} color="#9CA3AF" strokeWidth={2.5} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Enhanced Logout & Delete Account */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <View style={styles.logoutIconCircle}>
                <LogOut size={20} color="#374151" strokeWidth={2.5} />
              </View>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8}>
              <Trash2 size={16} color="#EF4444" strokeWidth={2.5} />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Version Info */}
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.versionText}>© 2025 EstateHub. All rights reserved.</Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>

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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingBottom: isSmallDevice ? 24 : 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 20 : 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 : 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 14 : 16,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImageWrapper: {
    width: isSmallDevice ? 80 : 90,
    height: isSmallDevice ? 80 : 90,
    borderRadius: isSmallDevice ? 40 : 45,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: isSmallDevice ? 28 : 32,
    height: isSmallDevice ? 28 : 32,
    backgroundColor: '#FFF',
    borderRadius: isSmallDevice ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(45, 106, 79, 0.1)',
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: 6,
  },
  name: {
    color: '#FFF',
    fontSize: isSmallDevice ? 19 : 22,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  contactIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: isSmallDevice ? 13 : 14,
    flex: 1,
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingTop: isSmallDevice ? 20 : 24,
    paddingBottom: isSmallDevice ? 90 : 100,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 20 : 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: isSmallDevice ? 16 : 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statNumber: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dashboardCardContainer: {
    marginBottom: isSmallDevice ? 20 : 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? 18 : 20,
    position: 'relative',
    overflow: 'hidden',
  },
  dashboardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dashboardTextContainer: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  dashboardSubtitle: {
    fontSize: isSmallDevice ? 12 : 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  dashboardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: isSmallDevice ? 16 : 18,
    padding: isSmallDevice ? 16 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: isSmallDevice ? 16 : 20,
    borderWidth: 1,
    borderColor: '#f9fafb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  cardDivider: {
    flex: 1,
    height: 2,
    backgroundColor: '#f3f4f6',
    borderRadius: 1,
  },
  cardContent: {
    gap: isSmallDevice ? 2 : 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 14,
    backgroundColor: '#fafbfc',
    marginBottom: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 12 : 14,
    flex: 1,
  },
  actionIconBox: {
    width: isSmallDevice ? 42 : 46,
    height: isSmallDevice ? 42 : 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: isSmallDevice ? 14 : 15,
    color: '#111827',
    flex: 1,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionValueBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  actionValue: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#374151',
    fontWeight: '700',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 14,
    backgroundColor: '#fafbfc',
    marginBottom: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 12 : 14,
    flex: 1,
    minWidth: 0,
  },
  detailIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: isSmallDevice ? 14 : 15,
    color: '#111827',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 14,
    backgroundColor: '#fafbfc',
    marginBottom: 8,
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 12 : 14,
  },
  legalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalLabel: {
    fontSize: isSmallDevice ? 14 : 15,
    color: '#111827',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  actionsContainer: {
    gap: 14,
    marginBottom: isSmallDevice ? 24 : 28,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: isSmallDevice ? 50 : 54,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: isSmallDevice ? 15 : 16,
    color: '#374151',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  deleteButtonText: {
    fontSize: isSmallDevice ? 14 : 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 24 : 28,
    marginBottom: 20,
    gap: 6,
  },
  versionText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default ProfileScreen;
