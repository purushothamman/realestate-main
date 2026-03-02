
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Switch,
    Animated,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform,
    StatusBar,
    KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
    User,
    Camera,
    Upload,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Briefcase,
    Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    BadgeCheck,
    Languages,
    Award,
    Hash,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../../utils/api';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

/**
 * Enhanced Unified Profile Edit Screen
 * Handles 'user', 'builder', and 'agent' roles dynamically.
 */
export default function EditScreen({ navigation, onBack, userData, onUpdate }) {
    const role = userData?.role || 'user';

    const [logoImage, setLogoImage] = useState(
        getImageUrl(userData?.profileImage) || DEFAULT_PROFILE_IMAGE
    );
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const isInitialized = useRef(false);

    // Consolidated Form State
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        profileImage: userData?.profileImage || '',

        // Builder specific
        companyName: userData?.companyName || '',
        gstNo: userData?.gstNo || '',
        panNo: userData?.panNo || '',
        website: userData?.website || '',
        description: userData?.description || '',
        experienceYears: userData?.experienceYears?.toString() || '0',
        totalProjects: userData?.totalProjects?.toString() || '0',
        address: userData?.address || '',
        city: userData?.city || '',
        state: userData?.state || '',
        pincode: userData?.pincode || '',

        // Agent specific
        title: userData?.title || '',
        agency: userData?.agency || '',
        reraId: userData?.reraId || '',
        about: userData?.about || '',
    });

    useEffect(() => {
        const fetchCurrentProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const token = await AsyncStorage.getItem('authToken');
                if (!token) return;

                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        profileImage: data.profileImage || '',
                        companyName: data.companyName || '',
                        gstNo: data.gstNo || '',
                        panNo: data.panNo || '',
                        website: data.website || '',
                        description: data.description || '',
                        experienceYears: data.experienceYears?.toString() || '0',
                        totalProjects: data.totalProjects?.toString() || '0',
                        address: data.address || '',
                        city: data.city || '',
                        state: data.state || '',
                        pincode: data.pincode || '',
                        title: data.title || '',
                        agency: data.agency || '',
                        reraId: data.reraId || '',
                        about: data.about || '',
                    });
                    if (data.profileImage) {
                        setLogoImage(getImageUrl(data.profileImage));
                    }
                    isInitialized.current = true;
                }
            } catch (err) {
                console.error('Error fetching profile in EditScreen:', err);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchCurrentProfile();
    }, []);

    // Also update if userData changes from outside (props)
    useEffect(() => {
        if (userData && !isLoadingProfile && !isInitialized.current) {
            console.log('🔄 userData change detected in EditScreen. Initializing formData...');
            isInitialized.current = true;
            setFormData(prev => ({
                ...prev,
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                profileImage: userData.profileImage || '',
                companyName: userData.companyName || '',
                gstNo: userData.gstNo || '',
                panNo: userData.panNo || '',
                website: userData.website || '',
                description: userData.description || '',
                experienceYears: userData.experienceYears?.toString() || '0',
                totalProjects: userData.totalProjects?.toString() || '0',
                address: userData.address || '',
                city: userData.city || '',
                state: userData.state || '',
                pincode: userData.pincode || '',
                title: userData.title || '',
                agency: userData.agency || '',
                reraId: userData.reraId || '',
                about: userData.about || '',
            }));
            if (userData.profileImage) {
                setLogoImage(getImageUrl(userData.profileImage));
            }
        }
    }, [userData, isLoadingProfile]);

    const handleSave = async () => {
        // Validation
        if (!formData.name || !formData.email) {
            Alert.alert('Required Fields', 'Please enter your name and email.');
            return;
        }

        if (role === 'builder' && !formData.companyName) {
            Alert.alert('Required Field', 'Company name is required for Builders.');
            return;
        }

        console.log('💾 handleSave triggered. Current formData:', formData);
        setIsSaving(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                Alert.alert('Error', 'Session expired. Please login again.');
                setIsSaving(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setShowSuccess(true);
                if (onUpdate) await onUpdate(); // Signal App.jsx to refresh user data
                setTimeout(() => {
                    setShowSuccess(false);
                    // Optionally go back after successful save
                    // onBack(); 
                }, 2000);
            } else {
                Alert.alert('Update Failed', result.message || 'Error saving changes');
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Connection failed. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;

            // Show preview immediately
            setLogoImage(localUri);

            try {
                const token = await AsyncStorage.getItem('authToken');
                const formDataUpload = new FormData();
                const filename = localUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                console.log('📤 Uploading image:', { localUri, filename, type, platform: Platform.OS });

                if (Platform.OS === 'web') {
                    const blobRes = await fetch(localUri);
                    const blob = await blobRes.blob();
                    formDataUpload.append('profileImage', blob, filename || 'profile.jpg');
                } else {
                    formDataUpload.append('profileImage', {
                        uri: localUri,
                        name: filename || 'profile.jpg',
                        type: type.toLowerCase(),
                    });
                }

                const uploadRes = await fetch(`${API_BASE_URL}/upload/profile-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formDataUpload,
                });

                const uploadData = await uploadRes.json();
                console.log('📥 Upload response:', uploadData);

                if (uploadRes.ok && (uploadData.url || uploadData.imageUrl)) {
                    const uploadedUrl = uploadData.url || uploadData.imageUrl;
                    console.log('✅ Setting formData.profileImage to:', uploadedUrl);
                    setFormData(prev => ({ ...prev, profileImage: uploadedUrl }));
                    Alert.alert('✅ Photo Uploaded', 'Profile photo is ready. Tap Save to apply changes.');
                } else {
                    Alert.alert('Upload Failed', uploadData.message || 'Could not upload photo.');
                    // Revert preview
                    setLogoImage(getImageUrl(formData.profileImage) || DEFAULT_PROFILE_IMAGE);
                }
            } catch (uploadErr) {
                console.error('Image upload error:', uploadErr);
                Alert.alert('Error', 'Failed to upload photo. Please try again.');
                setLogoImage(getImageUrl(formData.profileImage) || DEFAULT_PROFILE_IMAGE);
            }
        }
    };

    const renderInput = (label, value, key, icon, props = {}) => {
        const isTextArea = props.multiline;
        return (
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <View style={[styles.inputWithIcon, isTextArea && styles.textAreaContainer]}>
                    {icon && React.cloneElement(icon, {
                        size: 18,
                        color: '#6B7280',
                        style: isTextArea ? [styles.inputIcon, { marginTop: 15, alignSelf: 'flex-start' }] : styles.inputIcon
                    })}
                    <TextInput
                        style={[styles.input, icon && styles.inputWithPadding, isTextArea && styles.textArea]}
                        value={value}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        placeholderTextColor="#9CA3AF"
                        textAlignVertical={isTextArea ? "top" : "center"}
                        {...props}
                    />
                </View>
            </View>
        );
    };

    const renderTabs = () => {
        const tabs = [{ id: 'personal', label: 'Personal', icon: <User /> }];

        if (role === 'builder') {
            tabs.push({ id: 'business', label: 'Company', icon: <Building2 /> });
            tabs.push({ id: 'address', label: 'Location', icon: <MapPin /> });
        } else if (role === 'agent') {
            tabs.push({ id: 'professional', label: 'Professional', icon: <Briefcase /> });
        }

        // tabs.push({ id: 'security', label: 'Security', icon: <Shield /> });

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabScroll}
                contentContainerStyle={styles.tabContent}
            >
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}
                    >
                        {React.cloneElement(tab.icon, {
                            size: 16,
                            color: activeTab === tab.id ? '#FFF' : '#6B7280'
                        })}
                        <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderPersonalTab = () => (
        <Animated.View style={styles.section}>
            <View style={styles.cardHeader}>
                <User color="#2D6A4F" size={20} />
                <Text style={styles.cardTitle}>Basic Information</Text>
            </View>

            {renderInput('Full Name *', formData.name, 'name', <User />)}
            {renderInput('Email Address *', formData.email, 'email', <Mail />, { keyboardType: 'email-address', editable: false })}
            {renderInput('Phone Number', formData.phone, 'phone', <Phone />, { keyboardType: 'phone-pad' })}

            {role === 'agent' && renderInput('Professional Title', formData.title, 'title', <BadgeCheck />)}
            {role === 'agent' && renderInput('About Me', formData.about, 'about', <User />, { multiline: true, numberOfLines: 4 })}
        </Animated.View>
    );

    const renderBusinessTab = () => (
        <Animated.View style={styles.section}>
            <View style={styles.cardHeader}>
                <Building2 color="#10B981" size={20} />
                <Text style={styles.cardTitle}>Company Details</Text>
            </View>

            {renderInput('Company Name *', formData.companyName, 'companyName', <Building2 />)}

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    {renderInput('GST Number', formData.gstNo, 'gstNo', <Hash />)}
                </View>
                <View style={{ flex: 1 }}>
                    {renderInput('PAN Number', formData.panNo, 'panNo', <Shield />)}
                </View>
            </View>

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    {renderInput('Exp (Years)', formData.experienceYears, 'experienceYears', <Award />, { keyboardType: 'numeric' })}
                </View>
                <View style={{ flex: 1 }}>
                    {renderInput('Total Projects', formData.totalProjects, 'totalProjects', <CheckCircle2 />, { keyboardType: 'numeric' })}
                </View>
            </View>

            {renderInput('Website', formData.website, 'website', <Globe />, { keyboardType: 'url' })}
            {renderInput('Company Bio', formData.description, 'description', <Briefcase />, { multiline: true, numberOfLines: 4 })}
        </Animated.View>
    );

    const renderLocationTab = () => (
        <Animated.View style={styles.section}>
            <View style={styles.cardHeader}>
                <MapPin color="#F59E0B" size={20} />
                <Text style={styles.cardTitle}>Office Location</Text>
            </View>

            {renderInput('Street Address', formData.address, 'address', <MapPin />)}

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    {renderInput('City', formData.city, 'city', null)}
                </View>
                <View style={{ flex: 1 }}>
                    {renderInput('State', formData.state, 'state', null)}
                </View>
            </View>

            {renderInput('Pincode', formData.pincode, 'pincode', null, { keyboardType: 'numeric' })}
        </Animated.View>
    );

    const renderProfessionalTab = () => (
        <Animated.View style={styles.section}>
            <View style={styles.cardHeader}>
                <Award color="#8B5CF6" size={20} />
                <Text style={styles.cardTitle}>Professional Credentials</Text>
            </View>

            {renderInput('Agency Name', formData.agency, 'agency', <Building2 />)}
            {renderInput('RERA / License ID', formData.reraId, 'reraId', <BadgeCheck />)}

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    {renderInput('Exp (Years)', formData.experienceYears, 'experienceYears', <Award />, { keyboardType: 'numeric' })}
                </View>
                <View style={{ flex: 1 }}>
                    {renderInput('City', formData.city, 'city', <MapPin />)}
                </View>
            </View>

            <View style={styles.alertBox}>
                <AlertCircle color="#F59E0B" size={16} />
                <Text style={styles.alertText}>
                    Please ensure your RERA ID is correct for verification purposes.
                </Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <LinearGradient
                colors={['#1b4332', '#2d6a4f']}
                style={styles.header}
            >
                <SafeAreaView>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
                            <ArrowLeft color="#FFF" size={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.profileSection}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={typeof logoImage === 'string' ? { uri: logoImage } : logoImage}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity style={styles.camBtn} onPress={handlePickImage}>
                                <Camera color="#FFF" size={16} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.profileRole}>{role.toUpperCase()}</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.tabContainer}>
                    {renderTabs()}
                </View>

                <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                    {isLoadingProfile ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#2D6A4F" />
                            <Text style={styles.loadingText}>Loading your profile...</Text>
                        </View>
                    ) : (
                        <>
                            {activeTab === 'personal' && renderPersonalTab()}
                            {activeTab === 'business' && renderBusinessTab()}
                            {activeTab === 'address' && renderLocationTab()}
                            {activeTab === 'professional' && renderProfessionalTab()}
                        </>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveBtn, isSaving && styles.disabledBtn]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <CheckCircle2 color="#FFF" size={20} />
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Success Toast */}
            {showSuccess && (
                <View style={styles.toast}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.toastGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <CheckCircle2 color="#FFF" size={20} />
                        <Text style={styles.toastText}>Changes Saved Successfully!</Text>
                    </LinearGradient>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 0 : 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    headerBtn: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 10,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    camBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2D6A4F',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#1b4332',
    },
    profileRole: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginTop: 10,
        letterSpacing: 1,
    },
    tabContainer: {
        backgroundColor: '#FFF',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    tabScroll: {
        paddingHorizontal: 15,
    },
    tabContent: {
        gap: 10,
        paddingRight: 30,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    activeTabButton: {
        backgroundColor: '#2D6A4F',
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabLabel: {
        color: '#FFF',
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 6,
        marginLeft: 2,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        height: 54,
    },
    inputIcon: {
        marginLeft: 15,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 15,
        fontSize: 15,
        color: '#111827',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            },
        }),
    },
    inputWithPadding: {
        paddingLeft: 10,
    },
    textAreaContainer: {
        height: 120,
        alignItems: 'flex-start',
    },
    textArea: {
        height: '100%',
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
    },
    alertBox: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 10,
        marginTop: 5,
        gap: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    alertText: {
        fontSize: 12,
        color: '#92400E',
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 35 : 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    saveBtn: {
        backgroundColor: '#2D6A4F',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 4,
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    toast: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 100,
    },
    toastGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        gap: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    toastText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 15,
        color: '#6B7280',
        fontSize: 14,
    }
});
