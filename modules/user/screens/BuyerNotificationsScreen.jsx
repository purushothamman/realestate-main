/**
 * BuyerNotificationsScreen.jsx
 *
 * Buyer-facing notification centre.
 *
 * Notification types:
 *   agent_message    – Agent replied to / initiated a property inquiry
 *   builder_message  – Builder broadcast or direct message to the Buyer
 *   deal_closed      – A property deal is officially marked "Closed" 🎉
 *
 * Architecture (single file):
 *   BuyerNotificationsScreen  ← root, owns all state
 *     ├── NotificationList    ← filterable / searchable list with unread highlights
 *     └── NotificationDetail  ← full card + contextual navigation CTAs
 *
 * Theme : Forest green #1B5E3B + white  (matches the app system)
 *         Gold #D97706 reserved exclusively for "Deal Closed" moments.
 *
 * Focus-safe: no TextInput re-renders during typing (onBlur-commit).
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getImageUrl } from '../../../utils/api';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  FlatList, ScrollView, Image, Modal, Alert,
  Platform, StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft, BellOff, Search, X, CheckCheck, Filter,
  ChevronRight, Building2, MapPin, Phone, Mail, Clock,
  Home, MessageSquare, Star, Briefcase, Key, Sparkles,
  FileText, Layers, CalendarDays, BadgeCheck, TrendingUp,
  UserCheck, MessageCircle, MoreVertical,
} from 'lucide-react-native';

const { height: SH } = Dimensions.get('window');

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
  // Semantic
  blue: '#3B82F6', blueBg: '#EFF6FF', blueBdr: '#BFDBFE',
  teal: '#0D9488', tealBg: '#F0FDFA', tealBdr: '#99F6E4',
  gold: '#D97706', goldBg: '#FEF3C7', goldBdr: '#FDE68A', goldDeep: '#92400E',
  red: '#EF4444', redBg: '#FEF2F2',
  shadow: 'rgba(27,94,59,0.12)',
  shadowGold: 'rgba(217,119,6,0.20)',
};

/* ══════════════════════════════════════════════════════════
   MOCK DATA  (6 realistic notifications)
══════════════════════════════════════════════════════════ */
const SEED = [
  {
    id: 'b1', type: 'agent_message', read: false,
    createdAt: '2025-02-23T11:00:00Z',
    sender: {
      name: 'Priya Sharma', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=47',
      phone: '9876543210', email: 'priya@realty.com',
      rating: 4.8, experience: 7, spec: 'Residential',
    },
    summary: 'Priya replied to your Emerald Heights inquiry',
    message: 'Hi! Thank you for your interest in Emerald Heights. We have 4 units available in 2 BHK on floors 9–12, starting at ₹1.85 Cr with a 40:20:40 payment plan. I can arrange a site visit this Saturday or Sunday — which works better for you?',
    prevMsg: 'Your message: "Interested in 2 BHK, budget ₹1.8–2.1 Cr. Please share availability and visit slot."',
    property: { name: 'Emerald Heights', location: 'Andheri East, Mumbai', type: 'Residential', units: 36, status: 'Active', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' },
    nav: { chatLabel: 'Open Chat', propertyLabel: 'View Property' },
  },
  {
    id: 'b2', type: 'builder_message', read: false,
    createdAt: '2025-02-23T09:15:00Z',
    sender: {
      name: 'Skyline Developers', role: 'Builder',
      avatar: 'https://i.pravatar.cc/150?img=14',
      phone: '9823001122', email: 'info@skylinedev.com',
    },
    summary: 'Early-bird offer launched — 5% off + free parking',
    message: 'Dear Buyer, we are excited to announce an exclusive early-bird offer for Skyline Commercial Hub, Powai. Book any unit before 15th March 2025 and enjoy a 5% discount on the base price plus complimentary parking for Year 1. Units are going fast — contact our sales team today!',
    prevMsg: null,
    property: { name: 'Skyline Commercial Hub', location: 'Powai, Mumbai', type: 'Commercial', units: 8, status: 'Active', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80' },
    nav: { chatLabel: 'Contact Builder', propertyLabel: 'View Property' },
  },
  {
    id: 'b3', type: 'deal_closed', read: false,
    createdAt: '2025-02-22T16:45:00Z',
    sender: {
      name: 'Palm Developers Ltd.', role: 'Builder',
      avatar: 'https://i.pravatar.cc/150?img=22',
      phone: '9988776655', email: 'ops@palmdev.com',
    },
    summary: '🎉 Your Palm Springs Villa deal is officially Closed!',
    message: 'We are delighted to confirm that the purchase agreement for Villa Unit 3-B at Palm Springs Villa, Juhu has been successfully executed. Your possession date is 15 June 2025. Our team will reach out within 48 hours to walk you through registration and handover.',
    prevMsg: null,
    property: { name: 'Palm Springs Villa', location: 'Juhu, Mumbai', type: 'Residential', units: 6, status: 'Closed', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
    deal: { unitNo: 'Villa 3-B', area: '4,800 sq ft', finalPrice: '₹6.2 Cr', possession: '15 June 2025', regStatus: 'Pending' },
    nav: { propertyLabel: 'View Deal Details' },
  },
  {
    id: 'b4', type: 'agent_message', read: true,
    createdAt: '2025-02-22T14:10:00Z',
    sender: {
      name: 'Rahul Verma', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=12',
      phone: '9823456789', email: 'rahul@realty.com',
      rating: 4.5, experience: 5, spec: 'Commercial',
    },
    summary: 'Site visit confirmed for Saturday 10 AM at Skyline Hub',
    message: 'Your site visit for Skyline Commercial Hub is confirmed for this Saturday at 10:00 AM. Please arrive at the main gate on Link Road, Powai. I will personally give you a tour. Carry a valid photo ID. Looking forward to meeting you!',
    prevMsg: 'Your message: "Can we schedule a visit this weekend?"',
    property: { name: 'Skyline Commercial Hub', location: 'Powai, Mumbai', type: 'Commercial', units: 8, status: 'Active', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80' },
    nav: { chatLabel: 'Open Chat', propertyLabel: 'View Property' },
  },
  {
    id: 'b5', type: 'builder_message', read: true,
    createdAt: '2025-02-21T10:30:00Z',
    sender: {
      name: 'Ravi Constructions', role: 'Builder',
      avatar: 'https://i.pravatar.cc/150?img=57',
      phone: '9876500000', email: 'ravi@raviconstructions.com',
    },
    summary: 'Greenfield Villas is now RERA-approved — all docs live',
    message: 'We are pleased to inform you that Greenfield Villas has received its RERA registration (MahaRERA No: P51900045678). All project documents are now available on our website. The project remains on schedule for possession by December 2025.',
    prevMsg: null,
    property: { name: 'Greenfield Villas', location: 'Bandra West, Mumbai', type: 'Residential', units: 32, status: 'Active', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80' },
    nav: { propertyLabel: 'View Property' },
  },
  {
    id: 'b6', type: 'deal_closed', read: true,
    createdAt: '2025-02-18T09:00:00Z',
    sender: {
      name: 'Kavita Nair', role: 'Agent',
      avatar: 'https://i.pravatar.cc/150?img=25',
      phone: '9654321098', email: 'kavita@realty.com',
      rating: 4.3, experience: 4, spec: 'Mixed Use',
    },
    summary: '🎉 Harbor View Plaza Unit 2A deal is now Closed!',
    message: 'Congratulations on closing the deal for Unit 2A at Harbor View Plaza, Worli! The agreement has been signed by all parties. Your next step is property registration at the sub-registrar office. I will guide you through the entire registration process — please call me when you are ready.',
    prevMsg: null,
    property: { name: 'Harbor View Plaza', location: 'Worli, Mumbai', type: 'Mixed Use', units: 12, status: 'Closed', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80' },
    deal: { unitNo: 'Unit 2A', area: '2,200 sq ft', finalPrice: '₹3.8 Cr', possession: '1 April 2025', regStatus: 'In Progress' },
    nav: { chatLabel: 'Contact Agent', propertyLabel: 'View Deal Details' },
  },
];

/* ══════════════════════════════════════════════════════════
   TYPE CONFIG
══════════════════════════════════════════════════════════ */
const TYPE = {
  agent_message: { label: 'Agent Message', Icon: MessageCircle, color: T.blue, bg: T.blueBg, border: T.blueBdr },
  builder_message: { label: 'Builder Message', Icon: Building2, color: T.teal, bg: T.tealBg, border: T.tealBdr },
  buyer_message: { label: 'New Message', Icon: MessageCircle, color: T.blue, bg: T.blueBg, border: T.blueBdr },
  deal_closed: { label: 'Deal Closed', Icon: Key, color: T.gold, bg: T.goldBg, border: T.goldBdr },
  _default: { label: 'Notification', Icon: MessageSquare, color: T.n500, bg: T.n100, border: T.n200 },
};

const FILTERS = ['All', 'Unread', 'Messages', 'Deal Closed'];

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
   ATOMS
══════════════════════════════════════════════════════════ */
const TypeBadge = ({ type }) => {
  const c = TYPE[type] || TYPE._default;
  return (
    <View style={[at.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <c.Icon color={c.color} size={10} strokeWidth={2.5} />
      <Text style={[at.badgeTxt, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const SLabel = ({ text, mt = 0 }) => (
  <Text style={[at.slbl, mt && { marginTop: mt }]}>{text}</Text>
);

const AgentStars = ({ rating }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <Star color={T.gold} fill={T.gold} size={12} strokeWidth={0} />
    <Text style={{ fontSize: 12, fontWeight: '700', color: T.n700 }}>{rating.toFixed(1)}</Text>
  </View>
);

const at = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  badgeTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  slbl: { fontSize: 10, fontWeight: '800', color: T.n400, letterSpacing: 1.5, marginBottom: 10 },
});

/* ══════════════════════════════════════════════════════════
   DEAL-CLOSED HERO  (celebratory gold card)
══════════════════════════════════════════════════════════ */
function DealHero({ deal }) {
  const rows = [
    { label: 'Unit', val: deal.unitNo, Icon: Home },
    { label: 'Total Area', val: deal.area, Icon: Layers },
    { label: 'Final Price', val: deal.finalPrice, Icon: TrendingUp },
    { label: 'Possession', val: deal.possession, Icon: CalendarDays },
    { label: 'Registration', val: deal.regStatus, Icon: BadgeCheck },
  ];
  return (
    <View style={dh.card}>
      {/* Banner */}
      <View style={dh.banner}>
        <View style={dh.keyRing}>
          <Key color={T.gold} size={26} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={dh.banTitle}>Deal Successfully Closed!</Text>
          <Text style={dh.banSub}>Congratulations on your property</Text>
        </View>
        <Sparkles color={T.gold} size={22} strokeWidth={2} />
      </View>
      {/* Stats grid */}
      <View style={dh.grid}>
        {rows.map(({ label, val, Icon: I }, i) => (
          <View key={label} style={[dh.cell, i === rows.length - 1 && dh.cellFull]}>
            <View style={dh.cellIcon}><I color={T.gold} size={14} strokeWidth={2} /></View>
            <View>
              <Text style={dh.cellLabel}>{label}</Text>
              <Text style={dh.cellVal}>{val}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const dh = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden', marginBottom: 4, elevation: 5, shadowColor: T.shadowGold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
  banner: { backgroundColor: T.goldBg, borderWidth: 2, borderColor: T.goldBdr, borderBottomWidth: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  keyRing: { width: 52, height: 52, borderRadius: 26, backgroundColor: T.white, borderWidth: 2.5, borderColor: T.goldBdr, justifyContent: 'center', alignItems: 'center' },
  banTitle: { fontSize: 16, fontWeight: '800', color: T.gold, letterSpacing: -0.3 },
  banSub: { fontSize: 12, color: T.goldDeep, marginTop: 2, fontWeight: '500' },
  grid: { backgroundColor: T.white, borderWidth: 2, borderColor: T.goldBdr, borderTopWidth: 0, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '46%', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cellFull: { width: '100%' },
  cellIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: T.goldBg, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  cellLabel: { fontSize: 10, color: T.n500, fontWeight: '600', marginBottom: 2 },
  cellVal: { fontSize: 14, fontWeight: '800', color: T.n900 },
});

/* ══════════════════════════════════════════════════════════
   SHARED HEADER
══════════════════════════════════════════════════════════ */
function PageHeader({ title, subtitle, onBack, right, unread }) {
  return (
    <View style={ph.bar}>
      <TouchableOpacity style={ph.iconBtn} onPress={onBack} activeOpacity={0.7}>
        <ArrowLeft color={T.white} size={22} strokeWidth={2.5} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={ph.title}>{title}</Text>
        {subtitle ? <Text style={ph.sub}>{subtitle}</Text> : null}
      </View>
      {right}
      {unread > 0 && (
        <View style={ph.badge}>
          <Text style={ph.badgeTxt}>{unread}</Text>
        </View>
      )}
    </View>
  );
}

const ph = StyleSheet.create({
  bar: { backgroundColor: T.g800, paddingTop: Platform.OS === 'ios' ? 58 : 28, paddingBottom: 22, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: T.white, letterSpacing: -0.4 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  badge: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 26, right: 10, backgroundColor: T.red, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: T.g800 },
  badgeTxt: { fontSize: 9, fontWeight: '900', color: T.white },
});

/* ══════════════════════════════════════════════════════════
   LIST VIEW
══════════════════════════════════════════════════════════ */
function NotificationList({ notifs, onOpen, onMarkAllRead, onBack }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const unread = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);
  const deals = useMemo(() => notifs.filter(n => n.type === 'deal_closed').length, [notifs]);

  const filtered = useMemo(() => {
    let list = notifs;
    if (filter === 'Unread') list = list.filter(n => !n.read);
    else if (filter === 'Messages') list = list.filter(n => n.type === 'agent_message' || n.type === 'builder_message' || n.type === 'buyer_message');
    else if (filter === 'Deal Closed') list = list.filter(n => n.type === 'deal_closed');
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
    const cfg = TYPE[item.type] || TYPE._default;
    const isDeal = item.type === 'deal_closed';

    // Left-stripe colour logic
    const stripeColor = isDeal
      ? T.gold
      : (!item.read ? T.g600 : null);

    return (
      <TouchableOpacity
        style={[lv.card, !item.read && lv.cardUnread, isDeal && lv.cardDeal]}
        onPress={() => onOpen(item)}
        activeOpacity={0.86}
      >
        {stripeColor && <View style={[lv.stripe, { backgroundColor: stripeColor }]} />}

        <View style={lv.row}>
          {/* Avatar + type-icon overlay */}
          <View>
            {item.sender?.avatar ? (
              <Image source={{ uri: item.sender.avatar }} style={[lv.avatar, isDeal && lv.avatarDeal]} />
            ) : (
              <View style={[lv.avatar, isDeal && lv.avatarDeal, { backgroundColor: T.g600, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: T.white, fontSize: 20, fontWeight: '800' }}>
                  {(item.sender?.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[lv.typeChip, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <cfg.Icon color={cfg.color} size={11} strokeWidth={2.5} />
            </View>
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            {/* Name + time */}
            <View style={lv.topRow}>
              <Text style={lv.name} numberOfLines={1}>{item.sender.name}</Text>
              <Text style={lv.time}>{fmtRel(item.createdAt)}</Text>
            </View>

            {/* Type badge + role */}
            <View style={lv.metaRow}>
              <TypeBadge type={item.type} />
              <Text style={lv.roleLabel}>{item.sender.role}</Text>
            </View>

            {/* Summary */}
            <Text
              style={[lv.summary, !item.read && lv.summaryBold, isDeal && lv.summaryDeal]}
              numberOfLines={2}
            >
              {item.summary}
            </Text>

            {/* Property hint */}
            {item.property && (
              <View style={lv.propRow}>
                <Home color={isDeal ? T.gold : T.g600} size={11} strokeWidth={2} />
                <Text style={[lv.propTxt, isDeal && { color: T.gold }]} numberOfLines={1}>
                  {item.property.name}
                </Text>
                {isDeal && (
                  <View style={lv.soldTag}>
                    <Text style={lv.soldTagTxt}>SOLD</Text>
                  </View>
                )}
              </View>
            )}

            {/* Footer */}
            <View style={lv.foot}>
              {isDeal
                ? <View style={lv.dealFoot}><Key color={T.gold} size={11} strokeWidth={2.5} /><Text style={lv.dealFootTxt}>Tap to view details</Text></View>
                : <View style={lv.msgFoot}><MessageCircle color={T.g600} size={11} strokeWidth={2} /><Text style={lv.msgFootTxt}>Tap to open</Text></View>
              }
              {!item.read && <View style={lv.unreadDot} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={gs.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} new` : 'All caught up'}
        onBack={onBack}
        unread={unread}
        right={
          <TouchableOpacity style={ph.iconBtn} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
            <MoreVertical color={T.white} size={22} strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      {/* Search bar */}
      <View style={gs.searchWrap}>
        <View style={gs.searchBox}>
          <Search color={T.n500} size={16} strokeWidth={2} />
          <TextInput
            style={gs.searchInput}
            placeholder="Search notifications…"
            placeholderTextColor={T.n500}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X color={T.n500} size={15} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={gs.chips}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[gs.chip, filter === f && gs.chipOn]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            {f === 'Unread' && unread > 0 && <View style={[gs.chipDot, filter === f && gs.chipDotOn]} />}
            <Text style={[gs.chipTxt, filter === f && gs.chipTxtOn]}>{f}</Text>
            {f === 'Unread' && unread > 0 && (
              <View style={[gs.chipBadge, filter === f && gs.chipBadgeOn]}>
                <Text style={[gs.chipBadgeTxt, filter === f && gs.chipBadgeTxtOn]}>{unread}</Text>
              </View>
            )}
            {f === 'Deal Closed' && deals > 0 && (
              <View style={[gs.chipBadge, { backgroundColor: T.goldBg, borderWidth: 1, borderColor: T.goldBdr }, filter === f && gs.chipBadgeOn]}>
                <Text style={[gs.chipBadgeTxt, { color: T.gold }, filter === f && gs.chipBadgeTxtOn]}>{deals}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Deal count banner when deals exist */}
      {deals > 0 && (
        <View style={lv.dealBanner}>
          <Key color={T.gold} size={14} strokeWidth={2.5} />
          <Text style={lv.dealBannerTxt}>
            {deals} deal{deals > 1 ? 's' : ''} closed — tap to view your property
          </Text>
          <Sparkles color={T.gold} size={14} strokeWidth={2} />
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={lv.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={gs.empty}>
            <BellOff color={T.n300} size={56} strokeWidth={1.5} />
            <Text style={gs.emptyH}>No notifications</Text>
            <Text style={gs.emptySub}>
              {search ? 'No results match your search' : "You're all caught up!"}
            </Text>
          </View>
        }
      />

      {/* Options menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={mn.bg} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={mn.box}>
            <TouchableOpacity style={mn.row} activeOpacity={0.8}
              onPress={() => { onMarkAllRead(); setMenuOpen(false); }}>
              <CheckCheck color={T.g700} size={18} strokeWidth={2} />
              <Text style={mn.rowTxt}>Mark all as read</Text>
            </TouchableOpacity>
            <View style={mn.div} />
            <TouchableOpacity style={mn.row} activeOpacity={0.8} onPress={() => setMenuOpen(false)}>
              <Filter color={T.n600} size={18} strokeWidth={2} />
              <Text style={mn.rowTxt}>Notification preferences</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const lv = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 36 },
  card: { backgroundColor: T.white, borderRadius: 18, overflow: 'hidden', elevation: 2, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
  cardUnread: { backgroundColor: '#FAFFFD', elevation: 4 },
  cardDeal: { borderWidth: 1.5, borderColor: T.goldBdr, elevation: 5, shadowColor: T.shadowGold, shadowRadius: 10 },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  row: { flexDirection: 'row', padding: 16, gap: 13 },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: T.n200 },
  avatarDeal: { borderColor: T.goldBdr, borderWidth: 2.5 },
  typeChip: { position: 'absolute', bottom: -3, right: -4, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: T.white },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  name: { fontSize: 14, fontWeight: '800', color: T.n900, flex: 1, letterSpacing: -0.2 },
  time: { fontSize: 11, color: T.n400, marginLeft: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  roleLabel: { fontSize: 11, color: T.n500, fontWeight: '500' },
  summary: { fontSize: 13, color: T.n600, lineHeight: 18, marginBottom: 8 },
  summaryBold: { color: T.n800, fontWeight: '600' },
  summaryDeal: { color: T.goldDeep, fontWeight: '700' },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  propTxt: { fontSize: 11, color: T.g700, fontWeight: '600' },
  soldTag: { marginLeft: 4, backgroundColor: T.goldBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: T.goldBdr },
  soldTagTxt: { fontSize: 9, fontWeight: '800', color: T.gold },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.g600 },
  msgFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.g100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  msgFootTxt: { fontSize: 10, color: T.g700, fontWeight: '600' },
  dealFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.goldBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: T.goldBdr },
  dealFootTxt: { fontSize: 10, color: T.gold, fontWeight: '700' },
  dealBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: T.goldBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: T.goldBdr },
  dealBannerTxt: { flex: 1, fontSize: 12, color: T.goldDeep, fontWeight: '700' },
});

/* ══════════════════════════════════════════════════════════
   DETAIL VIEW
══════════════════════════════════════════════════════════ */
function NotificationDetail({ notif, onBack, navigation }) {
  const cfg = TYPE[notif.type] || TYPE._default;
  const isDeal = notif.type === 'deal_closed';
  const isAgent = notif.type === 'agent_message' || notif.type === 'buyer_message';

  const accentColor = isDeal ? T.gold : (isAgent ? T.blue : T.teal);

  const navigate = (action) => {
    if (action === 'chat' && notif.chatId && navigation) {
      navigation.navigate('chat', {
        chatId: notif.chatId,
        inquiryId: notif.inquiryId
      });
      return;
    }
    if (action === 'property' && notif.property?.id && navigation) {
      navigation.navigate('propertyDetail', { property: notif.property });
      return;
    }
    const msgs = {
      chat: `Opening ${isAgent ? 'chat' : 'contact'} with ${notif.sender?.name || 'user'}…`,
      property: `Opening ${notif.property?.name ?? notif.property?.title ?? 'property details'}…`,
      call: `Calling ${notif.sender?.name || 'user'} at ${notif.sender?.phone || 'N/A'}…`,
    };
    Alert.alert('Navigate', msgs[action] ?? 'Navigating…');
  };

  return (
    <View style={gs.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      <PageHeader
        title="Notification Detail"
        subtitle={cfg.label}
        onBack={onBack}
        right={
          <View style={[dv.hPill, { backgroundColor: cfg.bg, borderColor: cfg.border, borderWidth: 1 }]}>
            <cfg.Icon color={cfg.color} size={13} strokeWidth={2.5} />
            <Text style={[dv.hPillTxt, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={dv.scroll} showsVerticalScrollIndicator={false}>

        {/* ── DEAL HERO CARD ── */}
        {isDeal && notif.deal && (
          <>
            <SLabel text="DEAL SUMMARY" />
            <DealHero deal={notif.deal} />
          </>
        )}

        {/* ── SENDER CARD ── */}
        <SLabel text={isAgent ? 'FROM YOUR AGENT' : 'FROM BUILDER'} mt={isDeal ? 20 : 0} />
        <View style={[dv.senderCard, { borderLeftColor: accentColor, borderLeftWidth: 4 }]}>
          {notif.sender?.avatar ? (
            <Image source={{ uri: notif.sender.avatar }} style={dv.sAvatar} />
          ) : (
            <View style={[dv.sAvatar, { backgroundColor: T.g600, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: T.white, fontSize: 24, fontWeight: '800' }}>
                {(notif.sender?.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={dv.sName}>{notif.sender?.name || 'Unknown'}</Text>
            <View style={[dv.roleChip, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <cfg.Icon color={cfg.color} size={11} strokeWidth={2.5} />
              <Text style={[dv.roleChipTxt, { color: cfg.color }]}>{notif.sender?.role || 'User'}</Text>
            </View>
            {isAgent && notif.sender?.rating !== undefined && (
              <View style={dv.statsRow}>
                <AgentStars rating={notif.sender.rating} />
                <Text style={dv.statSep}>·</Text>
                <Briefcase color={T.n500} size={12} strokeWidth={2} />
                <Text style={dv.statTxt}>{notif.sender.experience} yrs</Text>
                <Text style={dv.statSep}>·</Text>
                <Text style={[dv.statTxt, { color: T.g700, fontWeight: '700' }]}>{notif.sender.spec}</Text>
              </View>
            )}
            {notif.sender?.phone ? (
              <View style={dv.contactLine}>
                <Phone color={T.n500} size={13} strokeWidth={2} />
                <Text style={dv.contactTxt}>{notif.sender.phone}</Text>
              </View>
            ) : null}
            {notif.sender?.email ? (
              <View style={dv.contactLine}>
                <Mail color={T.n500} size={13} strokeWidth={2} />
                <Text style={dv.contactTxt}>{notif.sender.email}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── TIMESTAMP BAR ── */}
        <View style={dv.metaBar}>
          <CalendarDays color={T.n500} size={14} strokeWidth={2} />
          <Text style={dv.metaTxt} numberOfLines={2}>{fmtFull(notif.createdAt)}</Text>
          {isDeal && (
            <View style={[dv.statusPill, { backgroundColor: T.goldBg }]}>
              <Key color={T.gold} size={11} strokeWidth={2.5} />
              <Text style={[dv.statusTxt, { color: T.gold }]}>Closed</Text>
            </View>
          )}
        </View>

        {/* ── ORIGINAL MESSAGE CONTEXT ── */}
        {notif.prevMsg && (
          <>
            <SLabel text="YOUR ORIGINAL MESSAGE" />
            <View style={dv.prevBubble}>
              <MessageSquare color={T.n400} size={14} strokeWidth={2} />
              <Text style={dv.prevTxt}>{notif.prevMsg}</Text>
            </View>
          </>
        )}

        {/* ── FULL MESSAGE ── */}
        <SLabel text="MESSAGE" mt={notif.prevMsg ? 16 : 0} />
        <View style={[dv.msgCard, { borderLeftColor: accentColor }]}>
          <Text style={dv.msgTxt}>{notif.message}</Text>
        </View>

        {/* ── RELATED PROPERTY CARD ── */}
        {notif.property && (
          <>
            <SLabel text="RELATED PROPERTY" mt={20} />
            <View style={dv.propCard}>
              {(notif.property.image || notif.property.propImage) ? (
                <Image source={{ uri: notif.property.image || notif.property.propImage }} style={dv.propImg} resizeMode="cover" />
              ) : (
                <View style={[dv.propImg, { backgroundColor: T.n200, justifyContent: 'center', alignItems: 'center' }]}>
                  <Home color={T.n400} size={40} strokeWidth={1.5} />
                </View>
              )}
              <View style={dv.propScrim} />
              {/* Type tag */}
              {notif.property.type && (
                <View style={dv.propTypTag}>
                  <Text style={dv.propTypTagTxt}>{notif.property.type}</Text>
                </View>
              )}
              {/* Closed / Sold tag */}
              {(isDeal || notif.property.status === 'Closed') && (
                <View style={dv.soldOverlay}>
                  <Key color={T.white} size={12} strokeWidth={2.5} />
                  <Text style={dv.soldOverlayTxt}>SOLD</Text>
                </View>
              )}
              <View style={dv.propBody}>
                <Text style={dv.propName}>{notif.property.name || notif.property.title}</Text>
                <View style={dv.propLocRow}>
                  <MapPin color={T.n500} size={12} strokeWidth={2} />
                  <Text style={dv.propLoc}>{notif.property.location || [notif.property.address, notif.property.city].filter(Boolean).join(', ')}</Text>
                </View>
                {notif.property.price && (
                  <View style={dv.propStat}>
                    <TrendingUp color={T.g600} size={12} strokeWidth={2} />
                    <Text style={dv.propStatTxt}>₹{Number(notif.property.price).toLocaleString('en-IN')}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* ── NAVIGATION CTAs ── */}
        <View style={{ gap: 10, marginTop: 24 }}>

          {/* Primary: Chat / Contact */}
          {notif.chatId && (
            <TouchableOpacity
              style={[dv.ctaPrimary, isDeal && dv.ctaPrimaryGold]}
              onPress={() => navigate('chat')}
              activeOpacity={0.85}
            >
              <MessageCircle color={isDeal ? T.gold : T.g800} size={18} strokeWidth={2.5} />
              <Text style={[dv.ctaPrimaryTxt, isDeal && { color: T.gold }]}>Open Chat</Text>
              <ChevronRight color={isDeal ? T.gold : T.g800} size={17} strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {/* Secondary: View Property */}
          {notif.property && (
            <TouchableOpacity
              style={dv.ctaSecondary}
              onPress={() => navigate('property')}
              activeOpacity={0.85}
            >
              {isDeal
                ? <Key color={T.g700} size={17} strokeWidth={2.5} />
                : <Building2 color={T.g700} size={17} strokeWidth={2.5} />
              }
              <Text style={dv.ctaSecondaryTxt}>{isDeal ? 'View Deal Details' : 'View Property'}</Text>
              <ChevronRight color={T.g700} size={17} strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {/* Tertiary: Quick call */}
          {notif.sender?.phone ? (
            <TouchableOpacity
              style={dv.ctaTertiary}
              onPress={() => navigate('call')}
              activeOpacity={0.85}
            >
              <Phone color={T.n500} size={17} strokeWidth={2.5} />
              <Text style={dv.ctaTertiaryTxt}>
                Call {(notif.sender?.name || 'User').split(' ')[0]}
              </Text>
              <ChevronRight color={T.n300} size={17} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={{ height: 44 }} />
      </ScrollView>
    </View>
  );
}

const dv = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24 },
  hPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20 },
  hPillTxt: { fontSize: 12, fontWeight: '700' },

  // Sender
  senderCard: { flexDirection: 'row', gap: 14, backgroundColor: T.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: T.n200, elevation: 2, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, marginBottom: 14, overflow: 'hidden' },
  sAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, borderColor: T.g400 },
  sName: { fontSize: 16, fontWeight: '800', color: T.n900, letterSpacing: -0.3, marginBottom: 6 },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 8 },
  roleChipTxt: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8, flexWrap: 'wrap' },
  statSep: { color: T.n400, fontSize: 12 },
  statTxt: { fontSize: 12, color: T.n500 },
  contactLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  contactTxt: { fontSize: 13, color: T.n600 },

  // Meta bar
  metaBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.n200, marginBottom: 20 },
  metaTxt: { flex: 1, fontSize: 12, color: T.n600 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  statusTxt: { fontSize: 11, fontWeight: '700' },

  // Previous message bubble
  prevBubble: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: T.n100, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: T.n200 },
  prevTxt: { flex: 1, fontSize: 12, color: T.n600, lineHeight: 18, fontStyle: 'italic' },

  // Full message
  msgCard: { backgroundColor: T.white, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: T.n200, borderLeftWidth: 4, borderLeftColor: T.g600, marginBottom: 4 },
  msgTxt: { fontSize: 14, color: T.n700, lineHeight: 22 },

  // Property card
  propCard: { borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8 },
  propImg: { width: '100%', height: 160 },
  propScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, backgroundColor: 'rgba(0,0,0,0.1)' },
  propTypTag: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(27,94,59,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  propTypTagTxt: { color: T.white, fontSize: 11, fontWeight: '700' },
  soldOverlay: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(217,119,6,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  soldOverlayTxt: { color: T.white, fontSize: 10, fontWeight: '800' },
  propBody: { backgroundColor: T.white, padding: 14 },
  propName: { fontSize: 16, fontWeight: '800', color: T.n900, marginBottom: 4 },
  propLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  propLoc: { fontSize: 12, color: T.n500 },
  propStat: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.g100, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  propStatTxt: { fontSize: 12, fontWeight: '600', color: T.g700 },

  // CTAs
  ctaPrimary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.g100, borderWidth: 2, borderColor: T.g200, borderRadius: 16, padding: 16 },
  ctaPrimaryGold: { backgroundColor: T.goldBg, borderColor: T.goldBdr },
  ctaPrimaryTxt: { flex: 1, fontSize: 15, fontWeight: '700', color: T.g800 },
  ctaSecondary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.white, borderWidth: 2, borderColor: T.g200, borderRadius: 16, padding: 16 },
  ctaSecondaryTxt: { flex: 1, fontSize: 15, fontWeight: '600', color: T.g700 },
  ctaTertiary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.n200, borderRadius: 16, padding: 16 },
  ctaTertiaryTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: T.n500 },
});

/* ══════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════ */
const gs = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.g50 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.n300, borderRadius: 14, paddingHorizontal: 13, height: 46 },
  searchInput: { flex: 1, fontSize: 14, color: T.n900, height: '100%' },
  chips: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 22, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.n300 },
  chipOn: { backgroundColor: T.g800, borderColor: T.g800 },
  chipTxt: { fontSize: 12, fontWeight: '600', color: T.n500 },
  chipTxtOn: { color: T.white },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.g600 },
  chipDotOn: { backgroundColor: T.white },
  chipBadge: { backgroundColor: T.g200, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  chipBadgeOn: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipBadgeTxt: { fontSize: 10, fontWeight: '800', color: T.g700 },
  chipBadgeTxtOn: { color: T.white },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyH: { fontSize: 17, fontWeight: '800', color: T.n600 },
  emptySub: { fontSize: 14, color: T.n400, textAlign: 'center', paddingHorizontal: 32 },
});

/* ══════════════════════════════════════════════════════════
   MENU STYLES
══════════════════════════════════════════════════════════ */
const mn = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' },
  box: { position: 'absolute', top: Platform.OS === 'ios' ? 102 : 72, right: 16, backgroundColor: T.white, borderRadius: 16, elevation: 10, shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, minWidth: 230 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  rowTxt: { fontSize: 14, fontWeight: '600', color: T.n700 },
  div: { height: 1, backgroundColor: T.n200 },
});

/* ══════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════ */
export default function BuyerNotificationsScreen({ navigation, onBack }) {
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
          type: n.type || 'buyer_message',
          read: n.isRead,
          createdAt: n.createdAt,
          relatedEntityId: n.relatedEntityId,
          sender: {
            name: n.title || 'User',
            role: 'Agent',
            avatar: null,
            email: '',
            phone: '',
          },
          summary: n.body || n.title || '',
          message: n.body || '',
          property: null,
          deal: null,
          nav: null,
          chatId: null,
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

    // Fetch enriched detail
    let enriched = { ...notif, read: true };
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const resp = await fetch(`${API_BASE_URL}/notifications/${notif.id}/detail`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await resp.json();
        if (data.success && data.detail) {
          const d = data.detail;
          enriched = {
            ...enriched,
            chatId: d.chatId || null,
            inquiryId: d.inquiryId || null,
            sender: d.sender ? {
              id: d.sender.id,
              name: d.sender.name,
              role: (d.sender.role || 'Agent').charAt(0).toUpperCase() + (d.sender.role || 'agent').slice(1),
              avatar: d.sender.avatar ? getImageUrl(d.sender.avatar) : null,
              email: d.sender.email || '',
              phone: d.sender.phone || '',
            } : enriched.sender,
            property: d.property ? {
              id: d.property.id,
              name: d.property.title,
              title: d.property.title,
              price: d.property.price,
              city: d.property.city,
              address: d.property.address,
              location: [d.property.address, d.property.city].filter(Boolean).join(', '),
              image: d.property.image ? getImageUrl(d.property.image) : null,
              status: notif.type === 'deal_closed' ? 'Closed' : 'Active',
            } : null,
          };
        }
      }
    } catch (err) {
      console.error('Failed to fetch notification detail:', err);
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

  if (loading) {
    return (
      <View style={[gs.screen, { justifyContent: 'center', alignItems: 'center' }]}>
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
