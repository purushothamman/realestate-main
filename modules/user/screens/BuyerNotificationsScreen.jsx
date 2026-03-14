/**
 * BuyerNotificationsScreen.jsx  — v3
 *
 * ✅ Fully responsive — phones (320px+), tablets (768px+), large tablets (1024px+)
 * ✅ Search bar black outline on focus — completely removed
 * ✅ Filter chips are OUTSIDE and BELOW the search bar (separate strip, own background)
 * ✅ No duplicate identifier errors
 * ✅ Layout: Header → SearchBar section → FilterStrip section → DealBanner → List/Grid
 *
 * Notification types:
 *   agent_message    – Agent replied to a property inquiry
 *   builder_message  – Builder broadcast / direct message
 *   deal_closed      – Deal officially marked "Closed" 🎉
 *
 * Theme: Forest green #1B5E3B + white | Gold #D97706 for deal-closed
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getImageUrl } from '../../../utils/api';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  FlatList, ScrollView, Image, Modal, Alert,
  Platform, StatusBar, ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {
  ArrowLeft, BellOff, Search, X, CheckCheck, Filter,
  ChevronRight, Building2, MapPin, Phone, Mail,
  Home, MessageSquare, Star, Briefcase, Key, Sparkles,
  Layers, CalendarDays, BadgeCheck, TrendingUp,
  MessageCircle, MoreVertical,
} from 'lucide-react-native';

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE HOOK  — call inside every component that needs sizing
═══════════════════════════════════════════════════════════ */
function useR() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  const isSmall = width < 360;

  const scaleFont = (base) => {
    if (isLargeTablet) return Math.round(base * 1.22);
    if (isTablet) return Math.round(base * 1.10);
    if (isSmall) return Math.round(base * 0.90);
    return base;
  };

  const scaleSp = (base) => {
    if (isLargeTablet) return Math.round(base * 1.35);
    if (isTablet) return Math.round(base * 1.18);
    if (isSmall) return Math.round(base * 0.88);
    return base;
  };

  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isSmall,
    fs: scaleFont,
    sp: scaleSp,
    hPad: isLargeTablet ? 32 : isTablet ? 24 : 16,
    cols: isLargeTablet ? 3 : isTablet ? 2 : 1,
  };
}

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  g900: '#0D3320', g800: '#1B5E3B', g700: '#1E7444', g600: '#25904F',
  g500: '#2EAD5F', g400: '#5BC282', g200: '#C6E8D4', g100: '#E8F5ED', g50: '#F4FAF7',
  n900: '#111827', n800: '#1F2937', n700: '#374151', n600: '#4B5563',
  n500: '#6B7280', n400: '#9CA3AF', n300: '#D1D5DB', n200: '#E5E7EB',
  n100: '#F3F4F6', white: '#FFFFFF',
  blue: '#3B82F6', blueBg: '#EFF6FF', blueBdr: '#BFDBFE',
  teal: '#0D9488', tealBg: '#F0FDFA', tealBdr: '#99F6E4',
  gold: '#D97706', goldBg: '#FEF3C7', goldBdr: '#FDE68A', goldDeep: '#92400E',
  red: '#EF4444',
  shadow: 'rgba(27,94,59,0.10)',
  shadowGold: 'rgba(217,119,6,0.18)',
};

/* ═══════════════════════════════════════════════════════════
   TYPE CONFIG
═══════════════════════════════════════════════════════════ */
const TYPE = {
  agent_message: { label: 'Agent Message', Icon: MessageCircle, color: T.blue, bg: T.blueBg, border: T.blueBdr },
  builder_message: { label: 'Builder Message', Icon: Building2, color: T.teal, bg: T.tealBg, border: T.tealBdr },
  buyer_message: { label: 'New Message', Icon: MessageCircle, color: T.blue, bg: T.blueBg, border: T.blueBdr },
  deal_closed: { label: 'Deal Closed', Icon: Key, color: T.gold, bg: T.goldBg, border: T.goldBdr },
  _default: { label: 'Notification', Icon: MessageSquare, color: T.n500, bg: T.n100, border: T.n200 },
};

const FILTERS = [
  { key: 'All', IconComp: null },
  { key: 'Unread', IconComp: null },
  { key: 'Messages', IconComp: MessageCircle },
  { key: 'Deal Closed', IconComp: Key },
];

/* ═══════════════════════════════════════════════════════════
   DATE HELPERS
═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   ATOMS
═══════════════════════════════════════════════════════════ */
const TypeBadge = ({ type }) => {
  const c = TYPE[type] || TYPE._default;
  return (
    <View style={[atomS.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <c.Icon color={c.color} size={10} strokeWidth={2.5} />
      <Text style={[atomS.badgeTxt, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const SLabel = ({ text, mt = 0 }) => (
  <Text style={[atomS.slbl, mt ? { marginTop: mt } : null]}>{text}</Text>
);

const AgentStars = ({ rating }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <Star color={T.gold} fill={T.gold} size={12} strokeWidth={0} />
    <Text style={{ fontSize: 12, fontWeight: '700', color: T.n700 }}>{rating.toFixed(1)}</Text>
  </View>
);

const atomS = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  badgeTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  slbl: { fontSize: 10, fontWeight: '800', color: T.n400, letterSpacing: 1.5, marginBottom: 10 },
});

/* ═══════════════════════════════════════════════════════════
   PAGE HEADER
═══════════════════════════════════════════════════════════ */
function PageHeader({ title, subtitle, onBack, right, unread }) {
  const { isTablet, fs } = useR();
  const ptop = Platform.OS === 'ios' ? (isTablet ? 52 : 56) : (isTablet ? 22 : 26);

  return (
    <View style={[hdrS.bar, {
      paddingTop: ptop,
      paddingBottom: isTablet ? 24 : 18,
      paddingHorizontal: isTablet ? 28 : 18,
    }]}>
      <TouchableOpacity
        style={[hdrS.iconBtn, isTablet && { width: 46, height: 46, borderRadius: 14 }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <ArrowLeft color={T.white} size={isTablet ? 24 : 22} strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={[hdrS.title, { fontSize: fs(20) }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[hdrS.sub, { fontSize: fs(12) }]}>{subtitle}</Text> : null}
      </View>

      {right}

      {unread > 0 && (
        <View style={[hdrS.badge, { top: ptop - 2, right: isTablet ? 18 : 8 }]}>
          <Text style={hdrS.badgeTxt}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      )}
    </View>
  );
}

const hdrS = StyleSheet.create({
  bar: { backgroundColor: T.g800, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: T.white, letterSpacing: -0.4 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  badge: { position: 'absolute', backgroundColor: T.red, minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: T.g800, paddingHorizontal: 3 },
  badgeTxt: { fontSize: 9, fontWeight: '900', color: T.white },
});

/* ═══════════════════════════════════════════════════════════
   SEARCH BAR  — NO black focus outline
   Lives in its own white section above the filter strip
═══════════════════════════════════════════════════════════ */
function SearchBar({ value, onChangeText }) {
  const { isTablet, fs, hPad } = useR();

  return (
    <View style={[srchS.section, { paddingHorizontal: hPad }]}>
      <View style={[srchS.wrap, isTablet && srchS.wrapTablet]}>
        <Search color={T.n400} size={isTablet ? 18 : 16} strokeWidth={2} />
        <TextInput
          style={[srchS.input, { fontSize: fs(14) }]}
          placeholder="Search notifications…"
          placeholderTextColor={T.n400}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          clearButtonMode="never"
          underlineColorAndroid="transparent"
          selectionColor={T.g600}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={srchS.clearBtn}>
              <X color={T.white} size={9} strokeWidth={3} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const srchS = StyleSheet.create({
  section: { backgroundColor: T.white, paddingTop: 12, paddingBottom: 8 },
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: T.n100,
    borderRadius: 14, paddingHorizontal: 14, height: 46,
    borderWidth: 1.5, borderColor: T.n200,
  },
  wrapTablet: { height: 52, borderRadius: 16, paddingHorizontal: 18 },
  input: {
    flex: 1, color: T.n900, height: '100%',
    outlineWidth: 0,
    outlineStyle: 'none',
    borderWidth: 0,
    paddingTop: 0, paddingBottom: 0,
  },
  clearBtn: { width: 18, height: 18, borderRadius: 9, backgroundColor: T.n400, justifyContent: 'center', alignItems: 'center' },
});

/* ═══════════════════════════════════════════════════════════
   FILTER STRIP  — completely separate section BELOW search bar
═══════════════════════════════════════════════════════════ */
function FilterStrip({ active, onPress, unread, deals }) {
  const { isTablet, fs, hPad } = useR();

  return (
    <View style={fltS.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[fltS.row, { paddingHorizontal: hPad }]}
      >
        {FILTERS.map(({ key, IconComp }) => {
          const isActive = active === key;
          const isDeal = key === 'Deal Closed';
          const isUnread = key === 'Unread';
          const count = isUnread ? unread : isDeal ? deals : 0;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => onPress(key)}
              activeOpacity={0.75}
              style={[
                fltS.chip,
                isTablet && fltS.chipTablet,
                isActive && fltS.chipActive,
                isActive && isDeal && fltS.chipActiveDeal,
              ]}
            >
              {IconComp && (
                <IconComp
                  color={isActive ? (isDeal ? T.gold : T.white) : T.n500}
                  size={isTablet ? 13 : 11}
                  strokeWidth={2.5}
                />
              )}
              <Text style={[
                fltS.chipLabel,
                { fontSize: fs(12) },
                isActive && fltS.chipLabelActive,
                isActive && isDeal && { color: T.gold },
              ]}>
                {key}
              </Text>
              {count > 0 && (
                <View style={[
                  fltS.badge,
                  isActive && (isDeal ? fltS.badgeActiveDeal : fltS.badgeActive),
                ]}>
                  <Text style={[
                    fltS.badgeTxt,
                    isActive && (isDeal ? { color: T.gold } : fltS.badgeTxtActive),
                  ]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const fltS = StyleSheet.create({
  section: { backgroundColor: T.white, paddingTop: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.n200 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: T.n100, borderWidth: 1.5, borderColor: T.n200 },
  chipTablet: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24 },
  chipActive: { backgroundColor: T.g800, borderColor: T.g800 },
  chipActiveDeal: { backgroundColor: T.goldBg, borderColor: T.goldBdr },
  chipLabel: { fontSize: 12, fontWeight: '600', color: T.n600 },
  chipLabelActive: { color: T.white, fontWeight: '700' },
  badge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: T.n200, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeActiveDeal: { backgroundColor: T.goldBg, borderWidth: 1, borderColor: T.goldBdr },
  badgeTxt: { fontSize: 10, fontWeight: '800', color: T.n700 },
  badgeTxtActive: { color: T.white },
});

/* ═══════════════════════════════════════════════════════════
   DEAL HERO
═══════════════════════════════════════════════════════════ */
function DealHero({ deal }) {
  const { isTablet, fs } = useR();
  const rows = [
    { label: 'Unit', val: deal.unitNo, Icon: Home },
    { label: 'Total Area', val: deal.area, Icon: Layers },
    { label: 'Final Price', val: deal.finalPrice, Icon: TrendingUp },
    { label: 'Possession', val: deal.possession, Icon: CalendarDays },
    { label: 'Registration', val: deal.regStatus, Icon: BadgeCheck },
  ];
  return (
    <View style={dlhS.card}>
      <View style={dlhS.banner}>
        <View style={[dlhS.ring, isTablet && { width: 60, height: 60, borderRadius: 30 }]}>
          <Key color={T.gold} size={isTablet ? 30 : 26} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[dlhS.banTitle, { fontSize: fs(16) }]}>Deal Successfully Closed!</Text>
          <Text style={[dlhS.banSub, { fontSize: fs(12) }]}>Congratulations on your property</Text>
        </View>
        <Sparkles color={T.gold} size={isTablet ? 26 : 22} strokeWidth={2} />
      </View>
      <View style={[dlhS.grid, isTablet && { gap: 16, padding: 20 }]}>
        {rows.map(({ label, val, Icon: I }, i) => (
          <View key={label} style={[dlhS.cell, i === rows.length - 1 && dlhS.cellFull, isTablet && { width: '30%' }]}>
            <View style={dlhS.cellIco}><I color={T.gold} size={14} strokeWidth={2} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[dlhS.cellLbl, { fontSize: fs(10) }]}>{label}</Text>
              <Text style={[dlhS.cellVal, { fontSize: fs(14) }]}>{val}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const dlhS = StyleSheet.create({
  card: { borderRadius: 18, overflow: 'hidden', marginBottom: 4, elevation: 5, shadowColor: T.shadowGold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12 },
  banner: { backgroundColor: T.goldBg, borderWidth: 2, borderColor: T.goldBdr, borderBottomWidth: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  ring: { width: 52, height: 52, borderRadius: 26, backgroundColor: T.white, borderWidth: 2.5, borderColor: T.goldBdr, justifyContent: 'center', alignItems: 'center' },
  banTitle: { fontSize: 16, fontWeight: '800', color: T.gold, letterSpacing: -0.3 },
  banSub: { fontSize: 12, color: T.goldDeep, marginTop: 2, fontWeight: '500' },
  grid: { backgroundColor: T.white, borderWidth: 2, borderColor: T.goldBdr, borderTopWidth: 0, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '46%', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cellFull: { width: '100%' },
  cellIco: { width: 32, height: 32, borderRadius: 8, backgroundColor: T.goldBg, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  cellLbl: { fontSize: 10, color: T.n500, fontWeight: '600', marginBottom: 2 },
  cellVal: { fontSize: 14, fontWeight: '800', color: T.n900 },
});

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION LIST
═══════════════════════════════════════════════════════════ */
function NotificationList({ notifs, onOpen, onMarkAllRead, onBack }) {
  const { isTablet, isLargeTablet, fs, hPad, cols, width } = useR();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const unread = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);
  const deals = useMemo(() => notifs.filter(n => n.type === 'deal_closed').length, [notifs]);

  const filtered = useMemo(() => {
    let list = notifs;
    if (filter === 'Unread') list = list.filter(n => !n.read);
    else if (filter === 'Messages') list = list.filter(n => ['agent_message', 'builder_message', 'buyer_message'].includes(n.type));
    else if (filter === 'Deal Closed') list = list.filter(n => n.type === 'deal_closed');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.sender?.name?.toLowerCase().includes(q) ||
        n.summary?.toLowerCase().includes(q) ||
        n.property?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifs, filter, search]);

  /* ── single card renderer ── */
  const renderCard = (item) => {
    const cfg = TYPE[item.type] || TYPE._default;
    const isDeal = item.type === 'deal_closed';
    const stripe = isDeal ? T.gold : (!item.read ? T.g600 : null);
    const avSize = isTablet ? 54 : 48;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          cardS.wrap,
          !item.read && cardS.wrapUnread,
          isDeal && cardS.wrapDeal,
          isTablet && cardS.wrapTablet,
        ]}
        onPress={() => onOpen(item)}
        activeOpacity={0.84}
      >
        {stripe && <View style={[cardS.stripe, { backgroundColor: stripe }]} />}

        <View style={[cardS.inner, { padding: isTablet ? 16 : 14, gap: isTablet ? 14 : 12 }]}>
          {/* Avatar */}
          <View>
            {item.sender?.avatar
              ? <Image source={{ uri: item.sender.avatar }} style={[cardS.av, { width: avSize, height: avSize, borderRadius: avSize / 2 }, isDeal && cardS.avDeal]} />
              : (
                <View style={[cardS.av, { width: avSize, height: avSize, borderRadius: avSize / 2, backgroundColor: T.g600, justifyContent: 'center', alignItems: 'center' }, isDeal && cardS.avDeal]}>
                  <Text style={{ color: T.white, fontSize: isTablet ? 20 : 18, fontWeight: '800' }}>
                    {(item.sender?.name || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )
            }
            <View style={[cardS.typeIcon, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <cfg.Icon color={cfg.color} size={isTablet ? 12 : 10} strokeWidth={2.5} />
            </View>
          </View>

          {/* Body */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={cardS.topRow}>
              <Text style={[cardS.name, { fontSize: fs(14) }]} numberOfLines={1}>{item.sender?.name}</Text>
              <Text style={[cardS.time, { fontSize: fs(10) }]}>{fmtRel(item.createdAt)}</Text>
            </View>
            <View style={cardS.metaRow}>
              <TypeBadge type={item.type} />
              <Text style={[cardS.role, { fontSize: fs(11) }]}>{item.sender?.role}</Text>
            </View>
            <Text style={[
              cardS.summary,
              { fontSize: fs(13) },
              !item.read && cardS.summaryBold,
              isDeal && cardS.summaryDeal,
            ]} numberOfLines={2}>
              {item.summary}
            </Text>
            {item.property && (
              <View style={cardS.propRow}>
                <Home color={isDeal ? T.gold : T.g600} size={11} strokeWidth={2} />
                <Text style={[cardS.propName, { fontSize: fs(11) }, isDeal && { color: T.gold }]} numberOfLines={1}>
                  {item.property.name}
                </Text>
                {isDeal && <View style={cardS.soldTag}><Text style={cardS.soldTxt}>SOLD</Text></View>}
              </View>
            )}
            <View style={cardS.foot}>
              {isDeal
                ? <View style={cardS.dealPill}><Key color={T.gold} size={10} strokeWidth={2.5} /><Text style={cardS.dealPillTxt}>Tap to view details</Text></View>
                : <View style={cardS.msgPill}><MessageCircle color={T.g600} size={10} strokeWidth={2} /><Text style={cardS.msgPillTxt}>Tap to open</Text></View>
              }
              {!item.read && <View style={cardS.dot} />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* deal banner */
  const DealBanner = () => deals > 0 ? (
    <View style={[lstS.dealBanner, { marginHorizontal: hPad, marginBottom: 10 }]}>
      <Key color={T.gold} size={14} strokeWidth={2.5} />
      <Text style={lstS.dealBannerTxt}>{deals} deal{deals > 1 ? 's' : ''} closed — tap to view</Text>
      <Sparkles color={T.gold} size={14} strokeWidth={2} />
    </View>
  ) : null;

  /* empty */
  const EmptyState = () => (
    <View style={lstS.empty}>
      <BellOff color={T.n300} size={54} strokeWidth={1.5} />
      <Text style={[lstS.emptyH, { fontSize: fs(17) }]}>No notifications</Text>
      <Text style={[lstS.emptySub, { fontSize: fs(14) }]}>
        {search ? 'No results match your search' : "You're all caught up!"}
      </Text>
    </View>
  );

  /* phone list */
  const PhoneList = () => (
    <FlatList
      data={filtered}
      keyExtractor={i => i.id}
      renderItem={({ item }) => renderCard(item)}
      contentContainerStyle={[lstS.listContent, { paddingHorizontal: hPad }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListHeaderComponent={<DealBanner />}
      ListEmptyComponent={<EmptyState />}
    />
  );

  /* tablet grid */
  const TabletGrid = () => {
    const rows = [];
    for (let i = 0; i < filtered.length; i += cols) {
      rows.push(filtered.slice(i, i + cols));
    }
    return (
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: hPad, paddingTop: 8, paddingBottom: 40 }}>
          <DealBanner />
          {rows.map((row, rIdx) => (
            <View key={rIdx} style={{ flexDirection: 'row', gap: 14, marginBottom: 14, alignItems: 'stretch' }}>
              {row.map(item => (
                <View key={item.id} style={{ flex: 1 }}>{renderCard(item)}</View>
              ))}
              {row.length < cols && Array.from({ length: cols - row.length }).map((_, k) => (
                <View key={`ph-${k}`} style={{ flex: 1 }} />
              ))}
            </View>
          ))}
          {filtered.length === 0 && <EmptyState />}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={gs.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      {/* ── Header ── */}
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} new` : 'All caught up'}
        onBack={onBack}
        unread={unread}
        right={
          <TouchableOpacity
            style={[hdrS.iconBtn, isTablet && { width: 46, height: 46, borderRadius: 14 }]}
            onPress={() => setMenuOpen(true)}
            activeOpacity={0.7}
          >
            <MoreVertical color={T.white} size={isTablet ? 24 : 22} strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      {/* ── Search bar (own white section) ── */}
      <SearchBar value={search} onChangeText={setSearch} />

      {/* ── Filter chips (separate section, below search) ── */}
      <FilterStrip active={filter} onPress={setFilter} unread={unread} deals={deals} />

      {/* ── List / Grid ── */}
      {isTablet ? <TabletGrid /> : <PhoneList />}

      {/* ── Options menu ── */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={mnS.overlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[mnS.box, isTablet && { top: 94, right: 24, minWidth: 260 }]}>
            <TouchableOpacity style={mnS.row} activeOpacity={0.8}
              onPress={() => { onMarkAllRead(); setMenuOpen(false); }}
            >
              <CheckCheck color={T.g700} size={18} strokeWidth={2} />
              <Text style={[mnS.rowTxt, { fontSize: fs(14) }]}>Mark all as read</Text>
            </TouchableOpacity>
            <View style={mnS.div} />
            <TouchableOpacity style={mnS.row} activeOpacity={0.8} onPress={() => setMenuOpen(false)}>
              <Filter color={T.n600} size={18} strokeWidth={2} />
              <Text style={[mnS.rowTxt, { fontSize: fs(14) }]}>Notification preferences</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const cardS = StyleSheet.create({
  wrap: { backgroundColor: T.white, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6 },
  wrapTablet: { borderRadius: 18 },
  wrapUnread: { backgroundColor: '#FAFFFD', elevation: 4 },
  wrapDeal: { borderWidth: 1.5, borderColor: T.goldBdr, elevation: 5, shadowColor: T.shadowGold, shadowRadius: 10 },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  inner: { flexDirection: 'row' },
  av: { borderWidth: 2, borderColor: T.n200 },
  avDeal: { borderColor: T.goldBdr, borderWidth: 2.5 },
  typeIcon: { position: 'absolute', bottom: -2, right: -3, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: T.white },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontWeight: '800', color: T.n900, flex: 1, letterSpacing: -0.2, marginRight: 6 },
  time: { color: T.n400, flexShrink: 0, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  role: { color: T.n500, fontWeight: '500' },
  summary: { color: T.n600, lineHeight: 18, marginBottom: 7 },
  summaryBold: { color: T.n800, fontWeight: '600' },
  summaryDeal: { color: T.goldDeep, fontWeight: '700' },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 7 },
  propName: { color: T.g700, fontWeight: '600', flex: 1 },
  soldTag: { backgroundColor: T.goldBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1, borderColor: T.goldBdr },
  soldTxt: { fontSize: 9, fontWeight: '800', color: T.gold },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.g600 },
  msgPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.g100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  msgPillTxt: { fontSize: 10, color: T.g700, fontWeight: '600' },
  dealPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.goldBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: T.goldBdr },
  dealPillTxt: { fontSize: 10, color: T.gold, fontWeight: '700' },
});

const lstS = StyleSheet.create({
  listContent: { paddingTop: 8, paddingBottom: 40 },
  dealBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.goldBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: T.goldBdr },
  dealBannerTxt: { flex: 1, fontSize: 12, color: T.goldDeep, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyH: { fontWeight: '800', color: T.n600 },
  emptySub: { color: T.n400, textAlign: 'center', paddingHorizontal: 32 },
});

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION DETAIL
═══════════════════════════════════════════════════════════ */
function NotificationDetail({ notif, onBack, navigation }) {
  const { isTablet, fs, hPad } = useR();
  const cfg = TYPE[notif.type] || TYPE._default;
  const isDeal = notif.type === 'deal_closed';
  const isAgt = notif.type === 'agent_message' || notif.type === 'buyer_message';
  const accent = isDeal ? T.gold : isAgt ? T.blue : T.teal;
  const imgH = isTablet ? 220 : 160;

  const go = (action) => {
    if (action === 'chat' && notif.chatId && navigation) {
      navigation.navigate('chat', { chatId: notif.chatId, inquiryId: notif.inquiryId }); return;
    }
    if (action === 'property' && notif.property?.id && navigation) {
      navigation.navigate('propertyDetail', { property: notif.property }); return;
    }
    Alert.alert('Navigate', ({
      chat: `Opening ${isAgt ? 'chat' : 'contact'} with ${notif.sender?.name || 'user'}…`,
      property: `Opening ${notif.property?.name ?? 'property details'}…`,
      call: `Calling ${notif.sender?.name || 'user'} at ${notif.sender?.phone || 'N/A'}…`,
    })[action] ?? 'Navigating…');
  };

  return (
    <View style={gs.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      <PageHeader
        title="Notification Detail"
        subtitle={cfg.label}
        onBack={onBack}
        right={
          <View style={[detS.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <cfg.Icon color={cfg.color} size={isTablet ? 15 : 13} strokeWidth={2.5} />
            <Text style={[detS.pillTxt, { color: cfg.color, fontSize: fs(11) }]}>{cfg.label}</Text>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[detS.scroll, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Deal hero */}
        {isDeal && notif.deal && (
          <>
            <SLabel text="DEAL SUMMARY" />
            <DealHero deal={notif.deal} />
          </>
        )}

        {/* Sender */}
        <SLabel text={isAgt ? 'FROM YOUR AGENT' : 'FROM BUILDER'} mt={isDeal ? 20 : 0} />
        <View style={[detS.senderCard, { borderLeftColor: accent }]}>
          {notif.sender?.avatar
            ? <Image source={{ uri: notif.sender.avatar }} style={[detS.av, isTablet && { width: 68, height: 68, borderRadius: 34 }]} />
            : (
              <View style={[detS.av, isTablet && { width: 68, height: 68, borderRadius: 34 }, { backgroundColor: T.g600, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: T.white, fontSize: isTablet ? 26 : 22, fontWeight: '800' }}>
                  {(notif.sender?.name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )
          }
          <View style={{ flex: 1 }}>
            <Text style={[detS.sName, { fontSize: fs(16) }]}>{notif.sender?.name || 'Unknown'}</Text>
            <View style={[detS.roleChip, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <cfg.Icon color={cfg.color} size={11} strokeWidth={2.5} />
              <Text style={[detS.roleChipTxt, { color: cfg.color, fontSize: fs(11) }]}>{notif.sender?.role || 'User'}</Text>
            </View>
            {isAgt && notif.sender?.rating !== undefined && (
              <View style={detS.statsRow}>
                <AgentStars rating={notif.sender.rating} />
                <Text style={detS.sep}>·</Text>
                <Briefcase color={T.n500} size={12} strokeWidth={2} />
                <Text style={[detS.statTxt, { fontSize: fs(12) }]}>{notif.sender.experience} yrs</Text>
                <Text style={detS.sep}>·</Text>
                <Text style={[detS.statTxt, { color: T.g700, fontWeight: '700', fontSize: fs(12) }]}>{notif.sender.spec}</Text>
              </View>
            )}
            {notif.sender?.phone && (
              <View style={detS.contactRow}>
                <Phone color={T.n500} size={13} strokeWidth={2} />
                <Text style={[detS.contactTxt, { fontSize: fs(13) }]}>{notif.sender.phone}</Text>
              </View>
            )}
            {notif.sender?.email && (
              <View style={detS.contactRow}>
                <Mail color={T.n500} size={13} strokeWidth={2} />
                <Text style={[detS.contactTxt, { fontSize: fs(13) }]}>{notif.sender.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Meta bar */}
        <View style={detS.metaBar}>
          <CalendarDays color={T.n500} size={14} strokeWidth={2} />
          <Text style={[detS.metaTxt, { fontSize: fs(12) }]} numberOfLines={2}>{fmtFull(notif.createdAt)}</Text>
          {isDeal && (
            <View style={detS.closedPill}>
              <Key color={T.gold} size={11} strokeWidth={2.5} />
              <Text style={detS.closedTxt}>Closed</Text>
            </View>
          )}
        </View>

        {/* Previous message */}
        {notif.prevMsg && (
          <>
            <SLabel text="YOUR ORIGINAL MESSAGE" />
            <View style={detS.prevBubble}>
              <MessageSquare color={T.n400} size={14} strokeWidth={2} />
              <Text style={[detS.prevTxt, { fontSize: fs(12) }]}>{notif.prevMsg}</Text>
            </View>
          </>
        )}

        {/* Full message */}
        <SLabel text="MESSAGE" mt={notif.prevMsg ? 16 : 0} />
        <View style={[detS.msgCard, { borderLeftColor: accent }]}>
          <Text style={[detS.msgTxt, { fontSize: fs(14) }]}>{notif.message}</Text>
        </View>

        {/* Property card */}
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
                <View style={detS.propTypeTag}>
                  <Text style={[detS.propTypeTagTxt, { fontSize: fs(11) }]}>{notif.property.type}</Text>
                </View>
              )}
              {(isDeal || notif.property.status === 'Closed') && (
                <View style={detS.soldBadge}>
                  <Key color={T.white} size={11} strokeWidth={2.5} />
                  <Text style={detS.soldBadgeTxt}>SOLD</Text>
                </View>
              )}
              <View style={[detS.propBody, isTablet && { padding: 18 }]}>
                <Text style={[detS.propTitle, { fontSize: fs(16) }]}>{notif.property.name || notif.property.title}</Text>
                <View style={detS.propLocRow}>
                  <MapPin color={T.n500} size={12} strokeWidth={2} />
                  <Text style={[detS.propLoc, { fontSize: fs(12) }]}>
                    {notif.property.location || [notif.property.address, notif.property.city].filter(Boolean).join(', ')}
                  </Text>
                </View>
                {notif.property.price && (
                  <View style={detS.propPriceRow}>
                    <TrendingUp color={T.g600} size={12} strokeWidth={2} />
                    <Text style={[detS.propPriceTxt, { fontSize: fs(12) }]}>₹{Number(notif.property.price).toLocaleString('en-IN')}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* CTAs */}
        <View style={{ gap: 10, marginTop: 24 }}>
          {notif.chatId && (
            <TouchableOpacity
              style={[detS.ctaA, isDeal && detS.ctaADeal, isTablet && detS.ctaTablet]}
              onPress={() => go('chat')} activeOpacity={0.85}
            >
              <MessageCircle color={isDeal ? T.gold : T.g800} size={isTablet ? 20 : 18} strokeWidth={2.5} />
              <Text style={[detS.ctaATxt, isDeal && { color: T.gold }, { fontSize: fs(15) }]}>Open Chat</Text>
              <ChevronRight color={isDeal ? T.gold : T.g800} size={isTablet ? 19 : 17} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {notif.property && (
            <TouchableOpacity
              style={[detS.ctaB, isTablet && detS.ctaTablet]}
              onPress={() => go('property')} activeOpacity={0.85}
            >
              {isDeal
                ? <Key color={T.g700} size={isTablet ? 19 : 17} strokeWidth={2.5} />
                : <Building2 color={T.g700} size={isTablet ? 19 : 17} strokeWidth={2.5} />
              }
              <Text style={[detS.ctaBTxt, { fontSize: fs(15) }]}>{isDeal ? 'View Deal Details' : 'View Property'}</Text>
              <ChevronRight color={T.g700} size={isTablet ? 19 : 17} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {notif.sender?.phone && (
            <TouchableOpacity
              style={[detS.ctaC, isTablet && detS.ctaTablet]}
              onPress={() => go('call')} activeOpacity={0.85}
            >
              <Phone color={T.n500} size={isTablet ? 19 : 17} strokeWidth={2.5} />
              <Text style={[detS.ctaCTxt, { fontSize: fs(14) }]}>Call {(notif.sender?.name || 'User').split(' ')[0]}</Text>
              <ChevronRight color={T.n300} size={isTablet ? 19 : 17} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 44 }} />
      </ScrollView>
    </View>
  );
}

const detS = StyleSheet.create({
  scroll: { paddingTop: 18, paddingBottom: 24 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillTxt: { fontSize: 11, fontWeight: '700' },
  senderCard: { flexDirection: 'row', gap: 14, backgroundColor: T.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: T.n200, borderLeftWidth: 4, elevation: 2, shadowColor: T.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, marginBottom: 14, overflow: 'hidden' },
  av: { width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, borderColor: T.g400 },
  sName: { fontSize: 16, fontWeight: '800', color: T.n900, letterSpacing: -0.3, marginBottom: 6 },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 8 },
  roleChipTxt: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8, flexWrap: 'wrap' },
  sep: { color: T.n400, fontSize: 12 },
  statTxt: { fontSize: 12, color: T.n500 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  contactTxt: { fontSize: 13, color: T.n600 },
  metaBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.n200, marginBottom: 20 },
  metaTxt: { flex: 1, fontSize: 12, color: T.n600 },
  closedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.goldBg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  closedTxt: { fontSize: 11, fontWeight: '700', color: T.gold },
  prevBubble: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: T.n100, borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 1, borderColor: T.n200 },
  prevTxt: { flex: 1, fontSize: 12, color: T.n600, lineHeight: 18, fontStyle: 'italic' },
  msgCard: { backgroundColor: T.white, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: T.n200, borderLeftWidth: 4, marginBottom: 4 },
  msgTxt: { fontSize: 14, color: T.n700, lineHeight: 22 },
  propCard: { borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: T.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8 },
  propImg: { width: '100%', height: 160 },
  propScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.07)' },
  propTypeTag: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(27,94,59,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  propTypeTagTxt: { color: T.white, fontSize: 11, fontWeight: '700' },
  soldBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(217,119,6,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  soldBadgeTxt: { color: T.white, fontSize: 10, fontWeight: '800' },
  propBody: { backgroundColor: T.white, padding: 14 },
  propTitle: { fontSize: 16, fontWeight: '800', color: T.n900, marginBottom: 4 },
  propLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  propLoc: { fontSize: 12, color: T.n500, flex: 1 },
  propPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.g100, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  propPriceTxt: { fontSize: 12, fontWeight: '600', color: T.g700 },
  ctaA: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.g100, borderWidth: 2, borderColor: T.g200, borderRadius: 16, padding: 16 },
  ctaADeal: { backgroundColor: T.goldBg, borderColor: T.goldBdr },
  ctaATxt: { flex: 1, fontSize: 15, fontWeight: '700', color: T.g800 },
  ctaB: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.white, borderWidth: 2, borderColor: T.g200, borderRadius: 16, padding: 16 },
  ctaBTxt: { flex: 1, fontSize: 15, fontWeight: '600', color: T.g700 },
  ctaC: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.white, borderWidth: 1.5, borderColor: T.n200, borderRadius: 16, padding: 16 },
  ctaCTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: T.n500 },
  ctaTablet: { padding: 18, borderRadius: 18 },
});

/* ═══════════════════════════════════════════════════════════
   GLOBAL  +  MENU
═══════════════════════════════════════════════════════════ */
const gs = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.g50 },
});

const mnS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' },
  box: { position: 'absolute', top: Platform.OS === 'ios' ? 100 : 70, right: 14, backgroundColor: T.white, borderRadius: 16, elevation: 10, shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, minWidth: 232 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  rowTxt: { fontSize: 14, fontWeight: '600', color: T.n700 },
  div: { height: 1, backgroundColor: T.n200 },
});

/* ═══════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════ */
export default function BuyerNotificationsScreen({ navigation, onBack }) {
  const { isTablet } = useR();
  const [notifs, setNotifs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) { setLoading(false); return; }
      const resp = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (data.success && data.notifications) {
        setNotifs(data.notifications.map(n => ({
          id: String(n.id),
          type: n.type || 'buyer_message',
          read: n.isRead,
          createdAt: n.createdAt,
          relatedEntityId: n.relatedEntityId,
          sender: { name: n.title || 'User', role: 'Agent', avatar: null, email: '', phone: '' },
          summary: n.body || n.title || '',
          message: n.body || '',
          property: null, deal: null, nav: null, chatId: null,
        })));
      }
    } catch (e) { console.error('fetchNotifications', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const openDetail = useCallback(async (notif) => {
    setNotifs(p => p.map(n => n.id === notif.id ? { ...n, read: true } : n));
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) fetch(`${API_BASE_URL}/notifications/${notif.id}/read`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { });
    } catch (_) { }

    let enriched = { ...notif, read: true };
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const resp = await fetch(`${API_BASE_URL}/notifications/${notif.id}/detail`, {
          headers: { Authorization: `Bearer ${token}` },
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
    } catch (e) { console.error('notification detail', e); }
    setSelected(enriched);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) notifs.filter(n => !n.read).forEach(n =>
        fetch(`${API_BASE_URL}/notifications/${n.id}/read`, {
          method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
        }).catch(() => { })
      );
    } catch (_) { }
  }, [notifs]);

  if (loading) return (
    <View style={[gs.screen, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={T.g800} />
      <Text style={{ marginTop: 12, color: T.n500, fontSize: isTablet ? 16 : 14 }}>Loading notifications…</Text>
    </View>
  );

  if (selected) return (
    <NotificationDetail
      notif={selected}
      onBack={() => setSelected(null)}
      navigation={navigation}
    />
  );

  return (
    <NotificationList
      notifs={notifs}
      onOpen={openDetail}
      onMarkAllRead={markAllRead}
      onBack={() => navigation?.goBack?.() || onBack?.()}
    />
  );
}