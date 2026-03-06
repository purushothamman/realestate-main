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
  Building2,
  Plus,
  TrendingUp,
  FileText,
  Users,
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
} from 'lucide-react-native';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';

// ─── Responsive helpers ───────────────────────────────────────────────────────
// All layout decisions are driven by the CURRENT window width so the component
// re-renders correctly after orientation changes.

const useResponsive = () => {
  const [dims, setDims] = useState(Dimensions.get('window'));
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDims(window));
    return () => sub?.remove();
  }, []);

  const { width: W, height: H } = dims;

  // Device buckets — purely for layout decisions, NOT for font scaling
  const isSmallPhone  = W < 360;          // e.g. iPhone SE 1st gen (320 px)
  const isTablet      = W >= 768;
  const isLargeTablet = W >= 1024;

  // How many stat columns to show
  const statCols = isLargeTablet ? 4 : isTablet ? 4 : 2;

  // Horizontal page padding
  const hPad = isLargeTablet ? 40 : isTablet ? 32 : isSmallPhone ? 14 : 20;

  // Stat card width — fills the row with equal columns and a 12 px gap
  const statGap = 12;
  const statCardW = (W - hPad * 2 - statGap * (statCols - 1)) / statCols;

  // Header image height — increased slightly to accommodate the downward card shift
  const headerH = isLargeTablet ? 320 : isTablet ? 290 : isSmallPhone ? 250 : 280;

  // How far the stat cards overlap the header (negative marginTop)
  // Smaller negative value = cards sit lower / more spacing below header
  const cardOverlap = isLargeTablet ? -20 : isTablet ? -20 : isSmallPhone ? -12 : -16;

  return { W, H, isSmallPhone, isTablet, isLargeTablet, hPad, statCols, statCardW, statGap, headerH, cardOverlap };
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuilderDashboard({
  builderName = 'John Anderson',
  navigation,
  onBack,
  onPropertyClick,
  onAddProperty,
  onAssignAgent,
}) {
  const [dashboardData, setDashboardData]     = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const r = useResponsive(); // reactive layout values

  useEffect(() => {
    fetchDashboardData();
    fetchPendingRequestsCount();
  }, []);

  // ── Backend calls (unchanged) ────────────────────────────────────────────

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');
      const response = await fetch(`${API_BASE_URL}/builder/dashboard`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard data');
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequestsCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/property-requests/builder?status=pending`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok && data.success) setPendingRequestsCount((data.requests || []).length);
    } catch (err) {
      console.error('Fetch property requests count error:', err);
    }
  };

  const handleAcceptInquiry = async (inquiryId) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Inquiry accepted! You can now chat with the user.');
        fetchInquiries();
      } else {
        Alert.alert('Error', data.message || 'Failed to accept inquiry');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept inquiry');
    }
  };

  const handleRejectInquiry = async (inquiryId) => {
    Alert.alert('Reject Inquiry', 'Are you sure you want to reject this inquiry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/reject`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ rejection_reason: 'Not interested at this time' }),
            });
            const data = await response.json();
            if (response.ok && data.success) {
              Alert.alert('Success', 'Inquiry rejected');
              fetchInquiries();
            } else {
              Alert.alert('Error', data.message || 'Failed to reject inquiry');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to reject inquiry');
          }
        },
      },
    ]);
  };

  // ── Derived data ─────────────────────────────────────────────────────────

  const stats = dashboardData?.stats || {
    activeProjects: 0, totalListings: 0, pendingInquiries: 0, upcomingDeadlines: 0,
  };
  const recentListings  = dashboardData?.recentListings  || [];
  const activeProjects  = dashboardData?.activeListings  || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':    return { bg: '#D1FAE5', text: '#065F46' };
      case 'pending':   return { bg: '#FEF3C7', text: '#92400E' };
      case 'sold':      return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'on-track':  return { bg: '#D1FAE5', text: '#065F46' };
      case 'delayed':   return { bg: '#FEE2E2', text: '#991B1B' };
      case 'completed': return { bg: '#DBEAFE', text: '#1E40AF' };
      default:          return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const getStatusText = (status) => {
    if (status === 'on-track') return 'On Track';
    if (status === 'delayed')  return 'Delayed';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handlePropertyClick = (listing) => {
    if (onPropertyClick) {
      onPropertyClick({
        ...listing,
        image: getImageUrl(listing.image || listing.imageUrl) || DEFAULT_PROPERTY_IMAGE,
      });
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.errorTitle}>Unable to load dashboard</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        {onBack && (
          <TouchableOpacity style={styles.backButtonError} onPress={onBack}>
            <Text style={styles.backButtonTextError}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const { W, isSmallPhone, isTablet, isLargeTablet, hPad, statCardW, statGap, headerH, cardOverlap } = r;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <View style={[styles.headerContainer, { height: headerH }]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY2MjI1ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080' }}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <View style={[
            styles.headerContent,
            {
              paddingHorizontal: hPad,
              paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 44,
            },
          ]}>
            {/* Top bar */}
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
                  <Bell size={22} color="#FFF" strokeWidth={2} />
                  {pendingRequestsCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{pendingRequestsCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity>
                  <Settings size={22} color="#FFF" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Welcome text */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle} numberOfLines={1}>
                Welcome, {builderName}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Manage your properties, listings, and projects in one place
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Stats grid ─────────────────────────────────────────────────── */}
        {/*
          cardOverlap is a small negative marginTop so the cards lift up and
          overlap the header just enough to look connected — without crowding
          the welcome text. The value is responsive: phones get -16, tablets -20.
        */}
        <View style={[styles.statsGrid, { gap: statGap, marginTop: cardOverlap }]}>
          {[
            {
              icon: <Building2 size={20} color="#2D6A4F" strokeWidth={2} />,
              iconBg: '#2D6A4F15',
              badge: <TrendingUp size={15} color="#10B981" strokeWidth={2} />,
              label: 'Active Projects',
              value: stats.activeProjects,
              onPress: null,
            },
            {
              icon: <FileText size={20} color="#3B82F6" strokeWidth={2} />,
              iconBg: '#3B82F615',
              badge: <TrendingUp size={15} color="#10B981" strokeWidth={2} />,
              label: 'Total Listings',
              value: stats.totalListings,
              onPress: null,
            },
            {
              icon: <Users size={20} color="#F97316" strokeWidth={2} />,
              iconBg: '#F9731615',
              badge: <Text style={styles.newBadge}>View All</Text>,
              label: 'Pending Inquiries',
              value: stats.pendingInquiries,
              onPress: () => navigation.navigate('builderInquiries'),
            },
            {
              icon: <Calendar size={20} color="#EF4444" strokeWidth={2} />,
              iconBg: '#EF444415',
              badge: <Clock size={15} color="#EF4444" strokeWidth={2} />,
              label: 'Upcoming Deadlines',
              value: stats.upcomingDeadlines,
              onPress: null,
            },
          ].map((item, i) => {
            const Card = item.onPress ? TouchableOpacity : View;
            return (
              <Card
                key={i}
                style={[styles.statCard, { width: statCardW }]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: item.iconBg }]}>
                    {item.icon}
                  </View>
                  {item.badge}
                </View>
                <Text style={styles.statLabel} numberOfLines={2}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </Card>
            );
          })}
        </View>

        {/* ── Primary actions ─────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={onAddProperty} activeOpacity={0.8}>
            <Plus size={18} color="#FFF" strokeWidth={2} />
            <Text style={styles.primaryButtonText}>Add New Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onAssignAgent} activeOpacity={0.8}>
            <Building2 size={18} color="#FFF" strokeWidth={2} />
            <Text style={styles.secondaryButtonText}>Assign Agent</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick access ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Access</Text>
          <View style={styles.quickRow}>
            {[
              { icon: <FileText size={22} color="#2D6A4F" strokeWidth={2} />, bg: '#2D6A4F15', label: 'My Listings' },
              { icon: <BarChart3 size={22} color="#3B82F6" strokeWidth={2} />, bg: '#3B82F615',  label: 'Analytics' },
              { icon: <MessageSquare size={22} color="#A855F7" strokeWidth={2} />, bg: '#A855F715', label: 'Messages' },
            ].map(({ icon, bg, label }) => (
              <TouchableOpacity key={label} style={styles.quickItem}>
                <View style={[styles.quickIcon, { backgroundColor: bg }]}>{icon}</View>
                <Text style={styles.quickLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Active projects ─────────────────────────────────────────────── */}
        {activeProjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Projects</Text>
              <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
            </View>

            {activeProjects.map((project) => {
              const sc = getStatusColor(project.status);
              return (
                <View key={project.id} style={styles.rowCard}>
                  <View style={styles.rowCardTop}>
                    <View style={styles.rowCardInfo}>
                      <Text style={styles.rowCardTitle} numberOfLines={1}>{project.title}</Text>
                      <View style={styles.metaRow}>
                        <Calendar size={12} color="#9CA3AF" strokeWidth={2} />
                        <Text style={styles.metaText}>{project.deadline}</Text>
                      </View>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.badgeText, { color: sc.text }]}>
                        {getStatusText(project.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressWrap}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPct}>{project.progress}%</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Recent listings ─────────────────────────────────────────────── */}
        {recentListings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Listings</Text>
              <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
            </View>

            {recentListings.map((listing) => {
              const sc = getStatusColor(listing.status);
              return (
                <TouchableOpacity
                  key={listing.id}
                  style={styles.rowCard}
                  onPress={() => handlePropertyClick(listing)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowCardTop}>
                    <View style={styles.rowCardInfo}>
                      <Text style={styles.rowCardTitle} numberOfLines={1}>{listing.title}</Text>
                      <View style={styles.metaRow}>
                        <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
                        <Text style={styles.metaText}>{listing.city}</Text>
                      </View>
                      <Text style={styles.price}>{listing.price}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.badgeText, { color: sc.text }]}>
                        {getStatusText(listing.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.listingFooter}>
                    <View style={styles.metaRow}>
                      <Eye size={14} color="#9CA3AF" strokeWidth={2} />
                      <Text style={styles.metaText}>{listing.views} views</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <MessageSquare size={14} color="#9CA3AF" strokeWidth={2} />
                      <Text style={styles.metaText}>{listing.inquiries} inquiries</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('PropertyEditScreen', { property: listing, userRole: 'Builder' });
                      }}
                    >
                      <Edit size={15} color="#2D6A4F" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Help card ────────────────────────────────────────────────────── */}
        <View style={[styles.helpCard, { marginBottom: 32 }]}>
          <View style={styles.helpIcon}>
            <HelpCircle size={22} color="#FFF" strokeWidth={2} />
          </View>
          <View style={styles.helpBody}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpSub}>
              Get support or learn more about managing your properties
            </Text>
            <TouchableOpacity style={styles.helpBtn} activeOpacity={0.8}>
              <Text style={styles.helpBtnText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
// Fixed, readable font sizes throughout.
// Layout adapts via the responsive values passed as inline style props above.

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // ── Loading / Error ─────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  backButtonError: { paddingVertical: 12 },
  backButtonTextError: { color: '#2D6A4F', fontSize: 15, fontWeight: '600' },

  // ── Header ──────────────────────────────────────────────────────────────
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  headerContent: {
    flex: 1,
    // Reduced bottom padding vs original (was 48) so the welcome text sits
    // higher and the cards don't need to overlap as aggressively.
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  notificationButton: { position: 'relative' },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  welcomeSection: {
    marginTop: 'auto',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 19,
  },

  // ── Scroll ──────────────────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 24,
  },

  // ── Stats grid ──────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    fontSize: 11,
    color: '#F97316',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  // ── Action buttons ───────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#2D6A4F',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Generic white card ───────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 14,
  },

  // ── Quick access ─────────────────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quickIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Section heading ───────────────────────────────────────────────────────
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  viewAll: {
    fontSize: 13,
    color: '#2D6A4F',
    fontWeight: '500',
  },

  // ── Row card (used for both projects and listings) ─────────────────────
  rowCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  rowCardInfo: { flex: 1 },
  rowCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Progress
  progressWrap: { gap: 5 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: { fontSize: 12, color: '#6B7280' },
  progressPct: { fontSize: 12, fontWeight: '600', color: '#111827' },
  progressTrack: {
    height: 7,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D6A4F',
    borderRadius: 4,
  },

  // Listing-specific
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D6A4F',
    marginTop: 2,
  },
  listingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editBtn: { marginLeft: 'auto' },

  // ── Help card ─────────────────────────────────────────────────────────────
  helpCard: {
    backgroundColor: '#2D6A4F',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  helpBody: { flex: 1 },
  helpTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  helpSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
    marginBottom: 14,
  },
  helpBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  helpBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D6A4F',
  },

  // ── Inquiry styles (kept for completeness) ───────────────────────────────
  inquiryCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    gap: 12,
  },
  inquiryImageContainer: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden' },
  inquiryImage: { width: '100%', height: '100%' },
  inquiryContent: { flex: 1 },
  inquiryPropertyTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  inquiryUserRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  inquiryUserName: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  inquiryMessage: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 6 },
  inquiryTime: { fontSize: 11, color: '#9CA3AF', marginBottom: 10 },
  inquiryActions: { flexDirection: 'row', gap: 8 },
  acceptButton: {
    flex: 1, backgroundColor: '#2D6A4F', borderRadius: 8,
    paddingVertical: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  acceptButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  rejectButton: {
    flex: 1, backgroundColor: '#FEE2E2', borderRadius: 8,
    paddingVertical: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  rejectButtonText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },

  // Nav (preserved)
  bottomNav: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    paddingVertical: 10, paddingHorizontal: 20,
  },
  navItem: { alignItems: 'center', gap: 3 },
  navTextActive: { fontSize: 11, color: '#2D6A4F', fontWeight: '600' },
  navTextInactive: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
});