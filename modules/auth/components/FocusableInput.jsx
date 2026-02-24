import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

export const FocusableInput = React.memo(({
    icon: Icon,
    error,
    containerStyle,
    inputStyle,
    rightElement,
    multiline,
    numberOfLines,
    ...inputProps
}) => {
    const [focused, setFocused] = useState(false);

    if (multiline) {
        return (
            <>
                <View
                    style={[
                        styles.textAreaWrapper,
                        focused && styles.inputWrapperFocused,
                        error && styles.inputWrapperError,
                        containerStyle,
                    ]}
                >
                    {Icon && (
                        <Icon
                            color={focused ? '#2D6A4F' : '#9CA3AF'}
                            size={20}
                            strokeWidth={2}
                            style={styles.textAreaIcon}
                        />
                    )}
                    <TextInput
                        style={[styles.textArea, inputStyle]}
                        placeholderTextColor="#9CA3AF"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
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
                    focused && styles.inputWrapperFocused,
                    error && styles.inputWrapperError,
                    containerStyle,
                ]}
            >
                {Icon && (
                    <Icon
                        color={focused ? '#2D6A4F' : '#9CA3AF'}
                        size={20}
                        strokeWidth={2}
                        style={styles.inputIcon}
                    />
                )}
                <TextInput
                    style={[styles.input, inputStyle]}
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
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
});

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
    inputWrapperFocused: {
        borderColor: '#2D6A4F',
        backgroundColor: '#FFFFFF',
        shadowColor: '#2D6A4F',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
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
