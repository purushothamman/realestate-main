import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE, DEFAULT_PROFILE_IMAGE } from '../../utils/api';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
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
    Target,
    ArrowUpRight,
    Sparkles,
    Award,
    ChevronRight,
    Activity,
    X
} from 'lucide-react-native';

const { width } = Dimensions.get('window');


const AnimatedKPICard = ({ icon, label, value, trend, trendValue, color, delay = 0, style }) => {
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
        <Animated.View style={[styles.kpiCard, { transform: [{ scale: scaleAnim }] }, style]}>
            <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: `${color}15` }]}>
                    {icon}
                </View>
                {trend && (
                    <View style={styles.kpiTrendContainer}>
                        <TrendingUp width={14} height={14} color="#10b981" strokeWidth={2.5} />
                        <Text style={styles.kpiTrendText}>{trendValue}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.kpiLabel}>{label}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
        </Animated.View>
    );
};

const AgentDashboard = ({ navigation, route }) => {
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    // State management
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState(null);
    const [recentLeads, setRecentLeads] = useState([]);
    const [activeListings, setActiveListings] = useState([]);
    const [agentData, setAgentData] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // Get auth token from AsyncStorage
    const getAuthToken = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            return token;
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
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
            throw error;
        }
    };

    // Fetch Dashboard Data + notifications
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const propertiesResponse = await apiRequest('/properties/my-properties');
            const notificationsResponse = await apiRequest('/notifications');
            const statsResponse = await apiRequest('/agent/dashboard-stats');

            if (propertiesResponse.success) {
                const filtered = (propertiesResponse.properties || []).filter(
                    p => p.status === 'sold' || p.status === 'rented'
                );
                setActiveListings(filtered);
            }

            if (statsResponse.success) {
                const s = statsResponse.stats;
                setStats({
                    totalListings: s.totalListings,
                    activeLeads: s.activeLeads,
                    pendingInquiries: s.pendingInquiries,
                    dealsClosed: s.dealsClosed,
                    newLeads: s.newLeads || 0,
                    conversionRate: s.conversionRate || 0,
                    monthlyRevenue: s.monthlyRevenue || 0
                });
            }

            if (notificationsResponse?.success) {
                setNotifications(notificationsResponse.notifications || []);
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
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return then.toLocaleDateString();
    };

    // Derived: pending hire requests from notifications
    const pendingHireRequests = notifications.filter(
        (n) => n.type === 'hire_request' && !n.isRead
    );

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
                        console.log('Calling:', lead.phone);
                    }
                }
            ]
        );
    };

    useEffect(() => {
        fetchDashboardData();

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

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

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

            {/* Enhanced Fixed Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerOpacity,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Enhanced Top Bar */}
                <View style={styles.topBar}>
                    <View style={styles.topBarLeft}>
                        <LinearGradient
                            colors={['#2D6A4F', '#1e4d38']}
                            style={styles.appIcon}
                        >
                            <Building2 width={22} height={22} color="#ffffff" strokeWidth={2.5} />
                        </LinearGradient>
                        <View>
                            <Text style={styles.appName}>EstateHub</Text>
                            <Text style={styles.appTagline}>Agent Portal</Text>
                        </View>
                    </View>

                    <View style={styles.topBarRight}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('agentNotifications')}
                        >
                            <View style={styles.notificationIconBg}>
                                <Bell width={20} height={20} color="#6b7280" strokeWidth={2.5} />
                            </View>
                            {pendingHireRequests.length > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {pendingHireRequests.length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
                            <Settings width={20} height={20} color="#6b7280" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Enhanced Agent Overview */}
                <View style={styles.agentOverviewContainer}>
                    <LinearGradient
                        colors={['#2D6A4F', '#1e4d38']}
                        style={styles.agentOverview}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.agentAvatarContainer}>
                            <Image
                                source={{
                                    uri: getImageUrl(agentData?.avatar) || DEFAULT_PROFILE_IMAGE
                                }}
                                style={styles.agentAvatar}
                            />
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View style={styles.agentInfo}>
                            <View style={styles.agentNameRow}>
                                <Text style={styles.agentName}>
                                    {agentData?.name || 'Agent Name'}
                                </Text>
                                <Award width={16} height={16} color="#fbbf24" fill="#fbbf24" />
                            </View>
                            <Text style={styles.agentTitle}>
                                {agentData?.title || 'Real Estate Agent'}
                            </Text>
                            <View style={styles.agentBadges}>
                                {agentData?.verified !== false && (
                                    <View style={styles.agentBadge}>
                                        <CheckCircle width={12} height={12} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                                        <Text style={styles.agentBadgeText}>Verified</Text>
                                    </View>
                                )}
                                <View style={styles.agentBadge}>
                                    <Target width={12} height={12} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                                    <Text style={styles.agentBadgeText}>
                                        {stats?.conversionRate || 0}% CVR
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sparkleIcon}>
                            <Sparkles width={20} height={20} color="rgba(255,255,255,0.6)" />
                        </View>
                    </LinearGradient>
                </View>

                {/* Enhanced Screen Title */}
                <View style={styles.screenTitle}>
                    <Text style={styles.screenTitleText}>Dashboard</Text>
                    <Text style={styles.screenSubtitle}>Track your performance and manage listings</Text>
                </View>
            </Animated.View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#2D6A4F"
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Enhanced Performance KPIs */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionTitleContainer}>
                                <Activity width={20} height={20} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={styles.sectionTitle}>Performance Snapshot</Text>
                            </View>
                        </View>

                        <View style={styles.kpiGrid}>
                            <AnimatedKPICard
                                icon={<FileText width={22} height={22} color="#2D6A4F" strokeWidth={2.5} />}
                                label="Total Listings"
                                value={stats?.totalListings || 0}
                                trend={true}
                                trendValue="+3"
                                color="#2D6A4F"
                                delay={0}
                            />
                            <AnimatedKPICard
                                icon={<Users width={22} height={22} color="#3b82f6" strokeWidth={2.5} />}
                                label="Active Leads"
                                value={stats?.activeLeads || 0}
                                trend={true}
                                trendValue={`+${stats?.newLeads || 0}`}
                                color="#3b82f6"
                                delay={100}
                            />
                            <TouchableOpacity
                                onPress={() => navigation.navigate('agentInquiries')}
                                activeOpacity={0.7}
                                style={{ width: '48%' }}
                            >
                                <AnimatedKPICard
                                    icon={<Users width={22} height={22} color="#a855f7" strokeWidth={2.5} />}
                                    label="Pending Inquiries"
                                    value={stats?.pendingInquiries || 0}
                                    trend={false}
                                    color="#a855f7"
                                    delay={200}
                                    style={{ width: '100%' }}
                                />
                            </TouchableOpacity>
                            <AnimatedKPICard
                                icon={<CheckCircle width={22} height={22} color="#10b981" strokeWidth={2.5} />}
                                label="Deals Closed"
                                value={stats?.dealsClosed || 0}
                                trend={true}
                                trendValue="+2"
                                color="#10b981"
                                delay={300}
                            />
                        </View>

                        {/* Enhanced Revenue Card */}
                        <View style={styles.revenueCardContainer}>
                            <LinearGradient
                                colors={['#3b82f6', '#8b5cf6']}
                                style={styles.revenueCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.revenueLeft}>
                                    <Text style={styles.revenueLabel}>Monthly Revenue</Text>
                                    <Text style={styles.revenueValue}>
                                        {formatPrice(stats?.monthlyRevenue || 0)}
                                    </Text>
                                    <View style={styles.revenueChange}>
                                        <ArrowUpRight width={14} height={14} color="#fff" strokeWidth={3} />
                                        <Text style={styles.revenueChangeText}>+12.5% from last month</Text>
                                    </View>
                                </View>
                                <View style={styles.revenueIcon}>
                                    <DollarSign width={28} height={28} color="#ffffff" strokeWidth={2.5} />
                                </View>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Enhanced Quick Actions */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionTitleContainer}>
                                <Sparkles width={20} height={20} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={styles.sectionTitle}>Quick Actions</Text>
                            </View>
                        </View>

                        <View style={styles.actionsGrid}>
                            <TouchableOpacity
                                style={styles.actionPrimary}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('addPropertyAgent')}
                            >
                                <LinearGradient
                                    colors={['#2D6A4F', '#1e4d38']}
                                    style={styles.actionPrimaryGradient}
                                >
                                    <View style={styles.actionIconPrimary}>
                                        <Plus width={24} height={24} color="#ffffff" strokeWidth={3} />
                                    </View>
                                    <Text style={styles.actionTextPrimary}>Add Property</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionSecondary}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.actionIconSecondary, { backgroundColor: '#eff6ff' }]}>
                                    <Phone width={22} height={22} color="#3b82f6" strokeWidth={2.5} />
                                </View>
                                <Text style={styles.actionTextSecondary}>Contact Leads</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionSecondary}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.actionIconSecondary, { backgroundColor: '#faf5ff' }]}>
                                    <Building2 width={22} height={22} color="#a855f7" strokeWidth={2.5} />
                                </View>
                                <Text style={styles.actionTextSecondary}>Manage Listings</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionSecondary}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.actionIconSecondary, { backgroundColor: '#f0fdf4' }]}>
                                    <BarChart3 width={22} height={22} color="#10b981" strokeWidth={2.5} />
                                </View>
                                <Text style={styles.actionTextSecondary}>View Reports</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Hire Requests from Builders */}
                    {pendingHireRequests.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Users width={20} height={20} color="#2D6A4F" strokeWidth={2.5} />
                                    <Text style={styles.sectionTitle}>Hire Requests</Text>
                                </View>
                            </View>

                            <View style={styles.leadsList}>
                                {pendingHireRequests.map((n) => (
                                    <View key={n.id} style={styles.leadCard}>
                                        <View style={styles.leadHeader}>
                                            <View style={styles.leadInfo}>
                                                <Text style={styles.leadName}>
                                                    {n.title || 'New hire request'}
                                                </Text>
                                                <Text style={styles.leadProperty} numberOfLines={2}>
                                                    {n.body || 'A builder wants to add you as their agent.'}
                                                </Text>
                                            </View>
                                            <View style={styles.statusBadge}>
                                                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                                <Text style={[styles.statusText, { color: '#047857' }]}>
                                                    Pending
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.leadFooter}>
                                            <Text style={styles.leadDate}>
                                                {formatTimeAgo(n.createdAt)}
                                            </Text>
                                            <View style={styles.leadActions}>
                                                <TouchableOpacity
                                                    style={styles.leadActionPrimary}
                                                    onPress={async () => {
                                                        try {
                                                            await apiRequest(`/agent/hire-requests/${n.relatedEntityId}/accept`, { method: 'POST' });
                                                            await apiRequest(`/notifications/${n.id}/read`, { method: 'PATCH' });
                                                            // Refresh notifications and listings (agent is now linked to builder properties)
                                                            await fetchDashboardData();
                                                        } catch (e) {
                                                            Alert.alert('Error', e.message || 'Failed to accept request');
                                                        }
                                                    }}
                                                >
                                                    <CheckCircle width={16} height={16} color="#ffffff" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.leadActionSecondary}
                                                    onPress={async () => {
                                                        try {
                                                            await apiRequest(`/agent/hire-requests/${n.relatedEntityId}/reject`, { method: 'POST' });
                                                            await apiRequest(`/notifications/${n.id}/read`, { method: 'PATCH' });
                                                            await fetchDashboardData();
                                                        } catch (e) {
                                                            Alert.alert('Error', e.message || 'Failed to reject request');
                                                        }
                                                    }}
                                                >
                                                    <X width={16} height={16} color="#374151" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Enhanced Recent Leads Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Users width={20} height={20} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={styles.sectionTitle}>Recent Leads</Text>
                            </View>
                            <TouchableOpacity onPress={() => { }}>
                                <View style={styles.viewAllButton}>
                                    <Text style={styles.viewAllButtonText}>View All</Text>
                                    <ChevronRight width={16} height={16} color="#2D6A4F" strokeWidth={2.5} />
                                </View>
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
                                                    <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
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
                                                        <Phone width={16} height={16} color="#ffffff" strokeWidth={2.5} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.leadActionSecondary}>
                                                        <MessageSquare width={16} height={16} color="#374151" strokeWidth={2.5} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.leadActionSecondary}>
                                                        <Eye width={16} height={16} color="#374151" strokeWidth={2.5} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIconContainer}>
                                        <Users width={32} height={32} color="#d1d5db" />
                                    </View>
                                    <Text style={styles.emptyText}>No recent leads</Text>
                                    <Text style={styles.emptySubtext}>New leads will appear here</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Enhanced My Listings Overview */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Building2 width={20} height={20} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={styles.sectionTitle}>My Listings</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('myListings')}>
                                <View style={styles.viewAllButton}>
                                    <Text style={styles.viewAllButtonText}>View All</Text>
                                    <ChevronRight width={16} height={16} color="#2D6A4F" strokeWidth={2.5} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.listingsList}>
                            {activeListings.length > 0 ? (
                                activeListings.slice(0, 5).map((listing) => {
                                    const statusStyle = getStatusStyle(listing.status);
                                    const primaryImage = getImageUrl(listing.primaryImage) || DEFAULT_PROPERTY_IMAGE;

                                    return (
                                        <TouchableOpacity
                                            key={listing.id}
                                            style={styles.listingCard}
                                            onPress={() => navigation.navigate('PropertyDetailScreen', { property: listing })}
                                            activeOpacity={0.9}
                                        >
                                            <View style={styles.listingImageContainer}>
                                                <Image
                                                    source={{ uri: primaryImage }}
                                                    style={styles.listingImage}
                                                />
                                                <LinearGradient
                                                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                                                    style={styles.listingImageGradient}
                                                />
                                                <View style={[
                                                    styles.listingStatusBadge,
                                                    { backgroundColor: statusStyle.bg }
                                                ]}>
                                                    <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                                                    <Text style={[styles.listingStatusText, { color: statusStyle.text }]}>
                                                        {listing.status || 'Active'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.listingContent}>
                                                <View style={styles.listingHeader}>
                                                    <View style={styles.listingInfo}>
                                                        <Text style={styles.listingTitle} numberOfLines={1}>
                                                            {listing.title}
                                                        </Text>
                                                        <View style={styles.listingLocation}>
                                                            <View style={styles.locationIconCircle}>
                                                                <MapPin width={10} height={10} color="#2D6A4F" strokeWidth={2.5} />
                                                            </View>
                                                            <Text style={styles.listingLocationText} numberOfLines={1}>
                                                                {listing.address}, {listing.city}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={styles.listingFooter}>
                                                    <Text style={styles.listingPrice}>
                                                        {formatPrice(listing.price)}
                                                    </Text>
                                                    <View style={styles.listingActions}>
                                                        <TouchableOpacity
                                                            style={styles.listingActionButton}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                navigation.navigate('PropertyEditScreen', {
                                                                    property: listing,
                                                                    userRole: agentData?.role === 'builder' ? 'Builder' : 'Agent'
                                                                });
                                                            }}
                                                        >
                                                            <Edit width={16} height={16} color="#6b7280" strokeWidth={2.5} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={styles.listingActionButton}>
                                                            <Share2 width={16} height={16} color="#6b7280" strokeWidth={2.5} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIconContainer}>
                                        <Building2 width={32} height={32} color="#d1d5db" />
                                    </View>
                                    <Text style={styles.emptyText}>No sold or rented listings</Text>
                                    <Text style={styles.emptySubtext}>Properties marked as sold or rented will appear here</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Enhanced Insights Section */}
                    <View style={styles.section}>
                        <View style={styles.insightsCard}>
                            <View style={styles.sectionTitleContainer}>
                                <BarChart3 width={20} height={20} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={styles.sectionTitle}>Quick Insights</Text>
                            </View>

                            <View style={styles.insightsList}>
                                <TouchableOpacity style={[styles.insightItem, { backgroundColor: '#f0fdf4' }]}>
                                    <View style={styles.insightLeft}>
                                        <View style={[styles.insightIcon, { backgroundColor: '#dcfce7' }]}>
                                            <TrendingUp width={20} height={20} color="#16a34a" strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.insightTextContainer}>
                                            <Text style={styles.insightTitle}>Trending Properties</Text>
                                            <Text style={styles.insightSubtitle}>
                                                {stats?.totalListings || 0} properties performing well
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight width={20} height={20} color="#16a34a" strokeWidth={2.5} />
                                </TouchableOpacity>

                                <View style={[styles.insightItem, { backgroundColor: '#eff6ff' }]}>
                                    <View style={styles.insightLeft}>
                                        <View style={[styles.insightIcon, { backgroundColor: '#dbeafe' }]}>
                                            <Target width={20} height={20} color="#2563eb" strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.insightTextContainer}>
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

                                <TouchableOpacity style={[styles.insightItem, { backgroundColor: '#faf5ff' }]}>
                                    <View style={styles.insightLeft}>
                                        <View style={[styles.insightIcon, { backgroundColor: '#f3e8ff' }]}>
                                            <Award width={20} height={20} color="#9333ea" strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.insightTextContainer}>
                                            <Text style={styles.insightTitle}>High-Performing Listings</Text>
                                            <Text style={styles.insightSubtitle}>
                                                Top {Math.min(3, stats?.totalListings || 0)} properties this month
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight width={20} height={20} color="#9333ea" strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 20 }} />
                </Animated.View>
            </Animated.ScrollView>

            {/* Enhanced Floating Add Button */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('addPropertyAgent')}
            >
                <LinearGradient
                    colors={['#2D6A4F', '#1e4d38']}
                    style={styles.fabGradient}
                >
                    <Plus width={28} height={28} color="#ffffff" strokeWidth={3} />
                </LinearGradient>
            </TouchableOpacity>

            {/* Enhanced Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <View style={styles.navIconActive}>
                        <Home width={22} height={22} color="#2D6A4F" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.navTextActive}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Building2 width={22} height={22} color="#9ca3af" strokeWidth={2.5} />
                    <Text style={styles.navTextInactive}>Listings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Users width={22} height={22} color="#9ca3af" strokeWidth={2.5} />
                    <Text style={styles.navTextInactive}>Leads</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <BarChart3 width={22} height={22} color="#9ca3af" strokeWidth={2.5} />
                    <Text style={styles.navTextInactive}>Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('profile')}
                >
                    <User width={22} height={22} color="#9ca3af" strokeWidth={2.5} />
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
        color: '#6b7280',
        fontWeight: '500'
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
    },

    // Enhanced Header
    header: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    appIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    appName: {
        fontSize: 19,
        color: '#111827',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    appTagline: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
        marginTop: 2,
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    notificationButton: {
        position: 'relative'
    },
    notificationIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
    notificationBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: -0.3,
    },

    // Enhanced Agent Overview
    agentOverviewContainer: {
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    agentOverview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        position: 'relative',
    },
    agentAvatarContainer: {
        position: 'relative',
    },
    agentAvatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    agentInfo: {
        flex: 1
    },
    agentNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    agentName: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    agentTitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 10,
        fontWeight: '500',
    },
    agentBadges: {
        flexDirection: 'row',
        gap: 12
    },
    agentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    agentBadgeText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.95)',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    sparkleIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
    },

    // Screen Title
    screenTitle: {
        gap: 6
    },
    screenTitleText: {
        fontSize: 22,
        color: '#111827',
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    screenSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        lineHeight: 20,
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
        marginBottom: 28
    },
    sectionHeaderRow: {
        marginBottom: 16
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 17,
        color: '#111827',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    viewAllButtonText: {
        fontSize: 13,
        color: '#2D6A4F',
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // Enhanced KPI Grid
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    kpiCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    kpiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    kpiIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    kpiTrendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    kpiTrendText: {
        fontSize: 11,
        color: '#10b981',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    kpiLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    kpiValue: {
        fontSize: 28,
        color: '#1e293b',
        fontWeight: '800',
        letterSpacing: -1,
    },

    // Enhanced Revenue Card
    revenueCardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    revenueCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    revenueLeft: {
        flex: 1,
    },
    revenueLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    revenueValue: {
        fontSize: 34,
        color: '#ffffff',
        fontWeight: '900',
        marginBottom: 8,
        letterSpacing: -1,
    },
    revenueChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    revenueChangeText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },
    revenueIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    // Enhanced Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    actionPrimary: {
        flex: 1,
        minWidth: '47%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    actionPrimaryGradient: {
        padding: 20,
        alignItems: 'center',
        gap: 10,
    },
    actionIconPrimary: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionTextPrimary: {
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    actionSecondary: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1.5,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    actionIconSecondary: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionTextSecondary: {
        fontSize: 14,
        color: '#111827',
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // Enhanced Leads List
    leadsList: {
        gap: 12
    },
    leadCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f9fafb',
    },
    leadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 14
    },
    leadInfo: {
        flex: 1
    },
    leadName: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    leadProperty: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 6,
        fontWeight: '500',
    },
    leadBudget: {
        fontSize: 15,
        color: '#2D6A4F',
        fontWeight: '700'
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    leadFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6'
    },
    leadDate: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    leadActions: {
        flexDirection: 'row',
        gap: 8
    },
    leadActionPrimary: {
        width: 36,
        height: 36,
        backgroundColor: '#2D6A4F',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    leadActionSecondary: {
        width: 36,
        height: 36,
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },

    // Enhanced Listings List
    listingsList: {
        gap: 14
    },
    listingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f9fafb',
    },
    listingImageContainer: {
        position: 'relative',
        height: 140,
    },
    listingImage: {
        width: '100%',
        height: '100%',
    },
    listingImageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    listingContent: {
        padding: 16
    },
    listingHeader: {
        marginBottom: 12
    },
    listingInfo: {
        flex: 1
    },
    listingTitle: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    listingLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    locationIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listingLocationText: {
        fontSize: 13,
        color: '#6b7280',
        flex: 1,
        fontWeight: '500',
    },
    listingStatusBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    listingStatusText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    listingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    listingPrice: {
        fontSize: 18,
        color: '#2D6A4F',
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    listingActions: {
        flexDirection: 'row',
        gap: 10
    },
    listingActionButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Enhanced Insights
    insightsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f9fafb',
    },
    insightsList: {
        gap: 12,
        marginTop: 16
    },
    insightItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16
    },
    insightLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1
    },
    insightIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    insightTextContainer: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    insightSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    conversionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 6
    },
    conversionBarBg: {
        width: 100,
        height: 8,
        backgroundColor: '#bfdbfe',
        borderRadius: 4,
        overflow: 'hidden'
    },
    conversionBarFill: {
        height: '100%',
        backgroundColor: '#2563eb',
        borderRadius: 4
    },
    conversionPercent: {
        fontSize: 13,
        color: '#2563eb',
        fontWeight: '700',
    },

    // Enhanced FAB
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 24,
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    // Enhanced Bottom Nav
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    navItem: {
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    navIconActive: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTextActive: {
        fontSize: 11,
        color: '#2D6A4F',
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    navTextInactive: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '600',
        letterSpacing: 0.2,
    }
});

export default AgentDashboard;
