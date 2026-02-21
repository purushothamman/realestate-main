/**
 * AssignAgentScreen.jsx
 *
 * Builder screen to:
 *  • View all properties and assign / change / remove agents
 *  • Browse the full hired-agent roster
 *  • Hire (onboard) a new agent via a full-form modal
 *
 * Focus-flicker safe: every TextInput uses the FieldInput
 * (onBlur-commit) pattern so typing never triggers parent re-renders.
 *
 * Color theme: Forest green #1B5E3B + white + soft sage surfaces
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  UserPlus,
  Building2,
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  Briefcase,
  Award,
  Home,
  TrendingUp,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  MessageSquare,
  Globe,
  Filter,
} from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

/* ═══════════════════════════════════════════════════════════
   API CONFIGURATION
═══════════════════════════════════════════════════════════ */
const getApiUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  // Greens
  g900: '#0D3320',
  g800: '#1B5E3B',
  g700: '#1E7444',
  g600: '#25904F',
  g500: '#2EAD5F',
  g400: '#5BC282',
  g200: '#C6E8D4',
  g100: '#E8F5ED',
  g50:  '#F4FAF7',

  // Neutrals
  n900: '#111827',
  n700: '#374151',
  n500: '#6B7280',
  n300: '#D1D5DB',
  n200: '#E5E7EB',
  n100: '#F3F4F6',
  white: '#FFFFFF',

  // Accent
  gold: '#F59E0B',
  red:  '#EF4444',
  redBg:'#FEF2F2',

  // Shadows
  shadow: 'rgba(27,94,59,0.14)',
};

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const PROPERTIES = [
  { id:'p1', name:'Verdant Residences',    location:'Bandra West, Mumbai',  type:'Residential', units:24, status:'Active',   image:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80', agentId:null },
  { id:'p2', name:'Skyline Commercial Hub', location:'Powai, Mumbai',        type:'Commercial',  units:8,  status:'Active',   image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80', agentId:'a2'  },
  { id:'p3', name:'Emerald Heights',        location:'Andheri East, Mumbai', type:'Residential', units:36, status:'Active',   image:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', agentId:null },
  { id:'p4', name:'Harbor View Plaza',      location:'Worli, Mumbai',        type:'Mixed Use',   units:12, status:'Upcoming', image:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80', agentId:null },
  { id:'p5', name:'Palm Springs Villa',     location:'Juhu, Mumbai',         type:'Residential', units:6,  status:'Active',   image:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', agentId:'a1'  },
];

const INIT_AGENTS = [
  { id:'a1', name:'Priya Sharma',  phone:'9876543210', email:'priya@realty.com',  exp:7,  rating:4.8, deals:142, city:'Mumbai',      spec:'Residential', avatar:'https://i.pravatar.cc/150?img=47' },
  { id:'a2', name:'Rahul Verma',   phone:'9823456789', email:'rahul@realty.com',  exp:5,  rating:4.5, deals:98,  city:'Mumbai',      spec:'Commercial',  avatar:'https://i.pravatar.cc/150?img=12' },
  { id:'a3', name:'Sneha Patil',   phone:'9765432100', email:'sneha@realty.com',  exp:3,  rating:4.2, deals:54,  city:'Thane',       spec:'Residential', avatar:'https://i.pravatar.cc/150?img=32' },
  { id:'a4', name:'Arjun Mehta',   phone:'9812345678', email:'arjun@realty.com',  exp:10, rating:4.9, deals:230, city:'Mumbai',      spec:'Luxury',      avatar:'https://i.pravatar.cc/150?img=68' },
  { id:'a5', name:'Kavita Nair',   phone:'9654321098', email:'kavita@realty.com', exp:4,  rating:4.3, deals:76,  city:'Navi Mumbai', spec:'Mixed Use',   avatar:'https://i.pravatar.cc/150?img=25' },
];

const TYPE_FILTERS = ['All','Residential','Commercial','Mixed Use'];

/* ═══════════════════════════════════════════════════════════
   FOCUS-SAFE FIELD INPUT
   Keeps local value in state; commits to parent only onBlur.
   Border highlight via setNativeProps = zero React re-renders.
═══════════════════════════════════════════════════════════ */
const FieldInput = React.memo(({
  icon: Icon,
  initialValue = '',
  onCommit,
  error,
  multiline,
  numberOfLines,
  secureEntry,
  containerStyle,
  inputStyle,
  ...rest
}) => {
  const [val, setVal]       = useState(initialValue);
  const [show, setShow]     = useState(false);   // password toggle
  const wrapRef             = useRef(null);

  const onFocus = useCallback(() => {
    wrapRef.current?.setNativeProps({
      style: { borderColor: T.g600, backgroundColor: T.white, elevation: 3 },
    });
  }, []);

  const onBlur = useCallback(() => {
    wrapRef.current?.setNativeProps({
      style: {
        borderColor: error ? T.red : T.n300,
        backgroundColor: T.g50,
        elevation: 0,
      },
    });
    onCommit?.(val);
  }, [val, onCommit, error]);

  if (multiline) {
    return (
      <>
        <View ref={wrapRef} style={[inp.taWrap, error && inp.errWrap, containerStyle]}>
          {Icon && <Icon color={T.n500} size={16} strokeWidth={2} style={inp.icon} />}
          <TextInput
            style={[inp.ta, inputStyle]}
            placeholderTextColor={T.n500}
            value={val}
            onChangeText={setVal}
            onFocus={onFocus}
            onBlur={onBlur}
            multiline
            numberOfLines={numberOfLines || 3}
            textAlignVertical="top"
            {...rest}
          />
        </View>
        {error ? <InlineErr msg={error} /> : null}
      </>
    );
  }

  return (
    <>
      <View ref={wrapRef} style={[inp.wrap, error && inp.errWrap, containerStyle]}>
        {Icon && <Icon color={T.n500} size={16} strokeWidth={2} style={inp.icon} />}
        <TextInput
          style={[inp.input, inputStyle]}
          placeholderTextColor={T.n500}
          value={val}
          onChangeText={setVal}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureEntry && !show}
          {...rest}
        />
      </View>
      {error ? <InlineErr msg={error} /> : null}
    </>
  );
}, (p, n) => p.error === n.error && p.initialValue === n.initialValue);

const InlineErr = ({ msg }) => (
  <View style={{ flexDirection:'row', alignItems:'center', gap:4, marginTop:4 }}>
    <AlertCircle color={T.red} size={12} strokeWidth={2} />
    <Text style={{ fontSize:11, color:T.red }}>{msg}</Text>
  </View>
);

const inp = StyleSheet.create({
  wrap:   { flexDirection:'row', alignItems:'center', height:50, backgroundColor:T.g50, borderWidth:1.5, borderColor:T.n300, borderRadius:12, paddingHorizontal:14 },
  taWrap: { flexDirection:'row', backgroundColor:T.g50, borderWidth:1.5, borderColor:T.n300, borderRadius:12, padding:14, minHeight:90 },
  errWrap:{ borderColor:T.red },
  icon:   { marginRight:10 },
  input:  { flex:1, fontSize:14, color:T.n900, height:'100%' },
  ta:     { flex:1, fontSize:14, color:T.n900, minHeight:65 },
});

/* ═══════════════════════════════════════════════════════════
   STAR RATING DISPLAY
═══════════════════════════════════════════════════════════ */
const Stars = ({ rating }) => (
  <View style={{ flexDirection:'row', alignItems:'center', gap:3 }}>
    <Star color={T.gold} fill={T.gold} size={12} strokeWidth={0} />
    <Text style={{ fontSize:12, fontWeight:'700', color:T.n700 }}>
      {rating > 0 ? rating.toFixed(1) : 'New'}
    </Text>
  </View>
);

/* ═══════════════════════════════════════════════════════════
   STATUS PILL
═══════════════════════════════════════════════════════════ */
const StatusPill = ({ status }) => (
  <View style={{
    paddingHorizontal:8, paddingVertical:3, borderRadius:20,
    backgroundColor: status === 'Active' ? T.g100 : '#FEF3C7',
  }}>
    <Text style={{ fontSize:10, fontWeight:'700', color: status === 'Active' ? T.g700 : '#92400E' }}>
      {status.toUpperCase()}
    </Text>
  </View>
);

/* ═══════════════════════════════════════════════════════════
   SUCCESS BANNER
═══════════════════════════════════════════════════════════ */
const SuccessBanner = ({ msg }) => {
  if (!msg) return null;
  return (
    <View style={sb.wrap}>
      <CheckCircle2 color={T.g700} size={16} strokeWidth={2.5} />
      <Text style={sb.txt} numberOfLines={2}>{msg}</Text>
    </View>
  );
};
const sb = StyleSheet.create({
  wrap: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:T.g100, borderLeftWidth:4, borderLeftColor:T.g600, marginHorizontal:16, marginTop:10, borderRadius:10, paddingHorizontal:14, paddingVertical:10 },
  txt:  { flex:1, fontSize:13, color:T.g800, fontWeight:'600' },
});

/* ═══════════════════════════════════════════════════════════
   MAIN SCREEN
═══════════════════════════════════════════════════════════ */
export default function AssignAgentScreen({ navigation, onBack }) {
  /* ── State ── */
  const [tab,          setTab]          = useState('properties'); // 'properties' | 'agents'
  const [properties,   setProperties]   = useState([]);
  const [agents,       setAgents]       = useState([]);
  const [assignments,  setAssignments]  = useState({});
  const [propFilter,   setPropFilter]   = useState('All');
  const [propSearch,   setPropSearch]   = useState('');
  const [agentSearch,  setAgentSearch]  = useState('');
  const [banner,       setBanner]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);

  // Assign picker modal
  const [pickerOpen,  setPickerOpen]   = useState(false);
  const [pickerProp,  setPickerProp]   = useState(null);
  const [pickerSearch,setPickerSearch] = useState('');

  // Hire modal
  const [hireOpen,    setHireOpen]     = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [hireSearch,  setHireSearch]   = useState('');
  const [hiring,      setHiring]       = useState(false);

  /* ── Banner helper ── */
  const flash = useCallback((msg) => {
    setBanner(msg);
    setTimeout(() => setBanner(''), 3500);
  }, []);

  /* ── API helpers ── */
  const getAuthToken = useCallback(async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch {
      return null;
    }
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

  const loadAssignAgentData = useCallback(async () => {
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
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadAssignAgentData();
  }, [loadAssignAgentData]);

  const openHireModal = useCallback(async () => {
    try {
      setHireOpen(true);
      setHiring(true);
      const res = await apiRequest('/builder/assign-agent/agents/available');
      setAvailableAgents(res.agents || []);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to load agents');
      setHireOpen(false);
    } finally {
      setHiring(false);
    }
  }, [apiRequest]);

  /* ── Filtered lists ── */
  const filteredProps = useMemo(() => {
    let list = properties;
    if (propFilter !== 'All') list = list.filter(p => p.type === propFilter);
    if (propSearch.trim())    list = list.filter(p =>
      p.name.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propSearch.toLowerCase())
    );
    return list;
  }, [properties, propFilter, propSearch]);

  const filteredAgents = useMemo(() => {
    const q = agentSearch.toLowerCase();
    return agents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.spec.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  }, [agents, agentSearch]);

  const pickerAgents = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    return agents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.spec.toLowerCase().includes(q)
    );
  }, [agents, pickerSearch]);

  const filteredAvailableAgents = useMemo(() => {
    const q = hireSearch.toLowerCase();
    if (!q) return availableAgents;
    return availableAgents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.phone || '').toLowerCase().includes(q)
    );
  }, [availableAgents, hireSearch]);

  /* ── Assign helpers ── */
  const agentById = useCallback((id) => agents.find(a => a.id === id), [agents]);

  const propCount = useCallback((agentId) =>
    Object.values(assignments).filter(id => id === agentId).length,
  [assignments]);

  const openPicker = useCallback((prop) => {
    setPickerProp(prop);
    setPickerSearch('');
    setPickerOpen(true);
  }, []);

  const confirmAssign = useCallback(async (agent) => {
    try {
      setPickerOpen(false);
      setSaving(true);
      await apiRequest(`/builder/assign-agent/properties/${pickerProp.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ agentId: agent.id }),
      });
      const asRes = await apiRequest('/builder/assign-agent/assignments');
      setAssignments(asRes.assignments || {});
      flash(`✓ ${agent.name} assigned to ${pickerProp.name}`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to assign agent');
    } finally {
      setSaving(false);
    }
  }, [pickerProp, apiRequest, flash]);

  const removeAssign = useCallback((prop) => {
    Alert.alert(
      'Remove Agent',
      `Remove ${agentById(assignments[prop.id])?.name} from ${prop.name}?`,
      [
        { text:'Cancel', style:'cancel' },
        { text:'Remove', style:'destructive', onPress: () => {
          (async () => {
            try {
              setSaving(true);
              await apiRequest(`/builder/assign-agent/properties/${prop.id}/assign`, { method: 'DELETE' });
              const asRes = await apiRequest('/builder/assign-agent/assignments');
              setAssignments(asRes.assignments || {});
              flash('Agent removed from property');
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to remove assignment');
            } finally {
              setSaving(false);
            }
          })();
        }},
      ]
    );
  }, [assignments, agentById, apiRequest, flash]);

  /* ── Hire existing agent (no duplicate user) ── */
  const hireExistingAgent = useCallback(async (agent) => {
    try {
      setHiring(true);
      const res = await apiRequest(`/builder/assign-agent/agents/${agent.id}/hire`, { method: 'POST' });

      // If already hired (legacy / repeat case), refresh team
      if (res.alreadyHired) {
        const team = await apiRequest('/builder/assign-agent/agents');
        setAgents(team.agents || []);
        flash(`✅ ${agent.name} is already on your team`);
        setTab('agents');
      } else {
        // Normal case: request sent, wait for agent approval
        flash(`✅ Hire request sent to ${agent.name} for approval`);
      }

      // In all cases, refresh available list so pending agents disappear
      const avail = await apiRequest('/builder/assign-agent/agents/available');
      setAvailableAgents(avail.agents || []);
      setHireOpen(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to hire agent');
    } finally {
      setHiring(false);
    }
  }, [apiRequest, flash]);

  /* ══════════════════════════════════════════════════════
     RENDER: PROPERTY CARD
  ══════════════════════════════════════════════════════ */
  const renderPropCard = ({ item }) => {
    const assigned = item.agentId ? agentById(assignments[item.id] || item.agentId) : agentById(assignments[item.id]);
    const isAssigned = !!assigned;

    return (
      <View style={pc.card}>
        {/* Image */}
        <View style={pc.imgBox}>
          <Image source={{ uri: item.image }} style={pc.img} resizeMode="cover" />
          <View style={pc.imgScrim} />
          {/* Type badge */}
          <View style={pc.typeBadge}>
            <Text style={pc.typeText}>{item.type}</Text>
          </View>
          {/* Status pill on image */}
          <View style={pc.statusWrap}>
            <StatusPill status={item.status} />
          </View>
        </View>

        {/* Body */}
        <View style={pc.body}>
          <Text style={pc.name} numberOfLines={1}>{item.name}</Text>

          <View style={pc.metaRow}>
            <MapPin color={T.n500} size={12} strokeWidth={2} />
            <Text style={pc.location} numberOfLines={1}>{item.location}</Text>
          </View>

          <View style={pc.statsRow}>
            <View style={pc.statChip}>
              <Home color={T.g600} size={12} strokeWidth={2} />
              <Text style={pc.statTxt}>{item.units} Units</Text>
            </View>
            <View style={[pc.statChip, { backgroundColor: item.status === 'Active' ? T.g100 : '#FEF3C7' }]}>
              <TrendingUp color={item.status === 'Active' ? T.g700 : '#92400E'} size={12} strokeWidth={2} />
              <Text style={[pc.statTxt, { color: item.status === 'Active' ? T.g700 : '#92400E' }]}>{item.status}</Text>
            </View>
          </View>

          {/* Agent zone */}
          {isAssigned ? (
            <View style={pc.agentZone}>
              <Image source={{ uri: assigned.avatar }} style={pc.agentAvatar} />
              <View style={{ flex:1 }}>
                <Text style={pc.agentName}>{assigned.name}</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                  <Stars rating={assigned.rating} />
                  <Text style={pc.agentSpec}>{assigned.spec}</Text>
                </View>
              </View>
              <View style={pc.agentBtns}>
                <TouchableOpacity style={pc.changeBtn} onPress={() => openPicker(item)} activeOpacity={0.8}>
                  <RefreshCw color={T.g700} size={13} strokeWidth={2.5} />
                  <Text style={pc.changeBtnTxt}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity style={pc.removeBtn} onPress={() => removeAssign(item)} activeOpacity={0.8}>
                  <Trash2 color={T.red} size={13} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={pc.assignBtn} onPress={() => openPicker(item)} activeOpacity={0.85}>
              <Users color={T.white} size={15} strokeWidth={2} />
              <Text style={pc.assignBtnTxt}>Assign Agent</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /* ══════════════════════════════════════════════════════
     RENDER: AGENT CARD
  ══════════════════════════════════════════════════════ */
  const renderAgentCard = ({ item }) => {
    const propNum = propCount(item.id);
    return (
      <View style={ac.card}>
        {/* Left: Avatar + badge */}
        <View style={ac.avatarCol}>
          <Image source={{ uri: item.avatar }} style={ac.avatar} />
          {propNum > 0 && (
            <View style={ac.propBadge}>
              <Text style={ac.propBadgeNum}>{propNum}</Text>
            </View>
          )}
        </View>

        {/* Right: Info */}
        <View style={{ flex:1 }}>
          <View style={ac.nameRow}>
            <Text style={ac.name}>{item.name}</Text>
            <Stars rating={item.rating} />
          </View>

          <View style={ac.specRow}>
            <View style={ac.specChip}>
              <Award color={T.g600} size={11} strokeWidth={2} />
              <Text style={ac.specTxt}>{item.spec}</Text>
            </View>
            {propNum > 0 && (
              <View style={ac.handlingChip}>
                <Text style={ac.handlingTxt}>{propNum} {propNum === 1 ? 'property' : 'properties'}</Text>
              </View>
            )}
          </View>

          <View style={ac.metaGrid}>
            <View style={ac.metaItem}>
              <Briefcase color={T.n500} size={12} strokeWidth={2} />
              <Text style={ac.metaTxt}>{item.exp} yrs exp</Text>
            </View>
            <View style={ac.metaItem}>
              <TrendingUp color={T.n500} size={12} strokeWidth={2} />
              <Text style={ac.metaTxt}>{item.deals} deals</Text>
            </View>
            <View style={ac.metaItem}>
              <MapPin color={T.n500} size={12} strokeWidth={2} />
              <Text style={ac.metaTxt}>{item.city}</Text>
            </View>
            <View style={ac.metaItem}>
              <Phone color={T.n500} size={12} strokeWidth={2} />
              <Text style={ac.metaTxt}>{item.phone}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  /* ══════════════════════════════════════════════════════
     RENDER: PICKER AGENT ROW
  ══════════════════════════════════════════════════════ */
  const renderPickerRow = ({ item }) => {
    const isCurrent = assignments[pickerProp?.id] === item.id;
    return (
      <TouchableOpacity
        style={[pr.row, isCurrent && pr.rowActive]}
        onPress={() => confirmAssign(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.avatar }} style={pr.avatar} />
        <View style={{ flex:1, marginLeft:12 }}>
          <Text style={pr.name}>{item.name}</Text>
          <Text style={pr.sub}>{item.spec} · {item.city}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginTop:3 }}>
            <Stars rating={item.rating} />
            <Text style={pr.meta}>{item.exp} yrs · {item.deals} deals</Text>
          </View>
        </View>
        {isCurrent
          ? <CheckCircle2 color={T.g600} size={20} strokeWidth={2} />
          : <ChevronRight color={T.n300} size={20} strokeWidth={2} />
        }
      </TouchableOpacity>
    );
  };

  /* ══════════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.g800} />

      {/* ─── HEADER ─── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation?.goBack?.() || onBack?.()}
          activeOpacity={0.7}
        >
          <ArrowLeft color={T.white} size={22} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={{ flex:1 }}>
          <Text style={s.headerTitle}>Agent Management</Text>
          <Text style={s.headerSub}>Assign & hire agents for your properties</Text>
        </View>

        <TouchableOpacity
          style={s.hireHeaderBtn}
          onPress={openHireModal}
          activeOpacity={0.85}
        >
          <UserPlus color={T.white} size={17} strokeWidth={2.5} />
          <Text style={s.hireHeaderTxt}>Hire Agent</Text>
        </TouchableOpacity>
      </View>

      {/* ─── STATS BAR ─── */}
      <View style={s.statsBar}>
        {[
          { label:'Properties', val: properties.length },
          { label:'Agents',     val: agents.length },
          { label:'Assigned',   val: Object.keys(assignments).length },
          { label:'Vacant',     val: properties.length - Object.keys(assignments).length },
        ].map((st, i, arr) => (
          <React.Fragment key={st.label}>
            <View style={s.statCell}>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={s.statDiv} />}
          </React.Fragment>
        ))}
      </View>

      {/* ─── SUCCESS BANNER ─── */}
      <SuccessBanner msg={banner} />

      {/* ─── TABS ─── */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, tab === 'properties' && s.tabActive]}
          onPress={() => setTab('properties')}
          activeOpacity={0.8}
        >
          <Building2 color={tab === 'properties' ? T.white : T.g700} size={16} strokeWidth={2} />
          <Text style={[s.tabTxt, tab === 'properties' && s.tabTxtActive]}>Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'agents' && s.tabActive]}
          onPress={() => setTab('agents')}
          activeOpacity={0.8}
        >
          <Users color={tab === 'agents' ? T.white : T.g700} size={16} strokeWidth={2} />
          <Text style={[s.tabTxt, tab === 'agents' && s.tabTxtActive]}>My Agents</Text>
          {agents.length > 0 && (
            <View style={[s.tabBadge, tab === 'agents' && s.tabBadgeActive]}>
              <Text style={[s.tabBadgeTxt, tab === 'agents' && s.tabBadgeTxtActive]}>{agents.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════
          PROPERTIES TAB
      ═══════════════════════════════════════════════ */}
      {tab === 'properties' && (
        <>
          {/* Search */}
          <View style={s.searchRow}>
            <View style={s.searchBox}>
              <Search color={T.n500} size={16} strokeWidth={2} />
              <TextInput
                style={s.searchInput}
                placeholder="Search properties…"
                placeholderTextColor={T.n500}
                value={propSearch}
                onChangeText={setPropSearch}
              />
              {propSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPropSearch('')}>
                  <X color={T.n500} size={15} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Type filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chips}
          >
            {TYPE_FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[s.chip, propFilter === f && s.chipActive]}
                onPress={() => setPropFilter(f)}
                activeOpacity={0.8}
              >
                <Text style={[s.chipTxt, propFilter === f && s.chipTxtActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredProps}
            keyExtractor={i => i.id}
            renderItem={renderPropCard}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.empty}>
                <Building2 color={T.n300} size={52} strokeWidth={1.5} />
                <Text style={s.emptyTxt}>No properties found</Text>
              </View>
            }
          />
        </>
      )}

      {/* ═══════════════════════════════════════════════
          MY AGENTS TAB
      ═══════════════════════════════════════════════ */}
      {tab === 'agents' && (
        <>
          <View style={s.searchRow}>
            <View style={s.searchBox}>
              <Search color={T.n500} size={16} strokeWidth={2} />
              <TextInput
                style={s.searchInput}
                placeholder="Search agents…"
                placeholderTextColor={T.n500}
                value={agentSearch}
                onChangeText={setAgentSearch}
              />
              {agentSearch.length > 0 && (
                <TouchableOpacity onPress={() => setAgentSearch('')}>
                  <X color={T.n500} size={15} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={s.hireInlineBtn}
              onPress={openHireModal}
              activeOpacity={0.85}
            >
              <UserPlus color={T.white} size={17} strokeWidth={2.5} />
              <Text style={s.hireInlineTxt}>Hire</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredAgents}
            keyExtractor={i => i.id}
            renderItem={renderAgentCard}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.empty}>
                <Users color={T.n300} size={52} strokeWidth={1.5} />
                <Text style={s.emptyTxt}>No agents yet. Hire your first agent!</Text>
                <TouchableOpacity style={s.emptyHireBtn} onPress={openHireModal} activeOpacity={0.85}>
                  <UserPlus color={T.white} size={16} strokeWidth={2.5} />
                  <Text style={s.emptyHireTxt}>Hire Agent</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      {/* ─── SAVING OVERLAY ─── */}
      {(saving || loading) && (
        <View style={s.savingOverlay}>
          <View style={s.savingBox}>
            <ActivityIndicator color={T.g700} size="large" />
            <Text style={s.savingTxt}>{loading ? 'Loading…' : 'Assigning agent…'}</Text>
          </View>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ASSIGN AGENT BOTTOM SHEET MODAL
      ═══════════════════════════════════════════════════════════ */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={m.backdrop}>
          <View style={m.sheet}>
            <View style={m.handle} />

            {/* Sheet header */}
            <View style={m.sheetHeader}>
              <View>
                <Text style={m.sheetTitle}>Select an Agent</Text>
                {pickerProp && (
                  <Text style={m.sheetSub} numberOfLines={1}>
                    For: {pickerProp.name}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={m.closeBtn} onPress={() => setPickerOpen(false)}>
                <X color={T.n500} size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Search inside picker */}
            <View style={[s.searchBox, { marginHorizontal:16, marginBottom:10 }]}>
              <Search color={T.n500} size={15} strokeWidth={2} />
              <TextInput
                style={s.searchInput}
                placeholder="Search agents…"
                placeholderTextColor={T.n500}
                value={pickerSearch}
                onChangeText={setPickerSearch}
              />
            </View>

            <FlatList
              data={pickerAgents}
              keyExtractor={i => i.id}
              renderItem={renderPickerRow}
              contentContainerStyle={{ paddingHorizontal:16, paddingBottom:36 }}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View style={{ height:1, backgroundColor:T.n200, marginVertical:2 }} />
              )}
              ListEmptyComponent={
                <View style={[s.empty, { paddingTop:40 }]}>
                  <Text style={s.emptyTxt}>No agents match your search</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════
          HIRE AGENT (SELECT EXISTING REGISTERED AGENT)
      ═══════════════════════════════════════════════════════════ */}
      <Modal
        visible={hireOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setHireOpen(false)}
      >
        <View style={m.backdrop}>
          <View style={m.hireSheet}>
            <View style={m.handle} />

            <View style={m.sheetHeader}>
              <View style={m.hireTitleRow}>
                <View style={m.hireIconBox}>
                  <UserPlus color={T.white} size={20} strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={m.sheetTitle}>Hire Agent</Text>
                  <Text style={m.sheetSub}>Select from registered agents</Text>
                </View>
              </View>
              <TouchableOpacity style={m.closeBtn} onPress={() => setHireOpen(false)}>
                <X color={T.n500} size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal:16, paddingBottom:26 }}>
              <View style={[s.searchBox, { marginBottom:10 }]}>
                <Search color={T.n500} size={15} strokeWidth={2} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search registered agents…"
                  placeholderTextColor={T.n500}
                  value={hireSearch}
                  onChangeText={setHireSearch}
                />
                {hireSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setHireSearch('')}>
                    <X color={T.n500} size={15} strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>

              {hiring && availableAgents.length === 0 ? (
                <View style={[s.empty, { paddingTop:26 }]}>
                  <ActivityIndicator color={T.g700} />
                  <Text style={[s.emptyTxt, { marginTop:10 }]}>Loading agents…</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredAvailableAgents}
                  keyExtractor={(i) => i.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom:14 }}
                  ItemSeparatorComponent={() => (
                    <View style={{ height:1, backgroundColor:T.n200, marginVertical:2 }} />
                  )}
                  renderItem={({ item }) => (
                    <View style={[pr.row, { justifyContent:'space-between' }]}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:12, flex:1, paddingRight:10 }}>
                        <Image source={{ uri: item.avatar }} style={pr.avatar} />
                        <View style={{ flex:1 }}>
                          <Text style={pr.name} numberOfLines={1}>{item.name}</Text>
                          <Text style={pr.meta} numberOfLines={1}>{item.email || item.phone || 'Agent'}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => hireExistingAgent(item)}
                        disabled={hiring}
                        activeOpacity={0.85}
                        style={{
                          backgroundColor: hiring ? T.n300 : T.g800,
                          paddingHorizontal:12,
                          paddingVertical:8,
                          borderRadius:10,
                        }}
                      >
                        <Text style={{ color:T.white, fontWeight:'800', fontSize:12 }}>Hire</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  ListEmptyComponent={
                    <View style={[s.empty, { paddingTop:26 }]}>
                      <Users color={T.n300} size={44} strokeWidth={1.5} />
                      <Text style={[s.emptyTxt, { marginTop:10 }]}>No available agents found</Text>
                    </View>
                  }
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROPERTY CARD STYLES
═══════════════════════════════════════════════════════════ */
const pc = StyleSheet.create({
  card:       { backgroundColor:T.white, borderRadius:20, overflow:'hidden', marginBottom:16, elevation:4, shadowColor:T.shadow, shadowOffset:{width:0,height:4}, shadowOpacity:1, shadowRadius:10 },
  imgBox:     { height:170, position:'relative' },
  img:        { width:'100%', height:'100%' },
  imgScrim:   { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.08)' },
  typeBadge:  { position:'absolute', top:12, left:12, backgroundColor:'rgba(27,94,59,0.85)', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  typeText:   { color:T.white, fontSize:11, fontWeight:'700', letterSpacing:0.5 },
  statusWrap: { position:'absolute', top:12, right:12 },
  body:       { padding:16 },
  name:       { fontSize:17, fontWeight:'800', color:T.n900, marginBottom:5, letterSpacing:-0.3 },
  metaRow:    { flexDirection:'row', alignItems:'center', gap:4, marginBottom:10 },
  location:   { fontSize:12, color:T.n500, flex:1 },
  statsRow:   { flexDirection:'row', gap:8, marginBottom:14 },
  statChip:   { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:T.g100, paddingHorizontal:9, paddingVertical:4, borderRadius:8 },
  statTxt:    { fontSize:12, fontWeight:'600', color:T.g700 },
  // Assigned zone
  agentZone:  { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:T.g50, borderRadius:12, padding:10, borderWidth:1.5, borderColor:T.g200 },
  agentAvatar:{ width:40, height:40, borderRadius:20, borderWidth:2, borderColor:T.g400 },
  agentName:  { fontSize:13, fontWeight:'700', color:T.n900 },
  agentSpec:  { fontSize:11, color:T.n500, marginLeft:2 },
  agentBtns:  { flexDirection:'row', alignItems:'center', gap:6 },
  changeBtn:  { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:T.g100, paddingHorizontal:10, paddingVertical:6, borderRadius:8, borderWidth:1, borderColor:T.g200 },
  changeBtnTxt:{ fontSize:11, fontWeight:'700', color:T.g700 },
  removeBtn:  { width:32, height:32, borderRadius:8, backgroundColor:T.redBg, justifyContent:'center', alignItems:'center' },
  // Assign button
  assignBtn:  { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:T.g800, borderRadius:12, paddingVertical:12 },
  assignBtnTxt:{ color:T.white, fontSize:14, fontWeight:'700' },
});

/* ═══════════════════════════════════════════════════════════
   AGENT CARD STYLES
═══════════════════════════════════════════════════════════ */
const ac = StyleSheet.create({
  card:       { backgroundColor:T.white, borderRadius:18, padding:16, marginBottom:14, elevation:3, shadowColor:T.shadow, shadowOffset:{width:0,height:3}, shadowOpacity:1, shadowRadius:8, flexDirection:'row', gap:14 },
  avatarCol:  { position:'relative' },
  avatar:     { width:58, height:58, borderRadius:29, borderWidth:2.5, borderColor:T.g400 },
  propBadge:  { position:'absolute', bottom:-2, right:-4, backgroundColor:T.g700, width:20, height:20, borderRadius:10, justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:T.white },
  propBadgeNum:{ fontSize:10, fontWeight:'800', color:T.white },
  nameRow:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:5 },
  name:       { fontSize:16, fontWeight:'800', color:T.n900, letterSpacing:-0.2, flex:1 },
  specRow:    { flexDirection:'row', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' },
  specChip:   { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:T.g100, paddingHorizontal:8, paddingVertical:3, borderRadius:7 },
  specTxt:    { fontSize:11, fontWeight:'700', color:T.g700 },
  handlingChip:{ backgroundColor:T.g800, paddingHorizontal:8, paddingVertical:3, borderRadius:7 },
  handlingTxt:{ fontSize:11, fontWeight:'700', color:T.white },
  metaGrid:   { flexDirection:'row', flexWrap:'wrap', gap:10 },
  metaItem:   { flexDirection:'row', alignItems:'center', gap:4 },
  metaTxt:    { fontSize:12, color:T.n500 },
});

/* ═══════════════════════════════════════════════════════════
   PICKER ROW STYLES
═══════════════════════════════════════════════════════════ */
const pr = StyleSheet.create({
  row:       { flexDirection:'row', alignItems:'center', paddingVertical:12, borderRadius:12 },
  rowActive: { backgroundColor:T.g50, paddingHorizontal:10, marginHorizontal:-10 },
  avatar:    { width:48, height:48, borderRadius:24, borderWidth:2, borderColor:T.n200 },
  name:      { fontSize:15, fontWeight:'700', color:T.n900 },
  sub:       { fontSize:12, color:T.n500, marginTop:1 },
  meta:      { fontSize:11, color:T.n500 },
});

/* ═══════════════════════════════════════════════════════════
   MODAL STYLES
═══════════════════════════════════════════════════════════ */
const m = StyleSheet.create({
  backdrop:   { flex:1, backgroundColor:'rgba(0,0,0,0.48)', justifyContent:'flex-end' },
  sheet:      { backgroundColor:T.white, borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:SH * 0.78, paddingBottom:Platform.OS === 'ios' ? 34 : 20 },
  hireSheet:  { backgroundColor:T.white, borderTopLeftRadius:28, borderTopRightRadius:28, maxHeight:SH * 0.93, paddingBottom:Platform.OS === 'ios' ? 34 : 20 },
  handle:     { width:44, height:4, backgroundColor:T.n300, borderRadius:2, alignSelf:'center', marginTop:12, marginBottom:4 },
  sheetHeader:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:16, borderBottomWidth:1, borderBottomColor:T.n200 },
  sheetTitle: { fontSize:18, fontWeight:'800', color:T.n900, letterSpacing:-0.3 },
  sheetSub:   { fontSize:12, color:T.n500, marginTop:2 },
  closeBtn:   { width:36, height:36, borderRadius:10, backgroundColor:T.n100, justifyContent:'center', alignItems:'center' },
  hireTitleRow:{ flexDirection:'row', alignItems:'center', gap:12 },
  hireIconBox:{ width:42, height:42, borderRadius:12, backgroundColor:T.g800, justifyContent:'center', alignItems:'center' },
  hireForm:   { paddingHorizontal:20, paddingTop:8, paddingBottom:16, gap:0 },
  twoCol:     { flexDirection:'row', gap:12 },
  field:      { marginBottom:16 },
  label:      { fontSize:13, fontWeight:'700', color:T.n700, marginBottom:6 },
  req:        { color:T.red },
  opt:        { fontWeight:'400', color:T.n500 },
  note:       { flexDirection:'row', alignItems:'flex-start', gap:8, backgroundColor:T.g100, borderRadius:10, padding:12, marginBottom:20, borderWidth:1, borderColor:T.g200 },
  noteTxt:    { flex:1, fontSize:12, color:T.g800, lineHeight:18 },
  submitBtn:  { backgroundColor:T.g800, borderRadius:16, paddingVertical:16, alignItems:'center', elevation:4, shadowColor:T.shadow, shadowOffset:{width:0,height:4}, shadowOpacity:1, shadowRadius:8 },
  submitDisabled:{ backgroundColor:T.n300, elevation:0 },
  submitTxt:  { color:T.white, fontSize:16, fontWeight:'800', letterSpacing:0.2 },
});

/* ═══════════════════════════════════════════════════════════
   SCREEN-LEVEL STYLES
═══════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  root: { flex:1, backgroundColor:T.g50 },

  // Header
  header:       { backgroundColor:T.g800, paddingTop:Platform.OS === 'ios' ? 58 : 28, paddingBottom:22, paddingHorizontal:20, flexDirection:'row', alignItems:'center', gap:14 },
  backBtn:      { width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.15)', justifyContent:'center', alignItems:'center' },
  headerTitle:  { fontSize:20, fontWeight:'800', color:T.white, letterSpacing:-0.4 },
  headerSub:    { fontSize:12, color:'rgba(255,255,255,0.65)', marginTop:2 },
  hireHeaderBtn:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(255,255,255,0.18)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.35)', borderRadius:12, paddingHorizontal:14, paddingVertical:9 },
  hireHeaderTxt:{ color:T.white, fontSize:13, fontWeight:'700' },

  // Stats
  statsBar:  { flexDirection:'row', backgroundColor:T.white, paddingVertical:14, paddingHorizontal:16, borderBottomWidth:1, borderBottomColor:T.n200, elevation:2, shadowColor:T.shadow, shadowOffset:{width:0,height:2}, shadowOpacity:1, shadowRadius:4 },
  statCell:  { flex:1, alignItems:'center' },
  statVal:   { fontSize:22, fontWeight:'900', color:T.g800, letterSpacing:-0.5 },
  statLbl:   { fontSize:11, color:T.n500, marginTop:2, fontWeight:'500' },
  statDiv:   { width:1, backgroundColor:T.n200, marginVertical:4 },

  // Tabs
  tabBar:      { flexDirection:'row', marginHorizontal:16, marginTop:14, marginBottom:4, backgroundColor:T.g100, borderRadius:14, padding:4 },
  tab:         { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:7, paddingVertical:11, borderRadius:11 },
  tabActive:   { backgroundColor:T.g800, elevation:3, shadowColor:T.shadow, shadowOffset:{width:0,height:2}, shadowOpacity:1, shadowRadius:4 },
  tabTxt:      { fontSize:14, fontWeight:'700', color:T.g700 },
  tabTxtActive:{ color:T.white },
  tabBadge:    { backgroundColor:T.g200, borderRadius:10, paddingHorizontal:6, paddingVertical:1 },
  tabBadgeActive:{ backgroundColor:'rgba(255,255,255,0.25)' },
  tabBadgeTxt: { fontSize:11, fontWeight:'800', color:T.g700 },
  tabBadgeTxtActive:{ color:T.white },

  // Search
  searchRow:  { flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:16, paddingTop:12, paddingBottom:4 },
  searchBox:  { flex:1, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:T.white, borderWidth:1.5, borderColor:T.n300, borderRadius:14, paddingHorizontal:13, height:46 },
  searchInput:{ flex:1, fontSize:14, color:T.n900, height:'100%' },
  hireInlineBtn:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:T.g800, borderRadius:14, paddingHorizontal:14, paddingVertical:12 },
  hireInlineTxt:{ color:T.white, fontSize:13, fontWeight:'700' },

  // Chips
  chips:    { paddingHorizontal:16, paddingVertical:10, gap:8 },
  chip:     { paddingHorizontal:14, paddingVertical:7, borderRadius:22, backgroundColor:T.white, borderWidth:1.5, borderColor:T.n300 },
  chipActive:{ backgroundColor:T.g800, borderColor:T.g800 },
  chipTxt:  { fontSize:13, fontWeight:'600', color:T.n500 },
  chipTxtActive:{ color:T.white },

  // List
  list: { paddingHorizontal:16, paddingBottom:36, paddingTop:4 },

  // Empty
  empty:      { alignItems:'center', paddingTop:60, gap:12 },
  emptyTxt:   { fontSize:15, color:T.n500, fontWeight:'500' },
  emptyHireBtn:{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:T.g800, borderRadius:14, paddingHorizontal:20, paddingVertical:12, marginTop:4 },
  emptyHireTxt:{ color:T.white, fontSize:14, fontWeight:'700' },

  // Saving overlay
  savingOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.38)', justifyContent:'center', alignItems:'center', zIndex:999 },
  savingBox:    { backgroundColor:T.white, borderRadius:20, padding:30, alignItems:'center', gap:14, elevation:10 },
  savingTxt:    { fontSize:15, color:T.n700, fontWeight:'600' },
});
