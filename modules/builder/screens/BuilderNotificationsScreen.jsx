/**
 * BuilderNotificationsScreen.jsx  (Updated)
 *
 * Changes made:
 *  1. Fully responsive for all device sizes (phones, tablets, large screens)
 *  2. Fixed black border on search bar while typing — using state-based border color
 *  3. Filters moved below the search bar with improved pill styling
 *  4. Overall UI polish: spacing, shadows, typography, card design
 *
 * Builder notification centre.
 *
 * Notification types:
 *   agent_hire_response        – Agent accepted / rejected a hire request
 *   agent_assignment_response  – Agent accepted / rejected a property assignment
 *   property_submission        – Agent submitted property listing for Builder approval
 *   user_inquiry               – Buyer inquiry about a Builder property
 *
 * Architecture (single file):
 *   BuilderNotificationsScreen  ← root, owns all state
 *     ├── NotificationList      ← filterable / searchable list
 *     └── NotificationDetail    ← full detail + contextual actions
 *
 * Theme  : Forest green #1B5E3B + white  (matches the rest of the app)
 * Safety : Every TextInput uses state-based focus — no native border flicker.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getImageUrl } from '../../../utils/api';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  FlatList, ScrollView, Image, Modal, Alert,
  ActivityIndicator, Platform, StatusBar, Dimensions,
  useWindowDimensions,
} from 'react-native';
import {
  ArrowLeft, BellOff, Search, X, CheckCheck, Filter,
  ChevronRight, Building2, MapPin, Phone, Mail, Clock,
  Home, MessageSquare, Briefcase, Send, FileText, Layers,
  CheckCircle2, XCircle, MoreVertical, CalendarDays,
  BadgeCheck, TrendingUp, UserCheck, Star, AlertTriangle,
  RefreshCw, Eye,
} from 'lucide-react-native';

/* ══════════════════════════════════════════════════════════
   RESPONSIVE HELPERS
══════════════════════════════════════════════════════════ */
const BASE_WIDTH = 375; // iPhone SE / base phone

const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLarge = width >= 1024;

  // Scale factor: capped so it doesn't grow forever on huge screens
  const scale = Math.min(width / BASE_WIDTH, isLarge ? 1.5 : isTablet ? 1.35 : 1.1);

  const rs = (size) => Math.round(size * scale);
  const rp = (size) => Math.round(size * Math.min(scale, 1.2)); // padding caps lower

  return { width, height, isTablet, isLarge, scale, rs, rp };
};

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const T = {
  // Greens
  g900: '#0D3320', g800: '#1B5E3B', g700: '#1E7444', g600: '#25904F',
  g500: '#2EAD5F', g400: '#5BC282', g200: '#C6E8D4', g100: '#E8F5ED', g50: '#F4FAF7',
  // Neutrals
  n900: '#111827', n800: '#1F2937', n700: '#374151', n600: '#4B5563',
  n500: '#6B7280', n400: '#9CA3AF', n300: '#D1D5DB', n200: '#E5E7EB',
  n100: '#F3F4F6', white: '#FFFFFF',
  // Accents
  amber: '#F59E0B', amberBg: '#FFFBEB', amberBdr: '#FCD34D',
  red: '#EF4444', redBg: '#FEF2F2', redBdr: '#FECACA',
  blue: '#3B82F6', blueBg: '#EFF6FF', blueBdr: '#BFDBFE',
  teal: '#0D9488', tealBg: '#F0FDFA', tealBdr: '#99F6E4',
  shadow: 'rgba(27,94,59,0.12)',
};

/* ══════════════════════════════════════════════════════════
   MOCK DATA  (7 realistic notifications)
══════════════════════════════════════════════════════════ */
const SEED = [
  {
    id: 'b1', type: 'agent_hire_response', read: false,
    createdAt: '2025-02-23T10:05:00Z', status: 'accepted',
    sender: {
      name: 'Priya Sharma', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=47',
      email: 'priya@realty.com', phone: '9876543210',
      experience: 7, rating: 4.8, deals: 142, spec: 'Residential',
    },
    summary: 'Priya Sharma accepted your hire request',
    message: 'Thank you for the opportunity. I am pleased to accept the hire request for Greenfield Villas. I have reviewed the project in full and am confident I can deliver excellent results. I will coordinate with your team immediately to begin the onboarding process.',
    property: {
      name: 'Greenfield Villas', location: 'Bandra West, Mumbai',
      type: 'Residential', units: 32,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
    },
    offer: { commission: '2.5%', duration: '12 months' },
    submission: null,
  },
  {
    id: 'b2', type: 'property_submission', read: false,
    createdAt: '2025-02-23T08:30:00Z', status: 'pending',
    sender: {
      name: 'Rahul Verma', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=12',
      email: 'rahul@realty.com', phone: '9823456789',
      experience: 5, rating: 4.5, deals: 98, spec: 'Commercial',
    },
    summary: 'Rahul submitted Skyline Commercial Hub for your approval',
    message: 'I have completed the full listing for Skyline Commercial Hub including unit specs, pricing tiers, floor plans, and RERA compliance details. All four supporting documents are attached. Please review and approve so we can go live on the platform at the earliest.',
    property: {
      name: 'Skyline Commercial Hub', location: 'Powai, Mumbai',
      type: 'Commercial', units: 8,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    },
    offer: null,
    submission: { listedPrice: '₹4.2 Cr / unit', listedArea: '2,400 sq ft / unit', docsAttached: 4 },
  },
  {
    id: 'b3', type: 'user_inquiry', read: true,
    createdAt: '2025-02-22T17:10:00Z', status: 'pending',
    sender: {
      name: 'Ananya Krishnan', role: 'Buyer',
      avatar: 'https://i.pravatar.cc/150?img=43',
      email: 'ananya.k@gmail.com', phone: '9765001234',
    },
    summary: '2 BHK availability and pricing inquiry — Emerald Heights',
    message: 'Hi, I came across Emerald Heights and I am very interested. Could you share current 2 BHK availability, pricing, and payment plan options? My budget is ₹1.8–2.1 Cr. I would also love to schedule a site visit this week if possible.',
    property: {
      name: 'Emerald Heights', location: 'Andheri East, Mumbai',
      type: 'Residential', units: 36,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    },
    offer: null, submission: null,
  },
  {
    id: 'b4', type: 'agent_assignment_response', read: false,
    createdAt: '2025-02-22T14:20:00Z', status: 'rejected',
    sender: {
      name: 'Arjun Mehta', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=68',
      email: 'arjun@realty.com', phone: '9812345678',
      experience: 10, rating: 4.9, deals: 230, spec: 'Luxury',
    },
    summary: 'Arjun Mehta declined the Harbor View Plaza assignment',
    message: 'Thank you for considering me. I must unfortunately decline the assignment for Harbor View Plaza as I am currently at full capacity with existing projects. My schedule opens up in Q3 2025 and I would love to collaborate on future projects then.',
    property: {
      name: 'Harbor View Plaza', location: 'Worli, Mumbai',
      type: 'Mixed Use', units: 12,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    },
    offer: null, submission: null,
  },
  {
    id: 'b5', type: 'property_submission', read: true,
    createdAt: '2025-02-21T11:45:00Z', status: 'approved',
    sender: {
      name: 'Kavita Nair', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=25',
      email: 'kavita@realty.com', phone: '9654321098',
      experience: 4, rating: 4.3, deals: 76, spec: 'Mixed Use',
    },
    summary: 'Palm Springs Villa listing submitted for approval',
    message: 'The full listing for Palm Springs Villa has been submitted with virtual tour links, floor plan PDFs, and a detailed pricing matrix. Please review and approve so we can begin receiving buyer inquiries as soon as possible.',
    property: {
      name: 'Palm Springs Villa', location: 'Juhu, Mumbai',
      type: 'Residential', units: 6,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    },
    offer: null,
    submission: { listedPrice: '₹6.5 Cr / villa', listedArea: '4,800 sq ft / villa', docsAttached: 7 },
  },
  {
    id: 'b6', type: 'user_inquiry', read: false,
    createdAt: '2025-02-20T09:30:00Z', status: 'pending',
    sender: {
      name: 'Rohan Mehta', role: 'Buyer',
      avatar: 'https://i.pravatar.cc/150?img=68',
      email: 'rohan.mehta@outlook.com', phone: '9654123456',
    },
    summary: 'Site-visit request for Palm Springs Villa this weekend',
    message: 'Hello, I am very interested in Palm Springs Villa and would love to schedule a site visit this Saturday or Sunday morning. I am a serious buyer with funds ready and would like to discuss the payment plan and any early-booking benefits.',
    property: {
      name: 'Palm Springs Villa', location: 'Juhu, Mumbai',
      type: 'Residential', units: 6,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    },
    offer: null, submission: null,
  },
  {
    id: 'b7', type: 'agent_hire_response', read: true,
    createdAt: '2025-02-19T16:00:00Z', status: 'rejected',
    sender: {
      name: 'Sneha Patil', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=32',
      email: 'sneha@realty.com', phone: '9765432100',
      experience: 3, rating: 4.2, deals: 54, spec: 'Residential',
    },
    summary: 'Sneha Patil declined your hire request',
    message: 'Thank you for the kind offer. I must respectfully decline the hire request for Emerald Heights due to prior commitments running through Q3. I would be happy to revisit collaborating in Q4 2025 once my schedule opens up.',
    property: {
      name: 'Emerald Heights', location: 'Andheri East, Mumbai',
      type: 'Residential', units: 36,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    },
    offer: null, submission: null,
  },
];

/* ══════════════════════════════════════════════════════════
   TYPE + STATUS CONFIG
══════════════════════════════════════════════════════════ */
const TYPE_CFG = {
  agent_hire_response: { label: 'Hire Response', Icon: UserCheck, color: T.teal, bg: T.tealBg, border: T.tealBdr },
  agent_assignment_response: { label: 'Assignment Reply', Icon: Building2, color: T.g700, bg: T.g100, border: T.g200 },
  property_submission: { label: 'Submission', Icon: FileText, color: T.blue, bg: T.blueBg, border: T.blueBdr },
  user_inquiry: { label: 'User Inquiry', Icon: MessageSquare, color: T.amber, bg: T.amberBg, border: T.amberBdr },
  hire_response: { label: 'Hire Response', Icon: UserCheck, color: T.teal, bg: T.tealBg, border: T.tealBdr },
  hire_request: { label: 'Hire Request', Icon: Briefcase, color: T.blue, bg: T.blueBg, border: T.blueBdr },
  property_approved: { label: 'Approved', Icon: BadgeCheck, color: T.g700, bg: T.g100, border: T.g200 },
  property_upload: { label: 'Property Upload', Icon: Home, color: T.g700, bg: T.g100, border: T.g200 },
  _default: { label: 'Notification', Icon: MessageSquare, color: T.n500, bg: T.n100, border: T.n200 },
};

const STATUS_CFG = {
  pending: { label: 'Pending', color: T.amber, bg: T.amberBg, Icon: Clock },
  accepted: { label: 'Accepted', color: T.g700, bg: T.g100, Icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: T.red, bg: T.redBg, Icon: XCircle },
  approved: { label: 'Approved', color: T.g700, bg: T.g100, Icon: BadgeCheck },
};

const FILTER_TABS = [
  { key: 'All', icon: null },
  { key: 'Unread', icon: null },
  { key: 'Agent Responses', icon: UserCheck },
  { key: 'Submissions', icon: FileText },
  { key: 'Inquiries', icon: MessageSquare },
];

/* ══════════════════════════════════════════════════════════
   DATE HELPERS
══════════════════════════════════════════════════════════ */
const fmtRel = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const fmtFull = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

/* ══════════════════════════════════════════════════════════
   TINY ATOMS
══════════════════════════════════════════════════════════ */
const StatusPill = ({ status }) => {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <View style={[atoms.pill, { backgroundColor: c.bg }]}>
      <c.Icon color={c.color} size={11} strokeWidth={2.5} />
      <Text style={[atoms.pillTxt, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const TypeBadge = ({ type }) => {
  const c = TYPE_CFG[type] || TYPE_CFG._default;
  return (
    <View style={[atoms.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <c.Icon color={c.color} size={10} strokeWidth={2.5} />
      <Text style={[atoms.badgeTxt, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const AgentStars = ({ rating }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <Star color={T.amber} fill={T.amber} size={12} strokeWidth={0} />
    <Text style={{ fontSize: 12, fontWeight: '700', color: T.n700 }}>{rating.toFixed(1)}</Text>
  </View>
);

const SectionLabel = ({ text, mt = 0 }) => (
  <Text style={[atoms.secLbl, mt > 0 && { marginTop: mt }]}>{text}</Text>
);

const atoms = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20,
  },
  pillTxt: { fontSize: 11, fontWeight: '700' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1,
  },
  badgeTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  secLbl: { fontSize: 10, fontWeight: '800', color: T.n400, letterSpacing: 1.4, marginBottom: 10 },
});

/* ══════════════════════════════════════════════════════════
   FOCUS-SAFE REPLY INPUT
   State-based border — zero native flicker or black ring
══════════════════════════════════════════════════════════ */
const ReplyInput = React.memo(({ recipientName, onSend }) => {
  const [val, setVal] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);
  const { rs } = useResponsive();

  const handleSend = async () => {
    if (!val.trim()) { Alert.alert('Empty Reply', 'Please type a message first.'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 950));
    setSending(false);
    onSend?.(val.trim());
    setVal('');
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={[
        replyS.wrap,
        focused && { borderColor: T.g600, backgroundColor: T.white },
      ]}>
        <TextInput
          style={[replyS.input, { fontSize: rs(14) }]}
          placeholder={`Reply to ${recipientName}…`}
          placeholderTextColor={T.n400}
          value={val}
          onChangeText={setVal}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          blurOnSubmit={false}
          // Prevents native Android outline/border on focus
          underlineColorAndroid="transparent"
        />
      </View>
      <TouchableOpacity
        style={[replyS.btn, sending && { opacity: 0.55 }]}
        onPress={handleSend}
        disabled={sending}
        activeOpacity={0.85}
      >
        {sending
          ? <ActivityIndicator color={T.white} size="small" />
          : <><Send color={T.white} size={rs(17)} strokeWidth={2.5} /><Text style={[replyS.btnTxt, { fontSize: rs(15) }]}>Send Reply</Text></>
        }
      </TouchableOpacity>
    </View>
  );
}, () => true);

const replyS = StyleSheet.create({
  wrap: {
    backgroundColor: T.g50, borderWidth: 1.5, borderColor: T.n300,
    borderRadius: 14, padding: 14, minHeight: 90,
    // Prevent any native outline on Android
    elevation: 0,
  },
  input: {
    color: T.n900, minHeight: 65,
    // Remove default Android blue outline
    outlineStyle: 'none',
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: T.g800, borderRadius: 14, paddingVertical: 14,
    elevation: 3, shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 6,
  },
  btnTxt: { color: T.white, fontWeight: '700' },
});

/* ══════════════════════════════════════════════════════════
   SHARED HEADER
══════════════════════════════════════════════════════════ */
function PageHeader({ title, subtitle, onBack, right, unread }) {
  const { rs, rp, isTablet } = useResponsive();

  return (
    <View style={[
      header.bar,
      {
        paddingTop: Platform.OS === 'ios' ? (isTablet ? 56 : 52) : (isTablet ? 32 : 26),
        paddingBottom: isTablet ? 24 : 20,
        paddingHorizontal: isTablet ? 28 : 20,
        gap: isTablet ? 16 : 14,
      }
    ]}>
      <TouchableOpacity style={[header.btn, isTablet && { width: 46, height: 46, borderRadius: 14 }]}
        onPress={onBack} activeOpacity={0.7}>
        <ArrowLeft color={T.white} size={rs(22)} strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={[header.title, { fontSize: rs(20) }]}>{title}</Text>
        {subtitle ? <Text style={[header.sub, { fontSize: rs(12) }]}>{subtitle}</Text> : null}
      </View>

      {right}

      {unread > 0 && (
        <View style={[
          header.badge,
          {
            top: Platform.OS === 'ios' ? (isTablet ? 54 : 50) : (isTablet ? 30 : 24),
            right: isTablet ? 14 : 8,
          }
        ]}>
          <Text style={header.badgeTxt}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </View>
  );
}

const header = StyleSheet.create({
  bar: {
    backgroundColor: T.g800,
    flexDirection: 'row', alignItems: 'center',
  },
  btn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontWeight: '800', color: T.white, letterSpacing: -0.4 },
  sub: { color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  badge: {
    position: 'absolute',
    backgroundColor: T.red, minWidth: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: T.g800,
    paddingHorizontal: 3,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', color: T.white },
});

/* ══════════════════════════════════════════════════════════
   NOTIFICATION  LIST  VIEW
══════════════════════════════════════════════════════════ */
function NotificationList({ notifs, onOpen, onMarkAllRead, onBack }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { width, isTablet, isLarge, rs, rp } = useResponsive();

  const unreadCount = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);

  const hPad = isTablet ? 24 : 16;
  const numCols = isLarge ? 2 : 1; // 2-column grid on large screens

  const filtered = useMemo(() => {
    let lst = notifs;
    if (filter === 'Unread') lst = lst.filter(n => !n.read);
    else if (filter === 'Agent Responses') lst = lst.filter(n => n.type === 'agent_hire_response' || n.type === 'agent_assignment_response');
    else if (filter === 'Submissions') lst = lst.filter(n => n.type === 'property_submission');
    else if (filter === 'Inquiries') lst = lst.filter(n => n.type === 'user_inquiry');

    if (search.trim()) {
      const q = search.toLowerCase();
      lst = lst.filter(n =>
        n.sender.name.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        (n.property?.name.toLowerCase().includes(q))
      );
    }
    return lst;
  }, [notifs, filter, search]);

  const stripeFor = (item) => {
    const isResp = item.type === 'agent_hire_response' || item.type === 'agent_assignment_response';
    if (isResp) return item.status === 'accepted' ? T.g600 : T.red;
    return item.read ? null : T.g600;
  };

  const renderItem = ({ item, index }) => {
    const cfg = TYPE_CFG[item.type] || TYPE_CFG._default;
    const stripe = stripeFor(item);
    const avatarSize = isTablet ? 56 : 50;

    return (
      <TouchableOpacity
        style={[
          listS.card,
          !item.read && listS.unread,
          isLarge && { marginHorizontal: 6 },
        ]}
        onPress={() => onOpen(item)}
        activeOpacity={0.86}
      >
        {stripe && <View style={[listS.stripe, { backgroundColor: stripe }]} />}

        <View style={[listS.inner, { padding: isTablet ? 18 : 14, gap: isTablet ? 14 : 12 }]}>
          {/* Avatar + type overlay */}
          <View>
            <Image
              source={{ uri: item.sender.avatar }}
              style={[listS.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
            />
            <View style={[listS.typeIcon, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <cfg.Icon color={cfg.color} size={11} strokeWidth={2.5} />
            </View>
          </View>

          {/* Right content */}
          <View style={{ flex: 1 }}>
            <View style={listS.topRow}>
              <Text style={[listS.senderName, { fontSize: rs(14) }]} numberOfLines={1}>
                {item.sender.name}
              </Text>
              <Text style={[listS.time, { fontSize: rs(11) }]}>{fmtRel(item.createdAt)}</Text>
            </View>

            <View style={listS.metaRow}>
              <TypeBadge type={item.type} />
              <Text style={[listS.roleLabel, { fontSize: rs(11) }]}>{item.sender.role}</Text>
            </View>

            <Text style={[listS.summary, !item.read && listS.summaryBold, { fontSize: rs(13), lineHeight: rs(19) }]}
              numberOfLines={2}>
              {item.summary}
            </Text>

            {item.property && (
              <View style={listS.propHint}>
                <Home color={T.g600} size={rs(11)} strokeWidth={2} />
                <Text style={[listS.propHintTxt, { fontSize: rs(11) }]} numberOfLines={1}>
                  {item.property.name}
                </Text>
              </View>
            )}

            <View style={listS.foot}>
              <StatusPill status={item.status} />
              {!item.read && <View style={listS.dot} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={g.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        onBack={onBack}
        unread={unreadCount}
        right={
          <TouchableOpacity
            style={[header.btn, isTablet && { width: 46, height: 46, borderRadius: 14 }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
          >
            <MoreVertical color={T.white} size={rs(22)} strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      {/* ── Search + Filters grouped together ── */}
      <View style={[g.topBar, { paddingHorizontal: hPad }]}>

        {/* Search box — state-driven border, no native outline */}
        <View style={[
          g.searchBox,
          searchFocused && g.searchBoxFocused,
          isTablet && { height: 52, borderRadius: 16 },
        ]}>
          <Search color={searchFocused ? T.g600 : T.n500} size={rs(16)} strokeWidth={2} />
          <TextInput
            style={[g.searchInput, { fontSize: rs(14) }]}
            placeholder="Search by agent, buyer, or property…"
            placeholderTextColor={T.n400}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            // Critical: prevent native Android focus rings
            underlineColorAndroid="transparent"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={g.searchClear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={g.searchClearInner}>
                <X color={T.n600} size={rs(12)} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips — directly below search */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[g.chips, { paddingVertical: 10 }]}
          style={{ marginHorizontal: -hPad }}
          contentInset={{ left: hPad, right: hPad }}
        >
          {/* Spacer for the left side when using contentInset on iOS */}
          <View style={{ width: hPad }} />
          {FILTER_TABS.map(({ key: f, icon: FIcon }) => {
            const isActive = filter === f;
            const isUnreadTab = f === 'Unread';
            return (
              <TouchableOpacity
                key={f}
                style={[
                  g.chip,
                  isActive && g.chipOn,
                  isTablet && { paddingHorizontal: 16, paddingVertical: 9 },
                ]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                {FIcon && (
                  <FIcon
                    color={isActive ? T.white : T.n500}
                    size={rs(12)}
                    strokeWidth={2.5}
                  />
                )}
                {isUnreadTab && unreadCount > 0 && (
                  <View style={[g.chipDot, isActive && g.chipDotOn]} />
                )}
                <Text style={[g.chipTxt, { fontSize: rs(12) }, isActive && g.chipTxtOn]}>{f}</Text>
                {isUnreadTab && unreadCount > 0 && (
                  <View style={[g.chipNum, isActive && g.chipNumOn]}>
                    <Text style={[g.chipNumTxt, isActive && g.chipNumTxtOn]}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ width: hPad }} />
        </ScrollView>
      </View>

      {/* ── List ── */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        numColumns={numCols}
        key={numCols} // re-render when columns change
        contentContainerStyle={[
          listS.container,
          { paddingHorizontal: isLarge ? hPad - 6 : hPad, paddingBottom: 40 },
        ]}
        columnWrapperStyle={isLarge ? { gap: 0 } : null}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: isTablet ? 12 : 10 }} />}
        ListEmptyComponent={
          <View style={[g.empty, { paddingTop: isTablet ? 100 : 80 }]}>
            <View style={g.emptyIconWrap}>
              <BellOff color={T.g400} size={isTablet ? 64 : 52} strokeWidth={1.5} />
            </View>
            <Text style={[g.emptyH, { fontSize: rs(17) }]}>No notifications</Text>
            <Text style={[g.emptySub, { fontSize: rs(14) }]}>
              {search ? 'No results match your search' : "You're all caught up!"}
            </Text>
          </View>
        }
      />

      {/* ── Options menu ── */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={menu.bg} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[menu.box, {
            top: Platform.OS === 'ios' ? (isTablet ? 108 : 100) : (isTablet ? 78 : 70),
            right: isTablet ? 20 : 14,
          }]}>
            <TouchableOpacity style={menu.row} activeOpacity={0.8}
              onPress={() => { onMarkAllRead(); setMenuOpen(false); }}>
              <View style={menu.iconBox}>
                <CheckCheck color={T.g700} size={rs(17)} strokeWidth={2} />
              </View>
              <Text style={[menu.rowTxt, { fontSize: rs(14) }]}>Mark all as read</Text>
            </TouchableOpacity>
            <View style={menu.div} />
            <TouchableOpacity style={menu.row} activeOpacity={0.8} onPress={() => setMenuOpen(false)}>
              <View style={[menu.iconBox, { backgroundColor: T.n100 }]}>
                <Filter color={T.n600} size={rs(17)} strokeWidth={2} />
              </View>
              <Text style={[menu.rowTxt, { fontSize: rs(14) }]}>Notification settings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════
   AGENT  DETAIL  VIEW
══════════════════════════════════════════════════════════ */
function AgentDetailView({ agent, onBack }) {
  const { rs, isTablet, rp } = useResponsive();
  const avatarSize = isTablet ? 120 : 100;

  return (
    <View style={g.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />
      <PageHeader title="Agent Profile" subtitle={agent?.role || 'Agent'} onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ padding: isTablet ? 24 : 16, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          {agent?.avatar ? (
            <Image source={{ uri: agent.avatar }} style={{
              width: avatarSize, height: avatarSize,
              borderRadius: avatarSize / 2, borderWidth: 3, borderColor: T.g400,
            }} />
          ) : (
            <View style={{
              width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2,
              backgroundColor: T.g600, justifyContent: 'center', alignItems: 'center',
              borderWidth: 3, borderColor: T.g400,
            }}>
              <Text style={{ color: T.white, fontSize: rs(42), fontWeight: '800' }}>
                {(agent?.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: rs(22), fontWeight: '800', color: T.n900, letterSpacing: -0.3 }}>
            {agent?.name || 'Agent'}
          </Text>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6,
            backgroundColor: T.g100, paddingHorizontal: 12, paddingVertical: 5,
            borderRadius: 20, borderWidth: 1, borderColor: T.g200,
          }}>
            <UserCheck color={T.g700} size={rs(13)} strokeWidth={2.5} />
            <Text style={{ fontSize: rs(12), fontWeight: '700', color: T.g700 }}>
              {agent?.role || 'Agent'}
            </Text>
          </View>
        </View>

        {(agent?.specialization || agent?.experience !== undefined) && (
          <>
            <SectionLabel text="PROFESSIONAL PROFILE" />
            <View style={{
              backgroundColor: T.white, borderRadius: 16, padding: isTablet ? 20 : 18,
              borderLeftWidth: 4, borderLeftColor: T.teal, borderWidth: 1, borderColor: T.n200, marginBottom: 20,
            }}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: T.n500, fontWeight: '600', marginBottom: 2 }}>SPEC</Text>
                  <Text style={{ fontSize: rs(15), fontWeight: '800', color: T.n900 }}>
                    {agent.specialization || 'Real Estate Agent'}
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: T.n200 }} />
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={{ fontSize: 10, color: T.n500, fontWeight: '600', marginBottom: 2 }}>EXP</Text>
                  <Text style={{ fontSize: rs(15), fontWeight: '800', color: T.n900 }}>
                    {agent.experience || 0} Years
                  </Text>
                </View>
              </View>
              {agent.city && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <MapPin color={T.n500} size={rs(14)} strokeWidth={2} />
                  <Text style={{ fontSize: rs(13), color: T.n600, fontWeight: '600' }}>
                    Based in {agent.city}
                  </Text>
                </View>
              )}
              {agent.about && (
                <Text style={{ fontSize: rs(13), color: T.n500, fontStyle: 'italic', lineHeight: rs(20) }}>
                  "{agent.about}"
                </Text>
              )}
            </View>
          </>
        )}

        <SectionLabel text="CONTACT INFORMATION" />
        <View style={{
          backgroundColor: T.white, borderRadius: 16, padding: isTablet ? 20 : 18,
          borderWidth: 1.5, borderColor: T.n200, gap: 16,
        }}>
          {agent?.email ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: T.g100, justifyContent: 'center', alignItems: 'center' }}>
                <Mail color={T.g700} size={rs(18)} strokeWidth={2} />
              </View>
              <View>
                <Text style={{ fontSize: 11, color: T.n400, fontWeight: '600', marginBottom: 2 }}>Email</Text>
                <Text style={{ fontSize: rs(15), fontWeight: '700', color: T.n900 }}>{agent.email}</Text>
              </View>
            </View>
          ) : null}
          {agent?.phone ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: T.g100, justifyContent: 'center', alignItems: 'center' }}>
                <Phone color={T.g700} size={rs(18)} strokeWidth={2} />
              </View>
              <View>
                <Text style={{ fontSize: 11, color: T.n400, fontWeight: '600', marginBottom: 2 }}>Phone</Text>
                <Text style={{ fontSize: rs(15), fontWeight: '700', color: T.n900 }}>{agent.phone}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {(!agent?.email && !agent?.phone) ? (
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <Text style={{ fontSize: rs(14), color: T.n400 }}>No contact details available.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════
   NOTIFICATION  DETAIL  VIEW
══════════════════════════════════════════════════════════ */
function NotificationDetail({ notif, onBack, onAction, navigation }) {
  const [localStatus, setLocalStatus] = useState(notif.status);
  const [actioning, setActioning] = useState(null);
  const [showAgentDetail, setShowAgentDetail] = useState(false);
  const { rs, isTablet, rp, width } = useResponsive();

  const hPad = isTablet ? 24 : 16;
  const maxContentWidth = Math.min(width, 680); // cap detail width on large screens

  useEffect(() => { setLocalStatus(notif.status); }, [notif.status]);

  const cfg = TYPE_CFG[notif.type] || TYPE_CFG._default;
  const scfg = STATUS_CFG[localStatus] ?? STATUS_CFG.pending;

  const isAgentResp = notif.type === 'agent_hire_response' || notif.type === 'agent_assignment_response' || notif.type === 'hire_response';
  const isSubmission = notif.type === 'property_submission';
  const isInquiry = notif.type === 'user_inquiry';
  const canAct = isSubmission && localStatus === 'pending';

  const accentColor = isAgentResp
    ? (localStatus === 'accepted' ? T.g600 : T.red)
    : null;

  const handleSubmission = async (action) => {
    setActioning(action);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const requestId = notif.relatedEntityId;
      if (requestId && token) {
        const endpoint = action === 'approve'
          ? `${API_BASE_URL}/property-requests/${requestId}/approve`
          : `${API_BASE_URL}/property-requests/${requestId}/reject`;
        const resp = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: action === 'reject' ? JSON.stringify({ rejection_reason: 'Disapproved by builder' }) : undefined,
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message || 'Request failed');
      }
      const next = action === 'approve' ? 'approved' : 'rejected';
      setLocalStatus(next);
      onAction(notif.id, next);
      Alert.alert(
        action === 'approve' ? '✓ Listing Approved' : 'Submission Rejected',
        action === 'approve' ? 'The property is now live on the platform.' : 'The submission has been rejected.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to process request');
    } finally {
      setActioning(null);
    }
  };

  const handleReply = useCallback((text) => {
    Alert.alert('Reply Sent', `Your message has been delivered to ${notif.sender.name}.`);
  }, [notif.sender.name]);

  if (showAgentDetail) {
    return <AgentDetailView agent={notif.sender} onBack={() => setShowAgentDetail(false)} />;
  }

  return (
    <View style={g.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      <PageHeader
        title="Notification Detail"
        subtitle={cfg.label}
        onBack={onBack}
        right={
          <View style={[detail.hPill, { backgroundColor: scfg.bg }]}>
            <scfg.Icon color={scfg.color} size={rs(13)} strokeWidth={2.5} />
            <Text style={[detail.hPillTxt, { fontSize: rs(12), color: scfg.color }]}>{scfg.label}</Text>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[
          detail.scroll,
          {
            paddingHorizontal: hPad,
            paddingTop: isTablet ? 22 : 18,
            // Center content on very wide screens
            maxWidth: maxContentWidth,
            alignSelf: 'center',
            width: '100%',
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── SENDER CARD ── */}
        <SectionLabel text={isInquiry ? 'FROM BUYER' : 'FROM AGENT'} />
        <View style={[detail.senderCard, accentColor && { borderLeftColor: accentColor, borderLeftWidth: 4 }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}
            onPress={() => (isSubmission || notif.type === 'property_upload' || isAgentResp) && setShowAgentDetail(true)}
            disabled={!notif.sender?.id && !isAgentResp}
          >
            {notif.sender?.avatar ? (
              <Image source={{ uri: notif.sender.avatar }} style={[detail.sAvatar, isTablet && { width: 70, height: 70, borderRadius: 35 }]} />
            ) : (
              <View style={[detail.sAvatar, isTablet && { width: 70, height: 70, borderRadius: 35 },
              { backgroundColor: T.g600, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: T.white, fontSize: rs(24), fontWeight: '800' }}>
                  {(notif.sender?.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={[detail.sName, { fontSize: rs(16) }]}>{notif.sender?.name || 'Unknown'}</Text>
              <View style={[detail.roleChip, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                <cfg.Icon color={cfg.color} size={rs(11)} strokeWidth={2.5} />
                <Text style={[detail.roleChipTxt, { fontSize: rs(11), color: cfg.color }]}>
                  {notif.sender?.role || 'User'}
                </Text>
              </View>

              {notif.sender?.rating !== undefined && (
                <View style={[detail.agentRow, { flexWrap: 'wrap' }]}>
                  <AgentStars rating={notif.sender.rating} />
                  <Text style={detail.dot2}>·</Text>
                  <Briefcase color={T.n500} size={rs(12)} strokeWidth={2} />
                  <Text style={[detail.agentMeta, { fontSize: rs(12) }]}>{notif.sender.experience} yrs</Text>
                  <Text style={detail.dot2}>·</Text>
                  <TrendingUp color={T.n500} size={rs(12)} strokeWidth={2} />
                  <Text style={[detail.agentMeta, { fontSize: rs(12) }]}>{notif.sender.deals} deals</Text>
                  {notif.sender.spec && (
                    <>
                      <Text style={detail.dot2}>·</Text>
                      <Text style={[detail.agentMeta, { fontSize: rs(12), color: T.g700, fontWeight: '700' }]}>
                        {notif.sender.spec}
                      </Text>
                    </>
                  )}
                </View>
              )}

              {isAgentResp && (
                <>
                  <View style={detail.contactLine}>
                    <Phone color={T.n500} size={rs(13)} strokeWidth={2} />
                    <Text style={[detail.contactTxt, { fontSize: rs(13) }]}>{notif.sender?.phone || 'N/A'}</Text>
                  </View>
                  <View style={detail.contactLine}>
                    <Mail color={T.n500} size={rs(13)} strokeWidth={2} />
                    <Text style={[detail.contactTxt, { fontSize: rs(13) }]}>{notif.sender?.email || 'N/A'}</Text>
                  </View>
                </>
              )}
            </View>
            {(isSubmission || notif.type === 'property_upload' || isAgentResp) && (
              <ChevronRight color={T.n400} size={rs(20)} />
            )}
          </TouchableOpacity>
        </View>

        {isAgentResp && notif.agent_details && (
          <>
            <SectionLabel text="PROFESSIONAL DETAILS" />
            <View style={[detail.msgCard, { borderLeftColor: T.teal, marginBottom: 20 }]}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: T.n500, fontWeight: '600', marginBottom: 2 }}>Specialization</Text>
                  <Text style={{ fontSize: rs(15), fontWeight: '800', color: T.n900 }}>
                    {notif.agent_details.professional_title || 'Real Estate Agent'}
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: T.n200 }} />
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={{ fontSize: 11, color: T.n500, fontWeight: '600', marginBottom: 2 }}>Experience</Text>
                  <Text style={{ fontSize: rs(15), fontWeight: '800', color: T.n900 }}>
                    {notif.agent_details.experience_years || 0} Years
                  </Text>
                </View>
              </View>
              {notif.agent_details.about_me && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: T.n500, fontWeight: '600', marginBottom: 4 }}>About Agent</Text>
                  <Text style={{ fontSize: rs(13), color: T.n600, lineHeight: rs(19) }}>
                    {notif.agent_details.about_me}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ── TIMESTAMP + STATUS ── */}
        <View style={detail.metaBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <CalendarDays color={T.n500} size={rs(14)} strokeWidth={2} />
            <Text style={[detail.metaTxt, { fontSize: rs(12) }]} numberOfLines={2}>{fmtFull(notif.createdAt)}</Text>
          </View>
          <StatusPill status={localStatus} />
        </View>

        {/* ── FULL MESSAGE ── */}
        <SectionLabel text="MESSAGE" />
        <View style={[detail.msgCard, accentColor && { borderLeftColor: accentColor }]}>
          <Text style={[detail.msgTxt, { fontSize: rs(14), lineHeight: rs(23) }]}>{notif.message}</Text>
        </View>

        {/* ── PROPERTY CARD ── */}
        {notif.property && (
          <>
            <SectionLabel text="RELATED PROPERTY" mt={20} />
            <View style={detail.propCard}>
              <Image
                source={{ uri: getImageUrl(notif.property.image) || notif.property.image }}
                style={[detail.propImg, isTablet && { height: 200 }]}
                resizeMode="cover"
              />
              <View style={[detail.propScrim, isTablet && { height: 200 }]} />
              <View style={detail.propTag}>
                <Text style={detail.propTagTxt}>{notif.property.type}</Text>
              </View>
              <View style={detail.propBody}>
                <Text style={[detail.propName, { fontSize: rs(16) }]}>{notif.property.name}</Text>
                <View style={detail.propRow}>
                  <MapPin color={T.n500} size={rs(12)} strokeWidth={2} />
                  <Text style={[detail.propLoc, { fontSize: rs(12) }]}>{notif.property.location}</Text>
                </View>
                <View style={detail.propStat}>
                  <Home color={T.g600} size={rs(12)} strokeWidth={2} />
                  <Text style={[detail.propStatTxt, { fontSize: rs(12) }]}>{notif.property.units} Units</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── SUBMISSION DETAILS ── */}
        {isSubmission && notif.submission && (
          <>
            <SectionLabel text="SUBMISSION DETAILS" mt={20} />
            <View style={detail.infoCard}>
              {[
                { label: 'Listed Price', val: notif.submission.listedPrice, Icon: TrendingUp },
                { label: 'Area per Unit', val: notif.submission.listedArea, Icon: Layers },
                { label: 'Documents Attached', val: `${notif.submission.docsAttached} files`, Icon: FileText },
              ].map(({ label, val, Icon: OI }) => (
                <View key={label} style={detail.infoRow}>
                  <View style={detail.infoIconBox}><OI color={T.g700} size={rs(16)} strokeWidth={2} /></View>
                  <View>
                    <Text style={detail.infoLabel}>{label}</Text>
                    <Text style={[detail.infoVal, { fontSize: rs(15) }]}>{val}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── HIRE OFFER TERMS ── */}
        {isAgentResp && notif.offer && (
          <>
            <SectionLabel text="HIRE TERMS" mt={20} />
            <View style={detail.infoCard}>
              {[
                { label: 'Commission', val: notif.offer.commission, Icon: TrendingUp },
                { label: 'Duration', val: notif.offer.duration, Icon: CalendarDays },
              ].map(({ label, val, Icon: OI }) => (
                <View key={label} style={detail.infoRow}>
                  <View style={detail.infoIconBox}><OI color={T.g700} size={rs(16)} strokeWidth={2} /></View>
                  <View>
                    <Text style={detail.infoLabel}>{label}</Text>
                    <Text style={[detail.infoVal, { fontSize: rs(15) }]}>{val}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── AGENT RESPONSE RESULT BANNER ── */}
        {isAgentResp && (
          <View style={[
            detail.resBanner,
            notif.status === 'accepted'
              ? { backgroundColor: T.g100, borderColor: T.g200 }
              : { backgroundColor: T.redBg, borderColor: T.redBdr },
          ]}>
            {notif.status === 'accepted'
              ? <CheckCircle2 color={T.g700} size={rs(20)} strokeWidth={2.5} />
              : <XCircle color={T.red} size={rs(20)} strokeWidth={2.5} />
            }
            <View style={{ flex: 1 }}>
              <Text style={[detail.resTitle, { fontSize: rs(15), color: notif.status === 'accepted' ? T.g800 : T.red }]}>
                {notif.status === 'accepted' ? 'Request Accepted' : 'Request Declined'}
              </Text>
              <Text style={[detail.resSub, { fontSize: rs(13), color: notif.status === 'accepted' ? T.g700 : T.red }]}>
                {notif.status === 'accepted'
                  ? `${notif.sender.name} has joined your project.`
                  : `${notif.sender.name} is unavailable — consider finding another agent.`}
              </Text>
            </View>
          </View>
        )}

        {/* ── BUILDER ACTION — APPROVE / REJECT SUBMISSION ── */}
        {isSubmission && (
          <>
            <SectionLabel text="BUILDER ACTION" mt={20} />
            {canAct ? (
              <>
                <View style={detail.warnBox}>
                  <AlertTriangle color={T.amber} size={rs(15)} strokeWidth={2} />
                  <Text style={[detail.warnTxt, { fontSize: rs(13) }]}>
                    Approving will publish this listing live on the platform immediately.
                  </Text>
                </View>
                <View style={[detail.actionRow, isTablet && { gap: 16 }]}>
                  <TouchableOpacity
                    style={[detail.rejectBtn, !!actioning && { opacity: 0.55 }]}
                    onPress={() => handleSubmission('reject')}
                    disabled={!!actioning}
                    activeOpacity={0.85}
                  >
                    {actioning === 'reject'
                      ? <ActivityIndicator color={T.red} size="small" />
                      : <><XCircle color={T.red} size={rs(18)} strokeWidth={2.5} />
                        <Text style={[detail.rejectTxt, { fontSize: rs(15) }]}>Reject</Text></>
                    }
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[detail.approveBtn, !!actioning && { opacity: 0.55 }]}
                    onPress={() => handleSubmission('approve')}
                    disabled={!!actioning}
                    activeOpacity={0.85}
                  >
                    {actioning === 'approve'
                      ? <ActivityIndicator color={T.white} size="small" />
                      : <><CheckCircle2 color={T.white} size={rs(18)} strokeWidth={2.5} />
                        <Text style={[detail.approveTxt, { fontSize: rs(15) }]}>Approve Listing</Text></>
                    }
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={[
                detail.resolvedRow,
                localStatus === 'approved'
                  ? { backgroundColor: T.g100, borderColor: T.g200 }
                  : { backgroundColor: T.redBg, borderColor: T.redBdr },
              ]}>
                {localStatus === 'approved'
                  ? <BadgeCheck color={T.g700} size={rs(18)} strokeWidth={2.5} />
                  : <XCircle color={T.red} size={rs(18)} strokeWidth={2.5} />
                }
                <Text style={[detail.resolvedTxt, { fontSize: rs(13), color: localStatus === 'approved' ? T.g800 : T.red }]}>
                  {localStatus === 'approved'
                    ? 'You approved this submission. The listing is now live.'
                    : 'You rejected this submission. The agent has been notified.'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* ── REPLY TO USER INQUIRY ── */}
        {isInquiry && (
          <>
            <SectionLabel text="RESPOND TO INQUIRY" mt={20} />
            <ReplyInput recipientName={notif.sender.name} onSend={handleReply} />
          </>
        )}

        {/* ── CTA BUTTONS ── */}
        <View style={{ gap: isTablet ? 12 : 10, marginTop: isTablet ? 24 : 20 }}>
          {notif.property && (
            <TouchableOpacity
              style={detail.ctaGreen}
              onPress={() => {
                if (navigation && notif._fullProperty) {
                  navigation.navigate('propertyDetail', { property: notif._fullProperty });
                } else {
                  Alert.alert('Property Details', [
                    notif.property.name, notif.property.location, notif.property.type,
                  ].filter(Boolean).join('\n'));
                }
              }}
              activeOpacity={0.85}
            >
              <Building2 color={T.g800} size={rs(17)} strokeWidth={2.5} />
              <Text style={[detail.ctaGreenTxt, { fontSize: rs(14) }]}>View Property Details</Text>
              <ChevronRight color={T.g800} size={rs(17)} strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {!isInquiry && notif.sender && (
            <TouchableOpacity
              style={detail.ctaNeutral}
              onPress={() => setShowAgentDetail(true)}
              activeOpacity={0.85}
            >
              <UserCheck color={T.g700} size={rs(17)} strokeWidth={2.5} />
              <Text style={[detail.ctaNeutralTxt, { fontSize: rs(14) }]}>View Agent Profile</Text>
              <ChevronRight color={T.g700} size={rs(17)} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════
   STYLES — List Cards
══════════════════════════════════════════════════════════ */
const listS = StyleSheet.create({
  container: { paddingTop: 8, paddingBottom: 36 },
  card: {
    backgroundColor: T.white, borderRadius: 18, overflow: 'hidden',
    elevation: 2, shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8,
  },
  unread: {
    backgroundColor: '#FAFFFD',
    elevation: 4,
    shadowColor: 'rgba(27,94,59,0.18)',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10,
  },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  inner: { flexDirection: 'row' },
  avatar: { borderWidth: 2, borderColor: T.n200 },
  typeIcon: {
    position: 'absolute', bottom: -3, right: -4,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: T.white,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  senderName: { fontWeight: '800', color: T.n900, flex: 1, letterSpacing: -0.2 },
  time: { color: T.n400, marginLeft: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  roleLabel: { color: T.n500, fontWeight: '500' },
  summary: { color: T.n600, marginBottom: 8 },
  summaryBold: { color: T.n800, fontWeight: '600' },
  propHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  propHintTxt: { color: T.g700, fontWeight: '600' },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.g600 },
});

/* ══════════════════════════════════════════════════════════
   STYLES — Detail
══════════════════════════════════════════════════════════ */
const detail = StyleSheet.create({
  scroll: { paddingBottom: 24 },
  hPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20,
  },
  hPillTxt: { fontWeight: '700' },

  senderCard: {
    flexDirection: 'row', gap: 14, backgroundColor: T.white, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: T.n200, elevation: 2, shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
    marginBottom: 14, overflow: 'hidden',
  },
  sAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, borderColor: T.g400 },
  sName: { fontWeight: '800', color: T.n900, letterSpacing: -0.3, marginBottom: 6 },
  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 8,
  },
  roleChipTxt: { fontWeight: '700' },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  dot2: { color: T.n400, fontSize: 12 },
  agentMeta: { color: T.n500 },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  contactTxt: { color: T.n600 },

  metaBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: T.white, borderRadius: 12, padding: 12, borderWidth: 1,
    borderColor: T.n200, marginBottom: 20,
  },
  metaTxt: { color: T.n600, flex: 1 },

  msgCard: {
    backgroundColor: T.white, borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: T.n200, borderLeftWidth: 4, borderLeftColor: T.g600,
    marginBottom: 4,
  },
  msgTxt: { color: T.n700 },

  propCard: {
    borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: T.shadow,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8,
  },
  propImg: { width: '100%', height: 155 },
  propScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 155, backgroundColor: 'rgba(0,0,0,0.08)' },
  propTag: {
    position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(27,94,59,0.85)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  propTagTxt: { color: T.white, fontSize: 11, fontWeight: '700' },
  propBody: { backgroundColor: T.white, padding: 14 },
  propName: { fontWeight: '800', color: T.n900, marginBottom: 4 },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  propLoc: { color: T.n500 },
  propStat: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: T.g100, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start',
  },
  propStatTxt: { fontWeight: '600', color: T.g700 },

  infoCard: { backgroundColor: T.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: T.g200, gap: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: T.g100, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 11, color: T.n500, fontWeight: '500', marginBottom: 2 },
  infoVal: { fontWeight: '800', color: T.n900 },

  resBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 16, borderRadius: 16, borderWidth: 1.5, marginTop: 20,
  },
  resTitle: { fontWeight: '800', marginBottom: 3 },
  resSub: { fontWeight: '500', lineHeight: 18 },

  warnBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: T.amberBg, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: T.amberBdr, marginBottom: 14,
  },
  warnTxt: { flex: 1, color: '#92400E', lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 12 },
  rejectBtn: {
    flex: 0.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: T.redBg, borderWidth: 2, borderColor: T.redBdr,
    borderRadius: 14, paddingVertical: 14,
  },
  rejectTxt: { color: T.red, fontWeight: '700' },
  approveBtn: {
    flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: T.g800, borderRadius: 14, paddingVertical: 14,
    elevation: 4, shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 6,
  },
  approveTxt: { color: T.white, fontWeight: '700' },
  resolvedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  resolvedTxt: { flex: 1, fontWeight: '600', lineHeight: 18 },

  ctaGreen: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.g100, borderWidth: 2, borderColor: T.g200, borderRadius: 14, padding: 16,
  },
  ctaGreenTxt: { flex: 1, fontWeight: '700', color: T.g800 },
  ctaNeutral: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.white, borderWidth: 2, borderColor: T.n200, borderRadius: 14, padding: 16,
  },
  ctaNeutralTxt: { flex: 1, fontWeight: '600', color: T.g700 },
});

/* ══════════════════════════════════════════════════════════
   STYLES — Global / Shared
══════════════════════════════════════════════════════════ */
const g = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.g50 },

  // Search + filter grouped container
  topBar: {
    backgroundColor: T.white,
    paddingTop: 14,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: T.n200,
    // Subtle shadow to separate from list
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Search box — border changes via prop (no native focus ring)
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.n100,
    borderWidth: 1.5, borderColor: T.n200,
    borderRadius: 14, paddingHorizontal: 14, height: 46,
  },
  searchBoxFocused: {
    backgroundColor: T.white,
    borderColor: T.g600,
    shadowColor: 'rgba(27,94,59,0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1, color: T.n900, height: '100%',
    // Prevent native Android blue underline/border
    underlineColorAndroid: 'transparent',
  },
  searchClear: { padding: 2 },
  searchClearInner: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: T.n300,
    justifyContent: 'center', alignItems: 'center',
  },

  chips: { gap: 8, alignItems: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24,
    backgroundColor: T.n100,
    borderWidth: 1.5, borderColor: T.n200,
  },
  chipOn: {
    backgroundColor: T.g800, borderColor: T.g800,
    shadowColor: 'rgba(27,94,59,0.3)',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6,
    elevation: 4,
  },
  chipTxt: { fontWeight: '600', color: T.n600 },
  chipTxtOn: { color: T.white },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.g600 },
  chipDotOn: { backgroundColor: T.white },
  chipNum: {
    backgroundColor: T.g200, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
  },
  chipNumOn: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipNumTxt: { fontSize: 10, fontWeight: '800', color: T.g700 },
  chipNumTxtOn: { color: T.white },

  empty: { alignItems: 'center', gap: 14 },
  emptyIconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: T.g100,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  emptyH: { fontWeight: '800', color: T.n600 },
  emptySub: { color: T.n400, textAlign: 'center', paddingHorizontal: 32 },
});

/* ══════════════════════════════════════════════════════════
   STYLES — Menu
══════════════════════════════════════════════════════════ */
const menu = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' },
  box: {
    position: 'absolute', right: 16, backgroundColor: T.white, borderRadius: 18,
    elevation: 12, shadowColor: 'rgba(0,0,0,0.18)',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 16,
    minWidth: 240, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 15 },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: T.g100, justifyContent: 'center', alignItems: 'center',
  },
  rowTxt: { fontWeight: '600', color: T.n700 },
  div: { height: 1, backgroundColor: T.n200 },
});

/* ══════════════════════════════════════════════════════════
   ROOT EXPORT  — wires list ↔ detail
══════════════════════════════════════════════════════════ */
export default function BuilderNotificationsScreen({ navigation, onBack }) {
  const [notifs, setNotifs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const { rs, isTablet } = useResponsive();

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
          type: n.type || 'property_submission',
          read: n.isRead,
          createdAt: n.createdAt,
          status: 'pending',
          relatedEntityId: n.relatedEntityId,
          sender: {
            name: (n.type === 'hire_response' || n.type === 'agent_hire_response') ? 'Agent' : (n.title || 'User'),
            role: n.type === 'user_inquiry' ? 'Buyer' : 'Agent',
            avatar: null,
            email: '',
            phone: '',
          },
          summary: n.body || n.title || '',
          message: n.body || '',
          property: null,
          offer: null,
          submission: null,
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
    const isSubmission = notif.type === 'property_submission';
    const isUpload = notif.type === 'property_upload';

    if ((isSubmission || isUpload) && notif.relatedEntityId) {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const resp = await fetch(`${API_BASE_URL}/property-requests/${notif.relatedEntityId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await resp.json();
          if (data.success && data.request) {
            const r = data.request;
            const coverImage = r.property?.images?.[0];
            const imageUrl = coverImage && coverImage.startsWith('http')
              ? coverImage
              : coverImage ? `${API_BASE_URL.replace('/api', '')}${coverImage}` : null;

            let summaryText = enriched.summary;
            let messageText = r.property?.description || enriched.message;

            if (isSubmission) {
              summaryText = `${r.agent?.name || 'Agent'} submitted "${r.property?.title || 'property'}" for your approval.`;
            } else if (isUpload) {
              summaryText = `Your agent has uploaded this property on your behalf.`;
              messageText = `Your agent has uploaded this property on your behalf.`;
            }

            enriched = {
              ...enriched,
              status: r.status || enriched.status,
              sender: {
                id: r.agent?.id || enriched.sender?.id,
                name: r.agent?.name || enriched.sender?.name,
                role: 'Agent',
                avatar: r.agent?.profile_image ? getImageUrl(r.agent.profile_image) : null,
                email: r.agent?.email || '',
                phone: r.agent?.phone || '',
              },
              summary: summaryText,
              message: messageText,
              property: r.property ? {
                id: r.property.id,
                name: r.property.title,
                location: [r.property.address, r.property.city, r.property.state].filter(Boolean).join(', '),
                type: r.property.listing_type || 'Residential',
                units: r.property.bedrooms || 0,
                price: r.property.price,
                city: r.property.city,
                image: imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
              } : null,
              submission: {
                listedPrice: r.property?.price ? `₹${Number(r.property.price).toLocaleString('en-IN')}` : 'N/A',
                listedArea: r.property?.area_sqft ? `${r.property.area_sqft} sq ft` : 'N/A',
                docsAttached: r.property?.images?.length || 0,
              },
              _fullProperty: r.property ? {
                ...r.property,
                images: (r.property.images || []).map(img =>
                  img && img.startsWith('http') ? img : img ? `${API_BASE_URL.replace('/api', '')}${img}` : null
                ).filter(Boolean),
                agent: r.agent,
              } : null,
            };
          }
        }
      } catch (err) {
        console.error('Failed to fetch property request details:', err);
      }
    } else if (notif.type === 'hire_response' && notif.relatedEntityId) {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const resp = await fetch(`${API_BASE_URL}/builder/hire-requests/${notif.relatedEntityId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await resp.json();
          if (data.success && data.request) {
            const r = data.request;
            enriched = {
              ...enriched,
              status: r.status || enriched.status,
              agent_details: r,
              sender: {
                id: r.agent_id,
                name: r.agent_name,
                role: 'Agent',
                avatar: r.agent_avatar ? getImageUrl(r.agent_avatar) : null,
                email: r.agent_email || '',
                phone: r.agent_phone || '',
                specialization: r.professional_title || '',
                experience: r.experience_years || 0,
                about: r.about_me || '',
                city: r.agent_city || '',
              },
            };
          }
        }
      } catch (err) {
        console.error('Failed to fetch hire response details:', err);
      }
    }
    setSelected(enriched);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
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
      <View style={[g.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{
          width: 80, height: 80, borderRadius: 24, backgroundColor: T.g100,
          justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        }}>
          <ActivityIndicator size="large" color={T.g800} />
        </View>
        <Text style={{ fontSize: rs(15), color: T.n500, fontWeight: '500' }}>
          Loading notifications…
        </Text>
      </View>
    );
  }

  if (selected) {
    return (
      <NotificationDetail
        notif={selected}
        onBack={() => setSelected(null)}
        onAction={handleAction}
        navigation={navigation}
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