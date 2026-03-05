import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Home,
  Building2,
  Plus,
  TrendingUp,
  FileText,
  Users,
  User,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  Eye,
  Edit,
  Clock,
  MessageSquare,
  BarChart3,
  MapPin,
  Check,
  X,
} from 'lucide-react-native';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';

const { width, height } = Dimensions.get('window');

export default function BuilderDashboard({
  builderName = 'John Anderson',
  navigation,
  onBack,
  onPropertyClick,
  onAddProperty,
  onAssignAgent,
  onMyProperties,
}) {
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchInquiries();
    fetchPendingRequestsCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/builder/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/inquiries/builder?status=pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error('Fetch inquiries error:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  // Fetch pending agent->builder property requests count
  const fetchPendingRequestsCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/property-requests/builder?status=pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPendingRequestsCount((data.requests || []).length);
      }
    } catch (err) {
      console.error('Fetch property requests count error:', err);
    }
  };

  // Handle accept inquiry
  const handleAcceptInquiry = async (inquiryId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Inquiry accepted! You can now chat with the user.');
        fetchInquiries(); // Refresh inquiries list
      } else {
        Alert.alert('Error', data.message || 'Failed to accept inquiry');
      }
    } catch (error) {
      console.error('Accept inquiry error:', error);
      Alert.alert('Error', 'Failed to accept inquiry');
    }
  };

  // Handle reject inquiry
  const handleRejectInquiry = async (inquiryId) => {
    Alert.alert(
      'Reject Inquiry',
      'Are you sure you want to reject this inquiry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/reject`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  rejection_reason: 'Not interested at this time'
                })
              });

              const data = await response.json();
              if (response.ok && data.success) {
                Alert.alert('Success', 'Inquiry rejected');
                fetchInquiries(); // Refresh inquiries list
              } else {
                Alert.alert('Error', data.message || 'Failed to reject inquiry');
              }
            } catch (error) {
              console.error('Reject inquiry error:', error);
              Alert.alert('Error', 'Failed to reject inquiry');
            }
          }
        }
      ]
    );
  };

  // Dashboard stats - use API data or fallback to defaults
  const stats = dashboardData?.stats || {
    activeProjects: 0,
    totalListings: 0,
    pendingInquiries: 0,
    upcomingDeadlines: 0,
  };

  // Recent listings - use API data or empty array
  const recentListings = dashboardData?.recentListings || [];

  // Active projects - use API data or empty array  
  const activeProjects = dashboardData?.activeListings || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'sold':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'on-track':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'delayed':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'completed':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getStatusText = (status) => {
    if (status === 'on-track') return 'On Track';
    if (status === 'delayed') return 'Delayed';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handlePropertyClick = (listing) => {
    console.log('Property clicked:', listing.title);
    if (onPropertyClick) {
      // Ensure the image URL is resolved before passing it to the detail screen
      const processedListing = {
        ...listing,
        image: getImageUrl(listing.image || listing.imageUrl) || DEFAULT_PROPERTY_IMAGE
      };
      onPropertyClick(processedListing);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load dashboard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchDashboardData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          {onBack && (
            <TouchableOpacity
              style={styles.backButtonError}
              onPress={onBack}
            >
              <Text style={styles.backButtonTextError}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {/* Fixed Header with Background */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY2MjI1ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
          }}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />

          {/* Header Content */}
          <View style={styles.headerContent}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View style={styles.topBarLeft}>
                <View style={styles.logoBox}>
                  <Building2 size={20} color="#2D6A4F" strokeWidth={2} />
                </View>
                <Text style={styles.logoText}>EstateHub</Text>
              </View>
              <View style={styles.topBarRight}>
                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => navigation.navigate('builderNotifications')}
                >
                  <Bell size={24} color="#FFFFFF" strokeWidth={2} />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {pendingRequestsCount}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Settings size={24} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome, {builderName}!</Text>
              <Text style={styles.welcomeSubtitle}>
                Manage your properties, listings, and projects in one place
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#2D6A4F15' }]}>
                <Building2 size={20} color="#2D6A4F" strokeWidth={2} />
              </View>
              <TrendingUp size={16} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Active Projects</Text>
            <Text style={styles.statValue}>{stats.activeProjects}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#3B82F615' }]}>
                <FileText size={20} color="#3B82F6" strokeWidth={2} />
              </View>
              <TrendingUp size={16} color="#10B981" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Total Listings</Text>
            <Text style={styles.statValue}>{stats.totalListings}</Text>
          </View>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('builderInquiries')}
            activeOpacity={0.7}
          >
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#F9731615' }]}>
                <Users size={20} color="#F97316" strokeWidth={2} />
              </View>
              <Text style={styles.newBadge}>View All</Text>
            </View>
            <Text style={styles.statLabel}>Pending Inquiries</Text>
            <Text style={styles.statValue}>{stats.pendingInquiries}</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#EF444415' }]}>
                <Calendar size={20} color="#EF4444" strokeWidth={2} />
              </View>
              <Clock size={16} color="#EF4444" strokeWidth={2} />
            </View>
            <Text style={styles.statLabel}>Upcoming Deadlines</Text>
            <Text style={styles.statValue}>{stats.upcomingDeadlines}</Text>
          </View>
        </View>

        {/* Primary Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onAddProperty}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryButtonText}>Add New Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onAssignAgent}
            activeOpacity={0.8}
          >
            <Building2 size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.secondaryButtonText}>Assign Agent</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Navigation */}
        <View style={styles.quickAccessCard}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#2D6A4F15' }]}>
                <FileText size={24} color="#2D6A4F" strokeWidth={2} />
              </View>
              <Text style={styles.quickAccessLabel}>My Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#3B82F615' }]}>
                <BarChart3 size={24} color="#3B82F6" strokeWidth={2} />
              </View>
              <Text style={styles.quickAccessLabel}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessItem}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#A855F715' }]}>
                <MessageSquare size={24} color="#A855F7" strokeWidth={2} />
              </View>
              <Text style={styles.quickAccessLabel}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Active Projects</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {activeProjects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.title}</Text>
                  <View style={styles.projectDeadline}>
                    <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.projectDeadlineText}>
                      {project.deadline}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(project.status).bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: getStatusColor(project.status).text,
                      },
                    ]}
                  >
                    {getStatusText(project.status)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{project.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${project.progress}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>


        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Recent Listings</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentListings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              style={styles.listingCard}
              onPress={() => handlePropertyClick(listing)}
              activeOpacity={0.7}
            >
              <View style={styles.listingHeader}>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <View style={styles.listingLocation}>
                    <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
                    <Text style={styles.listingLocationText}>
                      {listing.city}
                    </Text>
                  </View>
                  <Text style={styles.listingPrice}>{listing.price}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(listing.status).bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: getStatusColor(listing.status).text,
                      },
                    ]}
                  >
                    {getStatusText(listing.status)}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.listingStats}>
                <View style={styles.listingStat}>
                  <Eye size={16} color="#9CA3AF" strokeWidth={2} />
                  <Text style={styles.listingStatText}>{listing.views} views</Text>
                </View>
                <View style={styles.listingStat}>
                  <MessageSquare size={16} color="#9CA3AF" strokeWidth={2} />
                  <Text style={styles.listingStatText}>
                    {listing.inquiries} inquiries
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('PropertyEditScreen', {
                      property: listing,
                      userRole: 'Builder'
                    });
                  }}
                >
                  <Edit size={16} color="#2D6A4F" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help & Support */}
        <View style={styles.helpCard}>
          <View style={styles.helpContent}>
            <View style={styles.helpIcon}>
              <HelpCircle size={24} color="#FFFFFF" strokeWidth={2} />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpSubtitle}>
                Get support or learn more about managing your properties
              </Text>
              <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
                <Text style={styles.helpButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    height: 280, // Increased height
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40, // Added padding at bottom to push text up
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  welcomeSection: {
    marginTop: 'auto',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    marginTop: -40, // Reduced negative margin
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '500',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16, // Increased gap
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    height: 60, // Taller buttons
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    height: 60, // Taller buttons
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  quickAccessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Evenly spaced
    marginTop: 16,
  },
  quickAccessItem: {
    alignItems: 'center',
    gap: 10,
    width: '30%', // Fixed width for alignment
  },
  quickAccessIcon: {
    width: 60, // Larger touch target
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectDeadlineText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    gap: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D6A4F',
    borderRadius: 4,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  listingLocationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  listingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listingStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  editButton: {
    marginLeft: 'auto',
  },
  helpCard: {
    backgroundColor: '#2D6A4F',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  helpContent: {
    flexDirection: 'row',
    gap: 16,
  },
  helpIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 18,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonTextError: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: '600',
  },
  // Inquiry styles
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inquiryBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  inquiryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    gap: 16,
  },
  inquiryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inquiryImage: {
    width: '100%',
    height: '100%',
  },
  inquiryContent: {
    flex: 1,
  },
  inquiryPropertyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  inquiryUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inquiryUserName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  inquiryMessage: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  inquiryTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  inquiryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navTextActive: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '600',
  },
  navTextInactive: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});



