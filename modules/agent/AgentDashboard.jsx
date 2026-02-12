import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Home,
  Building2,
  Plus,
  TrendingUp,
  Users,
  Bell,
  Settings,
  Eye,
  Phone,
  MessageSquare,
  BarChart3,
  MapPin,
  DollarSign,
  Calendar,
  User,
  FileText,
  Share2,
  Edit,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL

const AgentDashboard = ({ navigation, route }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [activeListings, setActiveListings] = useState([]);
  const [agentData, setAgentData] = useState(null);

  // Get auth token from your auth context or AsyncStorage
  const getAuthToken = async () => {
    // Replace with your actual token retrieval logic
    // For example: await AsyncStorage.getItem('authToken');
    return 'YOUR_AUTH_TOKEN';
  };

  // API Request Helper
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const token = await getAuthToken();
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
      throw error;
    }
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [statsResponse, leadsResponse, propertiesResponse] = await Promise.all([
        apiRequest('/dashboard/stats'),
        apiRequest('/leads/recent?limit=3'),
        apiRequest('/properties/my-properties?limit=3&status=active,pending')
      ]);

      // Update state with fetched data
      if (statsResponse.success) {
        setStats(statsResponse.data.stats);
        setAgentData(statsResponse.data.stats.agent);
      }

      if (leadsResponse.success) {
        setRecentLeads(leadsResponse.data.leads);
      }

      if (propertiesResponse.success) {
        setActiveListings(propertiesResponse.data.properties);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  // Format budget range
  const formatBudgetRange = (budgetRange) => {
    if (!budgetRange) return 'N/A';
    return `${formatPrice(budgetRange.min)} - ${formatPrice(budgetRange.max)}`;
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return then.toLocaleDateString();
  };

  // Handle lead contact
  const handleContactLead = async (lead) => {
    Alert.alert(
      'Contact Lead',
      `Call ${lead.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // Add actual phone call functionality
            console.log('Calling:', lead.phone);
          }
        }
      ]
    );
  };

  // Handle property view
  const handleViewProperty = (property) => {
    // Navigate to property details
    // navigation.navigate('PropertyDetails', { propertyId: property._id });
    console.log('View property:', property._id);
  };

  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();

    // Animate on mount
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'new':
        return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
      case 'contacted':
        return { bg: '#f3e8ff', text: '#7c3aed', border: '#e9d5ff' };
      case 'follow-up':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'closed':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'active':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'pending':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      case 'sold':
        return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && !stats) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Fixed Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.appIcon}>
              <Building2 width={20} height={20} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.appName}>EstateHub</Text>
              <Text style={styles.appTagline}>Agent Portal</Text>
            </View>
          </View>
          
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell width={24} height={24} color="#6b7280" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {stats?.newLeads || 0}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity>
              <Settings width={24} height={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Agent Overview */}
        <LinearGradient
          colors={['#2D6A4F', '#245A42']}
          style={styles.agentOverview}
        >
          <Image
            source={{ 
              uri: agentData?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' 
            }}
            style={styles.agentAvatar}
          />
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>
              {agentData?.name || 'Agent Name'}
            </Text>
            <Text style={styles.agentTitle}>
              {agentData?.title || 'Real Estate Agent'}
            </Text>
            <View style={styles.agentBadges}>
              {agentData?.verified && (
                <View style={styles.agentBadge}>
                  <CheckCircle width={12} height={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.agentBadgeText}>Verified</Text>
                </View>
              )}
              <View style={styles.agentBadge}>
                <Target width={12} height={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.agentBadgeText}>
                  {stats?.conversionRate || 0}% CVR
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Screen Title */}
        <View style={styles.screenTitle}>
          <Text style={styles.screenTitleText}>Agent Dashboard</Text>
          <Text style={styles.screenSubtitle}>Manage your listings, leads, and performance</Text>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2D6A4F"
          />
        }
      >
        {/* Performance KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Snapshot</Text>
          
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: 'rgba(45, 106, 79, 0.1)' }]}>
                  <FileText width={20} height={20} color="#2D6A4F" />
                </View>
                <TrendingUp width={16} height={16} color="#10b981" />
              </View>
              <Text style={styles.kpiLabel}>Total Listings</Text>
              <Text style={styles.kpiValue}>{stats?.totalListings || 0}</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Users width={20} height={20} color="#3b82f6" />
                </View>
                <Text style={styles.kpiTrend}>+{stats?.newLeads || 0}</Text>
              </View>
              <Text style={styles.kpiLabel}>Active Leads</Text>
              <Text style={styles.kpiValue}>{stats?.activeLeads || 0}</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                  <Calendar width={20} height={20} color="#a855f7" />
                </View>
                <Clock width={16} height={16} color="#a855f7" />
              </View>
              <Text style={styles.kpiLabel}>Site Visits Scheduled</Text>
              <Text style={styles.kpiValue}>{stats?.siteVisits || 0}</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <CheckCircle width={20} height={20} color="#10b981" />
                </View>
                <TrendingUp width={16} height={16} color="#10b981" />
              </View>
              <Text style={styles.kpiLabel}>Deals Closed</Text>
              <Text style={styles.kpiValue}>{stats?.dealsClosed || 0}</Text>
            </View>
          </View>

          {/* Revenue Card */}
          <LinearGradient
            colors={['#3b82f6', '#9333ea']}
            style={styles.revenueCard}
          >
            <View>
              <Text style={styles.revenueLabel}>Monthly Revenue</Text>
              <Text style={styles.revenueValue}>
                {formatPrice(stats?.monthlyRevenue || 0)}
              </Text>
            </View>
            <View style={styles.revenueIcon}>
              <DollarSign width={24} height={24} color="#ffffff" />
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionPrimary} 
              activeOpacity={0.8}
              onPress={() => {/* Navigate to add property */}}
            >
              <View style={styles.actionIconPrimary}>
                <Plus width={24} height={24} color="#ffffff" />
              </View>
              <Text style={styles.actionTextPrimary}>Add New Property</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSecondary} 
              activeOpacity={0.8}
              onPress={() => {/* Navigate to leads */}}
            >
              <View style={[styles.actionIconSecondary, { backgroundColor: '#eff6ff' }]}>
                <Phone width={24} height={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionTextSecondary}>Contact Leads</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSecondary} 
              activeOpacity={0.8}
              onPress={() => {/* Navigate to listings */}}
            >
              <View style={[styles.actionIconSecondary, { backgroundColor: '#faf5ff' }]}>
                <Building2 width={24} height={24} color="#a855f7" />
              </View>
              <Text style={styles.actionTextSecondary}>Manage Listings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSecondary} 
              activeOpacity={0.8}
              onPress={() => {/* Navigate to analytics */}}
            >
              <View style={[styles.actionIconSecondary, { backgroundColor: '#f0fdf4' }]}>
                <BarChart3 width={24} height={24} color="#10b981" />
              </View>
              <Text style={styles.actionTextSecondary}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Leads Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Leads</Text>
            <TouchableOpacity onPress={() => {/* Navigate to all leads */}}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.leadsList}>
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => {
                const statusStyle = getStatusStyle(lead.status);
                
                return (
                  <View key={lead._id} style={styles.leadCard}>
                    <View style={styles.leadHeader}>
                      <View style={styles.leadInfo}>
                        <Text style={styles.leadName}>{lead.clientName}</Text>
                        <Text style={styles.leadProperty} numberOfLines={1}>
                          {lead.property?.title || 'Property'}
                        </Text>
                        <Text style={styles.leadBudget}>
                          {formatBudgetRange(lead.budgetRange)}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusStyle.bg,
                          borderColor: statusStyle.border
                        }
                      ]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                          {getStatusLabel(lead.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.leadFooter}>
                      <Text style={styles.leadDate}>
                        {formatTimeAgo(lead.createdAt)}
                      </Text>
                      <View style={styles.leadActions}>
                        <TouchableOpacity 
                          style={styles.leadActionPrimary}
                          onPress={() => handleContactLead(lead)}
                        >
                          <Phone width={16} height={16} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.leadActionSecondary}>
                          <MessageSquare width={16} height={16} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.leadActionSecondary}
                          onPress={() => {/* Navigate to lead details */}}
                        >
                          <Eye width={16} height={16} color="#374151" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No recent leads</Text>
            )}
          </View>
        </View>

        {/* My Listings Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Listings</Text>
            <TouchableOpacity onPress={() => {/* Navigate to all listings */}}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listingsList}>
            {activeListings.length > 0 ? (
              activeListings.map((listing) => {
                const statusStyle = getStatusStyle(listing.status);
                const primaryImage = listing.images?.find(img => img.isPrimary)?.url || 
                                   listing.images?.[0]?.url || 
                                   'https://images.unsplash.com/photo-1640109478916-f445f8f19b11?w=800';
                
                return (
                  <TouchableOpacity 
                    key={listing._id} 
                    style={styles.listingCard}
                    onPress={() => handleViewProperty(listing)}
                  >
                    <Image
                      source={{ uri: primaryImage }}
                      style={styles.listingImage}
                    />
                    <View style={styles.listingContent}>
                      <View style={styles.listingHeader}>
                        <View style={styles.listingInfo}>
                          <Text style={styles.listingTitle} numberOfLines={1}>
                            {listing.title}
                          </Text>
                          <View style={styles.listingLocation}>
                            <MapPin width={12} height={12} color="#9ca3af" />
                            <Text style={styles.listingLocationText} numberOfLines={1}>
                              {listing.location?.city || listing.location?.address}
                            </Text>
                          </View>
                        </View>
                        <View style={[
                          styles.listingStatusBadge,
                          { backgroundColor: statusStyle.bg }
                        ]}>
                          <Text style={[styles.listingStatusText, { color: statusStyle.text }]}>
                            {getStatusLabel(listing.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.listingFooter}>
                        <Text style={styles.listingPrice}>
                          {formatPrice(listing.price)}
                        </Text>
                        <View style={styles.listingActions}>
                          <TouchableOpacity onPress={(e) => {
                            e.stopPropagation();
                            /* Edit property */
                          }}>
                            <Edit width={16} height={16} color="#9ca3af" />
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Eye width={16} height={16} color="#9ca3af" />
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Share2 width={16} height={16} color="#9ca3af" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No active listings</Text>
            )}
          </View>
        </View>

        {/* Insights Section */}
        <View style={styles.section}>
          <View style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>

            <View style={styles.insightsList}>
              <View style={[styles.insightItem, { backgroundColor: '#f0fdf4' }]}>
                <View style={styles.insightLeft}>
                  <View style={[styles.insightIcon, { backgroundColor: '#dcfce7' }]}>
                    <TrendingUp width={20} height={20} color="#16a34a" />
                  </View>
                  <View>
                    <Text style={styles.insightTitle}>Trending Properties</Text>
                    <Text style={styles.insightSubtitle}>
                      {stats?.activeListings || 0} properties
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => {/* View trending */}}>
                  <Text style={styles.insightAction}>View</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.insightItem, { backgroundColor: '#eff6ff' }]}>
                <View style={styles.insightLeft}>
                  <View style={[styles.insightIcon, { backgroundColor: '#dbeafe' }]}>
                    <Target width={20} height={20} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.insightTitle}>Lead Conversion Rate</Text>
                    <View style={styles.conversionBar}>
                      <View style={styles.conversionBarBg}>
                        <View 
                          style={[
                            styles.conversionBarFill,
                            { width: `${stats?.conversionRate || 0}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.conversionPercent}>
                        {stats?.conversionRate || 0}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.insightItem, { backgroundColor: '#faf5ff' }]}>
                <View style={styles.insightLeft}>
                  <View style={[styles.insightIcon, { backgroundColor: '#f3e8ff' }]}>
                    <BarChart3 width={20} height={20} color="#9333ea" />
                  </View>
                  <View>
                    <Text style={styles.insightTitle}>High-Performing Listings</Text>
                    <Text style={styles.insightSubtitle}>
                      {stats?.activeListings || 0} properties
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => {/* View high performing */}}>
                  <Text style={styles.insightAction}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => {/* Navigate to add property */}}
      >
        <LinearGradient
          colors={['#2D6A4F', '#245A42']}
          style={styles.fabGradient}
        >
          <Plus width={24} height={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home width={24} height={24} color="#2D6A4F" />
          <Text style={styles.navTextActive}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {/* Navigate to listings */}}
        >
          <Building2 width={24} height={24} color="#9ca3af" />
          <Text style={styles.navTextInactive}>Listings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {/* Navigate to leads */}}
        >
          <Users width={24} height={24} color="#9ca3af" />
          <Text style={styles.navTextInactive}>Leads</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {/* Navigate to analytics */}}
        >
          <BarChart3 width={24} height={24} color="#9ca3af" />
          <Text style={styles.navTextInactive}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {/* Navigate to profile */}}
        >
          <User width={24} height={24} color="#9ca3af" />
          <Text style={styles.navTextInactive}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280'
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    fontSize: 14,
    color: '#9ca3af'
  },
  
  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center'
  },
  appName: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600'
  },
  appTagline: {
    fontSize: 12,
    color: '#9ca3af'
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  notificationButton: {
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  
  // Agent Overview
  agentOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24
  },
  agentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  agentInfo: {
    flex: 1
  },
  agentName: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4
  },
  agentTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8
  },
  agentBadges: {
    flexDirection: 'row',
    gap: 16
  },
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  agentBadgeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  
  // Screen Title
  screenTitle: {
    gap: 4
  },
  screenTitleText: {
    fontSize: 20,
    color: '#111827',
    fontWeight: 'bold'
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  
  // Scroll View
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100
  },
  
  // Section
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600'
  },
  viewAllButton: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '500'
  },
  
  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  kpiTrend: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600'
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  kpiValue: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold'
  },
  
  // Revenue Card
  revenueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  revenueLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4
  },
  revenueValue: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  revenueIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  actionPrimary: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  actionIconPrimary: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionTextPrimary: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500'
  },
  actionSecondary: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  actionIconSecondary: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionTextSecondary: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '500'
  },

  // Leads List
  leadsList: {
    gap: 12
  },
  leadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12
  },
  leadInfo: {
    flex: 1
  },
  leadName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4
  },
  leadProperty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  leadBudget: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '600'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500'
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  leadDate: {
    fontSize: 12,
    color: '#9ca3af'
  },
  leadActions: {
    flexDirection: 'row',
    gap: 8
  },
  leadActionPrimary: {
    width: 32,
    height: 32,
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  leadActionSecondary: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Listings List
  listingsList: {
    gap: 12
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  listingImage: {
    width: 96,
    height: 96
  },
  listingContent: {
    flex: 1,
    padding: 12
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8
  },
  listingInfo: {
    flex: 1
  },
  listingTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  listingLocationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1
  },
  listingStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  listingStatusText: {
    fontSize: 12,
    fontWeight: '500'
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listingPrice: {
    fontSize: 16,
    color: '#2D6A4F',
    fontWeight: 'bold'
  },
  listingActions: {
    flexDirection: 'row',
    gap: 12
  },

  // Insights
  insightsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  insightsList: {
    gap: 12,
    marginTop: 16
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  insightTitle: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500'
  },
  insightSubtitle: {
    fontSize: 12,
    color: '#6b7280'
  },
  insightAction: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500'
  },
  conversionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  conversionBarBg: {
    width: 80,
    height: 6,
    backgroundColor: '#bfdbfe',
    borderRadius: 3,
    overflow: 'hidden'
  },
  conversionBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3
  },
  conversionPercent: {
    fontSize: 12,
    color: '#6b7280'
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
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
    paddingHorizontal: 24
  },
  navItem: {
    alignItems: 'center',
    gap: 4
  },
  navTextActive: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '600'
  },
  navTextInactive: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500'
  }
});

export default AgentDashboard;