import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

export const FocusableInput = ({
    icon: Icon,
    error,
    containerStyle,
    inputStyle,
    rightElement,
    multiline,
    numberOfLines,
    ...inputProps
}) => {
    if (multiline) {
        return (
            <>
                <View
                    style={[
                        styles.textAreaWrapper,
                        error && styles.inputWrapperError,
                        containerStyle,
                    ]}
                >
                    {Icon && (
                        <Icon
                            color={'#9CA3AF'}
                            size={20}
                            strokeWidth={2}
                            style={styles.textAreaIcon}
                        />
                    )}
                    <TextInput
                        style={[styles.textArea, inputStyle]}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={numberOfLines || 4}
                        textAlignVertical="top"
                        {...inputProps}
                    />
                </View>
                {error ? (
                    <View style={styles.errorContainer}>
                        <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}
            </>
        );
    }

    return (
        <>
            <View
                style={[
                    styles.inputWrapper,
                    error && styles.inputWrapperError,
                    containerStyle,
                ]}
            >
                {Icon && (
                    <Icon
                        color={'#9CA3AF'}
                        size={20}
                        strokeWidth={2}
                        style={styles.inputIcon}
                    />
                )}
                <TextInput
                    style={[styles.input, inputStyle]}
                    placeholderTextColor="#9CA3AF"
                    {...inputProps}
                />
                {rightElement}
            </View>
            {error ? (
                <View style={styles.errorContainer}>
                    <AlertCircle color="#DC2626" size={12} strokeWidth={2} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}
        </>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputWrapperError: {
        borderColor: '#FECACA',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        height: '100%',
        // Removes the default black focus outline on web/Expo web
        outlineWidth: 0,
        outlineStyle: 'none',
    },
    textAreaWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
    },
    textAreaIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    textArea: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        minHeight: 80,
        outlineWidth: 0,
        outlineStyle: 'none',
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