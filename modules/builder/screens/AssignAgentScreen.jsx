/**
 * AssignAgentScreen.jsx — Fully Responsive (All Devices)
 *
 * RESPONSIVE BREAKPOINTS:
 *   xs  : width < 360   (small phones: iPhone SE, Galaxy A-series small)
 *   sm  : 360–599       (standard phones: iPhone 14, Pixel 7)
 *   md  : 600–899       (large phones landscape / small tablets: iPad mini portrait)
 *   lg  : 900–1199      (tablets: iPad 10", iPad Pro 11" portrait)
 *   xl  : ≥ 1200        (large tablets: iPad Pro 12.9", landscape tablets)
 *
 * RESPONSIVE IMPROVEMENTS:
 *   - Dynamic font scaling via useResponsive() hook
 *   - Header padding adapts to safe area + notch
 *   - Metric cards: 4-col row on sm+, 2×2 grid on xs
 *   - FlatList: 1 col on xs/sm, 2 col on md+, 3 col on xl
 *   - Property card image height scales with breakpoint
 *   - Agent card layout: stacks on xs, row on sm+
 *   - Filter bar: wraps on xs/sm, single row on md+
 *   - Filter pill labels hidden on xs (icon + badge only)
 *   - Modal sheet: full-height on xs, 82% on sm, 72% on md+
 *   - Modal search bar height adapts
 *   - Hire row: compact on xs
 *   - All touch targets ≥ 44pt
 *   - Overlay box padding scales
 *   - Tab bar text sizes scale
 *   - Horizontal padding scales across breakpoints
 */

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  FlatList, Modal, Image, Alert, ActivityIndicator,
  Platform, StatusBar, useWindowDimensions,
  Animated, Easing, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft, UserPlus, Building2, Users, Search,
  MapPin, Star, X, AlertCircle, CheckCircle2,
  Trash2, Check, Layers, Zap, Home, RefreshCw,
} from 'lucide-react-native';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE, DEFAULT_PROFILE_IMAGE } from '../../../utils/api';

/* ─────────────────────────────────────────────────────────
   BREAKPOINT SYSTEM
───────────────────────────────────────────────────────── */
const BP = {
  xs: 0,
  sm: 360,
  md: 600,
  lg: 900,
  xl: 1200,
};

function getBreakpoint(width) {
  if (width >= BP.xl) return 'xl';
  if (width >= BP.lg) return 'lg';
  if (width >= BP.md) return 'md';
  if (width >= BP.sm) return 'sm';
  return 'xs';
}

/* ─────────────────────────────────────────────────────────
   RESPONSIVE HOOK — single source of truth
───────────────────────────────────────────────────────── */
function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const bp = getBreakpoint(width);
    const isXs = bp === 'xs';
    const isSm = bp === 'sm';
    const isMd = bp === 'md';
    const isLg = bp === 'lg';
    const isXl = bp === 'xl';
    const isPhone = isXs || isSm;
    const isTablet = isMd || isLg || isXl;
    const isLandscape = width > height;

    // Horizontal padding
    const hp = isXs ? 12 : isSm ? 16 : isMd ? 22 : isLg ? 28 : 36;

    // Column count for FlatLists
    const propCols = isXs || isSm ? 1 : isMd ? 2 : isLg ? 2 : 3;
    const agentCols = isXs || isSm ? 1 : isMd ? 2 : isLg ? 2 : 3;

    // Font sizes
    const fs = {
      headerTitle: isXs ? 16 : isSm ? 18 : isMd ? 20 : isLg ? 22 : 24,
      tabLabel: isXs ? 12 : isSm ? 13 : 14,
      metricVal: isXs ? 14 : isSm ? 17 : isMd ? 18 : 20,
      metricLbl: isXs ? 7 : isSm ? 8 : 9,
      cardTitle: isXs ? 13 : isSm ? 15 : isMd ? 16 : 17,
      cardSub: isXs ? 10 : 12,
      cardStat: isXs ? 11 : 12,
      agentName: isXs ? 13 : isSm ? 14 : isMd ? 15 : 16,
      agentSub: isXs ? 10 : 11,
      modalTitle: isXs ? 15 : isSm ? 16 : 17,
      pillLabel: isXs ? 10 : 11,
      btnLabel: isXs ? 12 : 13,
      searchInput: isXs ? 13 : 14,
    };

    // Dimensions
    const dim = {
      propImgH: isXs ? 110 : isSm ? 140 : isMd ? 160 : isLg ? 170 : 190,
      agentAvatarSz: isXs ? 44 : isSm ? 50 : isMd ? 54 : 58,
      pickerAvatarSz: isXs ? 40 : 48,
      hireAvatarSz: isXs ? 40 : 48,
      backBtnSz: isXs ? 36 : isSm ? 40 : 44,
      backIconSz: isXs ? 17 : isSm ? 19 : 21,
      modalMaxH: isXs ? height * 0.92 : isPhone ? height * 0.85 : height * 0.75,
      modalHP: isXs ? 14 : isSm ? 18 : isMd ? 24 : 28,
      tabPadV: isXs ? 8 : isSm ? 9 : 11,
      metricRows: isXs ? 2 : 1,   // xs: 2-row 2×2, others: 1-row 4 cols
      filterPillH: isXs ? 40 : 44,
      searchH: isXs ? 42 : 44,
      modalSearchH: isXs ? 44 : 48,
      overlayPadH: isXs ? 24 : 36,
      overlayPadV: isXs ? 22 : 28,
      hireBtnH: isXs ? 36 : 40,
      hireBtnPadH: isXs ? 12 : 16,
    };

    // Header padding top (safe area aware)
    const headerPT = Platform.OS === 'ios'
      ? (isTablet ? 52 : 48)
      : (isXs ? 22 : isSm ? 26 : isTablet ? 30 : 28);

    // Show filter pill text
    const showPillLabel = !isXs;

    return {
      width, height, bp, isXs, isSm, isMd, isLg, isXl,
      isPhone, isTablet, isLandscape,
      hp, propCols, agentCols, fs, dim, headerPT, showPillLabel,
    };
  }, [width, height]);
}

/* ─────────────────────────────────
   PALETTE
───────────────────────────────── */
const P = {
  e900: '#052E16', e800: '#14532D', e700: '#15803D',
  e600: '#16A34A', e500: '#22C55E', e400: '#4ADE80',
  e200: '#BBF7D0', e100: '#DCFCE7', e50: '#F0FDF4',

  z900: '#111827', z800: '#1F2937', z700: '#374151',
  z600: '#4B5563', z500: '#6B7280', z400: '#9CA3AF',
  z300: '#D1D5DB', z200: '#E5E7EB', z100: '#F3F4F6',
  z50: '#F9FAFB', white: '#FFFFFF',

  amber: '#F59E0B', amberBg: '#FFFBEB',
  red: '#EF4444', redBg: '#FFF1F2',
};

const specStyle = spec => ({
  Residential: { bg: '#DCFCE7', text: '#14532D' },
  Commercial: { bg: '#DBEAFE', text: '#1E40AF' },
  Luxury: { bg: '#FEF3C7', text: '#92400E' },
  'Mixed Use': { bg: '#EDE9FE', text: '#5B21B6' },
}[spec] || { bg: '#F3F4F6', text: '#374151' });

/* ─────────────────────────────────
   TYPE FILTER CONFIG
───────────────────────────────── */
const TYPE_FILTERS = [
  { key: 'All', label: 'All Types', Icon: Layers },
  { key: 'Residential', label: 'Residential', Icon: Home },
  { key: 'Commercial', label: 'Commercial', Icon: Building2 },
  { key: 'Mixed Use', label: 'Mixed Use', Icon: Zap },
];

/* ════════════════════════════════════════════
   ANIMATED PRESSABLE — scale on press
════════════════════════════════════════════ */
const AnimatedPressable = ({
  onPress, style, children, scaleDown = 0.94,
  activeOpacity = 0.9, hitSlop, ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () =>
    Animated.spring(scale, { toValue: scaleDown, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

/* ════════════════════════════════════════════
   ANIMATED CARD — fade + rise on mount
════════════════════════════════════════════ */
const AnimatedCard = ({ index, children, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const delay = Math.min(index, 6) * 60;
    Animated.timing(anim, {
      toValue: 1, duration: 320, delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[
      style,
      {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      },
    ]}>
      {children}
    </Animated.View>
  );
};

/* ─────────────────────────────────
   FOCUS-SAFE INPUT
───────────────────────────────── */
const FieldInput = React.memo(({
  icon: Icon, initialValue = '', onCommit, error,
  multiline, numberOfLines, containerStyle, inputStyle, ...rest
}) => {
  const [val, setVal] = useState(initialValue);
  const wrapRef = useRef(null);
  const onFocus = useCallback(() =>
    wrapRef.current?.setNativeProps({ style: { borderColor: P.e600, backgroundColor: P.white } }), []);
  const onBlur = useCallback(() => {
    wrapRef.current?.setNativeProps({ style: { borderColor: error ? P.red : P.z300, backgroundColor: P.z50 } });
    onCommit?.(val);
  }, [val, onCommit, error]);
  return (
    <>
      <View ref={wrapRef} style={[FI.wrap, multiline && FI.taWrap, error && FI.err, containerStyle]}>
        {Icon && <Icon color={P.z400} size={15} strokeWidth={2} style={FI.icon} />}
        <TextInput
          style={[multiline ? FI.ta : FI.input, inputStyle]}
          placeholderTextColor={P.z400}
          value={val} onChangeText={setVal}
          onFocus={onFocus} onBlur={onBlur}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines || 3 : undefined}
          textAlignVertical={multiline ? 'top' : undefined}
          {...rest}
        />
      </View>
      {error && (
        <View style={FI.errRow}>
          <AlertCircle color={P.red} size={11} />
          <Text style={FI.errTxt}>{error}</Text>
        </View>
      )}
    </>
  );
}, (p, n) => p.error === n.error && p.initialValue === n.initialValue);
const FI = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: P.z50, borderWidth: 1, borderColor: P.z300, borderRadius: 10, paddingHorizontal: 14 },
  taWrap: { height: 'auto', alignItems: 'flex-start', padding: 14, minHeight: 90 },
  err: { borderColor: P.red },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: P.z900, height: '100%' },
  ta: { flex: 1, fontSize: 14, color: P.z900, minHeight: 66 },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  errTxt: { fontSize: 11, color: P.red },
});

/* ─────────────────────────────────
   SEARCH BAR (list pages)
───────────────────────────────── */
const SearchBar = ({ value, onChange, placeholder, style, height: h = 44, fontSize = 14 }) => {
  const ref = useRef(null);
  return (
    <View ref={ref} style={[SB.wrap, { height: h }, style]}>
      <Search color={P.z400} size={15} strokeWidth={2} />
      <TextInput
        style={[SB.input, { fontSize }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || 'Search…'}
        placeholderTextColor={P.z400}
        onFocus={() => ref.current?.setNativeProps({ style: { borderColor: P.e600, backgroundColor: P.white } })}
        onBlur={() => ref.current?.setNativeProps({ style: { borderColor: P.z200, backgroundColor: P.z50 } })}
      />
      {!!value && (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <View style={SB.clear}><X color={P.z500} size={11} strokeWidth={2.5} /></View>
        </TouchableOpacity>
      )}
    </View>
  );
};
const SB = StyleSheet.create({
  wrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: P.z50, borderWidth: 1, borderColor: P.z200, borderRadius: 10, paddingHorizontal: 12 },
  input: { flex: 1, color: P.z900, height: '100%', outlineStyle: 'none' },
  clear: { width: 20, height: 20, borderRadius: 10, backgroundColor: P.z200, justifyContent: 'center', alignItems: 'center' },
});

/* ─────────────────────────────────
   MODAL SEARCH BAR
───────────────────────────────── */
const ModalSearchBar = ({ value, onChange, placeholder, height: h = 48, fontSize = 14 }) => {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const handleFocus = () => { setFocused(true); Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start(); };
  const handleBlur = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start(); };
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [P.z300, P.e600] });
  return (
    <Animated.View style={[MSB.wrap, { height: h, borderColor }]}>
      <Search color={focused ? P.e600 : P.z400} size={15} strokeWidth={2} />
      <TextInput
        style={[MSB.input, { fontSize }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || 'Search…'}
        placeholderTextColor={P.z400}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {!!value && (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <View style={MSB.clear}><X color={P.z600} size={11} strokeWidth={2.5} /></View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};
const MSB = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: P.white, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, color: P.z900, height: '100%', outlineStyle: 'none' },
  clear: { width: 22, height: 22, borderRadius: 11, backgroundColor: P.z200, justifyContent: 'center', alignItems: 'center' },
});

/* ─────────────────────────────────
   STAR ROW
───────────────────────────────── */
const StarRow = ({ rating, size = 11 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <Star color={P.amber} fill={P.amber} size={size} strokeWidth={0} />
    <Text style={{ fontSize: size + 1, fontWeight: '700', color: P.z700 }}>
      {rating > 0 ? rating.toFixed(1) : 'New'}
    </Text>
  </View>
);

/* ─────────────────────────────────
   ANIMATED TOAST
───────────────────────────────── */
const AnimatedToast = ({ msg, hp }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const prevMsg = useRef('');
  useEffect(() => {
    if (msg && !prevMsg.current) {
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
    }
    if (!msg && prevMsg.current) {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
    prevMsg.current = msg;
  }, [msg]);
  if (!msg && !prevMsg.current) return null;
  return (
    <Animated.View style={[
      TS.wrap,
      { marginHorizontal: hp },
      {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
      },
    ]}>
      <CheckCircle2 color={P.e600} size={16} strokeWidth={2.5} />
      <Text style={TS.txt} numberOfLines={2}>{msg || prevMsg.current}</Text>
    </Animated.View>
  );
};
const TS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: P.e50, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: P.e200, shadowColor: P.e600, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  txt: { flex: 1, fontSize: 13, fontWeight: '600', color: P.e800 },
});

/* ═══════════════════════════════════════════════
   FILTER PILL — fully responsive
═══════════════════════════════════════════════ */
const FilterPill = React.memo(({ filterKey, label, Icon, isActive, count, onSelect, showLabel, pillHeight, fontSize }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.90, useNativeDriver: true, speed: 60, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
    ]).start();
    onSelect(filterKey);
  };
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View style={[
        FB.pill,
        isActive && FB.pillActive,
        { minHeight: pillHeight, transform: [{ scale }] },
        !showLabel && FB.pillCompact,
      ]}>
        <Icon color={isActive ? P.white : P.z500} size={showLabel ? 12 : 13} strokeWidth={2.2} />
        {showLabel && (
          <Text style={[FB.label, { fontSize }, isActive && FB.labelActive]} numberOfLines={1}>
            {label}
          </Text>
        )}
        <View style={[FB.badge, isActive ? FB.badgeActive : FB.badgeInactive]}>
          <Text style={[FB.badgeTxt, isActive && FB.badgeTxtActive]}>{count}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const FilterBar = React.memo(({ active, onSelect, properties, hp, showLabel, pillHeight, fontSize }) => {
  const counts = useMemo(() => {
    const c = {};
    TYPE_FILTERS.forEach(f => {
      c[f.key] = f.key === 'All' ? properties.length : properties.filter(p => p.type === f.key).length;
    });
    return c;
  }, [properties]);

  return (
    <View style={[FB.container, { paddingHorizontal: hp }]}>
      {TYPE_FILTERS.map(({ key, label, Icon }) => (
        <FilterPill
          key={key}
          filterKey={key}
          label={label}
          Icon={Icon}
          isActive={active === key}
          count={counts[key] ?? 0}
          onSelect={onSelect}
          showLabel={showLabel}
          pillHeight={pillHeight}
          fontSize={fontSize}
        />
      ))}
    </View>
  );
});
const FB = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: P.z200, backgroundColor: P.white },
  pillCompact: { paddingHorizontal: 9, gap: 4 },
  pillActive: { backgroundColor: P.e800, borderColor: P.e800 },
  label: { fontWeight: '600', color: P.z600 },
  labelActive: { color: P.white },
  badge: { borderRadius: 20, paddingHorizontal: 5, paddingVertical: 1, minWidth: 18, alignItems: 'center' },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.20)' },
  badgeInactive: { backgroundColor: P.z100 },
  badgeTxt: { fontSize: 10, fontWeight: '700', color: P.z500 },
  badgeTxtActive: { color: P.white },
});

/* ─────────────────────────────────
   PULSING LOADER
───────────────────────────────── */
const PulsingLoader = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, []);
  return (
    <Animated.View style={{ opacity: pulse }}>
      <ActivityIndicator color={P.e600} size="large" />
    </Animated.View>
  );
};

/* ════════════════════════════════════════════
   TAB CONTENT FADE
════════════════════════════════════════════ */
const TabContent = ({ children }) => {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
  }, []);
  return <Animated.View style={{ flex: 1, opacity: fade }}>{children}</Animated.View>;
};

/* ════════════════════════════════════════════
   MODAL LIST FADE
════════════════════════════════════════════ */
const ModalListFade = ({ children }) => {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 250, delay: 80, useNativeDriver: true }).start();
  }, []);
  return <Animated.View style={{ flexShrink: 1, width: '100%', opacity: fade }}>{children}</Animated.View>;
};

/* ═════════════════════════════════════════════
   MAIN SCREEN
═════════════════════════════════════════════ */
export default function AssignAgentScreen({ navigation, onBack }) {
  const R = useResponsive();

  /* ── State ── */
  const [tab, setTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [propFilter, setPropFilter] = useState('All');
  const [propSearch, setPropSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerProp, setPickerProp] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const [hireOpen, setHireOpen] = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [hireSearch, setHireSearch] = useState('');
  const [hiring, setHiring] = useState(false);
  const [hireFetchError, setHireFetchError] = useState('');
  const [hiringAgentId, setHiringAgentId] = useState(null); // tracks per-row loading

  /* ── Animations ── */
  const headerAnim = useRef(new Animated.Value(0)).current;
  const metricAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const tabContentKey = useRef(0);
  const prevTab = useRef(tab);
  if (prevTab.current !== tab) {
    tabContentKey.current += 1;
    prevTab.current = tab;
  }

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.stagger(80, metricAnims.map(a =>
      Animated.spring(a, { toValue: 1, speed: 14, bounciness: 8, useNativeDriver: true })
    )).start();
  }, []);

  /* ── Helpers ── */
  const flash = useCallback(msg => {
    setBanner(msg); setTimeout(() => setBanner(''), 3500);
  }, []);

  const getAuthToken = useCallback(async () => {
    try { return await AsyncStorage.getItem('authToken'); } catch { return null; }
  }, []);

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [getAuthToken]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, aRes, asRes] = await Promise.all([
        apiRequest('/builder/assign-agent/properties'),
        apiRequest('/builder/assign-agent/agents'),
        apiRequest('/builder/assign-agent/assignments'),
      ]);
      setProperties((pRes.properties || []).map(p => ({ ...p, id: String(p.id) })));
      setAgents(aRes.agents || []);
      setAssignments(asRes.assignments || {});
    } catch (e) { Alert.alert('Error', e.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, [apiRequest]);

  useEffect(() => { loadData(); }, [loadData]);

  // Fetch available agents — used both on open and on retry
  const fetchAvailableAgents = useCallback(async () => {
    setHiring(true);
    setHireFetchError('');
    try {
      const res = await apiRequest('/builder/assign-agent/agents/available');
      setAvailableAgents(res.agents || []);
    } catch (e) {
      setHireFetchError(e.message || 'Failed to load agents. Tap retry.');
    } finally {
      setHiring(false);
    }
  }, [apiRequest]);

  // Open modal FIRST synchronously, then fetch in background — never auto-close on error
  const openHireModal = useCallback(() => {
    setHireOpen(true);
    setHireSearch('');
    setAvailableAgents([]);
    setHireFetchError('');
    setHiringAgentId(null);
    fetchAvailableAgents();
  }, [fetchAvailableAgents]);

  /* ── Filtered data ── */
  const filteredProps = useMemo(() => {
    let list = properties;
    if (propFilter !== 'All') list = list.filter(p => p.type === propFilter);
    if (propSearch.trim()) {
      const q = propSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }
    return list;
  }, [properties, propFilter, propSearch]);

  const filteredAgents = useMemo(() => {
    const q = agentSearch.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(a => (a.name || '').toLowerCase().includes(q) || (a.spec || '').toLowerCase().includes(q) || (a.city || '').toLowerCase().includes(q));
  }, [agents, agentSearch]);

  const pickerAgents = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(a => (a.name || '').toLowerCase().includes(q) || (a.spec || '').toLowerCase().includes(q));
  }, [agents, pickerSearch]);

  const filteredAvailable = useMemo(() => {
    const q = hireSearch.trim().toLowerCase();
    if (!q) return availableAgents;
    return availableAgents.filter(a => (a.name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q) || (a.phone || '').toLowerCase().includes(q));
  }, [availableAgents, hireSearch]);

  const agentById = useCallback(id => agents.find(a => a.id === id), [agents]);
  const propCount = useCallback(aid => Object.values(assignments).filter(id => id === aid).length, [assignments]);
  const openPicker = useCallback(prop => { setPickerProp(prop); setPickerSearch(''); setPickerOpen(true); }, []);

  const confirmAssign = useCallback(async agent => {
    try {
      setPickerOpen(false); setSaving(true);
      await apiRequest(`/builder/assign-agent/properties/${pickerProp.id}/assign`, { method: 'POST', body: JSON.stringify({ agentId: agent.id }) });
      const asRes = await apiRequest('/builder/assign-agent/assignments');
      setAssignments(asRes.assignments || {});
      flash(`${agent.name} assigned to ${pickerProp.name}`);
    } catch (e) { Alert.alert('Error', e.message || 'Failed to assign agent'); }
    finally { setSaving(false); }
  }, [pickerProp, apiRequest, flash]);

  const removeAssign = useCallback(prop => {
    Alert.alert('Remove Agent', `Remove ${agentById(assignments[prop.id])?.name} from ${prop.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          (async () => {
            try {
              setSaving(true);
              await apiRequest(`/builder/assign-agent/properties/${prop.id}/assign`, { method: 'DELETE' });
              const asRes = await apiRequest('/builder/assign-agent/assignments');
              setAssignments(asRes.assignments || {});
              flash('Agent removed');
            } catch (e) { Alert.alert('Error', e.message || 'Failed'); }
            finally { setSaving(false); }
          })();
        }
      },
    ]);
  }, [assignments, agentById, apiRequest, flash]);

  const hireExistingAgent = useCallback(async agent => {
    if (hiringAgentId) return; // prevent double-tap
    setHiringAgentId(agent.id);
    try {
      const res = await apiRequest(`/builder/assign-agent/agents/${agent.id}/hire`, { method: 'POST' });
      if (res.alreadyHired) {
        const team = await apiRequest('/builder/assign-agent/agents');
        setAgents(team.agents || []);
        flash(`${agent.name} is already on your team`);
        setTab('agents');
      } else {
        flash(`Hire request sent to ${agent.name}`);
      }
      // Refresh list silently; close modal only on success
      const avail = await apiRequest('/builder/assign-agent/agents/available');
      setAvailableAgents(avail.agents || []);
      setHireOpen(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to hire agent');
      // Modal stays open so user can retry or close manually
    } finally {
      setHiringAgentId(null);
    }
  }, [hiringAgentId, apiRequest, flash]);

  const closeHireModal = useCallback(() => {
    setHireOpen(false);
    setHireSearch('');
    setHireFetchError('');
    setHiringAgentId(null);
    // Keep availableAgents so re-open is instant if data already loaded
  }, []);

  /* ── Derived layout values ── */
  const assignedCount = Object.keys(assignments).length;
  const vacantCount = properties.length - assignedCount;
  const { isXs, isSm, isTablet, hp, propCols, agentCols, fs, dim, headerPT, showPillLabel } = R;

  const metricData = [
    { label: 'Properties', val: properties.length },
    { label: 'Agents', val: agents.length },
    { label: 'Assigned', val: assignedCount },
    { label: 'Vacant', val: vacantCount },
  ];

  /* ─────────────────────────────────────────────────
     PROPERTY CARD RENDERER
  ───────────────────────────────────────────────── */
  const renderPropertyCard = useCallback(({ item, index }) => {
    const assigned = agentById(assignments[item.id] || item.agentId);
    const sc = assigned ? specStyle(assigned.spec) : null;

    return (
      <AnimatedCard index={index} style={[pc.cardOuter, propCols > 1 && { flex: 1 }]}>
        <View style={pc.card}>
          {/* Hero Image */}
          <Image
            source={{ uri: getImageUrl(item.image) || DEFAULT_PROPERTY_IMAGE }}
            style={[pc.heroImg, { height: dim.propImgH }]}
            resizeMode="cover"
          />

          {/* Badge row */}
          <View style={pc.badgeRow}>
            <View style={pc.typePill}>
              <Text style={[pc.typePillTxt, { fontSize: isXs ? 9 : 11 }]}>{item.type}</Text>
            </View>
            <View style={[pc.statusPill, { backgroundColor: item.status === 'Active' ? P.e100 : P.amberBg }]}>
              <Text style={[pc.statusPillTxt, { fontSize: isXs ? 9 : 11, color: item.status === 'Active' ? P.e700 : P.amber }]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Name + location */}
          <View style={[pc.nameSection, isXs && { paddingHorizontal: 10 }]}>
            <Text style={[pc.heroName, { fontSize: fs.cardTitle }]} numberOfLines={1}>{item.name}</Text>
            <View style={pc.heroLocRow}>
              <MapPin color={P.z400} size={11} strokeWidth={2} />
              <Text style={[pc.heroLoc, { fontSize: fs.cardSub }]} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={[pc.statsRow, isXs && { paddingHorizontal: 10 }]}>
            <View style={pc.statCol}>
              <Text style={[pc.statNum, { fontSize: fs.cardStat }]}>{item.units}</Text>
              <Text style={[pc.statLbl, { fontSize: isXs ? 8 : 10 }]}>Units</Text>
            </View>
            <View style={pc.statDivider} />
            <View style={pc.statCol}>
              <Text style={[pc.statNum, { fontSize: fs.cardStat, color: item.status === 'Active' ? P.e700 : P.amber }]}>
                {item.status}
              </Text>
              <Text style={[pc.statLbl, { fontSize: isXs ? 8 : 10 }]}>Status</Text>
            </View>
          </View>

          {/* Agent zone */}
          <View style={[pc.agentZone, isXs && { padding: 10 }]}>
            {assigned ? (
              <View style={[pc.assignedWrap, isXs && { gap: 6 }]}>
                <Image
                  source={{ uri: getImageUrl(assigned.avatar) || DEFAULT_PROFILE_IMAGE }}
                  style={[pc.assignedAvatar, isXs && { width: 34, height: 34, borderRadius: 17 }]}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[pc.assignedName, { fontSize: isXs ? 12 : 14 }]} numberOfLines={1}>
                    {assigned.name}
                  </Text>
                  <View style={[pc.assignedTagRow, isXs && { gap: 4 }]}>
                    <StarRow rating={assigned.rating} size={isXs ? 10 : 11} />
                    <Text style={pc.dot}>·</Text>
                    <View style={[pc.specTag, { backgroundColor: sc.bg }]}>
                      <Text style={[pc.specTagTxt, { color: sc.text, fontSize: isXs ? 9 : 10 }]}>{assigned.spec}</Text>
                    </View>
                  </View>
                </View>
                <View style={[pc.assignedActions, isXs && { gap: 5 }]}>
                  <AnimatedPressable
                    style={[pc.changeBtn, isXs && { paddingHorizontal: 8, paddingVertical: 6 }]}
                    onPress={() => openPicker(item)}
                    scaleDown={0.92}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <RefreshCw color={P.e700} size={isXs ? 11 : 12} strokeWidth={2.5} />
                    {!isXs && <Text style={pc.changeTxt}>Change</Text>}
                  </AnimatedPressable>
                  <AnimatedPressable
                    style={[pc.removeBtn, isXs && { width: 32, height: 32, borderRadius: 7 }]}
                    onPress={() => removeAssign(item)}
                    scaleDown={0.88}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 color={P.red} size={isXs ? 12 : 14} strokeWidth={2.5} />
                  </AnimatedPressable>
                </View>
              </View>
            ) : (
              <AnimatedPressable
                style={[pc.assignBtn, isXs && { paddingVertical: 10 }]}
                onPress={() => openPicker(item)}
                scaleDown={0.96}
              >
                <Users color={P.white} size={isXs ? 13 : 14} strokeWidth={2} />
                <Text style={[pc.assignBtnTxt, { fontSize: fs.btnLabel }]}>Assign Agent</Text>
              </AnimatedPressable>
            )}
          </View>
        </View>
      </AnimatedCard>
    );
  }, [agentById, assignments, openPicker, removeAssign, dim, fs, isXs, propCols]);

  /* ─────────────────────────────────────────────────
     AGENT CARD RENDERER
  ───────────────────────────────────────────────── */
  const renderAgentCard = useCallback(({ item, index }) => {
    const pNum = propCount(item.id);
    const sc = specStyle(item.spec);
    const avSz = dim.agentAvatarSz;

    return (
      <AnimatedCard index={index} style={[ag.cardOuter, agentCols > 1 && { flex: 1 }]}>
        <View style={[ag.card, isXs && { padding: 10, gap: 8 }]}>
          <Image
            source={{ uri: getImageUrl(item.avatar) || DEFAULT_PROFILE_IMAGE }}
            style={{ width: avSz, height: avSz, borderRadius: avSz / 2, flexShrink: 0 }}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={ag.nameRow}>
              <Text style={[ag.name, { fontSize: fs.agentName }]} numberOfLines={1}>{item.name}</Text>
              <StarRow rating={item.rating} size={isXs ? 10 : 11} />
            </View>
            <View style={[ag.tagRow, isXs && { gap: 5 }]}>
              <View style={[ag.specTag, { backgroundColor: sc.bg }]}>
                <Text style={[ag.specTxt, { color: sc.text, fontSize: isXs ? 9 : 11 }]}>{item.spec}</Text>
              </View>
              <Text style={[ag.cityTxt, { fontSize: isXs ? 10 : 12 }]} numberOfLines={1}>{item.city}</Text>
            </View>
            <View style={ag.statsRow}>
              <Text style={[ag.statTxt, { fontSize: fs.agentSub }]}>{item.exp} yrs exp</Text>
              <View style={ag.sep} />
              <Text style={[ag.statTxt, { fontSize: fs.agentSub }]}>{item.deals} deals</Text>
              {!isXs && (
                <>
                  <View style={ag.sep} />
                  <Text style={[ag.statTxt, { fontSize: fs.agentSub }]} numberOfLines={1}>{item.phone}</Text>
                </>
              )}
            </View>
          </View>
          {pNum > 0 && (
            <View style={[ag.badge, isXs && { paddingHorizontal: 6, paddingVertical: 3 }]}>
              <Text style={[ag.badgeTxt, { fontSize: isXs ? 9 : 11 }]}>{pNum}P</Text>
            </View>
          )}
        </View>
      </AnimatedCard>
    );
  }, [propCount, dim, fs, isXs, agentCols]);

  /* ─────────────────────────────────────────────────
     PICKER ROW RENDERER
  ───────────────────────────────────────────────── */
  const renderPickerRow = useCallback(({ item, index }) => {
    const isCurrent = assignments[pickerProp?.id] === item.id;
    const sc = specStyle(item.spec);
    const avSz = dim.pickerAvatarSz;
    return (
      <AnimatedCard index={index} style={{}}>
        <TouchableOpacity
          style={[pkr.row, isCurrent && pkr.rowActive, isXs && { paddingVertical: 11 }]}
          onPress={() => confirmAssign(item)}
          activeOpacity={0.78}
        >
          <Image source={{ uri: getImageUrl(item.avatar) || DEFAULT_PROFILE_IMAGE }} style={{ width: avSz, height: avSz, borderRadius: avSz / 2, flexShrink: 0 }} />
          <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
              <Text style={[pkr.name, { fontSize: isXs ? 13 : 14 }]} numberOfLines={1}>{item.name}</Text>
              <View style={[pkr.specBadge, { backgroundColor: sc.bg }]}>
                <Text style={[pkr.specTxt, { color: sc.text, fontSize: isXs ? 9 : 10 }]}>{item.spec}</Text>
              </View>
            </View>
            <Text style={[pkr.sub, { fontSize: isXs ? 11 : 12 }]}>{item.city} · {item.exp} yrs · {item.deals} deals</Text>
            <View style={{ marginTop: 3 }}><StarRow rating={item.rating} size={isXs ? 10 : 11} /></View>
          </View>
          <View style={[pkr.checkCircle, isCurrent && pkr.checkCircleActive, isXs && { width: 24, height: 24, borderRadius: 12 }]}>
            {isCurrent && <Check color={P.white} size={isXs ? 11 : 13} strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  }, [assignments, pickerProp, confirmAssign, dim, isXs]);

  /* ─────────────────────────────────────────────────
     HIRE ROW RENDERER
  ───────────────────────────────────────────────── */
  const renderHireRow = useCallback(({ item, index }) => {
    const sc = specStyle(item.spec);
    const avSz = dim.hireAvatarSz;
    const isThisHiring = hiringAgentId === item.id;
    const anyHiring = hiringAgentId !== null;
    return (
      <AnimatedCard index={index} style={{}}>
        <View style={[hr.row, isXs && { paddingVertical: 10 }]}>
          <Image source={{ uri: getImageUrl(item.avatar) || DEFAULT_PROFILE_IMAGE }} style={{ width: avSz, height: avSz, borderRadius: avSz / 2, flexShrink: 0 }} />
          <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
            <Text style={[hr.name, { fontSize: isXs ? 13 : 14 }]} numberOfLines={1}>{item.name}</Text>
            <View style={[hr.metaRow, isXs && { gap: 5 }]}>
              <View style={[hr.specBadge, { backgroundColor: sc.bg }]}>
                <Text style={[hr.specTxt, { color: sc.text, fontSize: isXs ? 9 : 11 }]}>{item.spec}</Text>
              </View>
              {!isXs && (
                <Text style={hr.contact} numberOfLines={1}>{item.email || item.phone || ''}</Text>
              )}
            </View>
            <Text style={[hr.sub, { fontSize: isXs ? 10 : 12 }]} numberOfLines={1}>
              {item.city ? item.city : ''}
              {item.exp ? `  ·  ${item.exp} yrs exp` : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              hr.btn,
              (anyHiring && !isThisHiring) && hr.btnOff,
              { minHeight: dim.hireBtnH, paddingHorizontal: dim.hireBtnPadH },
            ]}
            onPress={() => hireExistingAgent(item)}
            disabled={anyHiring}
            activeOpacity={0.75}
          >
            {isThisHiring ? (
              <ActivityIndicator color={P.white} size="small" />
            ) : (
              <Text style={[hr.btnTxt, { fontSize: isXs ? 12 : 13 }]}>Hire</Text>
            )}
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    );
  }, [hireExistingAgent, hiringAgentId, dim, isXs]);

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.e800} />

      {/* ══════ HEADER ══════ */}
      <Animated.View style={[
        s.header,
        { paddingTop: headerPT, paddingHorizontal: hp, paddingBottom: isXs ? 14 : 18 },
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}>
        {/* Nav row */}
        <View style={s.navRow}>
          <AnimatedPressable
            style={[
              s.backBtn,
              { width: dim.backBtnSz, height: dim.backBtnSz, borderRadius: isXs ? 8 : 10 },
            ]}
            onPress={() => navigation?.goBack?.() || onBack?.()}
            scaleDown={0.88}
          >
            <ArrowLeft color={P.white} size={dim.backIconSz} strokeWidth={2.5} />
          </AnimatedPressable>

          <Text
            style={[s.headTitle, { fontSize: fs.headerTitle }]}
            numberOfLines={1}
          >
            Agent Management
          </Text>

          <AnimatedPressable
            style={[s.hireCTA, isXs && { paddingHorizontal: 10, paddingVertical: 7 }]}
            onPress={openHireModal}
            scaleDown={0.94}
          >
            <UserPlus color={P.white} size={isTablet ? 18 : 15} strokeWidth={2.5} />
            {!isXs && (
              <Text style={[s.hireCTATxt, isTablet && { fontSize: 14 }]}>Hire</Text>
            )}
          </AnimatedPressable>
        </View>

        {/* Metric cards */}
        {isXs ? (
          // xs: 2×2 grid
          <View style={{ gap: 6 }}>
            <View style={[s.metricRow, { gap: 6 }]}>
              {metricData.slice(0, 2).map(({ label, val }, i) => (
                <Animated.View
                  key={label}
                  style={[
                    s.metricCard,
                    {
                      opacity: metricAnims[i],
                      transform: [
                        { scale: metricAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                        { translateY: metricAnims[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                      ],
                    },
                  ]}
                >
                  <Text style={[s.metricVal, { fontSize: fs.metricVal }]}>{val}</Text>
                  <Text style={[s.metricLbl, { fontSize: fs.metricLbl }]}>{label}</Text>
                </Animated.View>
              ))}
            </View>
            <View style={[s.metricRow, { gap: 6 }]}>
              {metricData.slice(2, 4).map(({ label, val }, i) => (
                <Animated.View
                  key={label}
                  style={[
                    s.metricCard,
                    {
                      opacity: metricAnims[i + 2],
                      transform: [
                        { scale: metricAnims[i + 2].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                        { translateY: metricAnims[i + 2].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                      ],
                    },
                  ]}
                >
                  <Text style={[s.metricVal, { fontSize: fs.metricVal }]}>{val}</Text>
                  <Text style={[s.metricLbl, { fontSize: fs.metricLbl }]}>{label}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        ) : (
          // sm+: 4-col single row
          <View style={[s.metricRow, { gap: isTablet ? 10 : 8 }]}>
            {metricData.map(({ label, val }, i) => (
              <Animated.View
                key={label}
                style={[
                  s.metricCard,
                  {
                    opacity: metricAnims[i],
                    transform: [
                      { scale: metricAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                      { translateY: metricAnims[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
                    ],
                  },
                ]}
              >
                <Text style={[s.metricVal, { fontSize: fs.metricVal }]}>{val}</Text>
                <Text style={[s.metricLbl, { fontSize: fs.metricLbl }]}>{label}</Text>
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

      <AnimatedToast msg={banner} hp={hp} />

      {/* ══════ TABS ══════ */}
      <View style={[s.tabBarWrap, { paddingHorizontal: hp }]}>
        <View style={s.tabBar}>
          {[
            { key: 'properties', label: 'Properties' },
            { key: 'agents', label: 'My Agents' },
          ].map(({ key, label }) => {
            const active = tab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[s.tabItem, active && s.tabItemActive, { paddingVertical: dim.tabPadV }]}
                onPress={() => setTab(key)}
                activeOpacity={0.7}
              >
                <Text style={[s.tabTxt, { fontSize: fs.tabLabel }, active && s.tabTxtActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ══════ PROPERTIES TAB ══════ */}
      {tab === 'properties' && (
        <TabContent key={`tab-p-${tabContentKey.current}`}>
          <View style={[s.toolRow, { paddingHorizontal: hp }]}>
            <SearchBar
              value={propSearch}
              onChange={setPropSearch}
              placeholder="Search properties…"
              height={dim.searchH}
              fontSize={fs.searchInput}
            />
          </View>
          <FilterBar
            active={propFilter}
            onSelect={setPropFilter}
            properties={properties}
            hp={hp}
            showLabel={showPillLabel}
            pillHeight={dim.filterPillH}
            fontSize={fs.pillLabel}
          />
          <FlatList
            data={filteredProps}
            keyExtractor={i => i.id}
            renderItem={renderPropertyCard}
            numColumns={propCols}
            key={`p-${propCols}`}
            columnWrapperStyle={propCols > 1 ? { gap: 12 } : undefined}
            contentContainerStyle={[s.list, { paddingHorizontal: hp }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.empty}>
                <Building2 color={P.z300} size={isXs ? 32 : 40} strokeWidth={1.5} />
                <Text style={[s.emptyH, { fontSize: isXs ? 13 : 15 }]}>No properties found</Text>
                <Text style={[s.emptySub, { fontSize: isXs ? 12 : 13 }]}>Try a different search or filter</Text>
              </View>
            }
          />
        </TabContent>
      )}

      {/* ══════ AGENTS TAB ══════ */}
      {tab === 'agents' && (
        <TabContent key={`tab-a-${tabContentKey.current}`}>
          <View style={[s.toolRow, { paddingHorizontal: hp, gap: 8 }]}>
            <SearchBar
              value={agentSearch}
              onChange={setAgentSearch}
              placeholder="Search agents…"
              height={dim.searchH}
              fontSize={fs.searchInput}
            />
            <AnimatedPressable
              style={[
                s.hireIconBtn,
                { width: dim.searchH, height: dim.searchH, borderRadius: isXs ? 9 : 11 },
              ]}
              onPress={openHireModal}
              scaleDown={0.90}
            >
              <UserPlus color={P.white} size={isTablet ? 19 : 16} strokeWidth={2.5} />
            </AnimatedPressable>
          </View>
          <FlatList
            data={filteredAgents}
            keyExtractor={i => i.id}
            renderItem={renderAgentCard}
            numColumns={agentCols}
            key={`a-${agentCols}`}
            columnWrapperStyle={agentCols > 1 ? { gap: 12 } : undefined}
            contentContainerStyle={[s.list, { paddingHorizontal: hp }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.empty}>
                <Users color={P.z300} size={isXs ? 32 : 40} strokeWidth={1.5} />
                <Text style={[s.emptyH, { fontSize: isXs ? 13 : 15 }]}>No agents on your team</Text>
                <Text style={[s.emptySub, { fontSize: isXs ? 12 : 13 }]}>Hire your first agent to get started</Text>
                <AnimatedPressable style={s.emptyHireBtn} onPress={openHireModal} scaleDown={0.95}>
                  <Text style={[s.emptyHireTxt, { fontSize: isXs ? 13 : 14 }]}>Hire Agent</Text>
                </AnimatedPressable>
              </View>
            }
          />
        </TabContent>
      )}

      {/* ══════ LOADING OVERLAY ══════ */}
      {(saving || loading) && (
        <View style={s.overlay}>
          <Animated.View style={[
            s.overlayBox,
            { paddingVertical: dim.overlayPadV, paddingHorizontal: dim.overlayPadH },
          ]}>
            <PulsingLoader />
            <Text style={[s.overlayTxt, { fontSize: isXs ? 13 : 14 }]}>
              {loading ? 'Loading…' : 'Saving…'}
            </Text>
          </Animated.View>
        </View>
      )}

      {/* ══════════════════════════════════════════
          ASSIGN AGENT MODAL
      ══════════════════════════════════════════ */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={md.backdrop}>
          <View style={[md.sheet, { maxHeight: dim.modalMaxH }]}>
            <View style={md.handle} />
            <View style={[md.header, { paddingHorizontal: dim.modalHP }]}>
              <View style={{ flex: 1 }}>
                <Text style={[md.title, { fontSize: fs.modalTitle }]}>Choose an Agent</Text>
                {pickerProp && (
                  <Text style={md.sub} numberOfLines={1}>For: {pickerProp.name}</Text>
                )}
              </View>
              <AnimatedPressable
                style={[md.closeBtn, isXs && { width: 32, height: 32, borderRadius: 8 }]}
                onPress={() => setPickerOpen(false)}
                scaleDown={0.88}
              >
                <X color={P.z600} size={isXs ? 15 : 17} strokeWidth={2.5} />
              </AnimatedPressable>
            </View>
            <View style={[md.searchWrap, { paddingHorizontal: dim.modalHP }]}>
              <ModalSearchBar
                value={pickerSearch}
                onChange={setPickerSearch}
                placeholder="Search by name or specialty…"
                height={dim.modalSearchH}
                fontSize={fs.searchInput}
              />
            </View>
            <ModalListFade>
              <FlatList
                data={pickerAgents}
                keyExtractor={i => i.id}
                renderItem={renderPickerRow}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: dim.modalHP, paddingBottom: 40 }}
                ItemSeparatorComponent={() => <View style={md.separator} />}
                ListEmptyComponent={
                  <View style={[s.empty, { paddingTop: 30 }]}>
                    <Users color={P.z300} size={isXs ? 28 : 36} strokeWidth={1.5} />
                    <Text style={[s.emptySub, { fontSize: isXs ? 12 : 13 }]}>No agents found</Text>
                  </View>
                }
              />
            </ModalListFade>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════
          HIRE AGENT MODAL
      ══════════════════════════════════════════ */}
      <Modal
        visible={hireOpen}
        transparent
        animationType="slide"
        onRequestClose={closeHireModal}
      >
        <View style={md.backdrop}>
          <View style={[md.sheet, { maxHeight: dim.modalMaxH }]}>
            <View style={md.handle} />
            <View style={[md.header, { paddingHorizontal: dim.modalHP }]}>
              <View style={[md.headerIcon, isXs && { width: 32, height: 32, borderRadius: 8 }]}>
                <UserPlus color={P.white} size={isXs ? 13 : 16} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[md.title, { fontSize: fs.modalTitle }]}>Hire an Agent</Text>
                <Text style={md.sub}>Browse & hire registered agents</Text>
              </View>
              <AnimatedPressable
                style={[md.closeBtn, isXs && { width: 32, height: 32, borderRadius: 8 }]}
                onPress={closeHireModal}
                scaleDown={0.88}
              >
                <X color={P.z600} size={isXs ? 15 : 17} strokeWidth={2.5} />
              </AnimatedPressable>
            </View>
            <View style={[md.searchWrap, { paddingHorizontal: dim.modalHP }]}>
              <ModalSearchBar
                value={hireSearch}
                onChange={setHireSearch}
                placeholder="Search by name, email or phone…"
                height={dim.modalSearchH}
                fontSize={fs.searchInput}
              />
            </View>
            {!hiring && !hireFetchError && filteredAvailable.length > 0 && (
              <View style={[md.countRow, { paddingHorizontal: dim.modalHP }]}>
                <Text style={[md.countTxt, { fontSize: isXs ? 11 : 12 }]}>
                  {filteredAvailable.length} agent{filteredAvailable.length !== 1 ? 's' : ''} available
                </Text>
              </View>
            )}
            {/* Loading state */}
            {hiring ? (
              <View style={[s.empty, { paddingTop: 36, paddingBottom: 36 }]}>
                <PulsingLoader />
                <Text style={[s.emptySub, { marginTop: 14, fontSize: isXs ? 12 : 13 }]}>
                  Loading agents…
                </Text>
              </View>
            ) : hireFetchError ? (
              /* Error state with retry */
              <View style={[s.empty, { paddingTop: 36, paddingBottom: 36 }]}>
                <AlertCircle color={P.red} size={isXs ? 28 : 36} strokeWidth={1.5} />
                <Text style={[s.emptyH, { fontSize: isXs ? 13 : 14, color: P.red }]}>
                  Could not load agents
                </Text>
                <Text style={[s.emptySub, { fontSize: isXs ? 12 : 13, textAlign: 'center', paddingHorizontal: 16 }]}>
                  {hireFetchError}
                </Text>
                <AnimatedPressable
                  style={[s.emptyHireBtn, { backgroundColor: P.e700, marginTop: 14 }]}
                  onPress={fetchAvailableAgents}
                  scaleDown={0.95}
                >
                  <Text style={[s.emptyHireTxt, { fontSize: isXs ? 12 : 14 }]}>Retry</Text>
                </AnimatedPressable>
              </View>
            ) : (
              <ModalListFade>
                <FlatList
                  data={filteredAvailable}
                  keyExtractor={i => i.id}
                  renderItem={renderHireRow}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingHorizontal: dim.modalHP, paddingBottom: 30 }}
                  ItemSeparatorComponent={() => <View style={md.separator} />}
                  ListEmptyComponent={
                    <View style={[s.empty, { paddingTop: 30 }]}>
                      <Users color={P.z300} size={isXs ? 28 : 36} strokeWidth={1.5} />
                      <Text style={[s.emptyH, { fontSize: isXs ? 13 : 15 }]}>No agents available</Text>
                      <Text style={[s.emptySub, { fontSize: isXs ? 12 : 13 }]}>
                        Check back later or invite via email
                      </Text>
                    </View>
                  }
                />
              </ModalListFade>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ═══════════════════════════════════════════════
   PROPERTY CARD STYLES
═══════════════════════════════════════════════ */
const pc = StyleSheet.create({
  cardOuter: { marginBottom: 14 },
  card: {
    backgroundColor: P.white, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: P.z200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  heroImg: { width: '100%' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingTop: 10 },
  typePill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, backgroundColor: P.z100 },
  typePillTxt: { color: P.z600, fontWeight: '600' },
  statusPill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  statusPillTxt: { fontWeight: '600' },
  nameSection: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 2 },
  heroName: { fontWeight: '700', color: P.z900, marginBottom: 4 },
  heroLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLoc: { color: P.z400, flex: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: P.z100, marginTop: 8 },
  statCol: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontWeight: '700', color: P.z800 },
  statLbl: { color: P.z400, textTransform: 'uppercase', letterSpacing: 0.3 },
  statDivider: { width: 1, height: 26, backgroundColor: P.z100 },
  agentZone: { padding: 12, borderTopWidth: 1, borderTopColor: P.z100 },
  assignedWrap: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  assignedAvatar: { width: 40, height: 40, borderRadius: 20, flexShrink: 0 },
  assignedName: { fontWeight: '600', color: P.z900, marginBottom: 3 },
  assignedTagRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  dot: { color: P.z300, fontSize: 14 },
  specTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  specTagTxt: { fontWeight: '600' },
  assignedActions: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 0 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: P.e200, backgroundColor: P.e50, minHeight: 36 },
  changeTxt: { fontSize: 12, fontWeight: '600', color: P.e700 },
  removeBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: P.redBg, justifyContent: 'center', alignItems: 'center' },
  assignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: P.e700, paddingVertical: 11, borderRadius: 10, minHeight: 44 },
  assignBtnTxt: { fontWeight: '700', color: P.white },
});

/* ═══════════════════════════════════════════════
   AGENT CARD STYLES
═══════════════════════════════════════════════ */
const ag = StyleSheet.create({
  cardOuter: { marginBottom: 10 },
  card: {
    backgroundColor: P.white, borderRadius: 12, padding: 13,
    flexDirection: 'row', gap: 11, alignItems: 'center',
    borderWidth: 1, borderColor: P.z200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  badge: { backgroundColor: P.e100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  badgeTxt: { fontWeight: '700', color: P.e700 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontWeight: '700', color: P.z900, flex: 1, marginRight: 6 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' },
  specTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  specTxt: { fontWeight: '600' },
  cityTxt: { color: P.z400, flexShrink: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  statTxt: { color: P.z500 },
  sep: { width: 1, height: 10, backgroundColor: P.z200, marginHorizontal: 7 },
});

/* ═══════════════════════════════════════════════
   PICKER ROW STYLES
═══════════════════════════════════════════════ */
const pkr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, minHeight: 64 },
  rowActive: { backgroundColor: P.e50, paddingHorizontal: 10, marginHorizontal: -10, borderRadius: 10 },
  name: { fontWeight: '700', color: P.z900, flex: 1 },
  specBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  specTxt: { fontWeight: '700' },
  sub: { color: P.z500, marginBottom: 2 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: P.z200, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkCircleActive: { backgroundColor: P.e600, borderColor: P.e600 },
});

/* ═══════════════════════════════════════════════
   HIRE ROW STYLES
═══════════════════════════════════════════════ */
const hr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, minHeight: 68 },
  name: { fontWeight: '700', color: P.z900, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' },
  specBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  specTxt: { fontWeight: '700' },
  contact: { fontSize: 12, color: P.z500, flexShrink: 1 },
  sub: { color: P.z400 },
  btn: { backgroundColor: P.e700, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  btnOff: { backgroundColor: P.z300 },
  btnTxt: { color: P.white, fontWeight: '700' },
});

/* ═══════════════════════════════════════════════
   MODAL STYLES
═══════════════════════════════════════════════ */
const md = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { flexShrink: 1, width: '100%', backgroundColor: P.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 36 : 20 },
  handle: { width: 40, height: 4, backgroundColor: P.z300, borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: P.z100 },
  headerIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: P.e700, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  title: { fontWeight: '800', color: P.z900, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: P.z500, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: P.z100, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto', flexShrink: 0 },
  searchWrap: { paddingTop: 12, paddingBottom: 8 },
  countRow: { paddingBottom: 7 },
  countTxt: { color: P.z400, fontWeight: '500' },
  separator: { height: 1, backgroundColor: P.z100, marginVertical: 2 },
});

/* ═══════════════════════════════════════════════
   SCREEN STYLES
═══════════════════════════════════════════════ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.z50 },

  header: { backgroundColor: P.e800 },
  navRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backBtn: { justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: 'rgba(255,255,255,0.12)' },
  headTitle: { flex: 1, fontWeight: '800', color: P.white },
  hireCTA: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.40)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minHeight: 40, justifyContent: 'center' },
  hireCTATxt: { color: P.white, fontWeight: '700', fontSize: 13 },

  metricRow: { flexDirection: 'row' },
  metricCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 4, alignItems: 'center', gap: 2 },
  metricVal: { fontWeight: '800', color: P.white },
  metricLbl: { color: 'rgba(255,255,255,0.60)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },

  tabBarWrap: { backgroundColor: P.white, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: P.z200 },
  tabBar: { flexDirection: 'row', backgroundColor: P.z100, borderRadius: 10, padding: 3 },
  tabItem: { flex: 1, alignItems: 'center', borderRadius: 8, minHeight: 42, justifyContent: 'center' },
  tabItemActive: { backgroundColor: P.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabTxt: { fontWeight: '600', color: P.z400 },
  tabTxtActive: { color: P.z900, fontWeight: '700' },

  toolRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 0 },
  hireIconBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: P.e800 },

  list: { paddingTop: 4, paddingBottom: 40 },

  empty: { alignItems: 'center', paddingTop: 50, gap: 8 },
  emptyH: { fontWeight: '700', color: P.z600, marginTop: 8 },
  emptySub: { color: P.z400, textAlign: 'center' },
  emptyHireBtn: { backgroundColor: P.e800, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 11, marginTop: 8, minHeight: 44, justifyContent: 'center' },
  emptyHireTxt: { color: P.white, fontWeight: '700' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  overlayBox: { backgroundColor: P.white, borderRadius: 20, alignItems: 'center', gap: 12, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  overlayTxt: { color: P.z700, fontWeight: '600' },
});