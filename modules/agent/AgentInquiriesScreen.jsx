import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    StatusBar,
    Alert,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ArrowLeft,
    Check,
    X,
    MessageSquare,
    User,
    Building2,
    Clock
} from 'lucide-react-native';
import { API_BASE_URL, getImageUrl, DEFAULT_PROPERTY_IMAGE } from '../../utils/api';

export default function AgentInquiriesScreen({ navigation, onBack }) {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/inquiries/builder?status=pending`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setInquiries(data.inquiries || []);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch inquiries');
            }
        } catch (err) {
            console.error('Fetch inquiries error:', err);
            Alert.alert('Error', 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (inquiryId, action) => {
        try {
            setProcessingId(inquiryId);
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok && data.success) {
                if (action === 'accept') {
                    // Update local state to show "View Chat"
                    setInquiries(prev => prev.map(inv =>
                        inv.id === inquiryId ? { ...inv, status: 'accepted', chat_id: data.chat_id } : inv
                    ));
                    Alert.alert('Success', 'Inquiry accepted! You can now chat with the user.');
                } else {
                    // Remove from list if rejected
                    setInquiries(prev => prev.filter(inv => inv.id !== inquiryId));
                    Alert.alert('Success', 'Inquiry rejected');
                }
            } else {
                Alert.alert('Error', data.message || `Failed to ${action} inquiry`);
            }
        } catch (error) {
            console.error(`${action} inquiry error:`, error);
            Alert.alert('Error', `Failed to ${action} inquiry`);
        } finally {
            setProcessingId(null);
        }
    };

    const navigateToChat = (chatId, inquiryId) => {
        navigation.navigate('chat', { chatId, inquiryId });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2D6A4F" />
                <Text style={styles.loadingText}>Loading inquiries...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack || (() => navigation.goBack())} style={styles.backButton}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Inquiries</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {inquiries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MessageSquare size={64} color="#D1D5DB" strokeWidth={1} />
                        <Text style={styles.emptyText}>No pending inquiries</Text>
                    </View>
                ) : (
                    inquiries.map((inquiry) => (
                        <View key={inquiry.id} style={styles.card}>
                            <View style={styles.cardMain}>
                                <Image
                                    source={{ uri: getImageUrl(inquiry.property_images?.[0] || inquiry.property_image) || DEFAULT_PROPERTY_IMAGE }}
                                    style={styles.propertyImage}
                                />
                                <View style={styles.cardInfo}>
                                    <Text style={styles.propertyTitle}>{inquiry.property_title}</Text>
                                    <View style={styles.userRow}>
                                        <User size={14} color="#6B7280" />
                                        <Text style={styles.userName}>{inquiry.user_name}</Text>
                                    </View>
                                    <Text style={styles.message} numberOfLines={2}>
                                        "{inquiry.initial_message}"
                                    </Text>
                                    <View style={styles.timeRow}>
                                        <Clock size={12} color="#9CA3AF" />
                                        <Text style={styles.timeText}>
                                            {new Date(inquiry.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                {inquiry.status === 'accepted' ? (
                                    <TouchableOpacity
                                        style={styles.chatButton}
                                        onPress={() => navigateToChat(inquiry.chat_id, inquiry.id)}
                                    >
                                        <MessageSquare size={18} color="#FFFFFF" />
                                        <Text style={styles.chatButtonText}>View Chat</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={styles.rejectButton}
                                            onPress={() => handleAction(inquiry.id, 'reject')}
                                            disabled={processingId === inquiry.id}
                                        >
                                            <X size={18} color="#DC2626" />
                                            <Text style={styles.rejectButtonText}>Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.acceptButton}
                                            onPress={() => handleAction(inquiry.id, 'accept')}
                                            disabled={processingId === inquiry.id}
                                        >
                                            <Check size={18} color="#FFFFFF" />
                                            <Text style={styles.acceptButtonText}>Accept</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    ))
                )}
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    backButton: { padding: 8 },
    scrollContent: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6B7280' },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#9CA3AF' },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardMain: { flexDirection: 'row', marginBottom: 16 },
    propertyImage: { width: 80, height: 80, borderRadius: 12 },
    cardInfo: { flex: 1, marginLeft: 16 },
    propertyTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    userName: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
    message: { fontSize: 14, color: '#6B7280', fontStyle: 'italic', marginBottom: 8 },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 12, color: '#9CA3AF' },
    cardActions: { flexDirection: 'row', gap: 12 },
    acceptButton: {
        flex: 1,
        backgroundColor: '#2D6A4F',
        borderRadius: 12,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    acceptButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    rejectButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    rejectButtonText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
    chatButton: {
        flex: 1,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    chatButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
