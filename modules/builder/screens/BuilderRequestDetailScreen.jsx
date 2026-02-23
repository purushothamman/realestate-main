import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, User, Mail, Phone, Check, X, MapPin, DollarSign } from 'lucide-react-native';

import { API_BASE_URL } from '../../../utils/api';


export default function BuilderRequestDetailScreen({ navigation, onBack, requestId }) {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setError(null);
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/property-requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch request');
      }

      setRequest(data.request);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [requestId]);

  const approve = async () => {
    try {
      setActionLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/property-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to approve');

      // Update local state so UI reflects new status and disables buttons
      setRequest(prev => prev ? { ...prev, status: 'approved' } : prev);

      Alert.alert('Approved', 'Property is now active.', [
        {
          text: 'OK',
          onPress: () => { },
        },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    try {
      setActionLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/property-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason: 'Disapproved by builder' }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to disapprove');

      // Update local state so UI reflects new status and disables buttons
      setRequest(prev => prev ? { ...prev, status: 'rejected' } : prev);

      Alert.alert('Disapproved', 'Request rejected. Property remains blocked.', [
        {
          text: 'OK',
          onPress: () => { },
        },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.centerText}>Loading request…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn’t load request</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={fetchDetail}>
          <Text style={styles.primaryBtnText}>Retry</Text>
        </TouchableOpacity>
        {!!onBack && (
          <TouchableOpacity style={styles.linkBtn} onPress={onBack}>
            <Text style={styles.linkBtnText}>Go back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const property = request?.property;
  const agent = request?.agent;
  const rawCover = property?.images?.[0];
  const cover =
    typeof rawCover === 'string' && rawCover.startsWith('http')
      ? rawCover
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
  const isPending = request?.status === 'pending';

  const openPropertyDetail = () => {
    if (!property || !navigation || !navigation.navigate) return;
    try {
      // Pass agent along so PropertyDetailScreen can show "Contact Agent" correctly
      navigation.navigate('propertyDetail', { property: { ...property, agent } });
    } catch (e) {
      console.error('Failed to navigate to property detail from builder request detail:', e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (onBack ? onBack() : navigation.goBack())}
        >
          <ChevronLeft width={22} height={22} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Request Detail</Text>
          <Text style={styles.headerSubtitle}>
            Status: {request?.status || '—'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={openPropertyDetail}
        >
          <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
          <View style={{ padding: 14 }}>
            <Text style={styles.title}>{property?.title}</Text>
            <View style={styles.row}>
              <DollarSign size={14} color="#6B7280" />
              <Text style={styles.rowText}>${Number(property?.price || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.rowText} numberOfLines={2}>
                {property?.address}, {property?.city}, {property?.state}
              </Text>
            </View>
            {!!property?.description && (
              <Text style={styles.desc} numberOfLines={6}>
                {property.description}
              </Text>
            )}
            <Text style={styles.linkHint}>Tap to view full property details</Text>
          </View>
        </TouchableOpacity>

        {/* Agent */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Agent</Text>
          </View>
          <View style={{ padding: 14, paddingTop: 0 }}>
            <View style={styles.row}>
              <User size={14} color="#6B7280" />
              <Text style={styles.rowText}>{agent?.name || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Mail size={14} color="#6B7280" />
              <Text style={styles.rowText}>{agent?.email || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Phone size={14} color="#6B7280" />
              <Text style={styles.rowText}>{agent?.phone || '—'}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.rejectBtn, (!isPending || actionLoading) && styles.btnDisabled]}
          disabled={!isPending || actionLoading}
          onPress={reject}
        >
          {actionLoading ? <ActivityIndicator size="small" color="#DC2626" /> : <X size={16} color="#DC2626" />}
          <Text style={styles.rejectText}>Disapprove</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveBtn, (!isPending || actionLoading) && styles.btnDisabled]}
          disabled={!isPending || actionLoading}
          onPress={approve}
        >
          {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <Check size={16} color="#fff" />}
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  headerSubtitle: { marginTop: 2, fontSize: 12, color: '#6B7280', fontWeight: '700' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  cover: { width: '100%', height: 200, backgroundColor: '#F3F4F6' },
  title: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowText: { fontSize: 13, color: '#374151', fontWeight: '700', flex: 1 },
  desc: { marginTop: 6, fontSize: 12, color: '#6B7280', fontWeight: '600', lineHeight: 18 },
  cardHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },
  approveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2D6A4F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveText: { color: '#fff', fontWeight: '900' },
  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectText: { color: '#DC2626', fontWeight: '900' },
  btnDisabled: { opacity: 0.55 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', padding: 24 },
  centerText: { marginTop: 12, color: '#6B7280', fontWeight: '700' },
  errorTitle: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 6 },
  errorText: { fontSize: 12, color: '#6B7280', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  primaryBtn: { backgroundColor: '#2D6A4F', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '900' },
  linkBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 12 },
  linkBtnText: { color: '#2D6A4F', fontWeight: '900' },
  linkHint: { marginTop: 8, fontSize: 11, color: '#6B7280', fontWeight: '600' },
});

