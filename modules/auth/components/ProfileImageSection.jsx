import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { User, Camera, Upload, AlertCircle } from 'lucide-react-native';
import { getImageUrl } from '../../../utils/api';

export const ProfileImageSection = React.memo(({
    profileImage,
    uploadingImage,
    onUpload,
    onRemove,
    error
}) => {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>
                Profile Picture <Text style={styles.labelOptional}>(Optional)</Text>
            </Text>
            <View style={styles.profileImageContainer}>
                <View style={styles.profileImageWrapper}>
                    {profileImage ? (
                        <Image
                            source={{ uri: getImageUrl(profileImage) }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <User color="#9CA3AF" size={32} strokeWidth={2} />
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={onUpload}
                        disabled={uploadingImage}
                        style={styles.cameraButton}
                        activeOpacity={0.8}
                    >
                        {uploadingImage ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Camera color="#FFFFFF" size={16} strokeWidth={2} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.profileImageInfo}>
                    <Text style={styles.profileImageTitle}>
                        {profileImage ? 'Change Photo' : 'Upload Photo'}
                    </Text>
                    <Text style={styles.profileImageSubtitle}>
                        JPG, PNG or GIF • Max 5MB
                    </Text>
                    <View style={styles.profileImageButtons}>
                        <TouchableOpacity
                            onPress={onUpload}
                            disabled={uploadingImage}
                            style={styles.chooseFileButton}
                            activeOpacity={0.8}
                        >
                            <Upload color="#2D6A4F" size={14} strokeWidth={2} />
                            <Text style={styles.chooseFileButtonText}>
                                {uploadingImage ? 'Uploading...' : 'Choose File'}
                            </Text>
                        </TouchableOpacity>
                        {profileImage && (
                            <TouchableOpacity
                                onPress={onRemove}
                                style={styles.removeButton}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.removeButtonText}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {error && (
                        <View style={styles.errorContainer}>
                            <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    labelOptional: {
        fontWeight: '400',
        color: '#9CA3AF',
    },
    profileImageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
    },
    profileImageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 32,
        height: 32,
        backgroundColor: '#2D6A4F',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    profileImageInfo: {
        flex: 1,
    },
    profileImageTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    profileImageSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    profileImageButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    chooseFileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#2D6A4F',
        borderRadius: 8,
    },
    chooseFileButtonText: {
        color: '#2D6A4F',
        fontSize: 12,
        fontWeight: '600',
    },
    removeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FEF2F2',
        borderWidth: 2,
        borderColor: '#FECACA',
        borderRadius: 8,
    },
    removeButtonText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        marginLeft: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
    },
});
