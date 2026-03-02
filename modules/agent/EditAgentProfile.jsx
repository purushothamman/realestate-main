import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Alert,
    Dimensions,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── COLORS ───────────────────────────────────────────────
const C = {
    green: '#2D6A4F',
    greenLt: '#40916C',
    greenBg: '#F0FDF4',
    greenBd: '#BBF7D0',
    blue: '#3B82F6',
    amber: '#F59E0B',
    purple: '#8B5CF6',
    red: '#EF4444',
    sold: '#6B7280',
    bg: '#F4F6F8',
    card: '#ffffff',
    text: '#111827',
    muted: '#6B7280',
    faint: '#9CA3AF',
    border: '#E5E7EB',
    border2: '#F3F4F6',
};

// ─── STAR ROW ──────────────────────────────────────────────
const StarRow = ({ count = 5, size = 12 }) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
            <Text key={i} style={{ fontSize: size, color: C.amber }}>★</Text>
        ))}
    </View>
);

// ════════════════════════════════════════════════════════════
//  EDIT PROFILE SCREEN
// ════════════════════════════════════════════════════════════
const EditProfileScreen = ({ onBack, userData, onUpdate }) => {
    const [form, setForm] = useState({
        firstName: userData?.name?.split(' ')[0] || '',
        lastName: userData?.name?.split(' ').slice(1).join(' ') || '',
        title: userData?.title || '',
        phone: userData?.phone || '',
        email: userData?.email || '',
        website: userData?.website || '',
        location: userData?.address || '',
        about: userData?.about || '',
        agency: userData?.agency || '',
        reraId: userData?.reraId || '',
        instagram: userData?.instagram || '',
        twitter: userData?.twitter || '',
        linkedin: userData?.linkedin || '',
        language1: userData?.language1 || 'English',
        language2: userData?.language2 || '',
        language3: userData?.language3 || '',
    });

    const [logoImage, setLogoImage] = useState(
        getImageUrl(userData?.profileImage) || DEFAULT_PROFILE_IMAGE
    );
    const [isSaving, setIsSaving] = useState(false);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (userData && !isInitialized.current) {
            console.log('🔄 userData change detected in EditAgentProfile. Initializing form...');
            isInitialized.current = true;
            setForm({
                firstName: userData.name?.split(' ')[0] || '',
                lastName: userData.name?.split(' ').slice(1).join(' ') || '',
                title: userData.title || '',
                phone: userData.phone || '',
                email: userData.email || '',
                website: userData.website || '',
                location: userData.address || '',
                about: userData.about || '',
                agency: userData.agency || '',
                reraId: userData.reraId || '',
                instagram: userData.instagram || '',
                twitter: userData.twitter || '',
                linkedin: userData.linkedin || '',
                language1: userData.language1 || 'English',
                language2: userData.language2 || '',
                language3: userData.language3 || '',
                profileImage: userData.profileImage || '',
            });
            if (userData.profileImage) {
                setLogoImage(getImageUrl(userData.profileImage));
            }
        }
    }, [userData]);

    const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0].uri) {
                const selectedImage = result.assets[0];
                console.log('📸 Agent photo picked:', selectedImage.uri);

                const formDataUpload = new FormData();
                if (Platform.OS === 'web') {
                    const response = await fetch(selectedImage.uri);
                    const blob = await response.blob();
                    formDataUpload.append('profileImage', blob, 'profile.jpg');
                } else {
                    const uriParts = selectedImage.uri.split('.');
                    const fileType = uriParts[uriParts.length - 1];
                    formDataUpload.append('profileImage', {
                        uri: selectedImage.uri,
                        name: `profile.${fileType}`,
                        type: `image/${fileType.toLowerCase()}`,
                    });
                }

                const token = await AsyncStorage.getItem('authToken');
                const uploadResponse = await fetch(`${API_BASE_URL}/upload/profile-image`, {
                    method: 'POST',
                    body: formDataUpload,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                const uploadData = await uploadResponse.json();
                if (uploadResponse.ok) {
                    handleChange('profileImage', uploadData.url);
                    setLogoImage(getImageUrl(uploadData.url));
                    Alert.alert('Success', 'Profile photo uploaded successfully');
                } else {
                    Alert.alert('Upload Failed', uploadData.message || 'Error uploading image');
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick or upload image');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                setIsSaving(false);
                return;
            }

            // Map form back to backend expected fields
            const payload = {
                ...form,
                name: `${form.firstName} ${form.lastName}`.trim(),
                city: form.location, // Agents table uses 'city'
                experienceYears: userData?.experienceYears || 0, // Preserve experience years
            };

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert('Profile Updated', 'Your profile has been saved successfully!');
                if (onUpdate) await onUpdate(); // Refresh global user data
                if (onBack) onBack();
            } else {
                Alert.alert('Error', result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Save agent profile error:', error);
            Alert.alert('Error', 'An error occurred while saving profile');
        } finally {
            setIsSaving(false);
        }
    };

    const SectionHeader = ({ title, icon }) => (
        <View style={editStyles.sectionHeader}>
            <Text style={editStyles.sectionIcon}>{icon}</Text>
            <Text style={editStyles.sectionTitle}>{title}</Text>
        </View>
    );

    const Field = ({ label, value, fieldKey, multiline = false, placeholder = '', keyboardType = 'default' }) => (
        <View style={editStyles.fieldWrap}>
            <Text style={editStyles.fieldLabel}>{label}</Text>
            <TextInput
                style={[editStyles.fieldInput, multiline && editStyles.fieldInputMulti]}
                value={value}
                onChangeText={v => handleChange(fieldKey, v)}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                placeholder={placeholder || label}
                placeholderTextColor={C.faint}
                keyboardType={keyboardType}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );

    return (
        <View style={editStyles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Header */}
            <View style={editStyles.header}>
                <View style={editStyles.headerBg} />
                <SafeAreaView>
                    <View style={editStyles.headerInner}>
                        <TouchableOpacity style={editStyles.headerBackBtn} onPress={onBack}>
                            <Text style={editStyles.headerBackText}>←</Text>
                        </TouchableOpacity>
                        <Text style={editStyles.headerTitle}>Edit Profile</Text>
                        <TouchableOpacity style={editStyles.headerSaveBtn} onPress={handleSave}>
                            <Text style={editStyles.headerSaveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={editStyles.body}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    {/* Profile Photo */}
                    <View style={editStyles.photoCard}>
                        <View style={editStyles.photoWrap}>
                            <Image
                                source={{ uri: logoImage }}
                                style={editStyles.photo}
                            />
                            <TouchableOpacity
                                style={editStyles.photoCamBtn}
                                onPress={handlePickImage}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={editStyles.photoCamIcon}>📷</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={editStyles.photoHint}>Tap to change profile photo</Text>

                        {/* Cover Photo */}
                        <TouchableOpacity
                            style={editStyles.coverBtn}
                            onPress={() => Alert.alert('Cover Photo', 'Change cover photo?')}
                        >
                            <Text style={editStyles.coverBtnIcon}>🖼 </Text>
                            <Text style={editStyles.coverBtnText}>Change Cover Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Information */}
                    <View style={editStyles.card}>
                        <SectionHeader title="Personal Information" icon="👤" />
                        <View style={editStyles.fieldRow}>
                            <View style={{ flex: 1 }}>
                                <Field label="First Name" value={form.firstName} fieldKey="firstName" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Field label="Last Name" value={form.lastName} fieldKey="lastName" />
                            </View>
                        </View>
                        <Field label="Professional Title" value={form.title} fieldKey="title" />
                        <Field label="About / Bio" value={form.about} fieldKey="about" multiline />
                    </View>

                    {/* Contact Information */}
                    <View style={editStyles.card}>
                        <SectionHeader title="Contact Information" icon="📞" />
                        <Field label="Phone" value={form.phone} fieldKey="phone" keyboardType="phone-pad" />
                        <Field label="Email" value={form.email} fieldKey="email" keyboardType="email-address" />
                        <Field label="Website" value={form.website} fieldKey="website" keyboardType="url" />
                        <Field label="Location" value={form.location} fieldKey="location" />
                    </View>

                    {/* Business & Credentials */}
                    <View style={editStyles.card}>
                        <SectionHeader title="Business & Credentials" icon="🏢" />
                        <Field label="Agency / Company" value={form.agency} fieldKey="agency" />
                        <Field label="RERA ID / License No." value={form.reraId} fieldKey="reraId" />
                    </View>

                    {/* Specializations */}
                    <View style={editStyles.card}>
                        <SectionHeader title="Specializations" icon="🏅" />
                        <View style={editStyles.tagEditRow}>
                            {['Luxury Homes', 'Waterfront Properties', 'New Developments', 'Investment Properties'].map((t, i) => (
                                <View key={i} style={editStyles.tagEditChip}>
                                    <Text style={editStyles.tagEditText}>{t}</Text>
                                    <TouchableOpacity onPress={() => { }}>
                                        <Text style={editStyles.tagEditRemove}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={editStyles.tagAddBtn} onPress={() => Alert.alert('Add Specialization')}>
                                <Text style={editStyles.tagAddText}>+ Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Languages */}
                    <View style={editStyles.card}>
                        <SectionHeader title="Languages" icon="🌐" />
                        <View style={editStyles.tagEditRow}>
                            {[form.language1, form.language2, form.language3].filter(Boolean).map((t, i) => (
                                <View key={i} style={editStyles.tagEditChip}>
                                    <Text style={editStyles.tagEditText}>{t}</Text>
                                    <TouchableOpacity onPress={() => { }}>
                                        <Text style={editStyles.tagEditRemove}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={editStyles.tagAddBtn} onPress={() => Alert.alert('Add Language')}>
                                <Text style={editStyles.tagAddText}>+ Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Social Profiles */}
                    <View style={editStyles.card}>
                        <SectionHeader title="Social Profiles" icon="📲" />

                        <View style={editStyles.socialField}>
                            <View style={[editStyles.socialIconWrap, { backgroundColor: '#FCE4EC' }]}>
                                <Text style={{ fontSize: 16 }}>📸</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={editStyles.fieldLabel}>Instagram</Text>
                                <TextInput
                                    style={editStyles.socialInput}
                                    value={form.instagram}
                                    onChangeText={v => handleChange('instagram', v)}
                                    placeholder="@username"
                                    placeholderTextColor={C.faint}
                                />
                            </View>
                        </View>

                        <View style={editStyles.socialField}>
                            <View style={[editStyles.socialIconWrap, { backgroundColor: '#E3F2FD' }]}>
                                <Text style={{ fontSize: 16 }}>🐦</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={editStyles.fieldLabel}>Twitter / X</Text>
                                <TextInput
                                    style={editStyles.socialInput}
                                    value={form.twitter}
                                    onChangeText={v => handleChange('twitter', v)}
                                    placeholder="@username"
                                    placeholderTextColor={C.faint}
                                />
                            </View>
                        </View>

                        <View style={[editStyles.socialField, { borderBottomWidth: 0 }]}>
                            <View style={[editStyles.socialIconWrap, { backgroundColor: '#E8F4FD' }]}>
                                <Text style={{ fontSize: 16 }}>💼</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={editStyles.fieldLabel}>LinkedIn</Text>
                                <TextInput
                                    style={editStyles.socialInput}
                                    value={form.linkedin}
                                    onChangeText={v => handleChange('linkedin', v)}
                                    placeholder="in/yourname"
                                    placeholderTextColor={C.faint}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={editStyles.savePrimaryBtn} onPress={handleSave}>
                        <Text style={editStyles.savePrimaryBtnText}>Save Changes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}>
                        <Text style={editStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

// ════════════════════════════════════════════════════════════
//  HERO SECTION
// ════════════════════════════════════════════════════════════
const HeroSection = ({ onEditPress, userData }) => (
    <View style={styles.hero}>
        <Image
            source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=jpg&q=60&w=1200&auto=format&fit=crop' }}
            style={styles.heroCover}
            resizeMode="cover"
        />
        <View style={styles.heroOverlay} />

        <SafeAreaView style={{ flex: 0 }}>
            <View style={styles.heroInner}>

                {/* Top Nav */}
                <View style={styles.topnav}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Back')}>
                        <Text style={styles.iconBtnText}>←</Text>
                    </TouchableOpacity>

                    <View style={styles.topnavBrand}>
                        <View style={styles.brandIcon}>
                            <Text style={{ fontSize: 14 }}>🏠</Text>
                        </View>
                        <Text style={styles.brandName}>EstateHub</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Text style={styles.iconBtnText}>⤴</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={onEditPress}>
                            <Text style={styles.iconBtnText}>✎</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Identity */}
                <View style={styles.identity}>
                    <View style={styles.avatarWrap}>
                        <Image
                            source={{ uri: getImageUrl(userData?.profileImage) || DEFAULT_PROFILE_IMAGE }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.avatarCam} onPress={onEditPress}>
                            <Text style={{ fontSize: 10, color: C.green }}>📷</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.identityInfo}>
                        <View style={styles.identityNameRow}>
                            <Text style={styles.identityName}>{userData?.name || 'Sarah Johnson'}</Text>
                            <View style={styles.verifiedBadge}>
                                <Text style={{ fontSize: 9, color: '#60A5FA' }}>✓ Verified</Text>
                            </View>
                        </View>
                        <Text style={styles.identityTitle}>{userData?.title || 'Senior Real Estate Advisor'}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>📍</Text>
                            <Text style={styles.identityLoc}>{userData?.address || 'Beverly Hills, CA'}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Strip */}
                <View style={styles.statsStrip}>
                    {[
                        { val: '18', lbl: 'Active' },
                        { val: '147', lbl: 'Sold' },
                        { val: '4.9★', lbl: 'Rating' },
                        { val: '$284M', lbl: 'Volume' },
                    ].map((item, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.stripCell,
                                idx < 3 && { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.12)' },
                            ]}
                        >
                            <Text style={styles.stripVal}>{item.val}</Text>
                            <Text style={styles.stripLbl}>{item.lbl}</Text>
                        </View>
                    ))}
                </View>

                {/* CTA Row */}
                <View style={styles.ctaRow}>
                    <TouchableOpacity style={styles.btnPrimary}>
                        <Text style={{ fontSize: 14, color: '#fff', marginRight: 4 }}>💬</Text>
                        <Text style={styles.btnPrimaryText}>Message</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnSecondary}>
                        <Text style={{ fontSize: 14, color: C.green, marginRight: 4 }}>📞</Text>
                        <Text style={styles.btnSecondaryText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnIcon}>
                        <Text style={{ fontSize: 15, color: C.green }}>✉</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    </View>
);

// ════════════════════════════════════════════════════════════
//  OVERVIEW TAB
// ════════════════════════════════════════════════════════════
const OverviewTab = ({ onEditPress, userData }) => {
    const statPills = [
        { val: userData?.totalActiveListings || '18', lbl: 'Active Listings', color: C.green, icon: '🏠' },
        { val: userData?.totalVolume || '$284M', lbl: 'Total Volume', color: C.blue, icon: '📈' },
        { val: userData?.rating || '4.9', lbl: (userData?.totalReviews || '98') + ' Reviews', color: C.amber, icon: '★' },
        { val: userData?.totalSoldListings || '147', lbl: 'Homes Sold', color: C.purple, icon: '🏅' },
    ];

    const contactInfo = [
        { icon: '📞', label: 'Phone', value: userData?.phone || '+1 (555) 123-4567' },
        { icon: '✉', label: 'Email', value: userData?.email || 'sarah.johnson@estatehub.com' },
        { icon: '🌐', label: 'Website', value: userData?.website || 'sarahjohnson.com' },
        { icon: '📍', label: 'Location', value: userData?.address || 'Beverly Hills, CA 90210' },
    ];

    const credentials = [
        { icon: '🏠', label: 'Agency', value: userData?.agency || 'Johnson Real Estate Group' },
        { icon: '🛡', label: 'RERA ID', value: userData?.reraId || 'RERA-CA-2024-12345' },
        { icon: '💲', label: 'Avg. Days on Market', value: '21 days' },
    ];

    const socials = [
        { icon: '📸', handle: userData?.instagram || '@sarahjohnsonre', color: '#E1306C' },
        { icon: '🐦', handle: userData?.twitter || '@sarahjohnsonre', color: '#1DA1F2' },
        { icon: '💼', handle: userData?.linkedin || 'in/sarahjohnson', color: '#0A66C2' },
    ];

    const settings = [
        { icon: '🔒', label: 'Change Password', sub: 'Last changed 3 months ago' },
        { icon: '🔔', label: 'Notifications', sub: 'Push, Email, SMS' },
        { icon: '🌐', label: 'Language & Region', sub: 'English (US)' },
        { icon: '❓', label: 'Help & Support', sub: 'FAQs, chat support' },
        { icon: '📄', label: 'Privacy Policy', sub: '' },
        { icon: '📄', label: 'Terms & Conditions', sub: '' },
    ];

    return (
        <View style={{ gap: 14 }}>

            {/* Edit Profile Banner */}
            <TouchableOpacity style={styles.editBanner} onPress={onEditPress} activeOpacity={0.85}>
                <View style={styles.editBannerLeft}>
                    <View style={styles.editBannerIcon}>
                        <Text style={{ fontSize: 16 }}>✎</Text>
                    </View>
                    <View>
                        <Text style={styles.editBannerTitle}>Edit Your Profile</Text>
                        <Text style={styles.editBannerSub}>Update info, photo, credentials & more</Text>
                    </View>
                </View>
                <Text style={{ color: C.green, fontSize: 20 }}>›</Text>
            </TouchableOpacity>

            {/* Stat Pills */}
            <View style={styles.statGrid}>
                {statPills.map((p, i) => (
                    <View key={i} style={[styles.statPill, { borderColor: p.color + '33' }]}>
                        <View style={[styles.statIcon, { backgroundColor: p.color + '18' }]}>
                            <Text style={{ fontSize: 16 }}>{p.icon}</Text>
                        </View>
                        <View>
                            <Text style={[styles.statVal, { color: p.color }]}>{p.val}</Text>
                            <Text style={styles.statLbl}>{p.lbl}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* About */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>About</Text>
                <Text style={styles.aboutText}>
                    With over 12 years of experience in luxury real estate, I specialize in connecting
                    discerning clients with exceptional properties across Beverly Hills, Bel Air, and the
                    greater Los Angeles area. My commitment to white-glove service and deep market knowledge
                    ensures every transaction exceeds expectations.
                </Text>
                <View style={styles.aboutMeta}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>📅</Text>
                        <Text style={styles.metaText}>Member since March 2013</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaIcon}>🕐</Text>
                        <Text style={styles.metaText}>Responds in &lt; 1 hour</Text>
                    </View>
                </View>
            </View>

            {/* Specializations */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Specializations</Text>
                <View style={styles.tagRow}>
                    {['Luxury Homes', 'Waterfront Properties', 'New Developments', 'Investment Properties'].map(t => (
                        <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                    ))}
                </View>
            </View>

            {/* Languages */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Languages</Text>
                <View style={styles.tagRow}>
                    {['English', 'Spanish', 'French'].map(t => (
                        <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                    ))}
                </View>
            </View>

            {/* Contact */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Contact Information</Text>
                {contactInfo.map((item, i) => (
                    <View key={i} style={[styles.infoRow, i === contactInfo.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={styles.infoIcon}><Text style={{ fontSize: 14 }}>{item.icon}</Text></View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>{item.label}</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{item.value}</Text>
                        </View>
                        {i < contactInfo.length - 1 && <Text style={{ color: C.faint, fontSize: 18 }}>›</Text>}
                    </View>
                ))}
            </View>

            {/* Business & Credentials */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Business & Credentials</Text>
                {credentials.map((item, i) => (
                    <View key={i} style={[styles.infoRow, i === credentials.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={styles.infoIcon}><Text style={{ fontSize: 14 }}>{item.icon}</Text></View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>{item.label}</Text>
                            <Text style={styles.infoValue}>{item.value}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Social Profiles */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Social Profiles</Text>
                {socials.map((s, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.socialChip, { borderColor: s.color + '44' }]}
                    >
                        <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                        <Text style={[styles.socialHandle, { color: s.color }]}>{s.handle}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Account Settings */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Account Settings</Text>
                {settings.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.settingsRow, i === settings.length - 1 && { borderBottomWidth: 0 }]}
                    >
                        <View style={styles.settingsLeft}>
                            <View style={styles.settingsIcon}><Text style={{ fontSize: 14 }}>{item.icon}</Text></View>
                            <View>
                                <Text style={styles.settingsLabel}>{item.label}</Text>
                                {!!item.sub && <Text style={styles.settingsSub}>{item.sub}</Text>}
                            </View>
                        </View>
                        <Text style={{ color: C.faint, fontSize: 18 }}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sign Out */}
            <View style={{ gap: 10 }}>
                <TouchableOpacity
                    style={styles.btnSignOut}
                    onPress={() => Alert.alert('Sign Out', 'Sign out of EstateHub?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Sign Out', style: 'destructive' },
                    ])}
                >
                    <Text style={{ fontSize: 17, marginRight: 6 }}>🚪</Text>
                    <Text style={styles.btnSignOutText}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete your account?')}>
                    <Text style={styles.btnDelete}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.version}>EstateHub v1.0.0 · © 2025 All rights reserved</Text>
        </View>
    );
};

// ════════════════════════════════════════════════════════════
//  LISTINGS TAB
// ════════════════════════════════════════════════════════════
const ListingsTab = () => {
    const listings = [
        {
            img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fm=jpg&q=60&w=600&auto=format&fit=crop',
            badge: 'ACTIVE', badgeColor: '#10B981',
            title: 'Modern Villa in Bel Air',
            price: '$8,500,000',
            meta: '6 bd · 7 ba · 9,200 sqft',
            views: '1,240 views', listed: '5d listed',
        },
        {
            img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?fm=jpg&q=60&w=600&auto=format&fit=crop',
            badge: 'ACTIVE', badgeColor: '#10B981',
            title: 'Beverly Hills Estate',
            price: '$14,200,000',
            meta: '8 bd · 10 ba · 14,500 sqft',
            views: '3,820 views', listed: '12d listed',
        },
        {
            img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?fm=jpg&q=60&w=600&auto=format&fit=crop',
            badge: 'SOLD', badgeColor: '#6B7280',
            title: 'Malibu Beachfront Home',
            price: '$6,750,000',
            meta: '5 bd · 6 ba · 6,800 sqft',
            views: '5,100 views', listed: '18d listed',
        },
    ];

    return (
        <View style={{ gap: 14 }}>
            <View style={styles.listingsHdr}>
                <View>
                    <Text style={styles.listingsCount}>24 Properties</Text>
                    <Text style={styles.listingsSub}>18 active · 147 sold</Text>
                </View>
                <TouchableOpacity style={styles.btnFilter}>
                    <Text style={styles.btnFilterText}>Filter</Text>
                </TouchableOpacity>
            </View>

            {listings.map((l, i) => (
                <TouchableOpacity key={i} style={styles.listingCard} activeOpacity={0.85}>
                    <View>
                        <Image
                            source={{ uri: l.img }}
                            style={styles.listingImg}
                            resizeMode="cover"
                        />
                        <View style={[styles.listingBadge, { backgroundColor: l.badgeColor }]}>
                            <Text style={styles.listingBadgeText}>{l.badge}</Text>
                        </View>
                    </View>
                    <View style={styles.listingBody}>
                        <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                        <Text style={styles.listingPrice}>{l.price}</Text>
                        <Text style={styles.listingMeta}>{l.meta}</Text>
                        <View style={styles.listingFooter}>
                            <View style={styles.listingFootItem}>
                                <Text style={styles.footIcon}>👁 </Text>
                                <Text style={styles.footText}>{l.views}</Text>
                            </View>
                            <View style={styles.listingFootItem}>
                                <Text style={styles.footIcon}>🕐 </Text>
                                <Text style={styles.footText}>{l.listed}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.btnLoadMore}>
                <Text style={styles.btnLoadMoreText}>View All Listings  →</Text>
            </TouchableOpacity>
        </View>
    );
};

export default function EditAgentProfileScreen({ navigation, onBack: propOnBack, initialShowEdit = true, userData, onUpdate }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditProfile, setShowEditProfile] = useState(initialShowEdit);

    const handleBack = () => {
        if (propOnBack) {
            propOnBack();
        } else if (showEditProfile) {
            setShowEditProfile(false);
        }
    };

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'listings', label: 'Listings' },
    ];

    // Show Edit Profile screen
    if (showEditProfile) {
        return <EditProfileScreen onBack={handleBack} userData={userData} onUpdate={onUpdate} />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Hero */}
            <HeroSection onEditPress={() => setShowEditProfile(true)} userData={userData} />

            {/* Sticky Tab Bar */}
            <View style={styles.tabbar}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Scrollable Body */}
            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyInner}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'overview' && <OverviewTab onEditPress={() => setShowEditProfile(true)} userData={userData} />}
                {activeTab === 'listings' && <ListingsTab />}
            </ScrollView>
        </View>
    );
}

// ════════════════════════════════════════════════════════════
//  STYLES — PROFILE SCREEN
// ════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },

    // ── EDIT BANNER ───────────────────────────────────────────
    editBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: C.greenBg,
        borderWidth: 1.5,
        borderColor: C.greenBd,
        borderRadius: 14,
        padding: 14,
        marginBottom: 0,
    },
    editBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    editBannerIcon: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: C.green + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBannerTitle: { fontSize: 14, fontWeight: '700', color: C.green },
    editBannerSub: { fontSize: 11, color: C.greenLt, marginTop: 2 },

    // ── HERO ─────────────────────────────────────────────────
    hero: {
        backgroundColor: '#0f2d1e',
        position: 'relative',
    },
    heroCover: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.35,
    },
    heroOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15,45,30,0.82)',
    },
    heroInner: {
        paddingHorizontal: 20,
        paddingBottom: 22,
    },

    topnav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
        paddingBottom: 20,
    },
    iconBtn: {
        width: 36, height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnText: {
        color: '#fff',
        fontSize: 18,
        lineHeight: 22,
    },
    topnavBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brandIcon: {
        width: 30, height: 30,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },

    identity: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 16,
        marginBottom: 18,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 86, height: 86,
        borderRadius: 43,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarCam: {
        position: 'absolute',
        bottom: 2, right: 2,
        width: 26, height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    identityInfo: { flex: 1, paddingBottom: 4 },
    identityNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    identityName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 26,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(96,165,250,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.45)',
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    identityTitle: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 5,
    },
    identityLoc: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
    },

    statsStrip: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
    },
    stripCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 6,
    },
    stripVal: { color: '#fff', fontSize: 15, fontWeight: '700' },
    stripLbl: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 2 },

    ctaRow: { flexDirection: 'row', gap: 10 },
    btnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        backgroundColor: C.green,
        borderRadius: 12,
    },
    btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    btnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    btnSecondaryText: { color: C.green, fontSize: 13, fontWeight: '700' },
    btnIcon: {
        width: 44, height: 44,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── TAB BAR ──────────────────────────────────────────────
    tabbar: {
        flexDirection: 'row',
        backgroundColor: C.card,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 13,
        alignItems: 'center',
        borderBottomWidth: 2.5,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: { borderBottomColor: C.green },
    tabBtnText: { fontSize: 13, fontWeight: '500', color: C.muted },
    tabBtnTextActive: { color: C.green, fontWeight: '700' },

    // ── BODY ─────────────────────────────────────────────────
    body: { flex: 1 },
    bodyInner: { padding: 14, paddingBottom: 60, gap: 0 },

    // ── CARD ─────────────────────────────────────────────────
    card: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: C.text,
        marginBottom: 14,
    },

    // ── STAT PILLS ───────────────────────────────────────────
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: C.card,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1.5,
        width: '47.5%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    statIcon: {
        width: 36, height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statVal: { fontSize: 16, fontWeight: '800', lineHeight: 20 },
    statLbl: { fontSize: 10, color: C.faint, marginTop: 2 },

    // ── ABOUT ─────────────────────────────────────────────────
    aboutText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 22,
    },
    aboutMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginTop: 12,
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    metaIcon: { fontSize: 13 },
    metaText: { fontSize: 11, color: C.faint },

    // ── TAGS ─────────────────────────────────────────────────
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        backgroundColor: C.greenBg,
        borderWidth: 1,
        borderColor: C.greenBd,
        borderRadius: 20,
        paddingHorizontal: 13,
        paddingVertical: 5,
    },
    tagText: { fontSize: 12, color: C.green, fontWeight: '600' },

    // ── INFO ROWS ─────────────────────────────────────────────
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: C.border2,
    },
    infoIcon: {
        width: 36, height: 36,
        borderRadius: 10,
        backgroundColor: C.greenBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: { flex: 1 },
    infoLabel: { fontSize: 10, color: C.faint, marginBottom: 2 },
    infoValue: { fontSize: 13, color: C.text, fontWeight: '500' },

    // ── SOCIAL CHIPS ─────────────────────────────────────────
    socialChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1.5,
        backgroundColor: '#FAFAFA',
        marginBottom: 8,
    },
    socialHandle: { fontSize: 13, fontWeight: '600' },

    // ── SETTINGS ROWS ─────────────────────────────────────────
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: C.border2,
    },
    settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingsIcon: {
        width: 34, height: 34,
        borderRadius: 9,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: C.border2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsLabel: { fontSize: 13, color: C.text, fontWeight: '500' },
    settingsSub: { fontSize: 11, color: C.faint, marginTop: 1 },

    // ── SIGN OUT ──────────────────────────────────────────────
    btnSignOut: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        backgroundColor: C.card,
        borderWidth: 1.5,
        borderColor: C.border,
        borderRadius: 12,
    },
    btnSignOutText: { fontSize: 14, color: '#374151', fontWeight: '600' },
    btnDelete: {
        fontSize: 13,
        color: C.red,
        textAlign: 'center',
        paddingVertical: 8,
    },
    version: {
        textAlign: 'center',
        fontSize: 11,
        color: C.faint,
        paddingTop: 4,
        marginBottom: 14,
    },

    // ── LISTINGS ──────────────────────────────────────────────
    listingsHdr: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    listingsCount: { fontSize: 18, fontWeight: '800', color: C.text },
    listingsSub: { fontSize: 12, color: C.muted, marginTop: 2 },
    btnFilter: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: C.green,
    },
    btnFilterText: { fontSize: 12, fontWeight: '700', color: C.green },

    listingCard: {
        backgroundColor: C.card,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 14,
    },
    listingImg: { width: '100%', height: 200 },
    listingBadge: {
        position: 'absolute',
        top: 12, left: 12,
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderRadius: 20,
    },
    listingBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
    listingBody: { padding: 14 },
    listingTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 3 },
    listingPrice: { fontSize: 20, fontWeight: '800', color: C.green, marginBottom: 6, letterSpacing: -0.4 },
    listingMeta: { fontSize: 12, color: C.muted, marginBottom: 10 },
    listingFooter: { flexDirection: 'row', gap: 16 },
    listingFootItem: { flexDirection: 'row', alignItems: 'center' },
    footIcon: { fontSize: 11 },
    footText: { fontSize: 11, color: C.faint },

    btnLoadMore: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 12,
        marginBottom: 14,
    },
    btnLoadMoreText: { fontSize: 13, color: C.green, fontWeight: '700' },
});

// ════════════════════════════════════════════════════════════
//  STYLES — EDIT PROFILE SCREEN
// ════════════════════════════════════════════════════════════
const editStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },

    // ── HEADER ───────────────────────────────────────────────
    header: {
        backgroundColor: C.green,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },
    headerBg: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: C.green,
        opacity: 0.95,
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        paddingBottom: 14,
    },
    headerBackBtn: {
        width: 38, height: 38,
        borderRadius: 11,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBackText: {
        color: '#fff',
        fontSize: 20,
        lineHeight: 24,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    headerSaveBtn: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    headerSaveText: {
        color: C.green,
        fontSize: 13,
        fontWeight: '800',
    },

    // ── BODY ─────────────────────────────────────────────────
    body: {
        padding: 14,
        paddingBottom: 40,
    },

    // ── PHOTO CARD ───────────────────────────────────────────
    photoCard: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    photoWrap: {
        position: 'relative',
        marginBottom: 10,
    },
    photo: {
        width: 100, height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: C.greenBd,
    },
    photoCamBtn: {
        position: 'absolute',
        bottom: 2, right: 2,
        width: 32, height: 32,
        borderRadius: 16,
        backgroundColor: C.green,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    photoCamIcon: { fontSize: 14 },
    photoHint: {
        fontSize: 12,
        color: C.faint,
        marginBottom: 14,
    },
    coverBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: C.green,
        backgroundColor: C.greenBg,
    },
    coverBtnIcon: { fontSize: 14 },
    coverBtnText: {
        fontSize: 12,
        color: C.green,
        fontWeight: '700',
    },

    // ── CARD ─────────────────────────────────────────────────
    card: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    // ── SECTION HEADER ───────────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border2,
    },
    sectionIcon: { fontSize: 16 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: C.text,
    },

    // ── FIELD ROW (side by side) ──────────────────────────────
    fieldRow: {
        flexDirection: 'row',
        gap: 12,
    },

    // ── FIELD ─────────────────────────────────────────────────
    fieldWrap: {
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: C.faint,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    fieldInput: {
        backgroundColor: C.bg,
        borderWidth: 1.5,
        borderColor: C.border,
        borderRadius: 10,
        paddingHorizontal: 13,
        paddingVertical: 11,
        fontSize: 14,
        color: C.text,
        fontWeight: '500',
    },
    fieldInputMulti: {
        minHeight: 100,
        paddingTop: 12,
        lineHeight: 22,
    },

    // ── TAG EDIT ──────────────────────────────────────────────
    tagEditRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagEditChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: C.greenBg,
        borderWidth: 1,
        borderColor: C.greenBd,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    tagEditText: {
        fontSize: 12,
        color: C.green,
        fontWeight: '600',
    },
    tagEditRemove: {
        fontSize: 10,
        color: C.green,
        fontWeight: '800',
    },
    tagAddBtn: {
        paddingHorizontal: 13,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: C.green,
        borderStyle: 'dashed',
    },
    tagAddText: {
        fontSize: 12,
        color: C.green,
        fontWeight: '700',
    },

    // ── SOCIAL FIELD ──────────────────────────────────────────
    socialField: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: C.border2,
    },
    socialIconWrap: {
        width: 40, height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialInput: {
        fontSize: 14,
        color: C.text,
        fontWeight: '500',
        paddingVertical: 4,
        borderBottomWidth: 1.5,
        borderBottomColor: C.border,
    },

    // ── SAVE BUTTON ───────────────────────────────────────────
    savePrimaryBtn: {
        height: 52,
        backgroundColor: C.green,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: C.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    savePrimaryBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    cancelText: {
        textAlign: 'center',
        fontSize: 13,
        color: C.muted,
        paddingVertical: 8,
        fontWeight: '600',
    },
});