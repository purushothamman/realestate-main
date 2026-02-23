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
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Building2, User, Clock, ArrowRight } from 'lucide-react-native';

import { API_BASE_URL } from '../../../utils/api';


export default function BuilderRequestListScreen({ navigation, onBack }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/property-requests/builder?status=pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch requests');
      }

      setRequests(data.requests || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.centerText}>Loading requests…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn’t load requests</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={fetchRequests}>
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
          <Text style={styles.headerTitle}>Agent Requests</Text>
          <Text style={styles.headerSubtitle}>{requests.length} pending</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
        }
        showsVerticalScrollIndicator={false}
      >
        {requests.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Building2 size={22} color="#2D6A4F" />
            </View>
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptyText}>When agents submit properties for approval, they’ll appear here.</Text>
          </View>
        ) : (
          requests.map((r) => (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => navigation.navigate('builderRequestDetail', { requestId: r.id })}
            >
              <Image
                source={{
                  uri: r.property_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
                }}
                style={styles.cardImage}
              />

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {r.property_title}
                </Text>

                <View style={styles.row}>
                  <User size={14} color="#6B7280" />
                  <Text style={styles.rowText} numberOfLines={1}>
                    {r.agent_name}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.rowText}>
                    {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                  </Text>
                </View>

                <View style={styles.ctaRow}>
                  <Text style={styles.ctaText}>Review</Text>
                  <ArrowRight size={16} color="#2D6A4F" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  headerSubtitle: { marginTop: 2, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  content: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  cardImage: { width: 92, height: 92, backgroundColor: '#F3F4F6' },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  rowText: { fontSize: 12, color: '#6B7280', fontWeight: '600', flex: 1 },
  ctaRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaText: { color: '#2D6A4F', fontWeight: '800', fontSize: 12 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 15, fontWeight: '900', color: '#111827', marginBottom: 6 },
  emptyText: { fontSize: 12, color: '#6B7280', fontWeight: '600', textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', padding: 24 },
  centerText: { marginTop: 12, color: '#6B7280', fontWeight: '600' },
  errorTitle: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 6 },
  errorText: { fontSize: 12, color: '#6B7280', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  primaryBtn: { backgroundColor: '#2D6A4F', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  linkBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 12 },
  linkBtnText: { color: '#2D6A4F', fontWeight: '800' },
});

