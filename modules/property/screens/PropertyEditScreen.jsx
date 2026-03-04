import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Camera,
  Home,
  X,
  Wifi,
  Car,
  Dumbbell,
  Trees,
  ShieldCheck,
  Droplets,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react-native';

import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../../utils/api';

/* ── Design tokens ── */
const G = '#1B5E3B';
const G_LIGHT = '#E8F5ED';
const G_MID = '#25904F';
const BLUE = '#3B82F6';
const AMBER = '#F59E0B';
const RED = '#EF4444';
const N900 = '#111827';
const N700 = '#374151';
const N500 = '#6B7280';
const N400 = '#9CA3AF';
const N300 = '#D1D5DB';
const N200 = '#E5E7EB';
const N100 = '#F3F4F6';
const WHITE = '#FFFFFF';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', Icon: Building2 },
  { id: 'villa', label: 'Villa', Icon: Home },
  { id: 'plot', label: 'Plot', Icon: Trees },
  { id: 'commercial', label: 'Commercial', Icon: Building2 },
];

const AMENITIES_LIST = [
  { id: 'wifi', label: 'WiFi', Icon: Wifi },
  { id: 'parking', label: 'Parking', Icon: Car },
  { id: 'gym', label: 'Gym', Icon: Dumbbell },
  { id: 'garden', label: 'Garden', Icon: Trees },
  { id: 'security', label: '24/7 Security', Icon: ShieldCheck },
  { id: 'pool', label: 'Swimming Pool', Icon: Droplets },
];

/* ─── helpers ─── */
const SectionHeader = ({ icon: Icon, iconBg = G_LIGHT, iconColor = G, title }) => (
  <View style={s.sectionHdr}>
    <View style={[s.sectionIcon, { backgroundColor: iconBg }]}>
      <Icon color={iconColor} size={20} />
    </View>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

const Label = ({ children, required }) => (
  <Text style={s.label}>{children}{required && <Text style={{ color: RED }}> *</Text>}</Text>
);

const FieldBox = ({ children, style }) => (
  <View style={[s.inputWrapper, style]}>{children}</View>
);

export default function PropertyEditScreen({ navigation, route, property, onSaved: propOnSaved }) {
  const onSaved = propOnSaved || route?.params?.onSaved;
  const prop = property || route?.params?.property || {};

  // Map numeric property_type_id → string key
  const typeIdToKey = { 1: 'apartment', 2: 'villa', 3: 'plot', 4: 'commercial' };
  const resolveType = (p) => {
    if (p.propertyType) return p.propertyType;
    if (p.property_type_id) return typeIdToKey[p.property_type_id] || '';
    if (p.type) {
      // handle string form like 'Apartment'
      const lower = String(p.type).toLowerCase();
      return Object.values(typeIdToKey).includes(lower) ? lower : '';
    }
    return '';
  };

  const toIds = (raw = []) => {
    if (!raw.length) return [];
    // If already IDs, keep; otherwise try to map labels → IDs
    const idSet = new Set(AMENITIES_LIST.map(a => a.id));
    if (idSet.has(raw[0])) return raw;
    return raw.map(label => {
      const found = AMENITIES_LIST.find(a => a.label.toLowerCase() === label.toLowerCase());
      return found ? found.id : null;
    }).filter(Boolean);
  };
  // Derive initial amenity IDs from whatever format was stored
  const [form, setForm] = useState({
    title: prop.title || prop.name || '',
    propertyType: resolveType(prop),
    status: (prop.listing_type || prop.listingType) === 'rent' ? 'rent'
      : (prop.listing_type || prop.listingType) === 'sale' ? 'sale'
        : prop.status === 'rent' ? 'rent' : 'sale',
    address: prop.address || '',
    city: prop.city || '',
    state: prop.state || '',
    pincode: prop.pincode ? String(prop.pincode) : '',
    price: prop.price ? String(prop.price) : '',
    area: prop.area_sqft || prop.areaSqft
      ? String(prop.area_sqft || prop.areaSqft)
      : prop.area ? String(prop.area) : '',
    description: prop.description || '',
    bedrooms: prop.bedrooms ? String(prop.bedrooms) : '',
    bathrooms: prop.bathrooms ? String(prop.bathrooms) : '',
    amenities: toIds(prop.amenities || []),
  });

  // Normalize images: could be strings, or objects with url/image_url field
  const normalizeImages = (imgs) => {
    if (!imgs || !imgs.length) return [];
    return imgs.map(img => {
      let path = null;
      if (typeof img === 'string') path = img;
      else if (img && (img.image_url || img.url)) path = img.image_url || img.url;
      return getImageUrl(path);
    }).filter(Boolean);
  };

  const [images, setImages] = useState(normalizeImages(prop.images));
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // City autocomplete
  const [cityQuery, setCityQuery] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cityDebounceRef = useRef(null);

  useEffect(() => {
    if (form.city) {
      setCityQuery([form.city, form.state].filter(Boolean).join(', '));
    }
  }, []);

  const upd = (key) => (val) => {
    setForm(p => ({ ...p, [key]: val }));
    setTouched(true);
  };

  /* City autocomplete */
  const fetchCities = async (query) => {
    if (!query || query.length < 2) { setCitySuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setCitySuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch { }
  };

  const onCityChange = (text) => {
    setCityQuery(text);
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    cityDebounceRef.current = setTimeout(() => fetchCities(text), 400);
  };

  const onCitySelect = (item) => {
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const state = addr.state || '';
    setCityQuery([city, state].filter(Boolean).join(', '));
    setForm(p => ({ ...p, city, state }));
    setCitySuggestions([]);
    setShowSuggestions(false);
    setTouched(true);
  };

  const clearCity = () => {
    setCityQuery('');
    setCitySuggestions([]);
    setShowSuggestions(false);
    setForm(p => ({ ...p, city: '', state: '' }));
  };

  /* Amenity toggle */
  const toggleAmenity = (id) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(id)
        ? p.amenities.filter(a => a !== id)
        : [...p.amenities, id],
    }));
    setTouched(true);
  };

  /* Image pick */
  const pickImage = async () => {
    if (images.length >= 6) {
      Alert.alert('Maximum Images', 'You can only upload up to 6 images.'); return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission Required', 'Allow photo library access.'); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) { Alert.alert('Error', 'You must be logged in.'); return; }
      for (const asset of result.assets) {
        try {
          const fd = new FormData();
          fd.append('image', Platform.OS === 'web'
            ? asset.file || await (await fetch(asset.uri)).blob()
            : { uri: asset.uri, name: asset.fileName || `img-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' }
          );
          const r = await fetch(`${API_BASE_URL}/upload/property-image`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
          });
          const d = await r.json();
          if (d.success && d.url) setImages(prev => [...prev, d.url]);
        } catch (e) { Alert.alert('Upload Failed', 'One image could not be uploaded.'); }
      }
      setTouched(true);
    }
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  /* Save */
  const handleSave = async () => {
    const propId = prop.id || prop.property_id;

    if (!propId) {
      console.error("Property ID is undefined! Cannot save.");
      Alert.alert('Error', 'Cannot identify this property. Please go back and try again.');
      return;
    }

    const priceStr = String(form.price || '').trim();
    const titleStr = String(form.title || '').trim();
    const addrStr = String(form.address || '').trim();
    const cityStr = String(form.city || '').trim();

    if (!titleStr) { Alert.alert('Required', 'Property title is required.'); return; }
    if (!form.propertyType) { Alert.alert('Required', 'Select a property type.'); return; }
    if (!addrStr) { Alert.alert('Required', 'Address is required.'); return; }
    if (!cityStr) { Alert.alert('Required', 'City is required.'); return; }
    if (!priceStr) { Alert.alert('Required', 'Price is required.'); return; }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) { Alert.alert('Error', 'You must be logged in.'); return; }

      const typeMap = { apartment: 1, villa: 2, plot: 3, commercial: 4 };

      const payload = {
        title: form.title,
        description: form.description || '',
        price: parseFloat(String(form.price).replace(/,/g, '')) || 0,
        listing_type: form.status,
        property_type_id: typeMap[form.propertyType] || 1,
        address: form.address,
        city: form.city,
        state: form.state || '',
        pincode: form.pincode || '',
        area_sqft: parseFloat(String(form.area).replace(/,/g, '')) || 0,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        features: form.amenities.map(id => ({ name: id, value: 'true' })),
        images: images.map((url, i) => ({ image_url: url, is_primary: i === 0, sort_order: i })),
      };



      const res = await fetch(`${API_BASE_URL}/properties/${propId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to update property');

      setTouched(false);

      // Notify callers (e.g. refresh listings)
      if (typeof onSaved === 'function') onSaved(data.property);

      // Success alert and automatic navigation back
      Alert.alert('Saved!', 'Property updated successfully.', [
        {
          text: 'OK',
          onPress: () => {
            if (typeof navigation?.goBack === 'function') {
              navigation.goBack();
            }
          }
        },
      ]);
      // Small timeout as fallback if user doesn't press OK immediately 
      // or to ensure it feels responsive
      // setTimeout(() => navigation?.goBack?.(), 1500); 
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!touched) { navigation?.goBack?.(); return; }
    Alert.alert('Discard Changes?', 'All unsaved edits will be lost.', [
      { text: 'Keep Editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation?.goBack?.() },
    ]);
  };

  const handleBack = () => {
    if (!touched) { navigation?.goBack?.(); return; }
    Alert.alert('Unsaved Changes', 'Leave without saving?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => navigation?.goBack?.() },
    ]);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={G} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} style={s.backBtn} activeOpacity={0.7}>
          <ArrowLeft color={WHITE} size={20} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Edit Property</Text>
          <Text style={s.headerSub} numberOfLines={1}>{form.title || 'Untitled'}</Text>
        </View>
        {touched && (
          <View style={s.unsavedPill}>
            <Text style={s.unsavedTxt}>Unsaved</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Images ── */}
        <View style={s.card}>
          <SectionHeader icon={Camera} title="Property Images" />
          <View style={s.imageGrid}>
            {images.map((uri, idx) => (
              <View key={idx} style={s.imgThumb}>
                <Image source={{ uri }} style={s.imgThumbImg} resizeMode="cover" />
                <TouchableOpacity style={s.imgRemove} onPress={() => removeImage(idx)} activeOpacity={0.8}>
                  <X color={WHITE} size={12} strokeWidth={3} />
                </TouchableOpacity>
                {idx === 0 && <View style={s.primaryBadge}><Text style={s.primaryBadgeTxt}>PRIMARY</Text></View>}
              </View>
            ))}
            {images.length < 6 && (
              <TouchableOpacity style={s.imgAdd} onPress={pickImage} activeOpacity={0.7}>
                <Camera color={N400} size={24} strokeWidth={1.5} />
                <Text style={s.imgAddTxt}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Basic Details ── */}
        <View style={s.card}>
          <SectionHeader icon={Building2} title="Basic Property Details" />

          <Label required>Property Title</Label>
          <FieldBox>
            <TextInput
              style={s.input}
              placeholder="e.g., Modern Luxury Villa"
              placeholderTextColor={N400}
              value={form.title}
              onChangeText={upd('title')}
            />
          </FieldBox>

          <Label required>Property Type</Label>
          <View style={s.typeGrid}>
            {PROPERTY_TYPES.map(({ id, label, Icon }) => {
              const active = form.propertyType === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[s.typeBtn, active && s.typeBtnActive]}
                  onPress={() => upd('propertyType')(id)}
                  activeOpacity={0.7}
                >
                  <Icon color={active ? G : N500} size={18} strokeWidth={2.5} />
                  <Text style={[s.typeTxt, active && s.typeTxtActive]}>{label}</Text>
                  {active && <CheckCircle2 color={G} size={16} fill={G} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Label required>Property Status</Label>
          <View style={s.typeGrid}>
            {[
              { id: 'sale', label: 'For Sale', Icon: DollarSign },
              { id: 'rent', label: 'For Rent', Icon: Home },
            ].map(({ id, label, Icon }) => {
              const active = form.status === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[s.typeBtn, active && s.typeBtnActive, { flex: 1 }]}
                  onPress={() => upd('status')(id)}
                  activeOpacity={0.7}
                >
                  <Icon color={active ? G : N500} size={18} />
                  <Text style={[s.typeTxt, active && s.typeTxtActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Label>Description</Label>
          <FieldBox style={{ minHeight: 90, alignItems: 'flex-start' }}>
            <TextInput
              style={[s.input, { height: 'auto', paddingVertical: 12, textAlignVertical: 'top' }]}
              placeholder="Describe the property in detail…"
              placeholderTextColor={N400}
              value={form.description}
              onChangeText={upd('description')}
              multiline
              blurOnSubmit={false}
            />
          </FieldBox>
        </View>

        {/* ── Location ── */}
        <View style={[s.card, { zIndex: showSuggestions ? 100 : 1 }]}>
          <SectionHeader icon={MapPin} iconBg="#EFF6FF" iconColor={BLUE} title="Location Details" />

          <Label required>City / Area</Label>
          <View style={{ zIndex: 100, marginBottom: 16 }}>
            <FieldBox style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Type to search city…"
                placeholderTextColor={N400}
                value={cityQuery}
                onChangeText={onCityChange}
                onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
              />
              {cityQuery.length > 0 && (
                <TouchableOpacity onPress={clearCity} style={{ marginRight: 8 }}>
                  <X color={N400} size={16} />
                </TouchableOpacity>
              )}
              <MapPin color={N400} size={18} />
            </FieldBox>
            {showSuggestions && (
              <View style={s.suggestionBox}>
                {citySuggestions.map((item, idx) => {
                  const addr = item.address || {};
                  const city = addr.city || addr.town || addr.village || addr.county || '';
                  const state = addr.state || '';
                  const label = [city, state].filter(Boolean).join(', ');
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[s.suggestionRow, idx < citySuggestions.length - 1 && s.suggestionBorder]}
                      onPress={() => onCitySelect(item)}
                      activeOpacity={0.7}
                    >
                      <MapPin color={BLUE} size={14} style={{ marginRight: 8 }} />
                      <Text style={s.suggestionTxt}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <Label required>Address</Label>
          <FieldBox>
            <TextInput
              style={s.input}
              placeholder="e.g., 123 Main Street"
              placeholderTextColor={N400}
              value={form.address}
              onChangeText={upd('address')}
            />
          </FieldBox>

          <Label>Pincode</Label>
          <FieldBox>
            <TextInput
              style={s.input}
              placeholder="e.g., 400053"
              placeholderTextColor={N400}
              value={form.pincode}
              onChangeText={upd('pincode')}
              keyboardType="number-pad"
              maxLength={6}
            />
          </FieldBox>
        </View>

        {/* ── Pricing & Area ── */}
        <View style={s.card}>
          <SectionHeader icon={DollarSign} iconBg="#FFFBEB" iconColor={AMBER} title="Pricing & Area" />

          <Label required>Price (₹)</Label>
          <FieldBox>
            <Text style={s.prefix}>₹</Text>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="e.g., 1,85,00,000"
              placeholderTextColor={N400}
              value={form.price}
              onChangeText={upd('price')}
              keyboardType="numeric"
            />
          </FieldBox>

          <Label>Area (sq ft)</Label>
          <FieldBox>
            <TextInput
              style={s.input}
              placeholder="e.g., 1200"
              placeholderTextColor={N400}
              value={form.area}
              onChangeText={upd('area')}
              keyboardType="numeric"
            />
          </FieldBox>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Label>Bedrooms</Label>
              <FieldBox>
                <TextInput
                  style={s.input}
                  placeholder="e.g., 3"
                  placeholderTextColor={N400}
                  value={form.bedrooms}
                  onChangeText={upd('bedrooms')}
                  keyboardType="number-pad"
                />
              </FieldBox>
            </View>
            <View style={{ flex: 1 }}>
              <Label>Bathrooms</Label>
              <FieldBox>
                <TextInput
                  style={s.input}
                  placeholder="e.g., 2"
                  placeholderTextColor={N400}
                  value={form.bathrooms}
                  onChangeText={upd('bathrooms')}
                  keyboardType="number-pad"
                />
              </FieldBox>
            </View>
          </View>
        </View>

        {/* ── Amenities ── */}
        <View style={s.card}>
          <SectionHeader icon={CheckCircle2} iconBg="#F0FDFA" iconColor="#0D9488" title="Amenities" />
          <Text style={s.amenityHint}>{form.amenities.length} selected — tap to toggle</Text>
          <View style={s.amenityGrid}>
            {AMENITIES_LIST.map(({ id, label, Icon }) => {
              const on = form.amenities.includes(id);
              return (
                <TouchableOpacity
                  key={id}
                  style={[s.amenityChip, on && s.amenityChipOn]}
                  onPress={() => toggleAmenity(id)}
                  activeOpacity={0.7}
                >
                  <Icon color={on ? G : N500} size={14} strokeWidth={2} />
                  <Text style={[s.amenityTxt, on && s.amenityTxtOn]}>{label}</Text>
                  {on && <CheckCircle2 color={G} size={13} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.discardBtn, !touched && { opacity: 0.4 }]}
          onPress={handleDiscard}
          disabled={!touched}
          activeOpacity={0.8}
        >
          <RotateCcw color={N700} size={16} strokeWidth={2.5} />
          <Text style={s.discardTxt}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Save color={WHITE} size={16} strokeWidth={2.5} />
          <Text style={s.saveTxt}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAF7' },
  header: { backgroundColor: G, paddingTop: Platform.OS === 'ios' ? 58 : 28, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: WHITE, letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  unsavedPill: { backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#FCD34D' },
  unsavedTxt: { fontSize: 11, fontWeight: '700', color: AMBER },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  card: { backgroundColor: WHITE, borderRadius: 18, marginBottom: 14, elevation: 2, shadowColor: 'rgba(27,94,59,0.10)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, padding: 20 },
  sectionHdr: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: N900, letterSpacing: -0.2 },
  label: { fontSize: 13, fontWeight: '700', color: N700, marginBottom: 7, letterSpacing: 0.1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderWidth: 1.5, borderColor: N300, borderRadius: 12, paddingHorizontal: 14, minHeight: 50, marginBottom: 16 },
  input: { flex: 1, fontSize: 15, color: N900, height: 50 },
  prefix: { fontSize: 15, color: N500, marginRight: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: N200, backgroundColor: N100 },
  typeBtnActive: { backgroundColor: G_LIGHT, borderColor: '#C6E8D4' },
  typeTxt: { fontSize: 13, fontWeight: '600', color: N500 },
  typeTxtActive: { color: G, fontWeight: '700' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imgThumb: { width: 90, height: 90, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  imgThumbImg: { width: '100%', height: '100%' },
  imgRemove: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(239,68,68,0.85)', justifyContent: 'center', alignItems: 'center' },
  primaryBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(27,94,59,0.75)', paddingVertical: 3 },
  primaryBadgeTxt: { fontSize: 9, fontWeight: '800', color: WHITE, textAlign: 'center', letterSpacing: 0.5 },
  imgAdd: { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: N300, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 6 },
  imgAddTxt: { fontSize: 11, color: N500, fontWeight: '600' },
  suggestionBox: { position: 'absolute', top: 54, left: 0, right: 0, backgroundColor: WHITE, borderRadius: 12, borderWidth: 1.5, borderColor: N200, elevation: 8, zIndex: 200, overflow: 'hidden' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: N100 },
  suggestionTxt: { fontSize: 14, color: N700, fontWeight: '500', flex: 1 },
  amenityHint: { fontSize: 12, color: N500, fontWeight: '500', marginBottom: 12 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 24, backgroundColor: N100, borderWidth: 1.5, borderColor: N200 },
  amenityChipOn: { backgroundColor: G_LIGHT, borderColor: '#C6E8D4' },
  amenityTxt: { fontSize: 12, fontWeight: '600', color: N500 },
  amenityTxtOn: { color: G },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: WHITE, borderTopWidth: 1.5, borderTopColor: N200, elevation: 20 },
  discardBtn: { flex: 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: N100, borderRadius: 14, paddingVertical: 15, borderWidth: 1.5, borderColor: N200 },
  discardTxt: { fontSize: 15, fontWeight: '700', color: N700 },
  saveBtn: { flex: 1.3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: G, borderRadius: 14, paddingVertical: 15, elevation: 4 },
  saveTxt: { fontSize: 15, fontWeight: '800', color: WHITE, letterSpacing: -0.2 },
});
