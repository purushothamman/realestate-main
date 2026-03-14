// context/GoogleLoginConfig.js
// Central configuration for Google Sign-In
// This file contains all Google OAuth configuration for the app

import { Platform } from 'react-native';

export const GOOGLE_CONFIG = {
  // ==================== STEP 1: PASTE YOUR WEB CLIENT ID HERE ====================
  //
  // HOW TO GET IT:
  //   1. Go to https://console.cloud.google.com/apis/credentials
  //   2. Click "+ CREATE CREDENTIALS" > "OAuth client ID"
  //   3. Application type: "Web application"
  //   4. Name: "EStateHub Web Client"
  //   5. Authorized JavaScript origins: https://auth.expo.io
  //   6. Authorized redirect URIs: https://auth.expo.io/@169yami/estatehub-app
  //   7. Click Create → Copy the Client ID below
  //
  // MUST match GOOGLE_CLIENT_ID in backend/.env
  // Format: 123456789-xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
  //
  WEB_CLIENT_ID: '583846474336-e4upcru2iqall7hgkbdo485f11ueehh0.apps.googleusercontent.com',

  // ==================== STEP 2: ANDROID CLIENT ID (for EAS APK builds) ====================
  //
  // HOW TO GET IT:
  //   1. In Google Cloud Console > Credentials > CREATE CREDENTIALS > OAuth client ID
  //   2. Application type: "Android"
  //   3. Package name: com.example.estatehubapp
  //   4. SHA-1: Run `eas credentials` → choose Android → copy SHA-1 fingerprint
  //   5. Click Create → Copy the Client ID below
  //
  // For Expo Go testing you can leave this empty (Web Client ID covers it)
  //
  ANDROID_CLIENT_ID: '',

  // iOS Client ID - leave empty, Web Client ID is used for iOS too
  IOS_CLIENT_ID: '',

  // ==================== CONFIGURATION OPTIONS ====================

  // Domain restriction (leave empty to allow all Google accounts)
  HOSTED_DOMAIN: '',

  // Requested scopes
  SCOPES: ['profile', 'email'],
};

// ==================== VALIDATION & SETUP FUNCTIONS ====================

/**
 * Get platform-specific Google Sign-In configuration
 * Returns the config object for GoogleSignin.configure()
 */
export const getGoogleSignInConfig = () => {
  const config = {
    webClientId: GOOGLE_CONFIG.WEB_CLIENT_ID,
    offlineAccess: GOOGLE_CONFIG.OFFLINE_ACCESS,
    forceCodeForRefreshToken: GOOGLE_CONFIG.FORCE_CODE_FOR_REFRESH_TOKEN,
  };

  // Add scopes
  if (GOOGLE_CONFIG.SCOPES?.length > 0) {
    config.scopes = GOOGLE_CONFIG.SCOPES;
  }

  // Only add iosClientId if explicitly set (NOT RECOMMENDED)
  if (Platform.OS === 'ios' && GOOGLE_CONFIG.IOS_CLIENT_ID) {
    console.warn('⚠️  Using separate iOS Client ID - this is usually not needed');
    config.iosClientId = GOOGLE_CONFIG.IOS_CLIENT_ID;
  }

  // Add hosted domain if specified
  if (GOOGLE_CONFIG.HOSTED_DOMAIN) {
    config.hostedDomain = GOOGLE_CONFIG.HOSTED_DOMAIN;
  }

  return config;
};

/**
 * Validate Google configuration before initialization
 * Returns true if valid, false otherwise
 */
export const validateGoogleConfig = () => {
  const errors = [];
  const warnings = [];

  // Validate Web Client ID
  if (!GOOGLE_CONFIG.WEB_CLIENT_ID) {
    errors.push('❌ WEB_CLIENT_ID is missing');
  } else if (GOOGLE_CONFIG.WEB_CLIENT_ID.includes('YOUR_') ||
    GOOGLE_CONFIG.WEB_CLIENT_ID.includes('REPLACE')) {
    errors.push('❌ WEB_CLIENT_ID still contains placeholder text');
  } else if (!GOOGLE_CONFIG.WEB_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
    errors.push('❌ WEB_CLIENT_ID format is incorrect');
  }

  // Platform-specific warnings
  if (Platform.OS === 'android') {
    warnings.push('ℹ️  Android: Ensure SHA-1 fingerprint is added to Google Cloud Console');
    warnings.push('ℹ️  For debug build: Use debug keystore SHA-1');
    warnings.push('ℹ️  For release build: Use release keystore SHA-1');
  }

  if (Platform.OS === 'ios') {
    warnings.push('ℹ️  iOS: Ensure URL scheme is configured in Info.plist');
    if (GOOGLE_CONFIG.IOS_CLIENT_ID) {
      warnings.push('⚠️  Separate iOS Client ID is set - usually not needed');
    }
  }

  // Check for iOS Client ID confusion
  if (GOOGLE_CONFIG.IOS_CLIENT_ID &&
    GOOGLE_CONFIG.IOS_CLIENT_ID !== GOOGLE_CONFIG.WEB_CLIENT_ID) {
    warnings.push('⚠️  Different iOS and Web Client IDs detected');
    warnings.push('⚠️  This can cause token verification failures');
    warnings.push('💡 Recommended: Set IOS_CLIENT_ID to empty string');
  }

  // Display results
  if (errors.length > 0) {
    console.error('\n🚨 CONFIGURATION ERRORS (Must Fix):');
    errors.forEach(error => console.error(error));
    return false;
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings:');
    warnings.forEach(warning => console.warn(warning));
  }

  console.log('✅ Google Sign-In configuration is valid\n');
  return true;
};

/**
 * Log configuration details (with sensitive data masked)
 */
export const logGoogleConfig = () => {
  const maskClientId = (id) => {
    if (!id) return 'NOT SET';
    if (id.length < 40) return `${id.substring(0, 10)}...`;
    return `${id.substring(0, 15)}...${id.slice(-15)}`;
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 Google Sign-In Configuration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Platform:         ${Platform.OS}`);
  console.log(`Web Client ID:    ${maskClientId(GOOGLE_CONFIG.WEB_CLIENT_ID)}`);
  console.log(`iOS Client ID:    ${maskClientId(GOOGLE_CONFIG.IOS_CLIENT_ID)}`);
  console.log(`Offline Access:   ${GOOGLE_CONFIG.OFFLINE_ACCESS}`);
  console.log(`Hosted Domain:    ${GOOGLE_CONFIG.HOSTED_DOMAIN || 'None (all domains allowed)'}`);
  console.log(`Scopes:           ${GOOGLE_CONFIG.SCOPES.join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

/**
 * Get debug information for troubleshooting
 */
export const getDebugInfo = () => {
  return {
    platform: Platform.OS,
    platformVersion: Platform.Version,
    webClientId: GOOGLE_CONFIG.WEB_CLIENT_ID,
    iosClientId: GOOGLE_CONFIG.IOS_CLIENT_ID || 'Not set (recommended)',
    androidClientId: GOOGLE_CONFIG.ANDROID_CLIENT_ID || 'Not set (uses SHA-1)',
    offlineAccess: GOOGLE_CONFIG.OFFLINE_ACCESS,
    hostedDomain: GOOGLE_CONFIG.HOSTED_DOMAIN || 'None',
    scopes: GOOGLE_CONFIG.SCOPES,
    configValid: validateGoogleConfig(),
  };
};

/**
 * Print setup instructions based on platform
 */
export const printSetupInstructions = () => {
  console.log('\n📚 Google Sign-In Setup Instructions:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (Platform.OS === 'android') {
    console.log('🤖 Android Setup:');
    console.log('1. Get your SHA-1 fingerprint:');
    console.log('   Debug: cd android && ./gradlew signingReport');
    console.log('   Look for "SHA1:" under "Variant: debug"');
    console.log('');
    console.log('2. Add SHA-1 to Google Cloud Console:');
    console.log('   - Go to Google Cloud Console');
    console.log('   - APIs & Services > Credentials');
    console.log('   - Find your OAuth 2.0 Client ID (Android type)');
    console.log('   - Add SHA-1 fingerprint');
    console.log('');
    console.log('3. Ensure package name matches:');
    console.log('   - Check android/app/build.gradle');
    console.log('   - applicationId must match Google Console');
  } else {
    console.log('🍎 iOS Setup:');
    console.log('1. Add URL scheme to Info.plist:');
    console.log('   - Open ios/[YourApp]/Info.plist');
    console.log('   - Add reversed client ID as URL scheme');
    console.log('   - Format: com.googleusercontent.apps.[CLIENT_ID]');
    console.log('');
    console.log('2. Ensure Bundle ID matches:');
    console.log('   - Check Xcode project settings');
    console.log('   - Bundle Identifier must match Google Console');
  }

  console.log('\n📋 Backend Setup:');
  console.log('1. Add to .env file:');
  console.log(`   GOOGLE_CLIENT_ID=${GOOGLE_CONFIG.WEB_CLIENT_ID}`);
  console.log('');
  console.log('2. Ensure backend is running on:');
  console.log(Platform.OS === 'android'
    ? '   http://10.0.2.2:5000 (for emulator)'
    : '   http://localhost:5000 (for simulator)');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

export default GOOGLE_CONFIG;