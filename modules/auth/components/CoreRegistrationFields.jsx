import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, Mail, Phone } from 'lucide-react-native';
import { FocusableInput } from './FocusableInput';
import { PasswordInput } from './PasswordInput';

export const CoreRegistrationFields = ({
    formData,
    errors,
    handleInputChange
}) => {
    return (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Full Name <Text style={styles.required}>*</Text>
                </Text>
                <FocusableInput
                    icon={User}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    error={errors.name}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="off"
                    blurOnSubmit={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Email Address <Text style={styles.required}>*</Text>
                </Text>
                <FocusableInput
                    icon={Mail}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    blurOnSubmit={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Phone Number <Text style={styles.required}>*</Text>
                </Text>
                <FocusableInput
                    icon={Phone}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    error={errors.phone}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    autoComplete="off"
                    blurOnSubmit={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    Password <Text style={styles.required}>*</Text>
                </Text>
                <PasswordInput
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    error={errors.password}
                />
                {!errors.password ? (
                    <Text style={styles.passwordHint}>
                        Must be at least 8 characters with letters and numbers
                    </Text>
                ) : null}
            </View>
        </>
    );
};

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
    passwordHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        marginLeft: 4,
    },
});
