import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Search,
  Bell,
  Filter,
  MoreVertical,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Flame,
  Users,
  UserCheck,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  UserPlus,
  PhoneCall,
  MessageSquare,
  Upload,
  FileText,
  BarChart3,
  Share2,
  PlusCircle,
  CalendarClock,
  Home,
  CheckCircle2,
  MapPin,
  User,
  Eye,
  Edit,
} from 'lucide-react-native';

import {
  agentService,
  leadService,
  propertyService,
  visitService,
  alertService,
  activityService,
  analyticsService
} from './services/apiServices';

const { width } = Dimensions.get('window');

// ─── Badge ───────────────────────────────────────────
const Badge = ({ style, children }) => (
  <View style={[styles.badge, style]}>
    <Text style={styles.badgeText}>{children}</Text>
  </View>
);

// ─── AgentHeader ──────────────────────────────────────
const AgentHeader = ({ unreadAlerts }) => (
  <View style={styles.headerBg}>
    <View style={styles.headerTopRow}>
      <View style={styles.headerLogoRow}>
        <Text style={styles.headerLogoText}>EStateHub</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Search size={16} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <View>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Bell size={16} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          {unreadAlerts > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadAlerts}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Filter size={16} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconBtn}>
          <MoreVertical size={16} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
    <Text style={styles.headerTitle}>Agent Dashboard</Text>
    <Text style={styles.headerSub}>Manage leads, properties & close deals</Text>
  </View>
);

// ─── AgentStatusBar ───────────────────────────────────
const AgentStatusBar = ({ agent, todayCount }) => (
  <View style={styles.statusBarContainer}>
    <View style={styles.avatarWrapper}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {agent?.name?.charAt(0)?.toUpperCase() || 'A'}
        </Text>
      </View>
      <View style={styles.onlineDot} />
    </View>
    <View style={styles.statusInfo}>
      <View style={styles.statusNameRow}>
        <Text style={styles.statusName}>{agent?.name || 'Agent Name'}</Text>
        {agent?.isVerified && (
          <View style={styles.verifiedBadge}>
            <CheckCircle2 size={12} color="#2D6A4F" strokeWidth={2} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <View style={styles.statusSubRow}>
        <Text style={styles.statusCompany}>{agent?.company || 'Skyline Builders'}</Text>
        <Text style={styles.statusDot}>•</Text>
        <View style={styles.statusAvailRow}>
          <View style={styles.statusAvailDot} />
          <Text style={styles.statusAvailText}>
            {agent?.isAvailable ? 'Available' : 'Busy'}
          </Text>
        </View>
      </View>
    </View>
    <View style={styles.statusRight}>
      <Text style={styles.statusCount}>{todayCount}</Text>
      <Text style={styles.statusCountLabel}>Today</Text>
    </View>
  </View>
);

// ─── AgentKPICard ─────────────────────────────────────
const AgentKPICard = ({ icon: Icon, label, value, trend, trendLabel, color }) => {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  return (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIconBox, { backgroundColor: color }]}>
        <Icon size={16} color="#FFFFFF" strokeWidth={2} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      {trend !== undefined && (
        <View style={styles.kpiTrendRow}>
          {isPositive && <TrendingUp size={12} color="#16A34A" strokeWidth={2} />}
          {isNegative && <TrendingDown size={12} color="#DC2626" strokeWidth={2} />}
          <Text style={[styles.kpiTrendText, isPositive ? styles.trendPos : isNegative ? styles.trendNeg : styles.trendNeutral]}>
            {Math.abs(trend)}% {trendLabel}
          </Text>
        </View>
      )}
    </View>
  );
};

// ─── AlertCard ────────────────────────────────────────
const severityMap = {
  info:    { bg: '#EFF6FF', border: '#BFDBFE', iconBg: '#DBEAFE', iconColor: '#2D6A4F' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', iconBg: '#FEF3C7', iconColor: '#D97706' },
  urgent:  { bg: '#FEF2F2', border: '#FECACA', iconBg: '#FEE2E2', iconColor: '#DC2626' },
};

const getAlertIcon = (type) => {
  switch(type) {
    case 'lead': return UserPlus;
    case 'followup': return PhoneCall;
    case 'builder': return MessageSquare;
    case 'visit': return Calendar;
    default: return UserPlus;
  }
};

const AlertCard = ({ alert, onMarkRead }) => {
  const s = severityMap[alert.severity || 'info'];
  const Icon = getAlertIcon(alert.type);
  
  const formatTime = (date) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMs = now - alertDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };
  
  return (
    <View style={[styles.alertCard, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={styles.alertTopRow}>
        <View style={[styles.alertIconBox, { backgroundColor: s.iconBg }]}>
          <Icon size={20} color={s.iconColor} strokeWidth={2} />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertMsg}>{alert.message}</Text>
          <Text style={styles.alertTime}>{formatTime(alert.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.alertBtns}>
        <TouchableOpacity style={styles.alertBtn}>
          <Phone size={12} color="#374151" strokeWidth={2} />
          <Text style={styles.alertBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.alertBtn}>
          <MessageCircle size={12} color="#374151" strokeWidth={2} />
          <Text style={styles.alertBtnText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.alertBtn, styles.alertBtnSmall]}
          onPress={() => onMarkRead(alert._id)}
        >
          <Eye size={12} color="#374151" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── AgentLeadCard ────────────────────────────────────
const statusColors = {
  New:         { bg: '#DBEAFE', text: '#2D6A4F' },
  Contacted:   { bg: '#F3E8FF', text: '#7C3AED' },
  Visit:       { bg: '#FFEDD5', text: '#C2410C' },
  Negotiation: { bg: '#FEF9C3', text: '#CA8A04' },
  Closed:      { bg: '#DCFCE7', text: '#16A34A' },
};

const priorityColors = {
  Hot:  { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  Warm: { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' },
  Cold: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
};

const AgentLeadCard = ({ lead, onUpdate }) => {
  const sc = statusColors[lead.status] || statusColors.New;
  const pc = priorityColors[lead.priority] || priorityColors.Cold;
  
  const formatTime = (date) => {
    const now = new Date();
    const leadDate = new Date(date);
    const diffMs = now - leadDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };
  
  return (
    <View style={styles.leadCard}>
      <View style={styles.leadTopRow}>
        <View style={styles.leadLeft}>
          <View style={styles.leadNameRow}>
            <Text style={styles.leadName}>{lead.clientName}</Text>
            {lead.priority === 'Hot' && <Flame size={16} color="#EF4444" strokeWidth={2} />}
          </View>
          <Text style={styles.leadContact}>{lead.contact}</Text>
          <View style={styles.leadTimeRow}>
            <Clock size={12} color="#6B7280" strokeWidth={2} />
            <Text style={styles.leadTime}>{formatTime(lead.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: pc.bg, borderColor: pc.border }]}>
          <Text style={[styles.priorityText, { color: pc.text }]}>{lead.priority}</Text>
        </View>
      </View>

      <View style={styles.leadMetaGrid}>
        <View style={styles.leadMetaItem}>
          <Text style={styles.leadMetaLabel}>Source</Text>
          <Text style={styles.leadMetaValue}>{lead.leadSource}</Text>
        </View>
        <View style={styles.leadMetaItem}>
          <Text style={styles.leadMetaLabel}>Interest</Text>
          <Text style={styles.leadMetaValue}>{lead.interestType}</Text>
        </View>
      </View>

      <View style={styles.leadPropertyBox}>
        <Text style={styles.leadPropertyLabel}>Property</Text>
        <Text style={styles.leadPropertyValue}>{lead.propertyName || 'Not assigned'}</Text>
      </View>

      <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
        <Text style={[styles.statusPillText, { color: sc.text }]}>{lead.status}</Text>
      </View>

      <View style={styles.leadBtns}>
        <TouchableOpacity style={styles.leadBtnPrimary}>
          <Phone size={12} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.leadBtnPrimaryText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.leadBtnOutline}>
          <MessageCircle size={12} color="#374151" strokeWidth={2} />
          <Text style={styles.leadBtnOutlineText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.leadBtnOutline}>
          <Calendar size={12} color="#374151" strokeWidth={2} />
          <Text style={styles.leadBtnOutlineText}>Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── PropertyCard ─────────────────────────────────────
const propStatusColors = {
  Available: { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
  Hold:      { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' },
  Sold:      { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' },
};

const PropertyCard = ({ property }) => {
  const ps = propStatusColors[property.status] || propStatusColors.Available;
  
  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(0)} Lakh`;
    return `₹${price}`;
  };
  
  return (
    <View style={styles.propCard}>
      <View style={styles.propTopRow}>
        <View style={styles.propLeft}>
          <Text style={styles.propTitle}>{property.title}</Text>
          <View style={styles.propBuilderRow}>
            <Building2 size={12} color="#6B7280" strokeWidth={2} />
            <Text style={styles.propBuilder}>{property.builder}</Text>
          </View>
        </View>
        <View style={[styles.propStatusBadge, { backgroundColor: ps.bg, borderColor: ps.border }]}>
          <Text style={[styles.propStatusText, { color: ps.text }]}>{property.status}</Text>
        </View>
      </View>
      <View style={styles.propPriceBox}>
        <Text style={styles.propPrice}>
          {property.priceFormatted || formatPrice(property.price)}
        </Text>
        <Text style={styles.propType}>{property.type}</Text>
      </View>
      <Text style={styles.propLocation}>{property.location}</Text>
      <View style={styles.propBtns}>
        <TouchableOpacity style={styles.propBtn}>
          <Share2 size={12} color="#374151" strokeWidth={2} />
          <Text style={styles.propBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.propBtn}>
          <Calendar size={12} color="#374151" strokeWidth={2} />
          <Text style={styles.propBtnText}>Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.propBtn}>
          <Edit size={12} color="#374151" strokeWidth={2} />
          <Text style={styles.propBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── SiteVisitCard ────────────────────────────────────
const visitStatusConfig = {
  scheduled: { borderColor: '#3B82F6' },
  completed: { borderColor: '#22C55E' },
  missed:    { borderColor: '#EF4444' },
};

const SiteVisitCard = ({ visit, onUpdate }) => {
  const cfg = visitStatusConfig[visit.status];
  
  const handleMarkDone = async () => {
    try {
      await visitService.updateVisit(visit._id, { status: 'completed' });
      onUpdate();
    } catch (error) {
      Alert.alert('Error', 'Failed to update visit');
    }
  };
  
  return (
    <View style={[styles.visitCard, { borderLeftColor: cfg.borderColor }]}>
      <View style={styles.visitTopRow}>
        <View style={styles.visitTimeRow}>
          <Clock size={16} color="#6B7280" strokeWidth={2} />
          <Text style={styles.visitTime}>{visit.time}</Text>
        </View>
        {visit.status === 'completed' && (
          <View style={styles.visitDoneRow}>
            <CheckCircle2 size={16} color="#16A34A" strokeWidth={2} />
            <Text style={styles.visitDoneText}>Done</Text>
          </View>
        )}
      </View>
      <View style={styles.visitInfoBlock}>
        <View style={styles.visitInfoRow}>
          <User size={14} color="#6B7280" strokeWidth={2} />
          <Text style={styles.visitClientName}>{visit.clientName}</Text>
        </View>
        <Text style={styles.visitProperty}>{visit.propertyName}</Text>
        <View style={styles.visitInfoRow}>
          <MapPin size={14} color="#6B7280" strokeWidth={2} />
          <Text style={styles.visitLocation}>{visit.location}</Text>
        </View>
      </View>
      {visit.status === 'scheduled' && (
        <View style={styles.visitBtns}>
          <TouchableOpacity style={styles.visitBtnOutline}>
            <Text style={styles.visitBtnOutlineText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.visitBtnPrimary}
            onPress={handleMarkDone}
          >
            <Text style={styles.visitBtnPrimaryText}>Mark Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── CommissionCard ───────────────────────────────────
const CommissionCard = ({ commission }) => {
  const formatCurrency = (amount) => {
    return `₹${(amount / 1000).toFixed(0)}K`;
  };
  
  const progress = commission?.monthlyTarget ? 
    Math.round((commission.totalEarned / commission.monthlyTarget) * 100) : 0;
  
  return (
    <View style={styles.commissionCard}>
      <View style={styles.commissionHeaderRow}>
        <View style={styles.commissionIconBox}>
          <DollarSign size={20} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={styles.commissionTitle}>Commission & Earnings</Text>
      </View>
      <Text style={styles.commissionSubLabel}>Total Earned (This Month)</Text>
      <Text style={styles.commissionAmount}>
        {formatCurrency(commission?.totalEarned || 0)}
      </Text>
      <View style={styles.commissionTrendRow}>
        <TrendingUp size={12} color="#86EFAC" strokeWidth={2} />
        <Text style={styles.commissionTrendText}>+18% vs last month</Text>
      </View>
      <View style={styles.commissionRow}>
        <View style={styles.commissionBox}>
          <View style={styles.commissionBoxLabelRow}>
            <Clock size={14} color="#86EFAC" strokeWidth={2} />
            <Text style={styles.commissionBoxLabel}>Pending</Text>
          </View>
          <Text style={styles.commissionBoxValue}>
            {formatCurrency(commission?.pending || 0)}
          </Text>
        </View>
        <View style={styles.commissionBox}>
          <View style={styles.commissionBoxLabelRow}>
            <CheckCircle2 size={14} color="#86EFAC" strokeWidth={2} />
            <Text style={styles.commissionBoxLabel}>Paid</Text>
          </View>
          <Text style={styles.commissionBoxValue}>
            {formatCurrency(commission?.paid || 0)}
          </Text>
        </View>
      </View>
      <View style={styles.commissionProgressSection}>
        <View style={styles.commissionProgressLabelRow}>
          <Text style={styles.commissionProgressLabel}>Monthly Target Progress</Text>
          <Text style={styles.commissionProgressPercent}>{progress}%</Text>
        </View>
        <View style={styles.commissionProgressBg}>
          <View style={[styles.commissionProgressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
};

// ─── Quick Actions ────────────────────────────────────
const quickActions = [
  { Icon: UserPlus,      label: 'Add Lead',         iconBg: '#DBEAFE', iconColor: '#2D6A4F' },
  { Icon: CalendarClock, label: 'Schedule Visit',   iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { Icon: Share2,        label: 'Share Property',   iconBg: '#F3E8FF', iconColor: '#9333EA' },
  { Icon: Upload,        label: 'Upload Docs',      iconBg: '#FFEDD5', iconColor: '#EA580C' },
  { Icon: MessageSquare, label: 'Builder Support',  iconBg: '#CFFAFE', iconColor: '#0891B2' },
  { Icon: BarChart3,     label: 'Analytics',        iconBg: '#E0E7FF', iconColor: '#4F46E5' },
  { Icon: FileText,      label: 'Report',           iconBg: '#FCE7F3', iconColor: '#DB2777' },
  { Icon: Home,          label: 'Properties',       iconBg: '#F1F5F9', iconColor: '#475569' },
];

// ─── Performance insight items ────────────────────────
const insightItems = [
  { label: 'Lead → Visit',        value: '42%', sub: '+5% growth',     bg: '#EFF6FF', border: '#BFDBFE', labelColor: '#2D6A4F', valueColor: '#1E3A5F', subColor: '#2D6A4F' },
  { label: 'Visit → Deal',        value: '28%', sub: '+12% growth',    bg: '#F0FDF4', border: '#BBF7D0', labelColor: '#16A34A', valueColor: '#14532D', subColor: '#16A34A' },
  { label: 'Avg Response Time',   value: '8 min', sub: 'Excellent',    bg: '#FAF5FF', border: '#E9D5FF', labelColor: '#9333EA', valueColor: '#3B0764', subColor: '#9333EA' },
  { label: 'Client Score',        value: '4.8/5', sub: 'Top 10%',      bg: '#FFF7ED', border: '#FED7AA', labelColor: '#EA580C', valueColor: '#7C2D12', subColor: '#EA580C' },
];

// ─── Main Screen ──────────────────────────────────────
const AgentDashboard = () => {
  const [activePeriod, setActivePeriod] = useState('Month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for data
  const [agent, setAgent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [commission, setCommission] = useState(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [
        agentRes,
        analyticsRes,
        trendsRes,
        leadsRes,
        propertiesRes,
        visitsRes,
        alertsRes,
        activitiesRes,
        commissionRes
      ] = await Promise.all([
        agentService.getProfile(),
        analyticsService.getDashboardAnalytics(),
        analyticsService.getTrends(),
        leadService.getLeads({ limit: 3 }),
        propertyService.getProperties({ limit: 2 }),
        visitService.getVisits({ limit: 3 }),
        alertService.getAlerts({ isRead: false, limit: 3 }),
        activityService.getActivities({ limit: 3 }),
        agentService.getCommission()
      ]);

      setAgent(agentRes.data);
      setAnalytics(analyticsRes.data);
      setTrends(trendsRes.data);
      setLeads(leadsRes.data);
      setProperties(propertiesRes.data);
      setVisits(visitsRes.data);
      setAlerts(alertsRes.data);
      setActivities(activitiesRes.data);
      setCommission(commissionRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleMarkAlertRead = async (alertId) => {
    try {
      await alertService.markAsRead(alertId);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark alert as read');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2D6A4F" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D6A4F" />

      <AgentHeader unreadAlerts={unreadAlerts} />
      <AgentStatusBar 
        agent={agent} 
        todayCount={analytics?.newLeadsToday || 0} 
      />

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* ── Live KPIs ── */}
        <View style={styles.sectionWhite}>
          <Text style={styles.sectionTitle}>Live Performance Metrics</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiScroll}>
            <AgentKPICard 
              icon={Users} 
              label="New Leads Today" 
              value={analytics?.newLeadsToday || 0}
              trend={trends?.newLeadsTrend || 0}
              trendLabel="vs yesterday" 
              color="#3B82F6" 
            />
            <AgentKPICard 
              icon={UserCheck} 
              label="Active Leads" 
              value={analytics?.activeLeads || 0}
              trend={trends?.activeLeadsTrend || 0}
              trendLabel="this week" 
              color="#A855F7" 
            />
            <AgentKPICard 
              icon={Clock} 
              label="Follow-ups Pending" 
              value={analytics?.followupsPending || 0}
              trend={trends?.followupsTrend || 0}
              trendLabel="overdue" 
              color="#F97316" 
            />
            <AgentKPICard 
              icon={Building2} 
              label="Properties Assigned" 
              value={analytics?.propertiesAssigned || 0}
              color="#06B6D4" 
            />
            <AgentKPICard 
              icon={Calendar} 
              label="Site Visits Today" 
              value={analytics?.siteVisitsToday || 0}
              color="#22C55E" 
            />
            <AgentKPICard 
              icon={TrendingUp} 
              label="Deals Closed" 
              value={analytics?.dealsClosed || 0}
              trend={trends?.dealsTrend || 0}
              trendLabel="this month" 
              color="#10B981" 
            />
            <AgentKPICard 
              icon={DollarSign} 
              label="Commission" 
              value={`₹${((commission?.totalEarned || 0) / 100000).toFixed(2)}L`}
              trend={trends?.commissionTrend || 0}
              trendLabel="growth" 
              color="#16A34A" 
            />
            <AgentKPICard 
              icon={Target} 
              label="Conversion Rate" 
              value={`${analytics?.conversionRate || 0}%`}
              trend={trends?.conversionTrend || 0}
              trendLabel="improvement" 
              color="#6366F1" 
            />
          </ScrollView>
        </View>

        {/* ── Priority Alerts ── */}
        <View style={styles.sectionPad}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Priority Alerts</Text>
            <Text style={styles.sectionMeta}>{unreadAlerts} pending</Text>
          </View>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <AlertCard 
                key={alert._id} 
                alert={alert} 
                onMarkRead={handleMarkAlertRead}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No alerts at the moment</Text>
          )}
        </View>

        {/* ── Active Leads ── */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Active Leads</Text>
            <Text style={styles.sectionLink}>View All ({analytics?.activeLeads || 0})</Text>
          </View>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <AgentLeadCard 
                key={lead._id} 
                lead={lead} 
                onUpdate={fetchData}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No active leads</Text>
          )}
        </View>

        {/* ── Assigned Properties ── */}
        <View style={styles.sectionPad}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Assigned Properties</Text>
            <Text style={styles.sectionLink}>View All ({analytics?.propertiesAssigned || 0})</Text>
          </View>
          {properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))
          ) : (
            <Text style={styles.emptyText}>No properties assigned</Text>
          )}
        </View>

        {/* ── Today's Site Visits ── */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Site Visits</Text>
            <Text style={styles.sectionMeta}>{analytics?.siteVisitsToday || 0} scheduled</Text>
          </View>
          {visits.length > 0 ? (
            visits.map((visit) => (
              <SiteVisitCard 
                key={visit._id} 
                visit={visit} 
                onUpdate={fetchData}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No visits scheduled</Text>
          )}
        </View>

        {/* ── Commission ── */}
        <View style={styles.sectionPad}>
          <CommissionCard commission={commission} />
        </View>

        {/* ── Performance Insights ── */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Performance Insights</Text>
            <View style={styles.periodRow}>
              {['Day', 'Week', 'Month'].map((p) => (
                <TouchableOpacity 
                  key={p} 
                  onPress={() => setActivePeriod(p)} 
                  style={[styles.periodBtn, activePeriod === p && styles.periodBtnActive]}
                >
                  <Text style={[styles.periodBtnText, activePeriod === p && styles.periodBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.insightGrid}>
            {insightItems.map((it) => (
              <View key={it.label} style={[styles.insightCard, { backgroundColor: it.bg, borderColor: it.border }]}>
                <Text style={[styles.insightLabel, { color: it.labelColor }]}>{it.label}</Text>
                <Text style={[styles.insightValue, { color: it.valueColor }]}>{it.value}</Text>
                <View style={styles.insightSubRow}>
                  <TrendingUp size={12} color={it.subColor} strokeWidth={2} />
                  <Text style={[styles.insightSub, { color: it.subColor }]}>{it.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {quickActions.map(({ Icon, label, iconBg, iconColor }) => (
              <TouchableOpacity key={label} style={styles.quickCard}>
                <View style={[styles.quickIconBox, { backgroundColor: iconBg }]}>
                  <Icon size={20} color={iconColor} strokeWidth={2} />
                </View>
                <Text style={styles.quickLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Activity ── */}
        <View style={styles.sectionWhite}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionLink}>View All</Text>
          </View>
          {activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = activity.icon === 'TrendingUp' ? TrendingUp : 
                          activity.icon === 'UserPlus' ? UserPlus : Calendar;
              return (
                <View key={activity._id} style={styles.activityRow}>
                  <View style={[styles.activityIconBox, { backgroundColor: activity.iconBg }]}>
                    <Icon size={16} color={activity.iconColor} strokeWidth={2} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDesc}>{activity.description}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>

        {/* Bottom spacer for CTA */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Sticky Bottom CTA ── */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaButton}>
          <PlusCircle size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.ctaText}>Add New Lead</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, paddingVertical: 20 },

  // ── Header ──
  headerBg: { backgroundColor: '#2D6A4F', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogoText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerIconBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, backgroundColor: '#EF4444', borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2D6A4F' },
  notifBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 2 },
  headerSub: { color: '#BFDBFE', fontSize: 12 },

  // ── Status Bar ──
  statusBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2D6A4F', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  onlineDot: { position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, backgroundColor: '#22C55E', borderRadius: 8, borderWidth: 2, borderColor: '#FFFFFF' },
  statusInfo: { flex: 1 },
  statusNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  statusName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  verifiedText: { fontSize: 11, color: '#2D6A4F', fontWeight: '600' },
  statusSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusCompany: { fontSize: 12, color: '#6B7280' },
  statusDot: { fontSize: 12, color: '#D1D5DB' },
  statusAvailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusAvailDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  statusAvailText: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  statusRight: { alignItems: 'flex-end' },
  statusCount: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statusCountLabel: { fontSize: 11, color: '#6B7280' },

  // ── Sections ──
  sectionWhite: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 16 },
  sectionPad: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionMeta: { fontSize: 12, color: '#6B7280' },
  sectionLink: { fontSize: 12, color: '#2D6A4F', fontWeight: '600' },

  // ── KPI ──
  kpiScroll: { flexDirection: 'row', gap: 12, paddingBottom: 4 },
  kpiCard: { width: 128, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  kpiIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 2 },
  kpiLabel: { fontSize: 11, color: '#6B7280', marginBottom: 6 },
  kpiTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  kpiTrendText: { fontSize: 11, fontWeight: '600' },
  trendPos: { color: '#16A34A' },
  trendNeg: { color: '#DC2626' },
  trendNeutral: { color: '#6B7280' },

  // ── Alert ──
  alertCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  alertTopRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  alertIconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  alertMsg: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  alertTime: { fontSize: 11, color: '#9CA3AF' },
  alertBtns: { flexDirection: 'row', gap: 8 },
  alertBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  alertBtnSmall: { flex: 0, paddingHorizontal: 8 },
  alertBtnText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  // ── Lead Card ──
  leadCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  leadTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  leadLeft: { flex: 1 },
  leadNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  leadName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  leadContact: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  leadTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leadTime: { fontSize: 11, color: '#6B7280' },
  priorityBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  priorityText: { fontSize: 11, fontWeight: '600' },
  leadMetaGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  leadMetaItem: { flex: 1 },
  leadMetaLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  leadMetaValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
  leadPropertyBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 8, marginBottom: 12 },
  leadPropertyLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  leadPropertyValue: { fontSize: 12, fontWeight: '600', color: '#111827' },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginBottom: 12 },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  leadBtns: { flexDirection: 'row', gap: 8 },
  leadBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 32, borderRadius: 6, backgroundColor: '#2D6A4F' },
  leadBtnPrimaryText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  leadBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  leadBtnOutlineText: { fontSize: 12, color: '#374151', fontWeight: '600' },

  // ── Property Card ──
  propCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  propTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  propLeft: { flex: 1, marginRight: 8 },
  propTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  propBuilderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  propBuilder: { fontSize: 12, color: '#6B7280' },
  propStatusBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  propStatusText: { fontSize: 11, fontWeight: '600' },
  propPriceBox: { backgroundColor: '#EFF6FF', borderRadius: 8, padding: 8, marginBottom: 8 },
  propPrice: { fontSize: 18, fontWeight: '700', color: '#1E3A5F' },
  propType: { fontSize: 12, color: '#2D6A4F' },
  propLocation: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  propBtns: { flexDirection: 'row', gap: 8 },
  propBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 32, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  propBtnText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  // ── Site Visit Card ──
  visitCard: { backgroundColor: '#FFFFFF', borderLeftWidth: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  visitTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  visitTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  visitTime: { fontSize: 14, fontWeight: '600', color: '#111827' },
  visitDoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  visitDoneText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  visitInfoBlock: { marginBottom: 12, gap: 4 },
  visitInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  visitClientName: { fontSize: 14, color: '#111827' },
  visitProperty: { fontSize: 12, fontWeight: '600', color: '#374151', paddingLeft: 20 },
  visitLocation: { fontSize: 12, color: '#6B7280' },
  visitBtns: { flexDirection: 'row', gap: 8 },
  visitBtnOutline: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  visitBtnOutlineText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  visitBtnPrimary: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 28, borderRadius: 6, backgroundColor: '#16A34A' },
  visitBtnPrimaryText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },

  // ── Commission ──
  commissionCard: { backgroundColor: '#16A34A', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  commissionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  commissionIconBox: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  commissionTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  commissionSubLabel: { fontSize: 12, color: '#86EFAC', marginBottom: 4 },
  commissionAmount: { fontSize: 30, fontWeight: '700', color: '#FFFFFF' },
  commissionTrendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, marginTop: 4 },
  commissionTrendText: { fontSize: 12, color: '#86EFAC' },
  commissionRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  commissionBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 10 },
  commissionBoxLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  commissionBoxLabel: { fontSize: 12, color: '#86EFAC' },
  commissionBoxValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  commissionProgressSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  commissionProgressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  commissionProgressLabel: { fontSize: 12, color: '#86EFAC' },
  commissionProgressPercent: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  commissionProgressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  commissionProgressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },

  // ── Performance Insights ──
  periodRow: { flexDirection: 'row', gap: 4 },
  periodBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  periodBtnActive: { backgroundColor: '#DBEAFE' },
  periodBtnText: { fontSize: 12, color: '#6B7280' },
  periodBtnTextActive: { color: '#2D6A4F', fontWeight: '600' },
  insightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  insightCard: { width: (width - 56) / 2, borderRadius: 12, borderWidth: 1, padding: 12 },
  insightLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  insightValue: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  insightSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  insightSub: { fontSize: 12 },

  // ── Quick Actions ──
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: { width: (width - 68) / 4, alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  quickIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, color: '#374151', fontWeight: '500', textAlign: 'center' },

  // ── Activity ──
  activityRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  activityIconBox: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, color: '#111827', fontWeight: '600', marginBottom: 2 },
  activityDesc: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  activityTime: { fontSize: 11, color: '#9CA3AF' },

  // ── CTA ──
  ctaContainer: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 5 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, backgroundColor: '#2D6A4F', borderRadius: 12, shadowColor: '#2D6A4F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default AgentDashboard;