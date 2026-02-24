import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { ChevronDown, AlertCircle, X, Check } from 'lucide-react-native';

export const RoleSelector = React.memo(({
    userTypes,
    formData,
    errors,
    showRoleModal,
    setShowRoleModal,
    handleSelectRole,
    selectedRole
}) => {

    return (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    I am a... <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                    onPress={() => setShowRoleModal(true)}
                    style={[
                        styles.roleButton,
                        formData.role && styles.roleButtonSelected,
                        errors.role && styles.roleButtonError,
                    ]}
                    activeOpacity={0.8}
                >
                    {selectedRole ? (
                        <View style={styles.roleSelected}>
                            <View
                                style={[
                                    styles.roleIcon,
                                    { backgroundColor: `${selectedRole.color}15` },
                                ]}
                            >
                                <selectedRole.icon
                                    color={selectedRole.color}
                                    size={20}
                                    strokeWidth={2}
                                />
                            </View>
                            <View style={styles.roleText}>
                                <Text style={styles.roleLabel}>{selectedRole.label}</Text>
                                <Text style={styles.roleDescription}>
                                    {selectedRole.description}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.rolePlaceholder}>Select your role</Text>
                    )}
                    <ChevronDown color="#9CA3AF" size={20} strokeWidth={2} />
                </TouchableOpacity>
                {errors.role && (
                    <View style={styles.errorContainer}>
                        <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                        <Text style={styles.errorText}>{errors.role}</Text>
                    </View>
                )}
            </View>

            <Modal
                visible={showRoleModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRoleModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowRoleModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Select Your Role</Text>
                                <Text style={styles.modalSubtitle}>
                                    Choose how you want to use EstateHub
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowRoleModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <X color="#6B7280" size={20} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {userTypes.map((type) => {
                                const IconComponent = type.icon;
                                return (
                                    <TouchableOpacity
                                        key={type.value}
                                        onPress={() => handleSelectRole(type.value)}
                                        style={[
                                            styles.roleOption,
                                            formData.role === type.value &&
                                            styles.roleOptionSelected,
                                        ]}
                                        activeOpacity={0.8}
                                    >
                                        <View
                                            style={[
                                                styles.roleOptionIcon,
                                                { backgroundColor: `${type.color}15` },
                                            ]}
                                        >
                                            <IconComponent
                                                color={type.color}
                                                size={24}
                                                strokeWidth={2}
                                            />
                                        </View>
                                        <View style={styles.roleOptionText}>
                                            <Text style={styles.roleOptionLabel}>{type.label}</Text>
                                            <Text style={styles.roleOptionDescription}>
                                                {type.description}
                                            </Text>
                                        </View>
                                        {formData.role === type.value && (
                                            <View style={styles.roleOptionCheck}>
                                                <Check color="#FFFFFF" size={14} strokeWidth={3} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
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
    required: {
        color: '#EF4444',
    },
    roleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
    },
    roleButtonSelected: {
        borderColor: '#2D6A4F',
        backgroundColor: '#FFFFFF',
    },
    roleButtonError: {
        borderColor: '#FECACA',
    },
    roleSelected: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    roleIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleText: {
        flex: 1,
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    roleDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    rolePlaceholder: {
        fontSize: 14,
        color: '#9CA3AF',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 32,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalBody: {
        padding: 16,
        gap: 12,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
    },
    roleOptionSelected: {
        backgroundColor: '#FFFFFF',
        borderColor: '#2D6A4F',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    roleOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleOptionText: {
        flex: 1,
    },
    roleOptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    roleOptionDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    roleOptionCheck: {
        width: 24,
        height: 24,
        backgroundColor: '#2D6A4F',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
