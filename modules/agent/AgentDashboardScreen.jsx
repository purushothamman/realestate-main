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
    Alert,
    useWindowDimensions,
    Platform,
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

// ─── Responsive Utilities ────────────────────────────────────────────────────

const BASE_WIDTH = 375; // iPhone SE / base design width

const getResponsiveSize = (size, width) => {
    const scale = width / BASE_WIDTH;
    const clamped = Math.min(Math.max(scale, 0.85), 1.4);
    return Math.round(size * clamped);
};

const getDeviceType = (width) => {
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    if (width >= 414) return 'largeMobile';
    return 'mobile';
};

const getColumns = (deviceType) => {
    if (deviceType === 'desktop') return 4;
    if (deviceType === 'tablet') return 2;
    return 2;
};

// ─── AnimatedKPICard ─────────────────────────────────────────────────────────

const AnimatedKPICard = ({ icon, label, value, trend, trendValue, color, delay = 0, style, rs }) => {
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
        <Animated.View style={[
            styles.kpiCard,
            {
                transform: [{ scale: scaleAnim }],
                padding: rs(18),
                borderRadius: rs(20),
                marginBottom: rs(16),
            },
            style
        ]}>
            <View style={styles.kpiHeader}>
                <View style={[
                    styles.kpiIcon,
                    {
                        backgroundColor: `${color}15`,
                        width: rs(44),
                        height: rs(44),
                        borderRadius: rs(14),
                    }
                ]}>
                    {icon}
                </View>
                {trend && (
                    <View style={[styles.kpiTrendContainer, { paddingHorizontal: rs(8), paddingVertical: rs(4), borderRadius: rs(10) }]}>
                        <TrendingUp width={rs(14)} height={rs(14)} color="#10b981" strokeWidth={2.5} />
                        <Text style={[styles.kpiTrendText, { fontSize: rs(11) }]}>{trendValue}</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.kpiLabel, { fontSize: rs(13) }]}>{label}</Text>
            <Text style={[styles.kpiValue, { fontSize: rs(26) }]}>{value}</Text>
        </Animated.View>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AgentDashboard = ({ navigation, route }) => {
    const { width, height } = useWindowDimensions();
    const deviceType = getDeviceType(width);
    const isTabletOrDesktop = deviceType === 'tablet' || deviceType === 'desktop';
    const isDesktop = deviceType === 'desktop';

    // Responsive size helper bound to current width
    const rs = (size) => getResponsiveSize(size, width);

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
            if (!response.ok) throw new Error(data.message || 'API request failed');
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
                setActiveListings(propertiesResponse.properties || []);
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

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    const formatPrice = (price) => {
        if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
        if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
        return `$${price}`;
    };

    const formatBudgetRange = (budgetRange) => {
        if (!budgetRange) return 'N/A';
        return `${formatPrice(budgetRange.min)} - ${formatPrice(budgetRange.max)}`;
    };

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

    const pendingHireRequests = notifications.filter(
        (n) => n.type === 'hire_request' && !n.isRead
    );

    const handleContactLead = async (lead) => {
        Alert.alert(
            'Contact Lead',
            `Call ${lead.clientName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => { console.log('Calling:', lead.phone); } }
            ]
        );
    };

    useEffect(() => {
        fetchDashboardData();
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
        ]).start();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'new': return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
            case 'contacted': return { bg: '#f3e8ff', text: '#7c3aed', border: '#e9d5ff' };
            case 'follow-up': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
            case 'closed': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
            case 'active': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
            case 'pending': return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
            case 'sold': return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
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

    // KPI card width based on device
    const kpiCardWidth = isDesktop
        ? `${100 / 4 - 1.5}%`
        : isTabletOrDesktop
        ? `${100 / 2 - 1}%`
        : '48%';

    // Listing columns
    const listingColumns = isTabletOrDesktop ? 2 : 1;

    if (loading && !stats) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={[styles.loadingText, { fontSize: rs(16) }]}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* ── Fixed Header ── */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerOpacity,
                        transform: [{ translateY: slideAnim }],
                        paddingHorizontal: rs(isTabletOrDesktop ? 32 : 24),
                        paddingTop: rs(16),
                        paddingBottom: rs(24),
                    }
                ]}
            >
                {/* Top Bar */}
                <View style={[styles.topBar, { marginBottom: rs(20) }]}>
                    <View style={[styles.topBarLeft, { gap: rs(12) }]}>
                        <LinearGradient
                            colors={['#2D6A4F', '#1e4d38']}
                            style={[styles.appIcon, { width: rs(44), height: rs(44), borderRadius: rs(14) }]}
                        >
                            <Building2 width={rs(22)} height={rs(22)} color="#ffffff" strokeWidth={2.5} />
                        </LinearGradient>
                        <View>
                            <Text style={[styles.appName, { fontSize: rs(19) }]}>EstateHub</Text>
                            <Text style={[styles.appTagline, { fontSize: rs(12) }]}>Agent Portal</Text>
                        </View>
                    </View>

                    <View style={[styles.topBarRight, { gap: rs(12) }]}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('agentNotifications')}
                        >
                            <View style={[styles.notificationIconBg, { width: rs(40), height: rs(40), borderRadius: rs(12) }]}>
                                <Bell width={rs(20)} height={rs(20)} color="#6b7280" strokeWidth={2.5} />
                            </View>
                            {pendingHireRequests.length > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={[styles.notificationBadgeText, { fontSize: rs(10) }]}>
                                        {pendingHireRequests.length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.settingsButton, { width: rs(40), height: rs(40), borderRadius: rs(12) }]}
                            activeOpacity={0.7}
                        >
                            <Settings width={rs(20)} height={rs(20)} color="#6b7280" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Agent Overview */}
                <View style={[styles.agentOverviewContainer, { borderRadius: rs(20), marginBottom: rs(20) }]}>
                    <LinearGradient
                        colors={['#2D6A4F', '#1e4d38']}
                        style={[styles.agentOverview, { gap: rs(16), padding: rs(20) }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.agentAvatarContainer}>
                            <Image
                                source={{ uri: getImageUrl(agentData?.avatar) || DEFAULT_PROFILE_IMAGE }}
                                style={[styles.agentAvatar, { width: rs(68), height: rs(68), borderRadius: rs(34) }]}
                            />
                            <View style={[styles.onlineIndicator, { width: rs(14), height: rs(14), borderRadius: rs(7) }]} />
                        </View>
                        <View style={styles.agentInfo}>
                            <View style={[styles.agentNameRow, { gap: rs(6), marginBottom: rs(4) }]}>
                                <Text style={[styles.agentName, { fontSize: rs(18) }]}>
                                    {agentData?.name || 'Agent Name'}
                                </Text>
                                <Award width={rs(16)} height={rs(16)} color="#fbbf24" fill="#fbbf24" />
                            </View>
                            <Text style={[styles.agentTitle, { fontSize: rs(13), marginBottom: rs(10) }]}>
                                {agentData?.title || 'Real Estate Agent'}
                            </Text>
                            <View style={[styles.agentBadges, { gap: rs(12) }]}>
                                {agentData?.verified !== false && (
                                    <View style={[styles.agentBadge, { paddingHorizontal: rs(10), paddingVertical: rs(4), borderRadius: rs(12), gap: rs(4) }]}>
                                        <CheckCircle width={rs(12)} height={rs(12)} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                                        <Text style={[styles.agentBadgeText, { fontSize: rs(12) }]}>Verified</Text>
                                    </View>
                                )}
                                <View style={[styles.agentBadge, { paddingHorizontal: rs(10), paddingVertical: rs(4), borderRadius: rs(12), gap: rs(4) }]}>
                                    <Target width={rs(12)} height={rs(12)} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                                    <Text style={[styles.agentBadgeText, { fontSize: rs(12) }]}>
                                        {stats?.conversionRate || 0}% CVR
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sparkleIcon}>
                            <Sparkles width={rs(20)} height={rs(20)} color="rgba(255,255,255,0.6)" />
                        </View>
                    </LinearGradient>
                </View>

                {/* Screen Title */}
                <View style={[styles.screenTitle, { gap: rs(6) }]}>
                    <Text style={[styles.screenTitleText, { fontSize: rs(22) }]}>Dashboard</Text>
                    <Text style={[styles.screenSubtitle, { fontSize: rs(14) }]}>
                        Track your performance and manage listings
                    </Text>
                </View>
            </Animated.View>

            {/* ── Scrollable Content ── */}
            <Animated.ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        padding: rs(isTabletOrDesktop ? 32 : 24),
                        paddingBottom: rs(100),
                    }
                ]}
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

                    {/* ── Performance KPIs ── */}
                    <View style={[styles.section, { marginBottom: rs(28) }]}>
                        <View style={[styles.sectionHeaderRow, { marginBottom: rs(16) }]}>
                            <View style={[styles.sectionTitleContainer, { gap: rs(10) }]}>
                                <Activity width={rs(20)} height={rs(20)} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={[styles.sectionTitle, { fontSize: rs(17) }]}>Performance Snapshot</Text>
                            </View>
                        </View>

                        {/* KPI Grid — wraps into columns based on device */}
                        <View style={[
                            styles.kpiGrid,
                            isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: rs(12) }
                        ]}>
                            {[
                                {
                                    icon: <FileText width={rs(22)} height={rs(22)} color="#2D6A4F" strokeWidth={2.5} />,
                                    label: 'Total Listings',
                                    value: stats?.totalListings || 0,
                                    trend: true, trendValue: '+3', color: '#2D6A4F', delay: 0,
                                },
                                {
                                    icon: <Users width={rs(22)} height={rs(22)} color="#3b82f6" strokeWidth={2.5} />,
                                    label: 'Active Leads',
                                    value: stats?.activeLeads || 0,
                                    trend: true, trendValue: `+${stats?.newLeads || 0}`, color: '#3b82f6', delay: 100,
                                },
                                {
                                    icon: <Users width={rs(22)} height={rs(22)} color="#a855f7" strokeWidth={2.5} />,
                                    label: 'Pending Inquiries',
                                    value: stats?.pendingInquiries || 0,
                                    trend: false, color: '#a855f7', delay: 200,
                                    onPress: () => navigation.navigate('agentInquiries'),
                                },
                                {
                                    icon: <CheckCircle width={rs(22)} height={rs(22)} color="#10b981" strokeWidth={2.5} />,
                                    label: 'Deals Closed',
                                    value: stats?.dealsClosed || 0,
                                    trend: true, trendValue: '+2', color: '#10b981', delay: 300,
                                },
                            ].map((kpi, idx) => {
                                const card = (
                                    <AnimatedKPICard
                                        key={idx}
                                        icon={kpi.icon}
                                        label={kpi.label}
                                        value={kpi.value}
                                        trend={kpi.trend}
                                        trendValue={kpi.trendValue}
                                        color={kpi.color}
                                        delay={kpi.delay}
                                        style={{ width: kpiCardWidth }}
                                        rs={rs}
                                    />
                                );
                                return kpi.onPress ? (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={kpi.onPress}
                                        activeOpacity={0.7}
                                        style={{ width: kpiCardWidth }}
                                    >
                                        <AnimatedKPICard
                                            icon={kpi.icon}
                                            label={kpi.label}
                                            value={kpi.value}
                                            trend={kpi.trend}
                                            trendValue={kpi.trendValue}
                                            color={kpi.color}
                                            delay={kpi.delay}
                                            style={{ width: '100%' }}
                                            rs={rs}
                                        />
                                    </TouchableOpacity>
                                ) : card;
                            })}
                        </View>

                        {/* Revenue Card */}
                        <View style={[styles.revenueCardContainer, { borderRadius: rs(20) }]}>
                            <LinearGradient
                                colors={['#3b82f6', '#8b5cf6']}
                                style={[styles.revenueCard, { padding: rs(24) }]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.revenueLeft}>
                                    <Text style={[styles.revenueLabel, { fontSize: rs(13) }]}>Monthly Revenue</Text>
                                    <Text style={[styles.revenueValue, { fontSize: rs(32) }]}>
                                        {formatPrice(stats?.monthlyRevenue || 0)}
                                    </Text>
                                    <View style={styles.revenueChange}>
                                        <ArrowUpRight width={rs(14)} height={rs(14)} color="#fff" strokeWidth={3} />
                                        <Text style={[styles.revenueChangeText, { fontSize: rs(13) }]}>+12.5% from last month</Text>
                                    </View>
                                </View>
                                <View style={[styles.revenueIcon, { width: rs(56), height: rs(56), borderRadius: rs(16) }]}>
                                    <DollarSign width={rs(28)} height={rs(28)} color="#ffffff" strokeWidth={2.5} />
                                </View>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* ── Quick Actions ── */}
                    <View style={[styles.section, { marginBottom: rs(28) }]}>
                        <View style={[styles.sectionHeaderRow, { marginBottom: rs(16) }]}>
                            <View style={[styles.sectionTitleContainer, { gap: rs(10) }]}>
                                <Sparkles width={rs(20)} height={rs(20)} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={[styles.sectionTitle, { fontSize: rs(17) }]}>Quick Actions</Text>
                            </View>
                        </View>

                        <View style={[styles.actionsGrid, { gap: rs(12) }]}>
                            <TouchableOpacity
                                style={[styles.actionPrimary, { borderRadius: rs(16), minWidth: isTabletOrDesktop ? '23%' : '47%' }]}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('addPropertyAgent')}
                            >
                                <LinearGradient
                                    colors={['#2D6A4F', '#1e4d38']}
                                    style={[styles.actionPrimaryGradient, { padding: rs(20), gap: rs(10) }]}
                                >
                                    <View style={[styles.actionIconPrimary, { width: rs(52), height: rs(52), borderRadius: rs(16) }]}>
                                        <Plus width={rs(24)} height={rs(24)} color="#ffffff" strokeWidth={3} />
                                    </View>
                                    <Text style={[styles.actionTextPrimary, { fontSize: rs(14) }]}>Add Property</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {[
                                { icon: <Phone width={rs(22)} height={rs(22)} color="#3b82f6" strokeWidth={2.5} />, bg: '#eff6ff', label: 'Contact Leads' },
                                { icon: <Building2 width={rs(22)} height={rs(22)} color="#a855f7" strokeWidth={2.5} />, bg: '#faf5ff', label: 'Manage Listings' },
                                { icon: <BarChart3 width={rs(22)} height={rs(22)} color="#10b981" strokeWidth={2.5} />, bg: '#f0fdf4', label: 'View Reports' },
                            ].map((action, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.actionSecondary,
                                        {
                                            borderRadius: rs(16),
                                            padding: rs(20),
                                            gap: rs(10),
                                            minWidth: isTabletOrDesktop ? '23%' : '47%',
                                            flex: isTabletOrDesktop ? 0 : 1,
                                        }
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    <View style={[
                                        styles.actionIconSecondary,
                                        { backgroundColor: action.bg, width: rs(52), height: rs(52), borderRadius: rs(16) }
                                    ]}>
                                        {action.icon}
                                    </View>
                                    <Text style={[styles.actionTextSecondary, { fontSize: rs(14) }]}>{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── Hire Requests ── */}
                    {pendingHireRequests.length > 0 && (
                        <View style={[styles.section, { marginBottom: rs(28) }]}>
                            <View style={[styles.sectionHeader, { marginBottom: rs(16) }]}>
                                <View style={[styles.sectionTitleContainer, { gap: rs(10) }]}>
                                    <Users width={rs(20)} height={rs(20)} color="#2D6A4F" strokeWidth={2.5} />
                                    <Text style={[styles.sectionTitle, { fontSize: rs(17) }]}>Hire Requests</Text>
                                </View>
                            </View>

                            <View style={[
                                styles.leadsList,
                                isTabletOrDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: rs(12) }
                            ]}>
                                {pendingHireRequests.map((n) => (
                                    <View
                                        key={n.id}
                                        style={[
                                            styles.leadCard,
                                            {
                                                borderRadius: rs(16),
                                                padding: rs(18),
                                            },
                                            isTabletOrDesktop && { width: '48%' }
                                        ]}
                                    >
                                        <View style={[styles.leadHeader, { gap: rs(12), marginBottom: rs(14) }]}>
                                            <View style={styles.leadInfo}>
                                                <Text style={[styles.leadName, { fontSize: rs(15) }]}>
                                                    {n.title || 'New hire request'}
                                                </Text>
                                                <Text style={[styles.leadProperty, { fontSize: rs(13) }]} numberOfLines={2}>
                                                    {n.body || 'A builder wants to add you as their agent.'}
                                                </Text>
                                            </View>
                                            <View style={[styles.statusBadge, { paddingHorizontal: rs(12), paddingVertical: rs(6), borderRadius: rs(14) }]}>
                                                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                                <Text style={[styles.statusText, { color: '#047857', fontSize: rs(12) }]}>Pending</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.leadFooter, { paddingTop: rs(14) }]}>
                                            <Text style={[styles.leadDate, { fontSize: rs(12) }]}>
                                                {formatTimeAgo(n.createdAt)}
                                            </Text>
                                            <View style={[styles.leadActions, { gap: rs(8) }]}>
                                                <TouchableOpacity
                                                    style={[styles.leadActionPrimary, { width: rs(36), height: rs(36), borderRadius: rs(10) }]}
                                                    onPress={async () => {
                                                        try {
                                                            await apiRequest(`/agent/hire-requests/${n.relatedEntityId}/accept`, { method: 'POST' });
                                                            await apiRequest(`/notifications/${n.id}/read`, { method: 'PATCH' });
                                                            await fetchDashboardData();
                                                        } catch (e) {
                                                            Alert.alert('Error', e.message || 'Failed to accept request');
                                                        }
                                                    }}
                                                >
                                                    <CheckCircle width={rs(16)} height={rs(16)} color="#ffffff" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.leadActionSecondary, { width: rs(36), height: rs(36), borderRadius: rs(10) }]}
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
                                                    <X width={rs(16)} height={rs(16)} color="#374151" strokeWidth={2.5} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── Recent Leads ── */}
                    <View style={[styles.section, { marginBottom: rs(28) }]}>
                        <View style={[styles.sectionHeader, { marginBottom: rs(16) }]}>
                            <View style={[styles.sectionTitleContainer, { gap: rs(10) }]}>
                                <Users width={rs(20)} height={rs(20)} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={[styles.sectionTitle, { fontSize: rs(17) }]}>Recent Leads</Text>
                            </View>
                            <TouchableOpacity onPress={() => { }}>
                                <View style={[styles.viewAllButton, { paddingHorizontal: rs(12), paddingVertical: rs(6), borderRadius: rs(12), gap: rs(4) }]}>
                                    <Text style={[styles.viewAllButtonText, { fontSize: rs(13) }]}>View All</Text>
                                    <ChevronRight width={rs(16)} height={rs(16)} color="#2D6A4F" strokeWidth={2.5} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={[
                            styles.leadsList,
                            isTabletOrDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: rs(12) }
                        ]}>
                            {recentLeads.length > 0 ? (
                                recentLeads.map((lead) => {
                                    const statusStyle = getStatusStyle(lead.status);
                                    return (
                                        <View
                                            key={lead._id}
                                            style={[
                                                styles.leadCard,
                                                { borderRadius: rs(16), padding: rs(18) },
                                                isTabletOrDesktop && { width: '48%' }
                                            ]}
                                        >
                                            <View style={[styles.leadHeader, { gap: rs(12), marginBottom: rs(14) }]}>
                                                <View style={styles.leadInfo}>
                                                    <Text style={[styles.leadName, { fontSize: rs(15) }]}>{lead.clientName}</Text>
                                                    <Text style={[styles.leadProperty, { fontSize: rs(13) }]} numberOfLines={1}>
                                                        {lead.property?.title || 'Property'}
                                                    </Text>
                                                    <Text style={[styles.leadBudget, { fontSize: rs(15) }]}>
                                                        {formatBudgetRange(lead.budgetRange)}
                                                    </Text>
                                                </View>
                                                <View style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor: statusStyle.bg,
                                                        borderColor: statusStyle.border,
                                                        paddingHorizontal: rs(12),
                                                        paddingVertical: rs(6),
                                                        borderRadius: rs(14),
                                                    }
                                                ]}>
                                                    <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                                                    <Text style={[styles.statusText, { color: statusStyle.text, fontSize: rs(12) }]}>
                                                        {getStatusLabel(lead.status)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={[styles.leadFooter, { paddingTop: rs(14) }]}>
                                                <Text style={[styles.leadDate, { fontSize: rs(12) }]}>
                                                    {formatTimeAgo(lead.createdAt)}
                                                </Text>
                                                <View style={[styles.leadActions, { gap: rs(8) }]}>
                                                    <TouchableOpacity
                                                        style={[styles.leadActionPrimary, { width: rs(36), height: rs(36), borderRadius: rs(10) }]}
                                                        onPress={() => handleContactLead(lead)}
                                                    >
                                                        <Phone width={rs(16)} height={rs(16)} color="#ffffff" strokeWidth={2.5} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.leadActionSecondary, { width: rs(36), height: rs(36), borderRadius: rs(10) }]}>
                                                        <MessageSquare width={rs(16)} height={rs(16)} color="#374151" strokeWidth={2.5} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={[styles.leadActionSecondary, { width: rs(36), height: rs(36), borderRadius: rs(10) }]}>
                                                        <Eye width={rs(16)} height={rs(16)} color="#374151" strokeWidth={2.5} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })
                            ) : (
                                <View style={[styles.emptyState, { paddingVertical: rs(48), paddingHorizontal: rs(32) }]}>
                                    <View style={[styles.emptyIconContainer, { width: rs(64), height: rs(64), borderRadius: rs(32), marginBottom: rs(16) }]}>
                                        <Users width={rs(32)} height={rs(32)} color="#d1d5db" />
                                    </View>
                                    <Text style={[styles.emptyText, { fontSize: rs(16) }]}>No recent leads</Text>
                                    <Text style={[styles.emptySubtext, { fontSize: rs(14) }]}>New leads will appear here</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* ── My Listings ── */}
                    <View style={[styles.section, { marginBottom: rs(28) }]}>
                        <View style={[styles.sectionHeader, { marginBottom: rs(16) }]}>
                            <View style={[styles.sectionTitleContainer, { gap: rs(10) }]}>
                                <Building2 width={rs(20)} height={rs(20)} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={[styles.sectionTitle, { fontSize: rs(17) }]}>My Listings</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('myListings')}>
                                <View style={[styles.viewAllButton, { paddingHorizontal: rs(12), paddingVertical: rs(6), borderRadius: rs(12), gap: rs(4) }]}>
                                    <Text style={[styles.viewAllButtonText, { fontSize: rs(13) }]}>View All</Text>
                                    <ChevronRight width={rs(16)} height={rs(16)} color="#2D6A4F" strokeWidth={2.5} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={[
                            styles.listingsList,
                            isTabletOrDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: rs(14) }
                        ]}>
                            {activeListings.length > 0 ? (
                                activeListings.slice(0, isTabletOrDesktop ? 6 : 5).map((listing) => {
                                    const statusStyle = getStatusStyle(listing.status);
                                    const primaryImage = getImageUrl(listing.primaryImage) || DEFAULT_PROPERTY_IMAGE;
                                    const listingImageHeight = isTabletOrDesktop ? rs(160) : rs(140);

                                    return (
                                        <TouchableOpacity
                                            key={listing.id}
                                            style={[
                                                styles.listingCard,
                                                { borderRadius: rs(18) },
                                                isTabletOrDesktop && { width: '48%' },
                                                isDesktop && { width: '32%' },
                                            ]}
                                            onPress={() => navigation.navigate('PropertyDetailScreen', { property: listing })}
                                            activeOpacity={0.9}
                                        >
                                            <View style={[styles.listingImageContainer, { height: listingImageHeight }]}>
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
                                                    {
                                                        backgroundColor: statusStyle.bg,
                                                        top: rs(12),
                                                        left: rs(12),
                                                        paddingHorizontal: rs(12),
                                                        paddingVertical: rs(6),
                                                        borderRadius: rs(14),
                                                        gap: rs(6),
                                                    }
                                                ]}>
                                                    <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                                                    <Text style={[styles.listingStatusText, { color: statusStyle.text, fontSize: rs(12) }]}>
                                                        {listing.status || 'Active'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={[styles.listingContent, { padding: rs(16) }]}>
                                                <View style={[styles.listingHeader, { marginBottom: rs(12) }]}>
                                                    <View style={styles.listingInfo}>
                                                        <Text style={[styles.listingTitle, { fontSize: rs(16), marginBottom: rs(8) }]} numberOfLines={1}>
                                                            {listing.title}
                                                        </Text>
                                                        <View style={[styles.listingLocation, { gap: rs(8) }]}>
                                                            <View style={[styles.locationIconCircle, { width: rs(20), height: rs(20), borderRadius: rs(10) }]}>
                                                                <MapPin width={rs(10)} height={rs(10)} color="#2D6A4F" strokeWidth={2.5} />
                                                            </View>
                                                            <Text style={[styles.listingLocationText, { fontSize: rs(13) }]} numberOfLines={1}>
                                                                {listing.address}, {listing.city}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={[styles.listingFooter, { paddingTop: rs(12) }]}>
                                                    <Text style={[styles.listingPrice, { fontSize: rs(18) }]}>
                                                        {formatPrice(listing.price)}
                                                    </Text>
                                                    <View style={[styles.listingActions, { gap: rs(10) }]}>
                                                        <TouchableOpacity
                                                            style={[styles.listingActionButton, { width: rs(36), height: rs(36), borderRadius: rs(10) }]}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                navigation.navigate('PropertyEditScreen', {
                                                                    property: listing,
                                                                    userRole: agentData?.role === 'builder' ? 'Builder' : 'Agent'
                                                                });
                                                            }}
                                                        >
                                                            <Edit width={rs(16)} height={rs(16)} color="#6b7280" strokeWidth={2.5} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={[styles.listingActionButton, { width: rs(36), height: rs(36), borderRadius: rs(10) }]}>
                                                            <Share2 width={rs(16)} height={rs(16)} color="#6b7280" strokeWidth={2.5} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View style={[styles.emptyState, { paddingVertical: rs(48), paddingHorizontal: rs(32) }]}>
                                    <View style={[styles.emptyIconContainer, { width: rs(64), height: rs(64), borderRadius: rs(32), marginBottom: rs(16) }]}>
                                        <Building2 width={rs(32)} height={rs(32)} color="#d1d5db" />
                                    </View>
                                    <Text style={[styles.emptyText, { fontSize: rs(16) }]}>No listings yet</Text>
                                    <Text style={[styles.emptySubtext, { fontSize: rs(14) }]}>Your recently added properties will appear here</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* ── Insights ── */}
                    <View style={[styles.section, { marginBottom: rs(28) }]}>
                        <View style={[styles.insightsCard, { borderRadius: rs(20), padding: rs(20) }]}>
                            <View style={[styles.sectionTitleContainer, { gap: rs(10) }]}>
                                <BarChart3 width={rs(20)} height={rs(20)} color="#2D6A4F" strokeWidth={2.5} />
                                <Text style={[styles.sectionTitle, { fontSize: rs(17) }]}>Quick Insights</Text>
                            </View>

                            <View style={[
                                styles.insightsList,
                                { gap: rs(12), marginTop: rs(16) },
                                isTabletOrDesktop && { flexDirection: 'row', flexWrap: 'wrap' }
                            ]}>
                                <TouchableOpacity style={[
                                    styles.insightItem,
                                    { backgroundColor: '#f0fdf4', padding: rs(16), borderRadius: rs(16) },
                                    isTabletOrDesktop && { flex: 1, minWidth: '30%' }
                                ]}>
                                    <View style={[styles.insightLeft, { gap: rs(14) }]}>
                                        <View style={[styles.insightIcon, { backgroundColor: '#dcfce7', width: rs(44), height: rs(44), borderRadius: rs(12) }]}>
                                            <TrendingUp width={rs(20)} height={rs(20)} color="#16a34a" strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.insightTextContainer}>
                                            <Text style={[styles.insightTitle, { fontSize: rs(14) }]}>Trending Properties</Text>
                                            <Text style={[styles.insightSubtitle, { fontSize: rs(12) }]}>
                                                {stats?.totalListings || 0} properties performing well
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight width={rs(20)} height={rs(20)} color="#16a34a" strokeWidth={2.5} />
                                </TouchableOpacity>

                                <View style={[
                                    styles.insightItem,
                                    { backgroundColor: '#eff6ff', padding: rs(16), borderRadius: rs(16) },
                                    isTabletOrDesktop && { flex: 1, minWidth: '30%' }
                                ]}>
                                    <View style={[styles.insightLeft, { gap: rs(14) }]}>
                                        <View style={[styles.insightIcon, { backgroundColor: '#dbeafe', width: rs(44), height: rs(44), borderRadius: rs(12) }]}>
                                            <Target width={rs(20)} height={rs(20)} color="#2563eb" strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.insightTextContainer}>
                                            <Text style={[styles.insightTitle, { fontSize: rs(14) }]}>Lead Conversion Rate</Text>
                                            <View style={[styles.conversionBar, { gap: rs(10), marginTop: rs(6) }]}>
                                                <View style={[styles.conversionBarBg, { width: rs(100), height: rs(8), borderRadius: rs(4) }]}>
                                                    <View style={[
                                                        styles.conversionBarFill,
                                                        { width: `${stats?.conversionRate || 0}%`, borderRadius: rs(4) }
                                                    ]} />
                                                </View>
                                                <Text style={[styles.conversionPercent, { fontSize: rs(13) }]}>
                                                    {stats?.conversionRate || 0}%
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity style={[
                                    styles.insightItem,
                                    { backgroundColor: '#faf5ff', padding: rs(16), borderRadius: rs(16) },
                                    isTabletOrDesktop && { flex: 1, minWidth: '30%' }
                                ]}>
                                    <View style={[styles.insightLeft, { gap: rs(14) }]}>
                                        <View style={[styles.insightIcon, { backgroundColor: '#f3e8ff', width: rs(44), height: rs(44), borderRadius: rs(12) }]}>
                                            <Award width={rs(20)} height={rs(20)} color="#9333ea" strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.insightTextContainer}>
                                            <Text style={[styles.insightTitle, { fontSize: rs(14) }]}>High-Performing Listings</Text>
                                            <Text style={[styles.insightSubtitle, { fontSize: rs(12) }]}>
                                                Top {Math.min(3, stats?.totalListings || 0)} properties this month
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight width={rs(20)} height={rs(20)} color="#9333ea" strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: rs(20) }} />
                </Animated.View>
            </Animated.ScrollView>

            {/* ── Floating Add Button ── */}
            <TouchableOpacity
                style={[styles.fab, { bottom: rs(24), right: rs(24) }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('addPropertyAgent')}
            >
                <LinearGradient
                    colors={['#2D6A4F', '#1e4d38']}
                    style={[styles.fabGradient, { width: rs(60), height: rs(60), borderRadius: rs(30) }]}
                >
                    <Plus width={rs(28)} height={rs(28)} color="#ffffff" strokeWidth={3} />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// ─── Static Styles (non-size-dependent properties only) ──────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        width: '100%',
    },
    emptyIconContainer: {
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtext: {
        color: '#9ca3af',
        textAlign: 'center',
    },

    // Header
    header: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    appName: {
        color: '#111827',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    appTagline: {
        color: '#9ca3af',
        fontWeight: '500',
        marginTop: 2,
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        position: 'relative',
    },
    notificationIconBg: {
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButton: {
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
        fontWeight: '800',
        letterSpacing: -0.3,
    },

    // Agent Overview
    agentOverviewContainer: {
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
        position: 'relative',
    },
    agentAvatarContainer: {
        position: 'relative',
    },
    agentAvatar: {
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    agentInfo: {
        flex: 1,
    },
    agentNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    agentName: {
        color: '#ffffff',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    agentTitle: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '500',
    },
    agentBadges: {
        flexDirection: 'row',
    },
    agentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    agentBadgeText: {
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
    screenTitle: {},
    screenTitleText: {
        color: '#111827',
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    screenSubtitle: {
        color: '#6b7280',
        fontWeight: '500',
        lineHeight: 20,
    },

    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {},

    // Section
    section: {},
    sectionHeaderRow: {},
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        color: '#111827',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
    },
    viewAllButtonText: {
        color: '#2D6A4F',
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // KPI Grid
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    kpiCard: {
        backgroundColor: '#ffffff',
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
        marginBottom: 12,
    },
    kpiIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    kpiTrendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    kpiTrendText: {
        color: '#10b981',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    kpiLabel: {
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    kpiValue: {
        color: '#1e293b',
        fontWeight: '800',
        letterSpacing: -1,
    },

    // Revenue Card
    revenueCardContainer: {
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
    },
    revenueLeft: {
        flex: 1,
    },
    revenueLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    revenueValue: {
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
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },
    revenueIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    actionPrimary: {
        overflow: 'hidden',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
        flex: 1,
    },
    actionPrimaryGradient: {
        alignItems: 'center',
    },
    actionIconPrimary: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTextPrimary: {
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    actionSecondary: {
        backgroundColor: '#ffffff',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    actionIconSecondary: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTextSecondary: {
        color: '#111827',
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    // Leads List
    leadsList: {
        gap: 12,
    },
    leadCard: {
        backgroundColor: '#ffffff',
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
    },
    leadInfo: {
        flex: 1,
    },
    leadName: {
        color: '#111827',
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    leadProperty: {
        color: '#6b7280',
        marginBottom: 6,
        fontWeight: '500',
    },
    leadBudget: {
        color: '#2D6A4F',
        fontWeight: '700',
    },
    statusBadge: {
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
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    leadFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    leadDate: {
        color: '#9ca3af',
        fontWeight: '500',
    },
    leadActions: {
        flexDirection: 'row',
    },
    leadActionPrimary: {
        backgroundColor: '#2D6A4F',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    leadActionSecondary: {
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Listings
    listingsList: {
        gap: 14,
    },
    listingCard: {
        backgroundColor: '#ffffff',
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
    listingContent: {},
    listingHeader: {},
    listingInfo: {
        flex: 1,
    },
    listingTitle: {
        color: '#111827',
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    listingLocation: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIconCircle: {
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listingLocationText: {
        color: '#6b7280',
        flex: 1,
        fontWeight: '500',
    },
    listingStatusBadge: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    listingStatusText: {
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    listingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    listingPrice: {
        color: '#2D6A4F',
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    listingActions: {
        flexDirection: 'row',
    },
    listingActionButton: {
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Insights
    insightsCard: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f9fafb',
    },
    insightsList: {},
    insightItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    insightLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    insightIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightTextContainer: {
        flex: 1,
    },
    insightTitle: {
        color: '#111827',
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    insightSubtitle: {
        color: '#6b7280',
        fontWeight: '500',
    },
    conversionBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    conversionBarBg: {
        backgroundColor: '#bfdbfe',
        overflow: 'hidden',
    },
    conversionBarFill: {
        height: '100%',
        backgroundColor: '#2563eb',
    },
    conversionPercent: {
        color: '#2563eb',
        fontWeight: '700',
    },

    // FAB
    fab: {
        position: 'absolute',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    fabGradient: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AgentDashboard;