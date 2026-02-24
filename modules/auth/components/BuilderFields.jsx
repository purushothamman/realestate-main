import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Building2, MessageSquare, Shield, FileText, X, Upload, TrendingUp, Briefcase, MapPin, AlertCircle } from 'lucide-react-native';
import { FocusableInput } from './FocusableInput';

export const BuilderFields = ({
    formData,
    errors,
    handleInputChange,
    handleDocumentUpload,
    handleRemoveDocument,
    uploadingDocument,
    formatFileSize
}) => {
    return (
        <View style={styles.builderFieldsContainer}>
            <Text style={styles.sectionHeader}>Builder Details</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Company Name <Text style={styles.required}>*</Text>
                </Text>
                <FocusableInput
                    icon={Building2}
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChangeText={(value) => handleInputChange('companyName', value)}
                    error={errors.companyName}
                    blurOnSubmit={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Company Description <Text style={styles.labelOptional}>(Optional)</Text>
                </Text>
                <FocusableInput
                    icon={MessageSquare}
                    placeholder="Brief description about your company and projects..."
                    value={formData.description}
                    onChangeText={(value) => handleInputChange('description', value)}
                    multiline
                    numberOfLines={4}
                    blurOnSubmit={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    GST Number <Text style={styles.labelOptional}>(Optional)</Text>
                </Text>
                <FocusableInput
                    icon={Shield}
                    placeholder="Enter GST number"
                    value={formData.gstNo}
                    onChangeText={(value) => handleInputChange('gstNo', value)}
                    error={errors.gstNo}
                    autoCapitalize="characters"
                    blurOnSubmit={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    PAN Number <Text style={styles.required}>*</Text>
                </Text>
                <FocusableInput
                    icon={Shield}
                    placeholder="Enter PAN number (e.g. AAAAA1111A)"
                    value={formData.panNo}
                    onChangeText={(value) => handleInputChange('panNo', value)}
                    error={errors.panNo}
                    autoCapitalize="characters"
                    blurOnSubmit={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Registration Certificate <Text style={styles.labelOptional}>(Optional)</Text>
                </Text>
                <View style={styles.documentUploadContainer}>
                    {formData.registrationCertificate ? (
                        <View style={styles.documentPreview}>
                            <View style={styles.documentInfo}>
                                <FileText color="#2D6A4F" size={24} strokeWidth={2} />
                                <View style={styles.documentDetails}>
                                    <Text style={styles.documentName} numberOfLines={1}>
                                        {formData.registrationCertificate.name}
                                    </Text>
                                    <Text style={styles.documentSize}>
                                        {formatFileSize(formData.registrationCertificate.size || 0)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={handleRemoveDocument}
                                style={styles.documentRemoveButton}
                                activeOpacity={0.8}
                            >
                                <X color="#DC2626" size={18} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleDocumentUpload}
                            disabled={uploadingDocument}
                            style={styles.documentUploadButton}
                            activeOpacity={0.8}
                        >
                            {uploadingDocument ? (
                                <ActivityIndicator color="#2D6A4F" size="small" />
                            ) : (
                                <>
                                    <Upload color="#2D6A4F" size={20} strokeWidth={2} />
                                    <Text style={styles.documentUploadText}>
                                        Upload Certificate (PDF or Image)
                                    </Text>
                                    <Text style={styles.documentUploadSubtext}>Max 10MB</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                    {errors.registrationCertificate && (
                        <View style={styles.errorContainer}>
                            <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                            <Text style={styles.errorText}>{errors.registrationCertificate}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Website <Text style={styles.labelOptional}>(Optional)</Text>
                </Text>
                <FocusableInput
                    icon={TrendingUp}
                    placeholder="https://example.com"
                    value={formData.website}
                    onChangeText={(value) => handleInputChange('website', value)}
                    keyboardType="url"
                    autoCapitalize="none"
                    blurOnSubmit={false}
                />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>
                        Experience (Years) <Text style={styles.labelOptional}>(Optional)</Text>
                    </Text>
                    <FocusableInput
                        icon={Briefcase}
                        placeholder="e.g. 5"
                        value={formData.experienceYears}
                        onChangeText={(value) => handleInputChange('experienceYears', value)}
                        keyboardType="numeric"
                        blurOnSubmit={false}
                    />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>
                        Total Projects <Text style={styles.labelOptional}>(Optional)</Text>
                    </Text>
                    <FocusableInput
                        icon={Building2}
                        placeholder="e.g. 10"
                        value={formData.totalProjects}
                        onChangeText={(value) => handleInputChange('totalProjects', value)}
                        keyboardType="numeric"
                        blurOnSubmit={false}
                    />
                </View>
            </View>

            <Text style={[styles.label, { marginTop: 8 }]}>
                Street Address / Building <Text style={styles.labelOptional}>(Optional)</Text>
            </Text>
            <View style={styles.inputGroup}>
                <FocusableInput
                    icon={MapPin}
                    placeholder="Floor, Building Name, Street"
                    value={formData.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                    blurOnSubmit={false}
                />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>City <Text style={styles.labelOptional}>(Optional)</Text></Text>
                    <FocusableInput
                        placeholder="City"
                        value={formData.city}
                        onChangeText={(value) => handleInputChange('city', value)}
                        blurOnSubmit={false}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>State <Text style={styles.labelOptional}>(Optional)</Text></Text>
                    <FocusableInput
                        placeholder="State"
                        value={formData.state}
                        onChangeText={(value) => handleInputChange('state', value)}
                        blurOnSubmit={false}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Pincode <Text style={styles.labelOptional}>(Optional)</Text></Text>
                <FocusableInput
                    icon={MapPin}
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChangeText={(value) => handleInputChange('pincode', value)}
                    keyboardType="numeric"
                    maxLength={6}
                    blurOnSubmit={false}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    builderFieldsContainer: {
        gap: 16,
        padding: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    inputGroup: {
        marginBottom: 16,
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
    required: {
        color: '#EF4444',
    },
    documentUploadContainer: {
        marginTop: 4,
    },
    documentUploadButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        gap: 8,
    },
    documentUploadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D6A4F',
        marginTop: 8,
    },
    documentUploadSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    documentPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
    },
    documentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    documentDetails: {
        flex: 1,
    },
    documentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    documentSize: {
        fontSize: 12,
        color: '#6B7280',
    },
    documentRemoveButton: {
        padding: 8,
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
