/**
 * AgentNotificationsScreen.jsx
 *
 * Agent-facing notification centre. Shows notifications from:
 *  • Builders  → hire requests, property assignments
 *  • Users     → property inquiries, messages
 *
 * Two views rendered inside a single file:
 *  1. NotificationList   – filterable list with unread highlighting
 *  2. NotificationDetail – full detail card with contextual actions
 *
 * Theme: Forest green #1B5E3B + white — consistent with the rest of the app
 * Focus-safe: every reply TextInput uses the onBlur-commit pattern.
 * Fix: Removed black border on search focus, improved filter chip design.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getImageUrl } from '../../utils/api';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  FlatList, ScrollView, Image, Modal, Alert,
  ActivityIndicator, Platform, StatusBar, Dimensions,
} from 'react-native';
import {
  ArrowLeft, Bell, BellOff, Search, X, CheckCheck,
  ChevronRight, Building2, MapPin, Phone, Mail, Clock,
  Home, MessageSquare, Briefcase, Send, AlertCircle,
  CheckCircle2, XCircle, Eye, MoreVertical, CalendarDays,
  BadgeCheck, TrendingUp, Filter,
} from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  g900: '#0D3320', g800: '#1B5E3B', g700: '#1E7444', g600: '#25904F',
  g500: '#2EAD5F', g400: '#5BC282', g200: '#C6E8D4', g100: '#E8F5ED', g50: '#F4FAF7',
  n900: '#111827', n800: '#1F2937', n700: '#374151', n600: '#4B5563',
  n500: '#6B7280', n400: '#9CA3AF', n300: '#D1D5DB', n200: '#E5E7EB',
  n100: '#F3F4F6', white: '#FFFFFF',
  amber: '#F59E0B', amberBg: '#FFFBEB', amberBdr: '#FCD34D',
  red: '#EF4444', redBg: '#FEF2F2', redBdr: '#FECACA',
  blue: '#3B82F6', blueBg: '#EFF6FF', blueBdr: '#BFDBFE',
  purple: '#8B5CF6', purpleBg: '#F5F3FF', purpleBdr: '#DDD6FE',
  shadow: 'rgba(27,94,59,0.12)',
};

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const NOTIFS_SEED = [
  {
    id: 'n1', type: 'hire_request', read: false,
    createdAt: '2025-02-23T09:15:00Z', status: 'pending',
    sender: { name: 'Ravi Constructions Pvt. Ltd.', role: 'Builder', avatar: 'https://i.pravatar.cc/150?img=57', email: 'ravi@raviconstructions.com', phone: '9876543210' },
    summary: 'Wants to hire you as their exclusive agent',
    message: 'We at Ravi Constructions are looking for an experienced residential agent to manage our upcoming project "Greenfield Villas" in Bandra West. Based on your profile and 7 years of experience, we believe you would be an excellent fit. We offer a competitive commission structure and a long-term partnership opportunity.',
    property: { name: 'Greenfield Villas', location: 'Bandra West, Mumbai', type: 'Residential', units: 32, image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80' },
    offer: { commission: '2.5%', duration: '12 months', startDate: 'March 2025' },
  },
  {
    id: 'n2', type: 'property_assignment', read: false,
    createdAt: '2025-02-23T07:40:00Z', status: 'accepted',
    sender: { name: 'Skyline Developers', role: 'Builder', avatar: 'https://i.pravatar.cc/150?img=14', email: 'info@skylinedev.com', phone: '9823001122' },
    summary: 'You have been assigned to Skyline Commercial Hub',
    message: 'You have been officially assigned as the lead agent for Skyline Commercial Hub, Powai. Your responsibilities include handling inquiries, scheduling site visits, and managing the closing process. Please coordinate with our sales team to get started immediately.',
    property: { name: 'Skyline Commercial Hub', location: 'Powai, Mumbai', type: 'Commercial', units: 8, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80' },
    offer: null,
  },
  {
    id: 'n3', type: 'user_inquiry', read: true,
    createdAt: '2025-02-22T16:30:00Z', status: 'pending',
    sender: { name: 'Ananya Krishnan', role: 'Buyer', avatar: 'https://i.pravatar.cc/150?img=47', email: 'ananya.k@gmail.com', phone: '9765001234' },
    summary: 'Inquiry about 2 BHK unit availability and pricing',
    message: 'Hi, I am interested in a 2 BHK unit at Emerald Heights. Could you please share the current pricing, floor availability, and payment plan options? We are a family of 3 and would prefer a unit above the 8th floor with a city view. Please let me know the earliest slot for a site visit this week.',
    property: { name: 'Emerald Heights', location: 'Andheri East, Mumbai', type: 'Residential', units: 36, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' },
    offer: null,
  },
  {
    id: 'n4', type: 'hire_request', read: true,
    createdAt: '2025-02-22T11:00:00Z', status: 'rejected',
    sender: { name: 'HarborLand Realty', role: 'Builder', avatar: 'https://i.pravatar.cc/150?img=30', email: 'hr@harborland.in', phone: '9812009988' },
    summary: 'Hire request for Harbor View Plaza project',
    message: 'We would like to onboard you as our agent for Harbor View Plaza in Worli. This is a premium mixed-use project with 12 units. Your expertise in mixed-use properties makes you an ideal candidate. We are offering an attractive commission and flexible timelines.',
    property: { name: 'Harbor View Plaza', location: 'Worli, Mumbai', type: 'Mixed Use', units: 12, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80' },
    offer: { commission: '2%', duration: '6 months', startDate: 'April 2025' },
  },
  {
    id: 'n5', type: 'user_inquiry', read: false,
    createdAt: '2025-02-21T14:20:00Z', status: 'pending',
    sender: { name: 'Rohan Mehta', role: 'Buyer', avatar: 'https://i.pravatar.cc/150?img=68', email: 'rohan.mehta@outlook.com', phone: '9654123456' },
    summary: 'Request for site visit at Palm Springs Villa this weekend',
    message: 'Hello, I came across Palm Springs Villa on your listing and am very interested in the 3 BHK villa unit. Can we schedule a site visit this Saturday or Sunday? I would also like to know if the price is negotiable for early booking. Please call or message me at your earliest convenience.',
    property: { name: 'Palm Springs Villa', location: 'Juhu, Mumbai', type: 'Residential', units: 6, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
    offer: null,
  },
  {
    id: 'n6', type: 'property_assignment', read: true,
    createdAt: '2025-02-20T09:00:00Z', status: 'accepted',
    sender: { name: 'Palm Developers Ltd.', role: 'Builder', avatar: 'https://i.pravatar.cc/150?img=22', email: 'ops@palmdev.com', phone: '9988776655' },
    summary: 'Assigned to Palm Springs Villa as lead agent',
    message: 'Congratulations! You have been selected as the lead agent for Palm Springs Villa, Juhu. This is an exclusive luxury project and we look forward to a successful partnership. Please check in with our sales coordinator Meera at meera@palmdev.com to get started.',
    property: { name: 'Palm Springs Villa', location: 'Juhu, Mumbai', type: 'Residential', units: 6, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
    offer: null,
  },
];

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const TYPE_META = {
  hire_request: { label: 'Hire Request', icon: Briefcase, color: T.purple, bg: T.purpleBg, border: T.purpleBdr },
  property_assignment: { label: 'Assignment', icon: Building2, color: T.g700, bg: T.g100, border: T.g200 },
  user_inquiry: { label: 'Inquiry', icon: MessageSquare, color: T.blue, bg: T.blueBg, border: T.blueBdr },
  hire_response: { label: 'Hire Response', icon: Briefcase, color: T.purple, bg: T.purpleBg, border: T.purpleBdr },
  property_submission: { label: 'Submission', icon: Building2, color: T.g700, bg: T.g100, border: T.g200 },
  property_approved: { label: 'Approved', icon: CheckCircle2, color: T.g700, bg: T.g100, border: T.g200 },
  _default: { label: 'Notification', icon: MessageSquare, color: T.n500, bg: T.n100, border: T.n200 },
};

const STATUS_META = {
  pending: { label: 'Pending', color: T.amber, bg: T.amberBg, icon: Clock },
  accepted: { label: 'Accepted', color: T.g700, bg: T.g100, icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: T.red, bg: T.redBg, icon: XCircle },
  approved: { label: 'Approved', color: T.g700, bg: T.g100, icon: CheckCircle2 },
};

const FILTERS = [
  { key: 'All', label: 'All' },
  { key: 'Unread', label: 'Unread' },
  { key: 'Hire Requests', label: 'Hire Requests' },
  { key: 'Assignments', label: 'Assignments' },
  { key: 'Inquiries', label: 'Inquiries' },
];

/* ═══════════════════════════════════════════════════════════
   DATE HELPERS
═══════════════════════════════════════════════════════════ */
const fmtRelative = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const fmtFull = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    + ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

/* ═══════════════════════════════════════════════════════════
   SHARED MINI-COMPONENTS
═══════════════════════════════════════════════════════════ */
const StatusPill = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  const I = m.icon;
  return (
    <View style={[chip.statusWrap, { backgroundColor: m.bg }]}>
      <I color={m.color} size={11} strokeWidth={2.5} />
      <Text style={[chip.statusTxt, { color: m.color }]}>{m.label}</Text>
    </View>
  );
};

const TypeBadge = ({ type }) => {
  const m = TYPE_META[type] || TYPE_META._default;
  const I = m.icon;
  return (
    <View style={[chip.typeWrap, { backgroundColor: m.bg, borderColor: m.border }]}>
      <I color={m.color} size={10} strokeWidth={2.5} />
      <Text style={[chip.typeTxt, { color: m.color }]}>{m.label}</Text>
    </View>
  );
};

const chip = StyleSheet.create({
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  statusTxt: { fontSize: 11, fontWeight: '700' },
  typeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  typeTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
});

/* ═══════════════════════════════════════════════════════════
   FOCUS-SAFE REPLY INPUT
═══════════════════════════════════════════════════════════ */
const ReplyInput = React.memo(({ onSend }) => {
  const [val, setVal] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSend = async () => {
    if (!val.trim()) { Alert.alert('Empty Reply', 'Please type a message before sending.'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    onSend?.(val.trim());
    setVal('');
  };

  return (
    <View style={ri.outer}>
      <View style={[ri.wrap, focused && ri.wrapFocused]}>
        <TextInput
          style={ri.input}
          placeholder="Type your reply to the user…"
          placeholderTextColor={T.n400}
          value={val}
          onChangeText={setVal}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          blurOnSubmit={false}
          underlineColorAndroid="transparent"
        />
      </View>
      <TouchableOpacity
        style={[ri.sendBtn, sending && ri.sendDisabled]}
        onPress={handleSend}
        disabled={sending}
        activeOpacity={0.85}
      >
        {sending
          ? <ActivityIndicator color={T.white} size="small" />
          : <><Send color={T.white} size={17} strokeWidth={2.5} /><Text style={ri.sendTxt}>Send Reply</Text></>
        }
      </TouchableOpacity>
    </View>
  );
}, () => true);

const ri = StyleSheet.create({
  outer: { gap: 12 },
  wrap: {
    backgroundColor: T.g50,
    borderWidth: 1.5,
    borderColor: T.n200,
    borderRadius: 14,
    padding: 14,
    minHeight: 90,
  },
  wrapFocused: {
    borderColor: T.g600,
    backgroundColor: T.white,
  },
  input: {
    fontSize: 14,
    color: T.n900,
    minHeight: 65,
    // Remove default outline/highlight on all platforms
    outlineWidth: 0,
  },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.g800, borderRadius: 14, paddingVertical: 14, elevation: 3, shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6 },
  sendDisabled: { opacity: 0.55 },
  sendTxt: { color: T.white, fontSize: 15, fontWeight: '700' },
});

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION LIST
═══════════════════════════════════════════════════════════ */
function NotificationList({ notifs, onOpen, onMarkAllRead, onBack }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);

  const filtered = useMemo(() => {
    let list = notifs;
    if (filter === 'Unread') list = list.filter(n => !n.read);
    else if (filter === 'Hire Requests') list = list.filter(n => n.type === 'hire_request');
    else if (filter === 'Assignments') list = list.filter(n => n.type === 'property_assignment');
    else if (filter === 'Inquiries') list = list.filter(n => n.type === 'user_inquiry');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.sender.name.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        (n.property?.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [notifs, filter, search]);

  const renderItem = ({ item }) => {
    const meta = TYPE_META[item.type] || TYPE_META._default;
    const TIcon = meta.icon;
    return (
      <TouchableOpacity
        style={[nl.card, !item.read && nl.cardUnread]}
        onPress={() => onOpen(item)}
        activeOpacity={0.85}
      >
        {!item.read && <View style={nl.stripe} />}
        <View style={nl.inner}>
          {/* Avatar + type icon */}
          <View style={nl.avatarWrap}>
            <Image source={{ uri: item.sender.avatar }} style={nl.avatar} />
            <View style={[nl.typeIcon, { backgroundColor: meta.bg, borderColor: meta.border }]}>
              <TIcon color={meta.color} size={11} strokeWidth={2.5} />
            </View>
          </View>
          {/* Content */}
          <View style={nl.body}>
            <View style={nl.topRow}>
              <Text style={nl.senderName} numberOfLines={1}>{item.sender.name}</Text>
              <Text style={nl.time}>{fmtRelative(item.createdAt)}</Text>
            </View>
            <View style={nl.badgeRow}>
              <TypeBadge type={item.type} />
              <Text style={nl.roleLabel}>{item.sender.role}</Text>
            </View>
            <Text style={[nl.summary, !item.read && nl.summaryBold]} numberOfLines={2}>
              {item.summary}
            </Text>
            {item.property && (
              <View style={nl.propHint}>
                <Home color={T.g600} size={11} strokeWidth={2} />
                <Text style={nl.propHintTxt} numberOfLines={1}>{item.property.name}</Text>
              </View>
            )}
            <View style={nl.bottomRow}>
              <StatusPill status={item.status} />
              {!item.read && <View style={nl.dot} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={ss.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      {/* Header */}
      <View style={ss.header}>
        <TouchableOpacity style={ss.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft color={T.white} size={22} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={ss.headerTitle}>Notifications</Text>
          <Text style={ss.headerSub}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</Text>
        </View>
        <TouchableOpacity style={ss.iconBtn} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
          <MoreVertical color={T.white} size={22} strokeWidth={2} />
        </TouchableOpacity>
        {unreadCount > 0 && (
          <View style={ss.headerBadge}>
            <Text style={ss.headerBadgeTxt}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Search + Filters grouped together */}
      <View style={ss.searchFilterBlock}>
        {/* Search */}
        <View style={[ss.searchBox, searchFocused && ss.searchBoxFocused]}>
          <Search color={searchFocused ? T.g600 : T.n400} size={16} strokeWidth={2} />
          <TextInput
            style={ss.searchInput}
            placeholder="Search notifications…"
            placeholderTextColor={T.n400}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            underlineColorAndroid="transparent"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={ss.searchClear}
              activeOpacity={0.7}
            >
              <X color={T.n400} size={14} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips — directly below search */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={ss.chipsContainer}
        >
          {FILTERS.map(f => {
            const isActive = filter === f.key;
            const isUnread = f.key === 'Unread';
            return (
              <TouchableOpacity
                key={f.key}
                style={[ss.chip, isActive && ss.chipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[ss.chipTxt, isActive && ss.chipTxtActive]}>{f.label}</Text>
                {isUnread && unreadCount > 0 && (
                  <View style={[ss.chipCountBadge, isActive && ss.chipCountBadgeActive]}>
                    <Text style={[ss.chipCountTxt, isActive && ss.chipCountTxtActive]}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={nl.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={ss.empty}>
            <BellOff color={T.n300} size={56} strokeWidth={1.5} />
            <Text style={ss.emptyTitle}>No notifications</Text>
            <Text style={ss.emptySubtitle}>
              {search ? 'No results match your search' : "You're all caught up!"}
            </Text>
          </View>
        }
      />

      {/* Options menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={mn.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={mn.menu}>
            <TouchableOpacity style={mn.item} activeOpacity={0.8}
              onPress={() => { onMarkAllRead(); setMenuOpen(false); }}>
              <CheckCheck color={T.g700} size={18} strokeWidth={2} />
              <Text style={mn.itemTxt}>Mark all as read</Text>
            </TouchableOpacity>
            <View style={mn.div} />
            <TouchableOpacity style={mn.item} activeOpacity={0.8} onPress={() => setMenuOpen(false)}>
              <Filter color={T.n600} size={18} strokeWidth={2} />
              <Text style={mn.itemTxt}>Notification settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const nl = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 36 },
  card: {
    backgroundColor: T.white,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  cardUnread: { backgroundColor: '#FAFFFD', elevation: 4 },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: T.g600 },
  inner: { flexDirection: 'row', padding: 16, gap: 13 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: T.n200 },
  typeIcon: {
    position: 'absolute', bottom: -3, right: -4,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: T.white,
  },
  body: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  senderName: { fontSize: 14, fontWeight: '800', color: T.n900, flex: 1, letterSpacing: -0.2 },
  time: { fontSize: 11, color: T.n400, marginLeft: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  roleLabel: { fontSize: 11, color: T.n500, fontWeight: '500' },
  summary: { fontSize: 13, color: T.n600, lineHeight: 18, marginBottom: 8 },
  summaryBold: { color: T.n800, fontWeight: '600' },
  propHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  propHintTxt: { fontSize: 11, color: T.g700, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.g600 },
});

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION DETAIL
═══════════════════════════════════════════════════════════ */
function NotificationDetail({ notif, onBack, onAction }) {
  const [localStatus, setLocalStatus] = useState(notif.status);
  const [actioning, setActioning] = useState(null);  // 'accept' | 'reject'

  const meta = TYPE_META[notif.type] || TYPE_META._default;
  const TIcon = meta.icon;
  const smeta = STATUS_META[localStatus] || STATUS_META.pending;
  const SIcon = smeta.icon;

  const handleRespond = async (action) => {
    if (localStatus !== 'pending') return;
    setActioning(action);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const requestId = notif.relatedEntityId;
      if (requestId && token) {
        const endpoint = action === 'accept'
          ? `${API_BASE_URL}/agent/hire-requests/${requestId}/accept`
          : `${API_BASE_URL}/agent/hire-requests/${requestId}/reject`;
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message || 'Request failed');
      }
      const next = action === 'accept' ? 'accepted' : 'rejected';
      setLocalStatus(next);
      onAction(notif.id, next);
      Alert.alert(
        action === 'accept' ? '✓ Accepted' : 'Declined',
        action === 'accept'
          ? `You accepted the request from ${notif.sender.name}.`
          : `You declined the request from ${notif.sender.name}.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('handleRespond error:', err);
      Alert.alert('Error', err.message || 'Failed to process request');
    } finally {
      setActioning(null);
    }
  };

  const handleReply = useCallback((text) => {
    Alert.alert('Reply Sent', `Your message has been sent to ${notif.sender.name}.`);
  }, [notif.sender.name]);

  return (
    <View style={ss.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      {/* Header */}
      <View style={ss.header}>
        <TouchableOpacity style={ss.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft color={T.white} size={22} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={ss.headerTitle}>Notification Detail</Text>
          <Text style={ss.headerSub}>{meta.label}</Text>
        </View>
        <View style={[dv.hStatus, { backgroundColor: smeta.bg }]}>
          <SIcon color={smeta.color} size={13} strokeWidth={2.5} />
          <Text style={[dv.hStatusTxt, { color: smeta.color }]}>{smeta.label}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={dv.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Sender ── */}
        <Text style={dv.secLabel}>FROM</Text>
        <View style={dv.senderCard}>
          {notif.sender.avatar && notif.sender.avatar.startsWith('http') ? (
            <Image source={{ uri: notif.sender.avatar }} style={dv.senderAvatar} />
          ) : (
            <View style={[dv.senderAvatar, { backgroundColor: T.g600, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: T.white, fontSize: 24, fontWeight: '800' }}>
                {(notif.sender.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={dv.senderName}>{notif.sender.name}</Text>
            <View style={[dv.roleChip, { backgroundColor: meta.bg, borderColor: meta.border }]}>
              <TIcon color={meta.color} size={11} strokeWidth={2.5} />
              <Text style={[dv.roleChipTxt, { color: meta.color }]}>{notif.sender.role}</Text>
            </View>
            {notif.builder?.company_name && (
              <View style={[dv.contactLine, { marginBottom: 8 }]}>
                <Building2 color={T.g700} size={14} strokeWidth={2} />
                <Text style={[dv.contactTxt, { fontWeight: '700', color: T.g800 }]}>{notif.builder.company_name}</Text>
              </View>
            )}
            <View style={dv.contactLine}>
              <Phone color={T.n500} size={13} strokeWidth={2} />
              <Text style={dv.contactTxt}>{notif.sender.phone}</Text>
            </View>
            <View style={dv.contactLine}>
              <Mail color={T.n500} size={13} strokeWidth={2} />
              <Text style={dv.contactTxt}>{notif.sender.email}</Text>
            </View>
          </View>
        </View>

        {/* ── Builder Activity/Company Info ── */}
        {notif.builder && (
          <>
            <Text style={dv.secLabel}>BUILDER PROFILE & ACTIVITY</Text>
            <View style={[dv.msgCard, { borderLeftColor: T.purple, marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <View style={{ backgroundColor: T.purpleBg, padding: 8, borderRadius: 10 }}>
                  <TrendingUp color={T.purple} size={18} strokeWidth={2} />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: T.n500, fontWeight: '600' }}>Engagement Level</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: T.n900 }}>{notif.builder.total_properties} Properties Uploaded</Text>
                </View>
              </View>

              {notif.builder.company_city && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <MapPin color={T.n500} size={14} strokeWidth={2} />
                  <Text style={{ fontSize: 13, color: T.n600, fontWeight: '600' }}>Based in {notif.builder.company_city}</Text>
                </View>
              )}

              {notif.builder.company_description && (
                <Text style={{ fontSize: 13, color: T.n500, fontStyle: 'italic', lineHeight: 18 }}>
                  "{notif.builder.company_description}"
                </Text>
              )}
            </View>
          </>
        )}

        {/* ── Timestamp + Status ── */}
        <View style={dv.metaBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <CalendarDays color={T.n500} size={14} strokeWidth={2} />
            <Text style={dv.metaBarTxt}>{fmtFull(notif.createdAt)}</Text>
          </View>
          <StatusPill status={localStatus} />
        </View>

        {/* ── Message ── */}
        <Text style={dv.secLabel}>MESSAGE</Text>
        <View style={dv.msgCard}>
          <Text style={dv.msgTxt}>{notif.message}</Text>
        </View>

        {/* ── Property ── */}
        {notif.property && (
          <>
            <Text style={[dv.secLabel, { marginTop: 20 }]}>RELATED PROPERTY</Text>
            <View style={dv.propCard}>
              <Image source={{ uri: getImageUrl(notif.property.image) }} style={dv.propImg} resizeMode="cover" />
              <View style={dv.propImgOverlay} />
              <View style={dv.propTypeBadge}>
                <Text style={dv.propTypeTxt}>{notif.property.type}</Text>
              </View>
              <View style={dv.propBody}>
                <Text style={dv.propName}>{notif.property.name}</Text>
                <View style={dv.propRow}>
                  <MapPin color={T.n500} size={12} strokeWidth={2} />
                  <Text style={dv.propLoc}>{notif.property.location}</Text>
                </View>
                <View style={dv.propStatRow}>
                  <View style={dv.propStat}>
                    <Home color={T.g600} size={12} strokeWidth={2} />
                    <Text style={dv.propStatTxt}>{notif.property.units} Units</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── Offer Details ── */}
        {notif.offer && (
          <>
            <Text style={[dv.secLabel, { marginTop: 20 }]}>OFFER DETAILS</Text>
            <View style={dv.offerCard}>
              {[
                { label: 'Commission', value: notif.offer.commission, Icon: TrendingUp },
                { label: 'Duration', value: notif.offer.duration, Icon: CalendarDays },
                { label: 'Start Date', value: notif.offer.startDate, Icon: BadgeCheck },
              ].map(({ label, value, Icon: OI }) => (
                <View key={label} style={dv.offerRow}>
                  <View style={dv.offerIconBox}><OI color={T.g700} size={16} strokeWidth={2} /></View>
                  <View>
                    <Text style={dv.offerLabel}>{label}</Text>
                    <Text style={dv.offerValue}>{value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Accept / Reject ── */}
        {(notif.type === 'hire_request' || notif.type === 'property_assignment') && (
          <>
            <Text style={[dv.secLabel, { marginTop: 20 }]}>RESPOND</Text>
            {localStatus === 'pending' ? (
              <View style={dv.actionRow}>
                <TouchableOpacity
                  style={[dv.declineBtn, !!actioning && dv.btnOff]}
                  onPress={() => handleRespond('reject')}
                  disabled={!!actioning}
                  activeOpacity={0.85}
                >
                  {actioning === 'reject'
                    ? <ActivityIndicator color={T.red} size="small" />
                    : <><XCircle color={T.red} size={18} strokeWidth={2.5} /><Text style={dv.declineTxt}>Decline</Text></>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dv.acceptBtn, !!actioning && dv.btnOff]}
                  onPress={() => handleRespond('accept')}
                  disabled={!!actioning}
                  activeOpacity={0.85}
                >
                  {actioning === 'accept'
                    ? <ActivityIndicator color={T.white} size="small" />
                    : <><CheckCircle2 color={T.white} size={18} strokeWidth={2.5} /><Text style={dv.acceptTxt}>Accept</Text></>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[dv.resolvedBanner, {
                backgroundColor: localStatus === 'accepted' ? T.g100 : T.redBg,
                borderColor: localStatus === 'accepted' ? T.g200 : T.redBdr,
              }]}>
                {localStatus === 'accepted'
                  ? <CheckCircle2 color={T.g700} size={18} strokeWidth={2.5} />
                  : <XCircle color={T.red} size={18} strokeWidth={2.5} />
                }
                <Text style={[dv.resolvedTxt, { color: localStatus === 'accepted' ? T.g800 : T.red }]}>
                  {localStatus === 'accepted'
                    ? 'You accepted this request. The builder has been notified.'
                    : 'You declined this request. The builder has been notified.'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* ── Reply (Inquiry) ── */}
        {notif.type === 'user_inquiry' && (
          <>
            <Text style={[dv.secLabel, { marginTop: 20 }]}>REPLY TO INQUIRY</Text>
            <ReplyInput onSend={handleReply} />
          </>
        )}

        {/* ── View Property CTA ── */}
        {notif.property && (
          <TouchableOpacity
            style={dv.viewPropBtn}
            onPress={() => Alert.alert('Navigate', `Opening ${notif.property.name}…`)}
            activeOpacity={0.85}
          >
            <Eye color={T.g800} size={17} strokeWidth={2.5} />
            <Text style={dv.viewPropTxt}>View Full Property Details</Text>
            <ChevronRight color={T.g800} size={17} strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
    </View>
  );
}

const dv = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24 },
  hStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20 },
  hStatusTxt: { fontSize: 12, fontWeight: '700' },
  secLabel: { fontSize: 10, fontWeight: '800', color: T.n400, letterSpacing: 1.2, marginBottom: 10 },

  // Sender card
  senderCard: { flexDirection: 'row', gap: 14, backgroundColor: T.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: T.n200, elevation: 2, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, marginBottom: 14 },
  senderAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, borderColor: T.g400 },
  senderName: { fontSize: 16, fontWeight: '800', color: T.n900, letterSpacing: -0.3, marginBottom: 6 },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 8 },
  roleChipTxt: { fontSize: 11, fontWeight: '700' },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  contactTxt: { fontSize: 13, color: T.n600 },

  // Meta bar
  metaBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.n200, marginBottom: 20 },
  metaBarTxt: { fontSize: 12, color: T.n600, flex: 1 },

  // Message
  msgCard: { backgroundColor: T.white, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: T.n200, borderLeftWidth: 4, borderLeftColor: T.g600, marginBottom: 4 },
  msgTxt: { fontSize: 14, color: T.n700, lineHeight: 22 },

  // Property
  propCard: { borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8 },
  propImg: { width: '100%', height: 155 },
  propImgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 155, backgroundColor: 'rgba(0,0,0,0.1)' },
  propTypeBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(27,94,59,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  propTypeTxt: { color: T.white, fontSize: 11, fontWeight: '700' },
  propBody: { backgroundColor: T.white, padding: 14 },
  propName: { fontSize: 16, fontWeight: '800', color: T.n900, marginBottom: 4 },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  propLoc: { fontSize: 12, color: T.n500 },
  propStatRow: { flexDirection: 'row' },
  propStat: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.g100, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  propStatTxt: { fontSize: 12, fontWeight: '600', color: T.g700 },

  // Offer
  offerCard: { backgroundColor: T.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: T.g200, gap: 14 },
  offerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  offerIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: T.g100, justifyContent: 'center', alignItems: 'center' },
  offerLabel: { fontSize: 11, color: T.n500, fontWeight: '500', marginBottom: 2 },
  offerValue: { fontSize: 15, fontWeight: '800', color: T.n900 },

  // Actions
  actionRow: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.redBg, borderWidth: 2, borderColor: T.redBdr, borderRadius: 14, paddingVertical: 14 },
  declineTxt: { color: T.red, fontSize: 15, fontWeight: '700' },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.g800, borderRadius: 14, paddingVertical: 14, elevation: 4, shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 6 },
  acceptTxt: { color: T.white, fontSize: 15, fontWeight: '700' },
  btnOff: { opacity: 0.55 },
  resolvedBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  resolvedTxt: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },

  // View property CTA
  viewPropBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.g100, borderWidth: 2, borderColor: T.g200, borderRadius: 14, padding: 16, marginTop: 20 },
  viewPropTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: T.g800 },
});

/* ═══════════════════════════════════════════════════════════
   SHARED STYLES
═══════════════════════════════════════════════════════════ */
const ss = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.g50 },

  // Header
  header: {
    backgroundColor: T.g800,
    paddingTop: Platform.OS === 'ios' ? 58 : 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: T.white, letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  headerBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 26,
    right: 10,
    backgroundColor: T.red,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: T.g800,
  },
  headerBadgeTxt: { fontSize: 9, fontWeight: '900', color: T.white },

  // Search + Filter block
  searchFilterBlock: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.n200,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    // Prevent any outline on web/android
    elevation: 0,
  },
  searchBoxFocused: {
    borderColor: T.g600,
    backgroundColor: T.white,
    elevation: 2,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: T.n900,
    height: '100%',
    // Prevent black outline on Android & web
    outlineWidth: 0,
    outlineStyle: 'none',
  },
  searchClear: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: T.n100,
    justifyContent: 'center', alignItems: 'center',
  },

  // Filter chips — cleaner pill design
  chipsContainer: {
    paddingVertical: 2,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: T.white,
    borderWidth: 1.5,
    borderColor: T.n200,
    // subtle shadow on inactive chips
    elevation: 1,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  chipActive: {
    backgroundColor: T.g800,
    borderColor: T.g800,
    elevation: 3,
    shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  chipTxt: { fontSize: 13, fontWeight: '600', color: T.n600 },
  chipTxtActive: { color: T.white, fontWeight: '700' },

  // Count badge on Unread chip
  chipCountBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: T.g100,
    paddingHorizontal: 5,
    justifyContent: 'center', alignItems: 'center',
  },
  chipCountBadgeActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  chipCountTxt: { fontSize: 11, fontWeight: '800', color: T.g700 },
  chipCountTxtActive: { color: T.white },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: T.n600 },
  emptySubtitle: { fontSize: 14, color: T.n400, textAlign: 'center' },
});

/* ═══════════════════════════════════════════════════════════
   MENU STYLES
═══════════════════════════════════════════════════════════ */
const mn = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' },
  menu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 102 : 72,
    right: 16,
    backgroundColor: T.white,
    borderRadius: 16,
    elevation: 10,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    minWidth: 210,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  itemTxt: { fontSize: 14, fontWeight: '600', color: T.n700 },
  div: { height: 1, backgroundColor: T.n200 },
});

/* ═══════════════════════════════════════════════════════════
   ROOT EXPORT – wires list ↔ detail navigation
═══════════════════════════════════════════════════════════ */
export default function AgentNotificationsScreen({ navigation, onBack }) {
  const [notifs, setNotifs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch real notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) { setLoading(false); return; }
      const resp = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await resp.json();
      if (data.success && data.notifications) {
        const mapped = data.notifications.map((n) => ({
          id: String(n.id),
          type: n.type || 'hire_request',
          read: n.isRead,
          createdAt: n.createdAt,
          status: 'pending',
          relatedEntityId: n.relatedEntityId,
          sender: {
            name: n.title || 'Builder',
            role: 'Builder',
            avatar: 'https://i.pravatar.cc/150?img=57',
            email: '',
            phone: '',
          },
          summary: n.body || n.title || '',
          message: n.body || '',
          property: null,
          offer: null,
        }));
        setNotifs(mapped);
      }
    } catch (err) {
      console.error('fetchNotifications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const openDetail = useCallback(async (notif) => {
    // Mark as read on backend
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        fetch(`${API_BASE_URL}/notifications/${notif.id}/read`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => { });
      }
    } catch (_) { }
    setNotifs(p => p.map(n => n.id === notif.id ? { ...n, read: true } : n));

    let enriched = { ...notif, read: true };
    if (notif.type === 'hire_request' && notif.relatedEntityId) {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const resp = await fetch(`${API_BASE_URL}/agent/hire-requests/${notif.relatedEntityId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await resp.json();
          if (data.success && data.request) {
            const r = data.request;
            enriched = {
              ...enriched,
              status: r.status || enriched.status,
              builder: r,
              sender: {
                ...enriched.sender,
                name: r.builder_name || enriched.sender.name,
                email: r.builder_email || '',
                phone: r.builder_phone || '',
                avatar: r.builder_avatar ? getImageUrl(r.builder_avatar) : enriched.sender.avatar,
              },
            };
          }
        }
      } catch (err) {
        console.error('Failed to fetch hire request details:', err);
      }
    }
    setSelected(enriched);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    // Mark all as read on backend
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        for (const n of notifs) {
          if (!n.read) {
            fetch(`${API_BASE_URL}/notifications/${n.id}/read`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` },
            }).catch(() => { });
          }
        }
      }
    } catch (_) { }
  }, [notifs]);

  const handleAction = useCallback((id, newStatus) => {
    setNotifs(p => p.map(n => n.id === id ? { ...n, status: newStatus } : n));
  }, []);

  if (loading) {
    return (
      <View style={[ss.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.g800} />
        <Text style={{ marginTop: 12, color: T.n500 }}>Loading notifications…</Text>
      </View>
    );
  }

  if (selected) {
    return (
      <NotificationDetail
        notif={selected}
        onBack={() => setSelected(null)}
        onAction={handleAction}
      />
    );
  }

  return (
    <NotificationList
      notifs={notifs}
      onOpen={openDetail}
      onMarkAllRead={markAllRead}
      onBack={() => navigation?.goBack?.() || onBack?.()}
    />
  );
}