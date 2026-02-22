import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Mail, Lock, Eye, EyeOff, AlertCircle, X, ArrowLeft } from 'lucide-react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getDebugInfo, printSetupInstructions } from '../context/GoogleLoginConfig';
import { getApiUrl } from '../../../utils/api';

WebBrowser.maybeCompleteAuthSession();

// ==================== API CONFIGURATION ====================
// const getApiUrl = () => {
//     if (Platform.OS === 'android') {
//         // return 'http://192.168.137.194:5000/api';
//         return 'http://192.168.0.104:5000/api';


//     } else {
//         return 'http://localhost:5000/api';
//     }
// };

const API_BASE_URL = getApiUrl();

export default function LoginScreen({
    navigation,
    onNavigateToLoginSuccess,
    onRegister,
    onForgotPassword,
    onBack
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);

    // ==================== NAVIGATION HELPER ====================

    const navigateByRole = (user) => {
        if (onNavigateToLoginSuccess) {
            onNavigateToLoginSuccess(user);
        }
    };


    // ==================== GOOGLE AUTH HOOK ====================
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: 'YOUR_EXPO_CLIENT_ID', // Replace with actual ID
        androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with actual ID
        webClientId: 'YOUR_WEB_CLIENT_ID', // Replace with actual ID
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log('✅ Google Authentication Success:', authentication);
            handleGoogleLoginSuccess(authentication.accessToken);
        } else if (response?.type === 'cancel' || response?.type === 'error') {
            setIsGoogleLoading(false);
        }
    }, [response]);

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await promptAsync();
            if (result.type !== 'success') {
                setIsGoogleLoading(false);
            }
        } catch (error) {
            console.error('Google login error:', error);
            setApiError('Google sign-in failed');
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleLoginSuccess = async (accessToken) => {
        setIsGoogleLoading(true);
        try {
            // Send token to backend
            const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: accessToken }),
            });
            const data = await res.json();
            if (res.ok) {
                await AsyncStorage.multiSet([
                    ['authToken', data.token],
                    ['user', JSON.stringify(data.user)],
                    ['userRole', data.user.role],
                    ['userId', String(data.user.id)],
                ]);
                navigateByRole(data.user);
            } else {
                setApiError(data.message || 'Google login failed on server');
            }
        } catch (error) {
            console.error('Backend Google login error:', error);
            setApiError('Could not connect to server');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // ==================== EMAIL/PASSWORD LOGIN ====================
    const handleLogin = async () => {
        setApiError('');
        if (!email.trim() || !password) {
            setApiError('Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password: password,
                }),
            });

            console.log("Calling:", `${API_BASE_URL}/auth/login`);
            console.log("STATUS:", response.status);


            const data = await response.json();
            console.log("RAW RESPONSE:", data);

            if (!response.ok) {
                setApiError(data.message || 'Login failed');
                return;
            }

            await AsyncStorage.multiSet([
                ['authToken', data.token],
                ['user', JSON.stringify(data.user)],
                ['userRole', data.user.role],
                ['userId', String(data.user.id)],
            ]);

            navigateByRole(data.user);

        } catch (error) {
            console.log("FETCH ERROR:", error);
            setApiError('Server connection failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigateToRegister = () => {
        if (onRegister) onRegister();
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Image Section */}
                <View style={styles.headerImageContainer}>
                    <ImageBackground
                        source={{
                            uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
                        }}
                        style={styles.headerImage}
                        resizeMode="cover"
                    >
                        <View style={styles.headerOverlay} />
                        <TouchableOpacity
                            style={styles.backButtonContainer}
                            onPress={() => onBack && onBack()}
                            activeOpacity={0.8}
                        >
                            <ArrowLeft color="#FFFFFF" size={24} strokeWidth={2} />
                        </TouchableOpacity>
                        <View style={styles.headerLogoContainer}>
                            <View style={styles.headerLogo}>
                                <Home color="#FFFFFF" size={24} strokeWidth={2} />
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                {/* Main Content Card */}
                <View style={styles.contentCard}>
                    <View style={styles.appNameContainer}>
                        <Text style={styles.appName}>EstateHub</Text>
                    </View>

                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>Welcome Back</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Sign in to continue exploring and managing your properties
                        </Text>
                    </View>

                    {apiError ? (
                        <View style={styles.errorMessage}>
                            <AlertCircle color="#DC2626" size={20} strokeWidth={2} />
                            <Text style={styles.errorMessageText}>{apiError}</Text>
                            <TouchableOpacity onPress={() => setApiError('')}>
                                <X color="#EF4444" size={16} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email or Phone</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    focusedInput === 'email' && styles.inputWrapperFocused,
                                ]}
                            >
                                <Mail
                                    color={focusedInput === 'email' ? '#2D6A4F' : '#9CA3AF'}
                                    size={20}
                                    strokeWidth={2}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setApiError('');
                                    }}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading && !isGoogleLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    focusedInput === 'password' && styles.inputWrapperFocused,
                                ]}
                            >
                                <Lock
                                    color={focusedInput === 'password' ? '#2D6A4F' : '#9CA3AF'}
                                    size={20}
                                    strokeWidth={2}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setApiError('');
                                    }}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading && !isGoogleLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    {showPassword ? (
                                        <EyeOff color="#9CA3AF" size={20} strokeWidth={2} />
                                    ) : (
                                        <Eye color="#9CA3AF" size={20} strokeWidth={2} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading || isGoogleLoading}
                            style={[
                                styles.loginButton,
                                (isLoading || isGoogleLoading) && styles.loginButtonDisabled,
                            ]}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity
                            onPress={handleGoogleLogin}
                            style={[styles.socialButton, styles.googleButton]}
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                <ActivityIndicator color="#4285F4" size="small" />
                            ) : (
                                <>
                                    <View style={styles.googleIcon}>
                                        <Text style={styles.googleIconText}>G</Text>
                                    </View>
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => Alert.alert('Coming Soon', 'Apple Sign-In is not yet available.')}
                        >
                            <Text style={styles.appleIcon}>🍎</Text>
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleNavigateToRegister}>
                            <Text style={styles.signUpLink}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 40,
    },
    headerImageContainer: {
        height: 256,
        overflow: 'hidden',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    headerLogoContainer: {
        position: 'absolute',
        top: 24,
        left: 24,
    },
    headerLogo: {
        width: 40,
        height: 40,
        backgroundColor: '#2D6A4F',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 24,
        right: 24,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -32,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 32,
    },
    appNameContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    appName: {
        fontSize: 30,
        fontWeight: '700',
        color: '#111827',
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    errorMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#FEF2F2',
        borderWidth: 2,
        borderColor: '#FECACA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    errorMessageText: {
        flex: 1,
        color: '#B91C1C',
        fontSize: 14,
        fontWeight: '500',
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputWrapperFocused: {
        borderColor: '#2D6A4F',
        backgroundColor: '#FFFFFF',
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
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    loginButton: {
        width: '100%',
        height: 48,
        backgroundColor: '#2D6A4F',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        color: '#6B7280',
        fontSize: 14,
        marginHorizontal: 16,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        gap: 8,
    },
    googleButton: {
        borderColor: '#4285F4',
        backgroundColor: '#F8FAFF',
    },
    googleIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4285F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleIconText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    appleIcon: {
        fontSize: 20,
    },
    socialButtonText: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '500',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signUpLink: {
        color: '#2D6A4F',
        fontSize: 14,
        fontWeight: '600',
    },
});
