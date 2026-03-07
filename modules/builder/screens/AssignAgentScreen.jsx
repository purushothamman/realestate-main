/**
 * AssignAgentScreen.jsx — Fully Responsive v4
 *
 * BREAKPOINTS:
 *   xs  : width < 360   (iPhone SE, small Android)
 *   sm  : 360–599       (iPhone 14, Pixel 7)
 *   md  : 600–899       (iPad mini portrait, large phone landscape)
 *   lg  : 900–1199      (iPad 10", iPad Pro 11" portrait)
 *   xl  : ≥ 1200        (iPad Pro 12.9", landscape tablets)
 *
 * v4 FIXES:
 *   • FlatList numColumns key prop now always matches numColumns value
 *   • columnWrapperStyle gap applied via consistent wrapper
 *   • Property cards: flex layout with minWidth guard prevents over-squeeze
 *   • Agent cards: flex layout with minWidth guard
 *   • Header: metricRow wrapping guard with minWidth on MetricCard
 *   • SearchBar + Dropdown toolRow: shrink-safe with minWidth on DD trigger
 *   • Modal sheets: safe maxHeight with minHeight for content
 *   • Picker / Hire rows: avatar shrink:0 and text flex:1 enforced
 *   • TypeFilterDropdown panel: zIndex hierarchy fixed for all tabs
 *   • All text: numberOfLines + flex guards to prevent overflow
 *   • Landscape: layout compensates for reduced height
 *   • xs: "Hire" CTA collapses to icon-only; metric grid 2×2
 *   • Safe-area paddingTop via Platform-aware headerPT
 *   • Tab bar min height enforced on all breakpoints
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
  ChevronDown, SlidersHorizontal,
} from 'lucide-react-native';
import { API_BASE_URL } from '../../../utils/api';

/* ═══════════════════════════════════════════
   BREAKPOINT SYSTEM
═══════════════════════════════════════════ */
const BP = { xs: 0, sm: 360, md: 600, lg: 900, xl: 1200 };

function getBreakpoint(w) {
  if (w >= BP.xl) return 'xl';
  if (w >= BP.lg) return 'lg';
  if (w >= BP.md) return 'md';
  if (w >= BP.sm) return 'sm';
  return 'xs';
}

/* ═══════════════════════════════════════════
   RESPONSIVE HOOK
═══════════════════════════════════════════ */
function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const bp       = getBreakpoint(width);
    const isXs     = bp === 'xs';
    const isSm     = bp === 'sm';
    const isMd     = bp === 'md';
    const isLg     = bp === 'lg';
    const isXl     = bp === 'xl';
    const isPhone  = isXs || isSm;
    const isTablet = isMd || isLg || isXl;
    const isLandscape = width > height;

    // Horizontal page padding — capped so cards don't get tiny
    const hp = isXs ? 10 : isSm ? 14 : isMd ? 20 : isLg ? 26 : 32;

    // Column counts
    const propCols  = isPhone ? 1 : isMd || isLg ? 2 : 3;
    const agentCols = isPhone ? 1 : isMd || isLg ? 2 : 3;

    // Usable content width for card min-width guards
    const contentW = width - hp * 2;
    // Per-column min width (with gap)
    const colGap = 12;
    const propColW  = propCols  > 1 ? (contentW - colGap * (propCols  - 1)) / propCols  : contentW;
    const agentColW = agentCols > 1 ? (contentW - colGap * (agentCols - 1)) / agentCols : contentW;

    // Font scale
    const fs = {
      headerTitle  : isXs ? 14 : isSm ? 16 : isMd ? 19 : isLg ? 21 : 23,
      tabLabel     : isXs ? 12 : isSm ? 13 : 14,
      metricVal    : isXs ? 13 : isSm ? 15 : isMd ? 17 : isLg ? 19 : 21,
      metricLbl    : isXs ? 7  : isSm ? 8  : isMd ? 9  : 10,
      cardTitle    : isXs ? 12 : isSm ? 13 : isMd ? 14 : 15,
      cardSub      : isXs ? 10 : isSm ? 11 : 12,
      cardStat     : isXs ? 11 : 12,
      agentName    : isXs ? 12 : isSm ? 13 : isMd ? 14 : 15,
      agentSub     : isXs ? 10 : 11,
      modalTitle   : isXs ? 13 : isSm ? 15 : 16,
      btnLabel     : isXs ? 11 : isSm ? 12 : 13,
      searchInput  : isXs ? 12 : 13,
      filterChip   : isXs ? 10 : isSm ? 11 : isMd ? 12 : 13,
      dropdownItem : isXs ? 12 : 13,
    };

    // Dimension scale
    const dim = {
      propImgH        : isXs ? 100 : isSm ? 125 : isMd ? 148 : isLg ? 162 : 182,
      agentAvatarSz   : isXs ? 40  : isSm ? 46  : isMd ? 52  : isLg ? 56  : 60,
      pickerAvatarSz  : isXs ? 36  : isSm ? 42  : 48,
      hireAvatarSz    : isXs ? 36  : isSm ? 42  : 48,
      backBtnSz       : isXs ? 32  : isSm ? 36  : isMd ? 40  : 44,
      backIconSz      : isXs ? 15  : isSm ? 17  : isMd ? 19  : 21,
      // Modal max height: taller on landscape phones since height is small
      modalMaxH       : isLandscape && isPhone
        ? height * 0.96
        : isXs ? height * 0.92 : isPhone ? height * 0.85 : height * 0.75,
      modalHP         : isXs ? 12  : isSm ? 16  : isMd ? 22  : isLg ? 26  : 30,
      tabPadV         : isXs ? 7   : isSm ? 8   : isMd ? 10  : 11,
      searchH         : isXs ? 38  : isSm ? 40  : 44,
      modalSearchH    : isXs ? 40  : isSm ? 44  : 48,
      overlayPadH     : isXs ? 22  : isSm ? 28  : 38,
      overlayPadV     : isXs ? 18  : isSm ? 22  : 30,
      hireBtnH        : isXs ? 32  : isSm ? 36  : 40,
      hireBtnPadH     : isXs ? 9   : isSm ? 12  : 16,
      dropdownIconSz  : isXs ? 12  : isSm ? 13  : 14,
      // dropdownMinW must fit "All Types" label + icons + padding
      dropdownMinW    : isXs ? 100 : isSm ? 116 : isMd ? 130 : 142,
      dropdownPanelW  : isXs ? 168 : isSm ? 192 : isMd ? 210 : 224,
      hireIconBtnR    : isXs ? 8   : isSm ? 9   : 10,
      cardAvatarSz    : isXs ? 30  : isSm ? 36  : 40,
      cardAvatarR     : isXs ? 15  : isSm ? 18  : 20,
      changeBtnH      : isXs ? 30  : 34,
      removeBtnSz     : isXs ? 30  : 34,
    };

    // Header paddingTop — accounts for status bar / notch
    const headerPT = Platform.OS === 'ios'
      ? (isTablet ? 54 : 50)
      : (isXs ? 20 : isSm ? 26 : isTablet ? 32 : 28);

    return {
      width, height, bp,
      isXs, isSm, isMd, isLg, isXl,
      isPhone, isTablet, isLandscape,
      hp, propCols, agentCols,
      propColW, agentColW,
      fs, dim, headerPT,
    };
  }, [width, height]);
}

/* ═══════════════════════════════════════════
   PALETTE
═══════════════════════════════════════════ */
const P = {
  e900: '#052E16', e800: '#14532D', e700: '#15803D',
  e600: '#16A34A', e500: '#22C55E', e400: '#4ADE80',
  e200: '#BBF7D0', e100: '#DCFCE7', e50:  '#F0FDF4',
  z900: '#111827', z800: '#1F2937', z700: '#374151',
  z600: '#4B5563', z500: '#6B7280', z400: '#9CA3AF',
  z300: '#D1D5DB', z200: '#E5E7EB', z100: '#F3F4F6',
  z50:  '#F9FAFB', white: '#FFFFFF',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  red:   '#EF4444', redBg:   '#FFF1F2',
};

const specStyle = (spec) => ({
  Residential: { bg: '#DCFCE7', text: '#14532D' },
  Commercial:  { bg: '#DBEAFE', text: '#1E40AF' },
  Luxury:      { bg: '#FEF3C7', text: '#92400E' },
  'Mixed Use': { bg: '#EDE9FE', text: '#5B21B6' },
}[spec] || { bg: '#F3F4F6', text: '#374151' });

/* ═══════════════════════════════════════════
   TYPE FILTER CONFIG
═══════════════════════════════════════════ */
const TYPE_FILTERS = [
  { key: 'All',         label: 'All Types',   Icon: Layers    },
  { key: 'Residential', label: 'Residential', Icon: Home      },
  { key: 'Commercial',  label: 'Commercial',  Icon: Building2 },
  { key: 'Mixed Use',   label: 'Mixed Use',   Icon: Zap       },
];

/* ═══════════════════════════════════════════
   ANIMATED PRESSABLE
═══════════════════════════════════════════ */
const AnimatedPressable = ({
  onPress, style, children, scaleDown = 0.94,
  activeOpacity = 0.88, hitSlop, disabled, ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scale, { toValue: scaleDown, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,         useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  return (
    <TouchableOpacity
      onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
      activeOpacity={activeOpacity} hitSlop={hitSlop} disabled={disabled} {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

/* ═══════════════════════════════════════════
   ANIMATED CARD (fade + rise)
═══════════════════════════════════════════ */
const AnimatedCard = ({ index, children, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 300,
      delay: Math.min(index, 7) * 55,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[style, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
    }]}>
      {children}
    </Animated.View>
  );
};

/* ═══════════════════════════════════════════
   SEARCH BAR
   FIX: flex:1 on wrap, minWidth:0 on input, ref pattern updated
═══════════════════════════════════════════ */
const SearchBar = ({ value, onChange, placeholder, style, height: h = 44, fontSize = 14 }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[SB.wrap, { height: h, borderColor: focused ? P.e600 : P.z200, backgroundColor: focused ? P.white : P.z50 }, style]}>
      <Search color={focused ? P.e500 : P.z400} size={15} strokeWidth={2} />
      <TextInput
        style={[SB.input, { fontSize }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || 'Search…'}
        placeholderTextColor={P.z400}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
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
  wrap:  {
    flex: 1,           // takes remaining horizontal space in toolRow
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12,
  },
  input: {
    flex: 1, minWidth: 0,   // prevents text overflow pushing siblings
    color: P.z900, height: '100%',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  clear: { width: 20, height: 20, borderRadius: 10, backgroundColor: P.z200, justifyContent: 'center', alignItems: 'center' },
});

/* ═══════════════════════════════════════════
   MODAL SEARCH BAR
═══════════════════════════════════════════ */
const ModalSearchBar = ({ value, onChange, placeholder, height: h = 48, fontSize = 14 }) => {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const onFocus = () => { setFocused(true);  Animated.timing(anim, { toValue: 1, duration: 160, useNativeDriver: false }).start(); };
  const onBlur  = () => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: false }).start(); };
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [P.z300, P.e600] });
  return (
    <Animated.View style={[MSB.wrap, { height: h, borderColor }]}>
      <Search color={focused ? P.e600 : P.z400} size={15} strokeWidth={2} />
      <TextInput
        style={[MSB.input, { fontSize }]}
        value={value} onChangeText={onChange}
        placeholder={placeholder || 'Search…'} placeholderTextColor={P.z400}
        onFocus={onFocus} onBlur={onBlur}
        returnKeyType="search" autoCorrect={false} autoCapitalize="none"
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
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: P.white, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, minWidth: 0, color: P.z900, height: '100%', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) },
  clear: { width: 22, height: 22, borderRadius: 11, backgroundColor: P.z200, justifyContent: 'center', alignItems: 'center' },
});

/* ═══════════════════════════════════════════
   STAR ROW
═══════════════════════════════════════════ */
const StarRow = ({ rating, size = 11 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    <Star color={P.amber} fill={P.amber} size={size} strokeWidth={0} />
    <Text style={{ fontSize: size + 1, fontWeight: '700', color: P.z700 }}>
      {rating > 0 ? rating.toFixed(1) : 'New'}
    </Text>
  </View>
);

/* ═══════════════════════════════════════════
   ANIMATED TOAST
═══════════════════════════════════════════ */
const AnimatedToast = ({ msg, hp }) => {
  const anim    = useRef(new Animated.Value(0)).current;
  const prevMsg = useRef('');
  useEffect(() => {
    if (msg && !prevMsg.current)
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
    if (!msg && prevMsg.current)
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    prevMsg.current = msg;
  }, [msg]);
  if (!msg && !prevMsg.current) return null;
  return (
    <Animated.View style={[TS.wrap, { marginHorizontal: hp }, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-28, 0] }) }],
    }]}>
      <CheckCircle2 color={P.e600} size={16} strokeWidth={2.5} />
      <Text style={TS.txt} numberOfLines={2}>{msg || prevMsg.current}</Text>
    </Animated.View>
  );
};
const TS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: P.e50, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: P.e200, shadowColor: P.e600, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  txt:  { flex: 1, fontSize: 13, fontWeight: '600', color: P.e800 },
});

/* ═══════════════════════════════════════════════════════════
   TYPE FILTER DROPDOWN  — v4 fixes
   • zIndex elevated to 200 to clear FlatList stacking context
   • Panel zIndex also 200
   • Backdrop covers entire screen via fixed large offsets
   • minWidth enforced inline (not from StyleSheet fn)
   • Panel width matches dropdownPanelW prop on tablet
═══════════════════════════════════════════════════════════ */
const TypeFilterDropdown = React.memo(({
  active, onSelect, properties,
  height: btnH = 44, fontSize, iconSize = 15,
  minWidth = 120, isTablet, panelWidth = 210,
}) => {
  const [open, setOpen]     = useState(false);
  const fadeAnim            = useRef(new Animated.Value(0)).current;
  const slideAnim           = useRef(new Animated.Value(-8)).current;
  const chevronAnim         = useRef(new Animated.Value(0)).current;

  const counts = useMemo(() => {
    const c = {};
    TYPE_FILTERS.forEach(f => {
      c[f.key] = f.key === 'All'
        ? properties.length
        : properties.filter(p => p.type === f.key).length;
    });
    return c;
  }, [properties]);

  const activeFilter = TYPE_FILTERS.find(f => f.key === active) || TYPE_FILTERS[0];
  const ActiveIcon   = activeFilter.Icon;
  const isFiltered   = active !== 'All';

  const openPanel = () => {
    setOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 1,  duration: 170, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.spring(slideAnim,   { toValue: 0,  useNativeDriver: true, speed: 28, bounciness: 5 }),
      Animated.timing(chevronAnim, { toValue: 1,  duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closePanel = (cb) => {
    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 0,  duration: 130, useNativeDriver: true }),
      Animated.timing(slideAnim,   { toValue: -8, duration: 130, useNativeDriver: true }),
      Animated.timing(chevronAnim, { toValue: 0,  duration: 150, useNativeDriver: true }),
    ]).start(() => { setOpen(false); cb?.(); });
  };

  const handleTrigger = () => open ? closePanel() : openPanel();
  const handleSelect  = (key) => closePanel(() => onSelect(key));
  const chevronRotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[DD.container, { minWidth, zIndex: 200 }]}>
      {/* Trigger */}
      <TouchableOpacity
        onPress={handleTrigger}
        activeOpacity={0.78}
        style={[DD.trigger, { height: btnH, minWidth }, isFiltered && DD.triggerActive]}
      >
        <ActiveIcon
          color={isFiltered ? P.e700 : P.z500}
          size={iconSize}
          strokeWidth={isFiltered ? 2.5 : 2}
        />
        <Text
          style={[DD.triggerLabel, { fontSize }, isFiltered ? DD.triggerLabelActive : DD.triggerLabelInactive]}
          numberOfLines={1}
        >
          {activeFilter.label}
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <ChevronDown color={isFiltered ? P.e700 : P.z400} size={12} strokeWidth={2.5} />
        </Animated.View>
      </TouchableOpacity>

      {open && (
        <>
          {/* Full-screen invisible backdrop */}
          <TouchableOpacity
            style={DD.backdrop}
            activeOpacity={1}
            onPress={() => closePanel()}
          />

          {/* Floating panel */}
          <Animated.View style={[
            DD.panel,
            isTablet
              ? [DD.panelTablet, { width: panelWidth }]
              : DD.panelPhone,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
            {/* Panel header */}
            <View style={DD.panelHeader}>
              <SlidersHorizontal color={P.z400} size={11} strokeWidth={2} />
              <Text style={DD.panelHeaderTxt}>Filter by type</Text>
            </View>

            {/* Options */}
            {TYPE_FILTERS.map(({ key, label, Icon }, idx) => {
              const isAct = active === key;
              const count = counts[key] ?? 0;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    DD.option,
                    isAct && DD.optionActive,
                    idx < TYPE_FILTERS.length - 1 && DD.optionBorder,
                  ]}
                  onPress={() => handleSelect(key)}
                  activeOpacity={0.68}
                >
                  <View style={[DD.optionIconBox, isAct && DD.optionIconBoxActive]}>
                    <Icon color={isAct ? P.e700 : P.z500} size={14} strokeWidth={isAct ? 2.5 : 2} />
                  </View>
                  <Text style={[DD.optionLabel, isAct ? DD.optionLabelActive : DD.optionLabelInactive]}>
                    {label}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <View style={[DD.countBadge, isAct && DD.countBadgeActive]}>
                    <Text style={[DD.countTxt, isAct && DD.countTxtActive]}>{count}</Text>
                  </View>
                  {isAct && (
                    <View style={DD.checkBox}>
                      <Check color={P.e700} size={12} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </>
      )}
    </View>
  );
});

const DD = StyleSheet.create({
  container: { position: 'relative' },

  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10,
    backgroundColor: P.z50, borderWidth: 1, borderColor: P.z200, borderRadius: 10,
  },
  triggerActive:        { backgroundColor: P.e50, borderColor: P.e200 },
  triggerLabel:         { flex: 1, fontWeight: '600', letterSpacing: -0.1 },
  triggerLabelActive:   { color: P.e800 },
  triggerLabelInactive: { color: P.z600 },

  /* Full-screen backdrop with z-index just below panel */
  backdrop: {
    position: 'absolute',
    top: -3000, left: -3000, right: -3000, bottom: -3000,
    zIndex: 198,
  },

  panel: {
    position: 'absolute', top: '100%', marginTop: 6,
    backgroundColor: P.white,
    borderRadius: 14, borderWidth: 1, borderColor: P.z200,
    overflow: 'hidden', zIndex: 199,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10, shadowRadius: 18, elevation: 12,
  },
  // Phone: panel fills trigger width
  panelPhone:  { left: 0, right: 0 },
  // Tablet: fixed width, right-aligned
  panelTablet: { right: 0 },

  panelHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: P.z100,
  },
  panelHeaderTxt: {
    fontSize: 10, fontWeight: '700', color: P.z400,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },

  option:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
  optionActive: { backgroundColor: P.e50 },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: P.z100 },

  optionIconBox:        { width: 28, height: 28, borderRadius: 7, backgroundColor: P.z100, justifyContent: 'center', alignItems: 'center' },
  optionIconBoxActive:  { backgroundColor: P.e100 },
  optionLabel:          { fontSize: 14, fontWeight: '500' },
  optionLabelActive:    { color: P.e800, fontWeight: '700' },
  optionLabelInactive:  { color: P.z700 },

  countBadge:      { minWidth: 22, height: 20, borderRadius: 20, backgroundColor: P.z100, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  countBadgeActive:{ backgroundColor: P.e200 },
  countTxt:        { fontSize: 11, fontWeight: '700', color: P.z500 },
  countTxtActive:  { color: P.e700 },

  checkBox: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: -2 },
});

/* ═══════════════════════════════════════════
   PULSING LOADER
═══════════════════════════════════════════ */
const PulsingLoader = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.3, duration: 680, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,   duration: 680, useNativeDriver: true }),
    ])).start();
    return () => pulse.stopAnimation();
  }, []);
  return <Animated.View style={{ opacity: pulse }}><ActivityIndicator color={P.e600} size="large" /></Animated.View>;
};

/* ═══════════════════════════════════════════
   TAB CONTENT FADE
═══════════════════════════════════════════ */
const TabContent = ({ children }) => {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
  }, []);
  return <Animated.View style={{ flex: 1, opacity: fade }}>{children}</Animated.View>;
};

/* ═══════════════════════════════════════════
   MODAL LIST FADE
═══════════════════════════════════════════ */
const ModalListFade = ({ children }) => {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 240, delay: 80, useNativeDriver: true }).start();
  }, []);
  return <Animated.View style={{ flex: 1, opacity: fade }}>{children}</Animated.View>;
};

/* ═══════════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════════ */
export default function AssignAgentScreen({ navigation, onBack }) {
  const R = useResponsive();

  /* ── State ── */
  const [tab, setTab]                 = useState('properties');
  const [properties, setProperties]   = useState([]);
  const [agents, setAgents]           = useState([]);
  const [assignments, setAssignments] = useState({});
  const [propFilter, setPropFilter]   = useState('All');
  const [propSearch, setPropSearch]   = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [banner, setBanner]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  const [pickerOpen, setPickerOpen]     = useState(false);
  const [pickerProp, setPickerProp]     = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const [hireOpen, setHireOpen]               = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [hireSearch, setHireSearch]           = useState('');
  const [hiring, setHiring]                   = useState(false);
  const [hireFetchError, setHireFetchError]   = useState('');
  const [hiringAgentId, setHiringAgentId]     = useState(null);

  /* ── Animations ── */
  const headerAnim  = useRef(new Animated.Value(0)).current;
  const metricAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const tabKey      = useRef(0);
  const prevTab     = useRef(tab);
  if (prevTab.current !== tab) { tabKey.current += 1; prevTab.current = tab; }

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.stagger(75, metricAnims.map(a =>
      Animated.spring(a, { toValue: 1, speed: 14, bounciness: 8, useNativeDriver: true })
    )).start();
  }, []);

  /* ── Helpers ── */
  const flash = useCallback(msg => {
    setBanner(msg);
    setTimeout(() => setBanner(''), 3400);
  }, []);

  const getAuthToken = useCallback(async () => {
    try { return await AsyncStorage.getItem('authToken'); } catch { return null; }
  }, []);

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
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
    finally     { setLoading(false); }
  }, [apiRequest]);

  useEffect(() => { loadData(); }, [loadData]);

  const fetchAvailableAgents = useCallback(async () => {
    setHiring(true); setHireFetchError('');
    try {
      const res = await apiRequest('/builder/assign-agent/agents/available');
      setAvailableAgents(res.agents || []);
    } catch (e) { setHireFetchError(e.message || 'Failed to load agents. Tap retry.'); }
    finally    { setHiring(false); }
  }, [apiRequest]);

  const openHireModal = useCallback(() => {
    setHireOpen(true); setHireSearch('');
    setAvailableAgents([]); setHireFetchError(''); setHiringAgentId(null);
    fetchAvailableAgents();
  }, [fetchAvailableAgents]);

  const closeHireModal = useCallback(() => {
    setHireOpen(false); setHireSearch(''); setHireFetchError(''); setHiringAgentId(null);
  }, []);

  /* ── Filtered lists ── */
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
    return agents.filter(a => (a.name||'').toLowerCase().includes(q) || (a.spec||'').toLowerCase().includes(q) || (a.city||'').toLowerCase().includes(q));
  }, [agents, agentSearch]);

  const pickerAgents = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(a => (a.name||'').toLowerCase().includes(q) || (a.spec||'').toLowerCase().includes(q));
  }, [agents, pickerSearch]);

  const filteredAvailable = useMemo(() => {
    const q = hireSearch.trim().toLowerCase();
    if (!q) return availableAgents;
    return availableAgents.filter(a => (a.name||'').toLowerCase().includes(q) || (a.email||'').toLowerCase().includes(q) || (a.phone||'').toLowerCase().includes(q));
  }, [availableAgents, hireSearch]);

  const agentById  = useCallback(id => agents.find(a => a.id === id), [agents]);
  const propCount  = useCallback(aid => Object.values(assignments).filter(id => id === aid).length, [assignments]);
  const openPicker = useCallback(prop => { setPickerProp(prop); setPickerSearch(''); setPickerOpen(true); }, []);

  const confirmAssign = useCallback(async agent => {
    try {
      setPickerOpen(false); setSaving(true);
      await apiRequest(`/builder/assign-agent/properties/${pickerProp.id}/assign`, {
        method: 'POST', body: JSON.stringify({ agentId: agent.id }),
      });
      const asRes = await apiRequest('/builder/assign-agent/assignments');
      setAssignments(asRes.assignments || {});
      flash(`${agent.name} assigned to ${pickerProp.name}`);
    } catch (e) { Alert.alert('Error', e.message || 'Failed to assign agent'); }
    finally    { setSaving(false); }
  }, [pickerProp, apiRequest, flash]);

  const removeAssign = useCallback(prop => {
    Alert.alert(
      'Remove Agent',
      `Remove ${agentById(assignments[prop.id])?.name} from ${prop.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => {
          (async () => {
            try {
              setSaving(true);
              await apiRequest(`/builder/assign-agent/properties/${prop.id}/assign`, { method: 'DELETE' });
              const asRes = await apiRequest('/builder/assign-agent/assignments');
              setAssignments(asRes.assignments || {});
              flash('Agent removed');
            } catch (e) { Alert.alert('Error', e.message || 'Failed'); }
            finally    { setSaving(false); }
          })();
        }},
      ]
    );
  }, [assignments, agentById, apiRequest, flash]);

  const hireExistingAgent = useCallback(async agent => {
    if (hiringAgentId) return;
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
      const avail = await apiRequest('/builder/assign-agent/agents/available');
      setAvailableAgents(avail.agents || []);
      setHireOpen(false);
    } catch (e) { Alert.alert('Error', e.message || 'Failed to hire agent'); }
    finally    { setHiringAgentId(null); }
  }, [hiringAgentId, apiRequest, flash]);

  /* ── Derived values ── */
  const assignedCount = Object.keys(assignments).length;
  const vacantCount   = properties.length - assignedCount;
  const {
    isXs, isSm, isTablet, hp, propCols, agentCols,
    propColW, agentColW,
    fs, dim, headerPT,
  } = R;

  const metricData = [
    { label: 'Properties', val: properties.length },
    { label: 'Agents',     val: agents.length },
    { label: 'Assigned',   val: assignedCount },
    { label: 'Vacant',     val: vacantCount },
  ];

  /* ════════════════════════════════════════════
     PROPERTY CARD RENDERER
     FIX: card uses minWidth from propColW; agent zone never overflows
  ════════════════════════════════════════════ */
  const renderPropertyCard = useCallback(({ item, index }) => {
    const assigned = agentById(assignments[item.id] || item.agentId);
    const sc       = assigned ? specStyle(assigned.spec) : null;
    const avSz     = dim.cardAvatarSz;
    const avR      = dim.cardAvatarR;

    return (
      <AnimatedCard
        index={index}
        style={[
          pc.cardOuter,
          propCols > 1
            ? { flex: 1, minWidth: Math.max(propColW - 2, 140) }
            : { width: '100%' },
        ]}
      >
        <View style={pc.card}>
          {/* Hero image */}
          <Image
            source={{ uri: item.image }}
            style={[pc.heroImg, { height: dim.propImgH }]}
            resizeMode="cover"
          />

          {/* Badge row */}
          <View style={[pc.badgeRow, { paddingHorizontal: isXs ? 9 : 12 }]}>
            <View style={pc.typePill}>
              <Text style={[pc.typePillTxt, { fontSize: isXs ? 9 : 10 }]}>{item.type}</Text>
            </View>
            <View style={[pc.statusPill, { backgroundColor: item.status === 'Active' ? P.e100 : P.amberBg }]}>
              <Text style={[pc.statusPillTxt, { fontSize: isXs ? 9 : 10, color: item.status === 'Active' ? P.e700 : P.amber }]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Name + location */}
          <View style={[pc.nameSection, { paddingHorizontal: isXs ? 9 : 12 }]}>
            <Text style={[pc.heroName, { fontSize: fs.cardTitle }]} numberOfLines={1}>{item.name}</Text>
            <View style={pc.heroLocRow}>
              <MapPin color={P.z400} size={11} strokeWidth={2} />
              <Text style={[pc.heroLoc, { fontSize: fs.cardSub }]} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={[pc.statsRow, { paddingHorizontal: isXs ? 9 : 12 }]}>
            <View style={pc.statCol}>
              <Text style={[pc.statNum, { fontSize: fs.cardStat }]}>{item.units}</Text>
              <Text style={[pc.statLbl, { fontSize: isXs ? 8 : 9 }]}>Units</Text>
            </View>
            <View style={pc.statDivider} />
            <View style={pc.statCol}>
              <Text style={[pc.statNum, { fontSize: fs.cardStat, color: item.status === 'Active' ? P.e700 : P.amber }]}>
                {item.status}
              </Text>
              <Text style={[pc.statLbl, { fontSize: isXs ? 8 : 9 }]}>Status</Text>
            </View>
          </View>

          {/* Agent zone */}
          <View style={[pc.agentZone, { padding: isXs ? 9 : 12 }]}>
            {assigned ? (
              <View style={pc.assignedWrap}>
                {/* Avatar: flexShrink:0 so it never collapses */}
                <Image
                  source={{ uri: assigned.avatar }}
                  style={{ width: avSz, height: avSz, borderRadius: avR, flexShrink: 0 }}
                />
                {/* Name + tags: flex:1 minWidth:0 so long names truncate */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[pc.assignedName, { fontSize: isXs ? 11 : isSm ? 12 : 13 }]} numberOfLines={1}>
                    {assigned.name}
                  </Text>
                  <View style={pc.assignedTagRow}>
                    <StarRow rating={assigned.rating} size={isXs ? 10 : 11} />
                    <Text style={pc.dot}>·</Text>
                    <View style={[pc.specTag, { backgroundColor: sc.bg }]}>
                      <Text style={[pc.specTagTxt, { color: sc.text, fontSize: isXs ? 9 : 10 }]} numberOfLines={1}>
                        {assigned.spec}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Actions: flexShrink:0 so buttons don't vanish */}
                <View style={[pc.assignedActions, { flexShrink: 0 }]}>
                  <AnimatedPressable
                    style={[
                      pc.changeBtn,
                      { minHeight: dim.changeBtnH },
                      isXs && { paddingHorizontal: 7, paddingVertical: 4 },
                    ]}
                    onPress={() => openPicker(item)}
                    scaleDown={0.91}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <RefreshCw color={P.e700} size={isXs ? 11 : 12} strokeWidth={2.5} />
                    {!isXs && <Text style={pc.changeTxt}>Change</Text>}
                  </AnimatedPressable>
                  <AnimatedPressable
                    style={[pc.removeBtn, { width: dim.removeBtnSz, height: dim.removeBtnSz }]}
                    onPress={() => removeAssign(item)}
                    scaleDown={0.87}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 color={P.red} size={isXs ? 12 : 14} strokeWidth={2.5} />
                  </AnimatedPressable>
                </View>
              </View>
            ) : (
              <AnimatedPressable
                style={[pc.assignBtn, { minHeight: isXs ? 38 : 42 }]}
                onPress={() => openPicker(item)}
                scaleDown={0.96}
              >
                <Users color={P.white} size={isXs ? 13 : 15} strokeWidth={2} />
                <Text style={[pc.assignBtnTxt, { fontSize: fs.btnLabel }]}>Assign Agent</Text>
              </AnimatedPressable>
            )}
          </View>
        </View>
      </AnimatedCard>
    );
  }, [agentById, assignments, openPicker, removeAssign, dim, fs, isXs, isSm, propCols, propColW]);

  /* ════════════════════════════════════════════
     AGENT CARD RENDERER
     FIX: minWidth guard; phone field hides on xs/sm only when very small
  ════════════════════════════════════════════ */
  const renderAgentCard = useCallback(({ item, index }) => {
    const pNum = propCount(item.id);
    const sc   = specStyle(item.spec);
    const avSz = dim.agentAvatarSz;

    return (
      <AnimatedCard
        index={index}
        style={[
          ag.cardOuter,
          agentCols > 1
            ? { flex: 1, minWidth: Math.max(agentColW - 2, 120) }
            : { width: '100%' },
        ]}
      >
        <View style={[ag.card, isXs && { padding: 10, gap: 8 }]}>
          <Image
            source={{ uri: item.avatar }}
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
              {/* Hide phone on xs to prevent overflow */}
              {!isXs && item.phone ? (
                <>
                  <View style={ag.sep} />
                  <Text style={[ag.statTxt, { fontSize: fs.agentSub, flexShrink: 1 }]} numberOfLines={1}>
                    {item.phone}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
          {pNum > 0 && (
            <View style={[ag.badge, isXs && { paddingHorizontal: 5, paddingVertical: 3 }, { flexShrink: 0 }]}>
              <Text style={[ag.badgeTxt, { fontSize: isXs ? 9 : 11 }]}>{pNum}P</Text>
            </View>
          )}
        </View>
      </AnimatedCard>
    );
  }, [propCount, dim, fs, isXs, agentCols, agentColW]);

  /* ════════════════════════════════════════════
     PICKER ROW RENDERER
  ════════════════════════════════════════════ */
  const renderPickerRow = useCallback(({ item, index }) => {
    const isCurrent = assignments[pickerProp?.id] === item.id;
    const sc        = specStyle(item.spec);
    const avSz      = dim.pickerAvatarSz;
    return (
      <AnimatedCard index={index} style={{}}>
        <TouchableOpacity
          style={[pkr.row, isCurrent && pkr.rowActive, isXs && { paddingVertical: 10 }]}
          onPress={() => confirmAssign(item)}
          activeOpacity={0.75}
        >
          <Image source={{ uri: item.avatar }} style={{ width: avSz, height: avSz, borderRadius: avSz / 2, flexShrink: 0 }} />
          <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
              <Text style={[pkr.name, { fontSize: isXs ? 12 : 14, flexShrink: 1 }]} numberOfLines={1}>{item.name}</Text>
              <View style={[pkr.specBadge, { backgroundColor: sc.bg }]}>
                <Text style={[pkr.specTxt, { color: sc.text, fontSize: isXs ? 9 : 10 }]}>{item.spec}</Text>
              </View>
            </View>
            <Text style={[pkr.sub, { fontSize: isXs ? 10 : 12 }]} numberOfLines={1}>
              {item.city} · {item.exp} yrs · {item.deals} deals
            </Text>
            <View style={{ marginTop: 3 }}><StarRow rating={item.rating} size={isXs ? 10 : 11} /></View>
          </View>
          <View style={[pkr.checkCircle, isCurrent && pkr.checkCircleActive, isXs && { width: 24, height: 24, borderRadius: 12 }]}>
            {isCurrent && <Check color={P.white} size={isXs ? 11 : 13} strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  }, [assignments, pickerProp, confirmAssign, dim, isXs]);

  /* ════════════════════════════════════════════
     HIRE ROW RENDERER
  ════════════════════════════════════════════ */
  const renderHireRow = useCallback(({ item, index }) => {
    const sc           = specStyle(item.spec);
    const avSz         = dim.hireAvatarSz;
    const isThisHiring = hiringAgentId === item.id;
    const anyHiring    = hiringAgentId !== null;
    return (
      <AnimatedCard index={index} style={{}}>
        <View style={[hr.row, isXs && { paddingVertical: 10 }]}>
          <Image source={{ uri: item.avatar }} style={{ width: avSz, height: avSz, borderRadius: avSz / 2, flexShrink: 0 }} />
          <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
            <Text style={[hr.name, { fontSize: isXs ? 12 : 14 }]} numberOfLines={1}>{item.name}</Text>
            <View style={[hr.metaRow, isXs && { gap: 5 }]}>
              <View style={[hr.specBadge, { backgroundColor: sc.bg }]}>
                <Text style={[hr.specTxt, { color: sc.text, fontSize: isXs ? 9 : 11 }]}>{item.spec}</Text>
              </View>
              {!isXs && (item.email || item.phone) ? (
                <Text style={[hr.contact, { flexShrink: 1 }]} numberOfLines={1}>{item.email || item.phone}</Text>
              ) : null}
            </View>
            <Text style={[hr.sub, { fontSize: isXs ? 10 : 12 }]} numberOfLines={1}>
              {item.city || ''}{item.exp ? `  ·  ${item.exp} yrs exp` : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              hr.btn,
              (anyHiring && !isThisHiring) && hr.btnOff,
              { minHeight: dim.hireBtnH, paddingHorizontal: dim.hireBtnPadH, flexShrink: 0 },
            ]}
            onPress={() => hireExistingAgent(item)}
            disabled={anyHiring}
            activeOpacity={0.75}
          >
            {isThisHiring
              ? <ActivityIndicator color={P.white} size="small" />
              : <Text style={[hr.btnTxt, { fontSize: isXs ? 12 : 13 }]}>Hire</Text>
            }
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    );
  }, [hireExistingAgent, hiringAgentId, dim, isXs]);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.e800} />

      {/* ══════ HEADER ══════ */}
      <Animated.View style={[
        s.header,
        { paddingTop: headerPT, paddingHorizontal: hp, paddingBottom: isXs ? 12 : isSm ? 14 : 18 },
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }],
        },
      ]}>
        {/* Nav row */}
        <View style={[s.navRow, { marginBottom: isXs ? 10 : 14 }]}>
          <AnimatedPressable
            style={[s.backBtn, { width: dim.backBtnSz, height: dim.backBtnSz, borderRadius: isXs ? 8 : 10 }]}
            onPress={() => navigation?.goBack?.() || onBack?.()}
            scaleDown={0.87}
          >
            <ArrowLeft color={P.white} size={dim.backIconSz} strokeWidth={2.5} />
          </AnimatedPressable>

          {/* Title: flex:1 + numberOfLines prevents overflow on narrow screens */}
          <Text
            style={[s.headTitle, { fontSize: fs.headerTitle }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            Agent Management
          </Text>

          {/* Hire CTA: icon-only on xs */}
          <AnimatedPressable
            style={[
              s.hireCTA,
              isXs && { paddingHorizontal: 8, paddingVertical: 6 },
              isTablet && { paddingHorizontal: 16 },
            ]}
            onPress={openHireModal}
            scaleDown={0.93}
          >
            <UserPlus color={P.white} size={isTablet ? 18 : isXs ? 14 : 15} strokeWidth={2.5} />
            {!isXs && (
              <Text style={[s.hireCTATxt, isTablet && { fontSize: 14 }]}>Hire</Text>
            )}
          </AnimatedPressable>
        </View>

        {/* Metric cards — 2×2 on xs, single row on sm+ */}
        {isXs ? (
          <View style={{ gap: 6 }}>
            <View style={[s.metricRow, { gap: 6 }]}>
              {metricData.slice(0, 2).map(({ label, val }, i) => (
                <MetricCard key={label} val={val} label={label} anim={metricAnims[i]} fs={fs} />
              ))}
            </View>
            <View style={[s.metricRow, { gap: 6 }]}>
              {metricData.slice(2, 4).map(({ label, val }, i) => (
                <MetricCard key={label} val={val} label={label} anim={metricAnims[i + 2]} fs={fs} />
              ))}
            </View>
          </View>
        ) : (
          <View style={[s.metricRow, { gap: isTablet ? 10 : 8 }]}>
            {metricData.map(({ label, val }, i) => (
              <MetricCard key={label} val={val} label={label} anim={metricAnims[i]} fs={fs} />
            ))}
          </View>
        )}
      </Animated.View>

      <AnimatedToast msg={banner} hp={hp} />

      {/* ══════ TABS ══════ */}
      <View style={[s.tabBarWrap, { paddingHorizontal: hp }]}>
        <View style={s.tabBar}>
          {[{ key: 'properties', label: 'Properties' }, { key: 'agents', label: 'My Agents' }].map(({ key, label }) => {
            const active = tab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[s.tabItem, active && s.tabItemActive, { paddingVertical: dim.tabPadV }]}
                onPress={() => setTab(key)}
                activeOpacity={0.7}
              >
                <Text style={[s.tabTxt, { fontSize: fs.tabLabel }, active && s.tabTxtActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ══════ PROPERTIES TAB ══════ */}
      {tab === 'properties' && (
        <TabContent key={`p-${tabKey.current}`}>
          {/*
            Tool row: zIndex:200 so dropdown panel floats above cards.
            overflow:visible is crucial — default 'hidden' would clip the panel.
          */}
          <View style={[s.toolRow, { paddingHorizontal: hp, zIndex: 200, overflow: 'visible' }]}>
            <SearchBar
              value={propSearch}
              onChange={setPropSearch}
              placeholder="Search properties…"
              height={dim.searchH}
              fontSize={fs.searchInput}
            />
            <TypeFilterDropdown
              active={propFilter}
              onSelect={setPropFilter}
              properties={properties}
              height={dim.searchH}
              fontSize={fs.filterChip}
              iconSize={dim.dropdownIconSz}
              minWidth={dim.dropdownMinW}
              panelWidth={dim.dropdownPanelW}
              isTablet={isTablet}
            />
          </View>

          <FlatList
            data={filteredProps}
            keyExtractor={i => i.id}
            renderItem={renderPropertyCard}
            numColumns={propCols}
            // key must change when numColumns changes — prevents RN layout bug
            key={`props-${propCols}`}
            columnWrapperStyle={propCols > 1 ? { gap: 12 } : undefined}
            contentContainerStyle={[s.list, { paddingHorizontal: hp }]}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false} // ensures dropdown not clipped
            ListEmptyComponent={
              <View style={s.empty}>
                <Building2 color={P.z300} size={isXs ? 30 : 42} strokeWidth={1.5} />
                <Text style={[s.emptyH, { fontSize: isXs ? 13 : 15 }]}>No properties found</Text>
                <Text style={[s.emptySub, { fontSize: isXs ? 12 : 13 }]}>Try a different search or filter</Text>
              </View>
            }
          />
        </TabContent>
      )}

      {/* ══════ AGENTS TAB ══════ */}
      {tab === 'agents' && (
        <TabContent key={`a-${tabKey.current}`}>
          <View style={[s.toolRow, { paddingHorizontal: hp }]}>
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
                { width: dim.searchH, height: dim.searchH, borderRadius: dim.hireIconBtnR },
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
            key={`agents-${agentCols}`}
            columnWrapperStyle={agentCols > 1 ? { gap: 12 } : undefined}
            contentContainerStyle={[s.list, { paddingHorizontal: hp }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.empty}>
                <Users color={P.z300} size={isXs ? 30 : 42} strokeWidth={1.5} />
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

      {/* ══════ LOADING / SAVING OVERLAY ══════ */}
      {(loading || saving) && (
        <View style={s.overlay}>
          <Animated.View style={[s.overlayBox, {
            paddingVertical: dim.overlayPadV,
            paddingHorizontal: dim.overlayPadH,
          }]}>
            <PulsingLoader />
            <Text style={[s.overlayTxt, { fontSize: isXs ? 13 : 14 }]}>
              {loading ? 'Loading…' : 'Saving…'}
            </Text>
          </Animated.View>
        </View>
      )}

      {/* ══════════════════════════════════════════════
          ASSIGN AGENT MODAL
          FIX: flex:1 on inner sheet so FlatList scrolls correctly
      ══════════════════════════════════════════════ */}
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
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[md.title, { fontSize: fs.modalTitle }]}>Choose an Agent</Text>
                {pickerProp && (
                  <Text style={md.sub} numberOfLines={1}>For: {pickerProp.name}</Text>
                )}
              </View>
              <AnimatedPressable
                style={[md.closeBtn, isXs && { width: 30, height: 30, borderRadius: 8 }]}
                onPress={() => setPickerOpen(false)}
                scaleDown={0.87}
              >
                <X color={P.z600} size={isXs ? 14 : 17} strokeWidth={2.5} />
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
            {/* flex:1 here allows FlatList to fill remaining space and scroll */}
            <View style={{ flex: 1 }}>
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
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════
          HIRE AGENT MODAL
      ══════════════════════════════════════════════ */}
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
              <View style={[md.headerIcon, isXs && { width: 30, height: 30, borderRadius: 8 }]}>
                <UserPlus color={P.white} size={isXs ? 13 : 16} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
                <Text style={[md.title, { fontSize: fs.modalTitle }]}>Hire an Agent</Text>
                <Text style={md.sub} numberOfLines={1}>Browse & hire registered agents</Text>
              </View>
              <AnimatedPressable
                style={[md.closeBtn, isXs && { width: 30, height: 30, borderRadius: 8 }]}
                onPress={closeHireModal}
                scaleDown={0.87}
              >
                <X color={P.z600} size={isXs ? 14 : 17} strokeWidth={2.5} />
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

            {/* flex:1 so content fills and scrolls */}
            <View style={{ flex: 1 }}>
              {hiring ? (
                <View style={[s.empty, { paddingTop: 36, paddingBottom: 36 }]}>
                  <PulsingLoader />
                  <Text style={[s.emptySub, { marginTop: 14, fontSize: isXs ? 12 : 13 }]}>Loading agents…</Text>
                </View>
              ) : hireFetchError ? (
                <View style={[s.empty, { paddingTop: 36, paddingBottom: 36 }]}>
                  <AlertCircle color={P.red} size={isXs ? 28 : 36} strokeWidth={1.5} />
                  <Text style={[s.emptyH, { fontSize: isXs ? 13 : 14, color: P.red }]}>Could not load agents</Text>
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
                        <Text style={[s.emptySub, { fontSize: isXs ? 12 : 13 }]}>Check back later or invite via email</Text>
                      </View>
                    }
                  />
                </ModalListFade>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ═══════════════════════════════════════════
   METRIC CARD
   FIX: minWidth:0 + numberOfLines on label prevents overflow on xs
═══════════════════════════════════════════ */
const MetricCard = ({ val, label, anim, fs }) => (
  <Animated.View style={[s.metricCard, {
    opacity: anim,
    transform: [
      { scale:      anim.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) },
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0]  }) },
    ],
  }]}>
    <Text style={[s.metricVal, { fontSize: fs.metricVal }]} numberOfLines={1}>{val}</Text>
    <Text style={[s.metricLbl, { fontSize: fs.metricLbl }]} numberOfLines={1}>{label}</Text>
  </Animated.View>
);

/* ═══════════════════════════════════════════════════
   STYLESHEETS
═══════════════════════════════════════════════════ */

/* Property card */
const pc = StyleSheet.create({
  cardOuter:     { marginBottom: 14 },
  card:          { backgroundColor: P.white, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: P.z200, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  heroImg:       { width: '100%' },
  badgeRow:      { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 10 },
  typePill:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: P.z100 },
  typePillTxt:   { color: P.z600, fontWeight: '600' },
  statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusPillTxt: { fontWeight: '600' },
  nameSection:   { paddingTop: 8, paddingBottom: 2 },
  heroName:      { fontWeight: '700', color: P.z900, marginBottom: 4 },
  heroLocRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLoc:       { color: P.z400, flex: 1, minWidth: 0 },
  statsRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: P.z100, marginTop: 8 },
  statCol:       { flex: 1, alignItems: 'center', gap: 2 },
  statNum:       { fontWeight: '700', color: P.z800 },
  statLbl:       { color: P.z400, textTransform: 'uppercase', letterSpacing: 0.3 },
  statDivider:   { width: 1, height: 24, backgroundColor: P.z100 },
  agentZone:     { borderTopWidth: 1, borderTopColor: P.z100 },
  // assignedWrap: no overflow needed; children use flex:1 / flexShrink:0
  assignedWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  assignedName:  { fontWeight: '600', color: P.z900, marginBottom: 3 },
  assignedTagRow:{ flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  dot:           { color: P.z300, fontSize: 14 },
  specTag:       { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  specTagTxt:    { fontWeight: '600' },
  assignedActions:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  changeBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: P.e200, backgroundColor: P.e50 },
  changeTxt:     { fontSize: 12, fontWeight: '600', color: P.e700 },
  removeBtn:     { borderRadius: 8, backgroundColor: P.redBg, justifyContent: 'center', alignItems: 'center' },
  assignBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: P.e700, paddingVertical: 11, borderRadius: 10 },
  assignBtnTxt:  { fontWeight: '700', color: P.white },
});

/* Agent card */
const ag = StyleSheet.create({
  cardOuter: { marginBottom: 10 },
  card:      { backgroundColor: P.white, borderRadius: 12, padding: 13, flexDirection: 'row', gap: 11, alignItems: 'center', borderWidth: 1, borderColor: P.z200, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  badge:     { backgroundColor: P.e100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTxt:  { fontWeight: '700', color: P.e700 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name:      { fontWeight: '700', color: P.z900, flex: 1, minWidth: 0, marginRight: 6 },
  tagRow:    { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' },
  specTag:   { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  specTxt:   { fontWeight: '600' },
  cityTxt:   { color: P.z400, flexShrink: 1, minWidth: 0 },
  statsRow:  { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  statTxt:   { color: P.z500 },
  sep:       { width: 1, height: 10, backgroundColor: P.z200, marginHorizontal: 7 },
});

/* Picker rows */
const pkr = StyleSheet.create({
  row:              { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, minHeight: 64 },
  rowActive:        { backgroundColor: P.e50, paddingHorizontal: 10, marginHorizontal: -10, borderRadius: 10 },
  name:             { fontWeight: '700', color: P.z900, flexShrink: 1, minWidth: 0 },
  specBadge:        { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  specTxt:          { fontWeight: '700' },
  sub:              { color: P.z500, marginBottom: 2 },
  checkCircle:      { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: P.z200, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkCircleActive:{ backgroundColor: P.e600, borderColor: P.e600 },
});

/* Hire rows */
const hr = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, minHeight: 68 },
  name:     { fontWeight: '700', color: P.z900, marginBottom: 4 },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' },
  specBadge:{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  specTxt:  { fontWeight: '700' },
  contact:  { fontSize: 12, color: P.z500, minWidth: 0 },
  sub:      { color: P.z400 },
  btn:      { backgroundColor: P.e700, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnOff:   { backgroundColor: P.z300 },
  btnTxt:   { color: P.white, fontWeight: '700' },
});

/* Modals */
const md = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.46)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: P.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 36 : 20, display: 'flex', flexDirection: 'column' },
  handle:     { width: 40, height: 4, backgroundColor: P.z300, borderRadius: 2, alignSelf: 'center', marginTop: 14, marginBottom: 4 },
  header:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: P.z100 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: P.e700, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  title:      { fontWeight: '800', color: P.z900, letterSpacing: -0.2 },
  sub:        { fontSize: 12, color: P.z500, marginTop: 2 },
  closeBtn:   { width: 34, height: 34, borderRadius: 10, backgroundColor: P.z100, justifyContent: 'center', alignItems: 'center', marginLeft: 8, flexShrink: 0 },
  searchWrap: { paddingTop: 12, paddingBottom: 8 },
  countRow:   { paddingBottom: 7 },
  countTxt:   { color: P.z400, fontWeight: '500' },
  separator:  { height: 1, backgroundColor: P.z100, marginVertical: 2 },
});

/* Screen-level */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.z50 },

  /* Header */
  header:    { backgroundColor: P.e800 },
  navRow:    { flexDirection: 'row', alignItems: 'center' },
  backBtn:   { justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: 'rgba(255,255,255,0.12)', flexShrink: 0 },
  headTitle: { flex: 1, minWidth: 0, fontWeight: '800', color: P.white },
  hireCTA:   { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.38)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minHeight: 40, justifyContent: 'center', flexShrink: 0 },
  hireCTATxt:{ color: P.white, fontWeight: '700', fontSize: 13 },

  /* Metrics */
  metricRow: { flexDirection: 'row' },
  metricCard:{ flex: 1, minWidth: 0, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 4, alignItems: 'center', gap: 2 },
  metricVal: { fontWeight: '800', color: P.white },
  metricLbl: { color: 'rgba(255,255,255,0.58)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },

  /* Tabs */
  tabBarWrap:    { backgroundColor: P.white, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: P.z200 },
  tabBar:        { flexDirection: 'row', backgroundColor: P.z100, borderRadius: 10, padding: 3 },
  tabItem:       { flex: 1, alignItems: 'center', borderRadius: 8, minHeight: 38, justifyContent: 'center' },
  tabItemActive: { backgroundColor: P.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabTxt:        { fontWeight: '600', color: P.z400 },
  tabTxtActive:  { color: P.z900, fontWeight: '700' },

  /* Tool row: overflow:visible is set inline to allow dropdown clipping fix */
  toolRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 12 },
  hireIconBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: P.e800, flexShrink: 0 },

  /* List */
  list: { paddingTop: 4, paddingBottom: 44 },

  /* Empty states */
  empty:       { alignItems: 'center', paddingTop: 50, gap: 8 },
  emptyH:      { fontWeight: '700', color: P.z600, marginTop: 8 },
  emptySub:    { color: P.z400, textAlign: 'center' },
  emptyHireBtn:{ backgroundColor: P.e800, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 11, marginTop: 8, minHeight: 44, justifyContent: 'center' },
  emptyHireTxt:{ color: P.white, fontWeight: '700' },

  /* Loading overlay */
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.27)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  overlayBox: { backgroundColor: P.white, borderRadius: 20, alignItems: 'center', gap: 12, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
  overlayTxt: { color: P.z700, fontWeight: '600' },
});