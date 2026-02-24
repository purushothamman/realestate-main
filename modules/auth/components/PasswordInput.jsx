import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { FocusableInput } from './FocusableInput';

export const PasswordInput = ({ error, ...inputProps }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <FocusableInput
            icon={Lock}
            error={error}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            blurOnSubmit={false}
            inputStyle={styles.passwordInput}
            rightElement={
                <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeButton}
                >
                    {showPassword ? (
                        <EyeOff color="#9CA3AF" size={20} strokeWidth={2} />
                    ) : (
                        <Eye color="#9CA3AF" size={20} strokeWidth={2} />
                    )}
                </TouchableOpacity>
            }
            {...inputProps}
        />
    );
};

const styles = StyleSheet.create({
    passwordInput: {
        paddingRight: 40,
    },
    eyeButton: {
        padding: 4,
    },
});
