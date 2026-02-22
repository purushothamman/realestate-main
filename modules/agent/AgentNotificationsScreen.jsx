/**
 * AgentNotificationsScreen.jsx
 *
 * Notification centre for Agents — receives messages/alerts from Builders.
 *
 * Features:
 *  • Categorised tabs: All / Property / Assignment / Messages / Alerts
 *  • Swipe-to-dismiss (delete) individual notifications
 *  • Mark single or all as read
 *  • Notification detail bottom sheet on tap
 *  • Unread count badge on each tab
 *  • Empty states per category
 *  • Pull-to-refresh simulation
 *  • Green + White theme (forest green #1B5E3B family)
 *
 * Focus-safe: no TextInput flickering risk; no parent-state-on-keystroke pattern.
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  PanResponder,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Building2,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  CheckCheck,
  Trash2,
  X,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Home,
  FileText,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  CircleCheck,
  Info,
  Zap,
} from 'lucide-react-native';

const { width: SW } = Dimensions.get('window');

/* ══════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════ */
const T = {
  // Forest greens
  g900: '#0A2E1A',
  g800: '#1B5E3B',
  g700: '#1E7444',
  g600: '#25904F',
  g500: '#2EAD5F',
  g400: '#52C47A',
  g300: '#86D9A4',
  g200: '#C0EDD1',
  g100: '#E4F7EC',
  g50:  '#F2FBF6',

  // Neutrals
  n900: '#0F1B14',
  n700: '#374151',
  n600: '#4B5563',
  n500: '#6B7280',
  n400: '#9CA3AF',
  n300: '#D1D5DB',
  n200: '#E5E7EB',
  n100: '#F3F4F6',
  white: '#FFFFFF',

  // Semantic
  blue:    '#3B82F6',
  blueBg:  '#EFF6FF',
  amber:   '#F59E0B',
  amberBg: '#FFFBEB',
  red:     '#EF4444',
  redBg:   '#FEF2F2',
  purple:  '#8B5CF6',
  purpleBg:'#F5F3FF',

  shadow: 'rgba(27,94,59,0.12)',
};

/* ══════════════════════════════════════════════
   NOTIFICATION TYPES CONFIG
══════════════════════════════════════════════ */
const N_TYPES = {
  property:   { icon: Building2,    color: T.g700,   bg: T.g100,    label: 'Property'   },
  assignment: { icon: UserCheck,    color: T.blue,   bg: T.blueBg,  label: 'Assignment' },
  message:    { icon: MessageSquare,color: T.purple,  bg: T.purpleBg,label: 'Message'    },
  alert:      { icon: AlertTriangle,color: T.amber,  bg: T.amberBg, label: 'Alert'      },
  system:     { icon: Zap,          color: T.n600,   bg: T.n100,    label: 'System'     },
};

/* ══════════════════════════════════════════════
   MOCK NOTIFICATIONS
══════════════════════════════════════════════ */
const INIT_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'assignment',
    title: 'New Property Assigned',
    body: 'Verdant Residences in Bandra West has been assigned to you. Please review the property details and contact the builder to begin marketing.',
    builder: 'Greenfield Constructions',
    builderAvatar: 'https://i.pravatar.cc/150?img=15',
    property: 'Verdant Residences',
    location: 'Bandra West, Mumbai',
    time: '2 min ago',
    timestamp: Date.now() - 2 * 60 * 1000,
    read: false,
    pinned: true,
    meta: { units: 24, type: 'Residential', commission: '2%' },
  },
  {
    id: 'n2',
    type: 'message',
    title: 'Message from Builder',
    body: 'Please schedule a site visit for the Skyline Commercial Hub this week. The builder wants to brief you on the project highlights before you start showing it to clients.',
    builder: 'Skyline Developers',
    builderAvatar: 'https://i.pravatar.cc/150?img=33',
    property: 'Skyline Commercial Hub',
    location: 'Powai, Mumbai',
    time: '18 min ago',
    timestamp: Date.now() - 18 * 60 * 1000,
    read: false,
    pinned: false,
    meta: {},
  },
  {
    id: 'n3',
    type: 'property',
    title: 'Property Details Updated',
    body: 'The pricing for Emerald Heights has been revised. Unit rates have been updated from ₹1.2 Cr to ₹1.35 Cr for 2BHK. Please update your client presentations accordingly.',
    builder: 'Emerald Group',
    builderAvatar: 'https://i.pravatar.cc/150?img=60',
    property: 'Emerald Heights',
    location: 'Andheri East, Mumbai',
    time: '1 hr ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: false,
    pinned: false,
    meta: { units: 36, type: 'Residential' },
  },
  {
    id: 'n4',
    type: 'alert',
    title: 'Booking Deadline Reminder',
    body: 'The pre-launch booking window for Harbor View Plaza closes in 3 days. Ensure all interested clients submit their EOI forms before the deadline to secure early-bird pricing.',
    builder: 'Harbor Realty',
    builderAvatar: 'https://i.pravatar.cc/150?img=44',
    property: 'Harbor View Plaza',
    location: 'Worli, Mumbai',
    time: '3 hr ago',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: true,
    pinned: false,
    meta: { deadline: '3 days', type: 'Mixed Use' },
  },
  {
    id: 'n5',
    type: 'assignment',
    title: 'Agent Rating Received',
    body: 'The builder has given you a 5-star rating for your recent work on Palm Springs Villa. Your professionalism and client handling were specifically praised.',
    builder: 'Palm Estates',
    builderAvatar: 'https://i.pravatar.cc/150?img=22',
    property: 'Palm Springs Villa',
    location: 'Juhu, Mumbai',
    time: 'Yesterday',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    pinned: false,
    meta: { rating: 5 },
  },
  {
    id: 'n6',
    type: 'message',
    title: 'Documents Required',
    body: 'Please submit your RERA certificate and updated ID proof to the builder portal by Friday. This is required to continue your listing for Greenwood Residences.',
    builder: 'Greenfield Constructions',
    builderAvatar: 'https://i.pravatar.cc/150?img=15',
    property: 'Greenwood Residences',
    location: 'Bandra West, Mumbai',
    time: 'Yesterday',
    timestamp: Date.now() - 26 * 60 * 60 * 1000,
    read: true,
    pinned: false,
    meta: {},
  },
  {
    id: 'n7',
    type: 'property',
    title: 'New Floor Plan Released',
    body: 'Updated floor plans for the 3BHK and 4BHK units at Skyline Commercial Hub are now available in your builder portal. Download and share with prospective buyers.',
    builder: 'Skyline Developers',
    builderAvatar: 'https://i.pravatar.cc/150?img=33',
    property: 'Skyline Commercial Hub',
    location: 'Powai, Mumbai',
    time: '2 days ago',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: true,
    pinned: false,
    meta: {},
  },
  {
    id: 'n8',
    type: 'alert',
    title: 'Commission Structure Change',
    body: 'The commission structure for Emerald Heights has been revised effective immediately. New rate is 2.5% on first 10 units sold. Please review the updated agreement in your portal.',
    builder: 'Emerald Group',
    builderAvatar: 'https://i.pravatar.cc/150?img=60',
    property: 'Emerald Heights',
    location: 'Andheri East, Mumbai',
    time: '3 days ago',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    read: true,
    pinned: false,
    meta: {},
  },
  {
    id: 'n9',
    type: 'system',
    title: 'Welcome to EstateHub Agent Portal',
    body: 'Your agent profile has been verified and activated. You can now receive property assignments from builders and start managing your listings. Complete your profile to unlock all features.',
    builder: 'EstateHub',
    builderAvatar: null,
    property: null,
    location: null,
    time: '5 days ago',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    read: true,
    pinned: false,
    meta: {},
  },
];

const TABS = [
  { key: 'all',        label: 'All',        types: null },
  { key: 'assignment', label: 'Assigned',   types: ['assignment'] },
  { key: 'property',   label: 'Property',   types: ['property'] },
  { key: 'message',    label: 'Messages',   types: ['message'] },
  { key: 'alert',      label: 'Alerts',     types: ['alert'] },
];

/* ══════════════════════════════════════════════
   SWIPEABLE NOTIFICATION CARD
══════════════════════════════════════════════ */
const SWIPE_THRESHOLD = SW * 0.35;

const SwipeableCard = React.memo(({ item, onPress, onMarkRead, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const cfg        = N_TYPES[item.type] || N_TYPES.system;
  const IconComp   = cfg.icon;

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,
    onPanResponderMove: (_, g) => {
      if (g.dx < 0) translateX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -SWIPE_THRESHOLD) {
        // Delete animation
        Animated.parallel([
          Animated.timing(translateX, { toValue: -SW, duration: 260, useNativeDriver: true }),
          Animated.timing(opacity,    { toValue: 0,   duration: 260, useNativeDriver: true }),
        ]).start(() => onDelete(item.id));
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      }
    },
  })).current;

  const deleteIconOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ opacity }}>
      {/* Delete reveal behind card */}
      <Animated.View style={[card.deleteReveal, { opacity: deleteIconOpacity }]}>
        <Trash2 color={T.white} size={22} strokeWidth={2} />
        <Text style={card.deleteTxt}>Delete</Text>
      </Animated.View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[card.wrap, !item.read && card.wrapUnread]}
          onPress={() => onPress(item)}
          onLongPress={() => onMarkRead(item.id)}
          activeOpacity={0.88}
          delayLongPress={400}
        >
          {/* Unread bar */}
          {!item.read && <View style={card.unreadBar} />}

          {/* Pinned badge */}
          {item.pinned && (
            <View style={card.pinnedBadge}>
              <Zap color={T.g700} size={10} fill={T.g700} />
              <Text style={card.pinnedTxt}>Priority</Text>
            </View>
          )}

          <View style={card.inner}>
            {/* Icon */}
            <View style={[card.iconBox, { backgroundColor: cfg.bg }]}>
              <IconComp color={cfg.color} size={20} strokeWidth={2} />
            </View>

            {/* Content */}
            <View style={card.content}>
              {/* Builder row */}
              <View style={card.builderRow}>
                {item.builderAvatar ? (
                  <Image source={{ uri: item.builderAvatar }} style={card.builderAvatar} />
                ) : (
                  <View style={[card.builderAvatar, { backgroundColor: T.g200, justifyContent:'center', alignItems:'center' }]}>
                    <Building2 color={T.g700} size={10} strokeWidth={2} />
                  </View>
                )}
                <Text style={card.builderName} numberOfLines={1}>{item.builder}</Text>
                <Text style={card.time}>{item.time}</Text>
              </View>

              {/* Title */}
              <Text style={[card.title, !item.read && card.titleUnread]} numberOfLines={1}>
                {item.title}
              </Text>

              {/* Body */}
              <Text style={card.body} numberOfLines={2}>{item.body}</Text>

              {/* Property chip */}
              {item.property && (
                <View style={card.propChip}>
                  <MapPin color={T.g600} size={11} strokeWidth={2} />
                  <Text style={card.propChipTxt} numberOfLines={1}>{item.property}</Text>
                </View>
              )}
            </View>

            {/* Chevron */}
            <ChevronRight color={T.n300} size={18} strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
});

/* ══════════════════════════════════════════════
   NOTIFICATION DETAIL SHEET
══════════════════════════════════════════════ */
const DetailSheet = ({ item, onClose, onDelete }) => {
  if (!item) return null;
  const cfg = N_TYPES[item.type] || N_TYPES.system;
  const IconComp = cfg.icon;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={ds.backdrop}>
        <View style={ds.sheet}>
          {/* Handle */}
          <View style={ds.handle} />

          {/* Header */}
          <View style={ds.header}>
            <View style={[ds.iconBox, { backgroundColor: cfg.bg }]}>
              <IconComp color={cfg.color} size={24} strokeWidth={2} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={ds.typeLbl}>{cfg.label}</Text>
              <Text style={ds.time}>{item.time}</Text>
            </View>
            <TouchableOpacity style={ds.closeBtn} onPress={onClose}>
              <X color={T.n500} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={ds.body} showsVerticalScrollIndicator={false}>
            {/* Builder info */}
            <View style={ds.builderCard}>
              {item.builderAvatar ? (
                <Image source={{ uri: item.builderAvatar }} style={ds.builderAvatar} />
              ) : (
                <View style={[ds.builderAvatar, { backgroundColor: T.g200, justifyContent:'center', alignItems:'center' }]}>
                  <Building2 color={T.g700} size={18} strokeWidth={2} />
                </View>
              )}
              <View>
                <Text style={ds.builderLabel}>From Builder</Text>
                <Text style={ds.builderName}>{item.builder}</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={ds.title}>{item.title}</Text>

            {/* Body */}
            <Text style={ds.bodyTxt}>{item.body}</Text>

            {/* Property info */}
            {item.property && (
              <View style={ds.propCard}>
                <View style={ds.propCardHeader}>
                  <Home color={T.g600} size={16} strokeWidth={2} />
                  <Text style={ds.propCardTitle}>Property Details</Text>
                </View>
                <View style={ds.propRow}>
                  <Building2 color={T.n500} size={13} strokeWidth={2} />
                  <Text style={ds.propVal}>{item.property}</Text>
                </View>
                {item.location && (
                  <View style={ds.propRow}>
                    <MapPin color={T.n500} size={13} strokeWidth={2} />
                    <Text style={ds.propVal}>{item.location}</Text>
                  </View>
                )}
                {item.meta?.units && (
                  <View style={ds.propRow}>
                    <Home color={T.n500} size={13} strokeWidth={2} />
                    <Text style={ds.propVal}>{item.meta.units} Units · {item.meta.type}</Text>
                  </View>
                )}
                {item.meta?.commission && (
                  <View style={ds.propRow}>
                    <TrendingUp color={T.n500} size={13} strokeWidth={2} />
                    <Text style={ds.propVal}>Commission: {item.meta.commission}</Text>
                  </View>
                )}
                {item.meta?.rating && (
                  <View style={ds.propRow}>
                    <Star color={T.amber} fill={T.amber} size={13} strokeWidth={0} />
                    <Text style={ds.propVal}>{item.meta.rating}-star rating from builder</Text>
                  </View>
                )}
                {item.meta?.deadline && (
                  <View style={ds.propRow}>
                    <Clock color={T.red} size={13} strokeWidth={2} />
                    <Text style={[ds.propVal, { color: T.red, fontWeight:'700' }]}>Deadline in {item.meta.deadline}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Action buttons */}
            <View style={ds.actions}>
              <TouchableOpacity style={ds.primaryAction} onPress={onClose} activeOpacity={0.85}>
                <CircleCheck color={T.white} size={17} strokeWidth={2.5} />
                <Text style={ds.primaryActionTxt}>Mark as Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={ds.deleteAction}
                onPress={() => { onDelete(item.id); onClose(); }}
                activeOpacity={0.85}
              >
                <Trash2 color={T.red} size={17} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* ══════════════════════════════════════════════
   MAIN SCREEN
══════════════════════════════════════════════ */
export default function AgentNotificationsScreen({ navigation, onBack }) {
  const [notifications, setNotifications] = useState(INIT_NOTIFICATIONS);
  const [activeTab,     setActiveTab]     = useState('all');
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [refreshing,    setRefreshing]    = useState(false);

  /* ── Derived ── */
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const tabData = useMemo(() => {
    const tab = TABS.find(t => t.key === activeTab);
    if (!tab) return notifications;
    if (!tab.types) return notifications;
    return notifications.filter(n => tab.types.includes(n.type));
  }, [notifications, activeTab]);

  const unreadPerTab = useMemo(() => {
    const counts = {};
    TABS.forEach(tab => {
      const list = tab.types
        ? notifications.filter(n => tab.types.includes(n.type))
        : notifications;
      counts[tab.key] = list.filter(n => !n.read).length;
    });
    return counts;
  }, [notifications]);

  /* ── Actions ── */
  const markRead = useCallback((id) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(p => p.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotif = useCallback((id) => {
    setNotifications(p => p.filter(n => n.id !== id));
  }, []);

  const openDetail = useCallback((item) => {
    setSelectedItem(item);
    markRead(item.id);
  }, [markRead]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    // Simulate a new notification arriving
    const newNotif = {
      id: `n${Date.now()}`,
      type: 'message',
      title: 'New Message from Builder',
      body: 'Your builder has sent you an update about the latest property listing. Please check your portal for details.',
      builder: 'Greenfield Constructions',
      builderAvatar: 'https://i.pravatar.cc/150?img=15',
      property: 'Verdant Residences',
      location: 'Bandra West, Mumbai',
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
      pinned: false,
      meta: {},
    };
    setNotifications(p => [newNotif, ...p]);
    setRefreshing(false);
  }, []);

  /* ── Render card ── */
  const renderItem = useCallback(({ item }) => (
    <SwipeableCard
      item={item}
      onPress={openDetail}
      onMarkRead={markRead}
      onDelete={deleteNotif}
    />
  ), [openDetail, markRead, deleteNotif]);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      {/* ─── HEADER ─── */}
      <View style={s.header}>
        {/* Top row */}
        <View style={s.headerTop}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation?.goBack?.() || onBack?.()}
            activeOpacity={0.7}
          >
            <ArrowLeft color={T.white} size={22} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={{ flex:1 }}>
            <Text style={s.headerTitle}>Notifications</Text>
            <Text style={s.headerSub}>
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity style={s.markAllBtn} onPress={markAllRead} activeOpacity={0.8}>
              <CheckCheck color={T.white} size={16} strokeWidth={2.5} />
              <Text style={s.markAllTxt}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Unread summary pill */}
        {unreadCount > 0 && (
          <View style={s.summaryPill}>
            <View style={s.summaryDot} />
            <Text style={s.summaryTxt}>
              You have <Text style={{ fontWeight:'800' }}>{unreadCount}</Text> unread{' '}
              notification{unreadCount > 1 ? 's' : ''} from your builders
            </Text>
          </View>
        )}
      </View>

      {/* ─── TABS ─── */}
      <View style={s.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabs}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const cnt = unreadPerTab[tab.key];
            return (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, isActive && s.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabTxt, isActive && s.tabTxtActive]}>{tab.label}</Text>
                {cnt > 0 && (
                  <View style={[s.tabBadge, isActive && s.tabBadgeActive]}>
                    <Text style={[s.tabBadgeTxt, isActive && s.tabBadgeTxtActive]}>{cnt}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── SWIPE HINT ─── */}
      {tabData.length > 0 && (
        <View style={s.hint}>
          <Info color={T.g500} size={12} strokeWidth={2} />
          <Text style={s.hintTxt}>Swipe left to delete · Long press to mark as read</Text>
        </View>
      )}

      {/* ─── LIST ─── */}
      <FlatList
        data={tabData}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.g600}
            colors={[T.g600, T.g400]}
          />
        }
        ItemSeparatorComponent={() => <View style={s.separator} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <BellOff color={T.g400} size={44} strokeWidth={1.5} />
            </View>
            <Text style={s.emptyTitle}>No notifications here</Text>
            <Text style={s.emptySub}>
              {activeTab === 'all'
                ? "You're all caught up! Builder notifications will appear here."
                : `No ${activeTab} notifications yet.`}
            </Text>
          </View>
        }
        ListFooterComponent={
          tabData.length > 0 ? (
            <View style={s.footer}>
              <View style={s.footerLine} />
              <Text style={s.footerTxt}>{tabData.length} notification{tabData.length !== 1 ? 's' : ''}</Text>
              <View style={s.footerLine} />
            </View>
          ) : null
        }
      />

      {/* ─── DETAIL SHEET ─── */}
      <DetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={deleteNotif}
      />
    </View>
  );
}

/* ══════════════════════════════════════════════
   CARD STYLES
══════════════════════════════════════════════ */
const card = StyleSheet.create({
  wrap: {
    backgroundColor: T.white,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  wrapUnread: {
    borderLeftWidth: 0,
    elevation: 4,
    shadowOpacity: 1.5,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: T.g600,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 2,
  },
  pinnedBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: T.g100,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 3,
  },
  pinnedTxt: { fontSize: 10, fontWeight: '800', color: T.g700 },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingLeft: 18,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  content: { flex: 1 },
  builderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  builderAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: T.n200,
  },
  builderName: {
    fontSize: 11,
    fontWeight: '600',
    color: T.n500,
    flex: 1,
  },
  time: { fontSize: 11, color: T.n400 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: T.n700,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  titleUnread: {
    fontWeight: '800',
    color: T.n900,
  },
  body: {
    fontSize: 13,
    color: T.n500,
    lineHeight: 18,
    marginBottom: 8,
  },
  propChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: T.g50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: T.g200,
  },
  propChipTxt: { fontSize: 11, fontWeight: '600', color: T.g700 },
  // Delete reveal
  deleteReveal: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: T.red,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteTxt: { color: T.white, fontSize: 11, fontWeight: '700' },
});

/* ══════════════════════════════════════════════
   DETAIL SHEET STYLES
══════════════════════════════════════════════ */
const ds = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.46)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: T.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: T.n300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.n200,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLbl: { fontSize: 12, fontWeight: '700', color: T.n500, letterSpacing: 0.4, textTransform: 'uppercase' },
  time:    { fontSize: 13, color: T.n500, marginTop: 2 },
  closeBtn:{ width: 36, height: 36, borderRadius: 10, backgroundColor: T.n100, justifyContent: 'center', alignItems: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  builderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.g50,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.g200,
  },
  builderAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: T.g300 },
  builderLabel:  { fontSize: 11, color: T.n500, fontWeight: '600', marginBottom: 2 },
  builderName:   { fontSize: 15, fontWeight: '800', color: T.n900 },
  title:   { fontSize: 20, fontWeight: '800', color: T.n900, letterSpacing: -0.4, marginBottom: 10, lineHeight: 26 },
  bodyTxt: { fontSize: 14, color: T.n600, lineHeight: 22, marginBottom: 20 },
  propCard: {
    backgroundColor: T.g50,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: T.g200,
    gap: 10,
  },
  propCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  propCardTitle:  { fontSize: 13, fontWeight: '800', color: T.g800 },
  propRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  propVal:  { fontSize: 13, color: T.n700, fontWeight: '500', flex: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: T.g800,
    borderRadius: 14,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  primaryActionTxt: { color: T.white, fontSize: 15, fontWeight: '700' },
  deleteAction: {
    width: 52,
    backgroundColor: T.redBg,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
});

/* ══════════════════════════════════════════════
   SCREEN-LEVEL STYLES
══════════════════════════════════════════════ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.g50 },

  // Header
  header: {
    backgroundColor: T.g800,
    paddingTop: Platform.OS === 'ios' ? 58 : 28,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: T.white, letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  markAllTxt: { color: T.white, fontSize: 12, fontWeight: '700' },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.g400,
  },
  summaryTxt: { fontSize: 12, color: 'rgba(255,255,255,0.85)', flex: 1, lineHeight: 17 },

  // Tabs
  tabsWrapper: {
    backgroundColor: T.white,
    borderBottomWidth: 1,
    borderBottomColor: T.n200,
    elevation: 2,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  tabs:       { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22, backgroundColor: T.n100, borderWidth: 1.5, borderColor: T.n200 },
  tabActive:  { backgroundColor: T.g800, borderColor: T.g800 },
  tabTxt:     { fontSize: 13, fontWeight: '700', color: T.n500 },
  tabTxtActive:{ color: T.white },
  tabBadge:   { backgroundColor: T.g200, borderRadius: 9, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeActive:{ backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeTxt:{ fontSize: 11, fontWeight: '800', color: T.g700 },
  tabBadgeTxtActive:{ color: T.white },

  // Hint
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  hintTxt: { fontSize: 11, color: T.g500, fontStyle: 'italic' },

  // List
  list:      { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 30 },
  separator: { height: 10 },

  // Empty
  empty:       { alignItems: 'center', paddingTop: 70, paddingHorizontal: 32, gap: 12 },
  emptyIconBox:{ width: 90, height: 90, borderRadius: 45, backgroundColor: T.g100, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: T.n900, letterSpacing: -0.3 },
  emptySub:    { fontSize: 14, color: T.n500, textAlign: 'center', lineHeight: 20 },

  // Footer
  footer:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20, paddingHorizontal: 20 },
  footerLine: { flex: 1, height: 1, backgroundColor: T.n200 },
  footerTxt:  { fontSize: 12, color: T.n400, fontWeight: '600' },
});
