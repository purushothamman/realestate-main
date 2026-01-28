#!/bin/bash

# Google Sign-In Troubleshooting Script
# Run this to check your configuration

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Google Sign-In Configuration Checker                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a React Native project
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in a React Native project directory${NC}"
    exit 1
fi

echo "📋 Checking Frontend Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for Google Sign-In package
if grep -q "@react-native-google-signin/google-signin" package.json; then
    echo -e "${GREEN}✅ Google Sign-In package installed${NC}"
else
    echo -e "${RED}❌ Google Sign-In package NOT installed${NC}"
    echo "   Run: npm install @react-native-google-signin/google-signin"
fi

# Check for GoogleLoginConfig.js
if [ -f "context/GoogleLoginConfig.js" ] || [ -f "src/context/GoogleLoginConfig.js" ]; then
    echo -e "${GREEN}✅ GoogleLoginConfig.js found${NC}"
    
    # Check if Web Client ID is configured
    CONFIG_FILE=$(find . -name "GoogleLoginConfig.js" -type f | head -n 1)
    if grep -q "WEB_CLIENT_ID: '989936525414" "$CONFIG_FILE"; then
        echo -e "${GREEN}✅ Web Client ID is configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Web Client ID might not be set correctly${NC}"
    fi
    
    # Check if iOS Client ID is empty
    if grep -q "IOS_CLIENT_ID: ''" "$CONFIG_FILE"; then
        echo -e "${GREEN}✅ iOS Client ID is empty (recommended)${NC}"
    else
        echo -e "${YELLOW}⚠️  iOS Client ID is set (usually not needed)${NC}"
    fi
else
    echo -e "${RED}❌ GoogleLoginConfig.js NOT found${NC}"
fi

echo ""
echo "📱 Checking Android Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Android files
if [ -f "android/build.gradle" ]; then
    echo -e "${GREEN}✅ Android project found${NC}"
    
    # Check package name
    if [ -f "android/app/build.gradle" ]; then
        PACKAGE_NAME=$(grep "applicationId" android/app/build.gradle | sed 's/.*"\(.*\)".*/\1/')
        echo -e "${GREEN}✅ Package name: ${PACKAGE_NAME}${NC}"
        echo "   Make sure this matches your Google Console Android client"
    fi
    
    # Check for Play Services
    if grep -q "play-services-auth" android/app/build.gradle; then
        echo -e "${GREEN}✅ Play Services Auth dependency found${NC}"
    else
        echo -e "${YELLOW}⚠️  Play Services Auth dependency might be missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Android project not found${NC}"
fi

echo ""
echo "🍎 Checking iOS Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check iOS files
if [ -d "ios" ]; then
    echo -e "${GREEN}✅ iOS project found${NC}"
    
    # Check for Info.plist
    INFO_PLIST=$(find ios -name "Info.plist" -type f | head -n 1)
    if [ -f "$INFO_PLIST" ]; then
        if grep -q "CFBundleURLSchemes" "$INFO_PLIST"; then
            echo -e "${GREEN}✅ URL schemes configured in Info.plist${NC}"
        else
            echo -e "${YELLOW}⚠️  URL schemes might not be configured${NC}"
            echo "   Add reversed client ID to Info.plist"
        fi
    fi
    
    # Check if pods are installed
    if [ -f "ios/Podfile.lock" ]; then
        echo -e "${GREEN}✅ Pods installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Pods might not be installed${NC}"
        echo "   Run: cd ios && pod install"
    fi
else
    echo -e "${YELLOW}⚠️  iOS project not found${NC}"
fi

echo ""
echo "🖥️  Checking Backend Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for .env file
if [ -f "../backend/.env" ] || [ -f ".env" ] || [ -f "../.env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    
    ENV_FILE=$(find . .. -maxdepth 1 -name ".env" -type f | head -n 1)
    
    if grep -q "GOOGLE_CLIENT_ID" "$ENV_FILE"; then
        echo -e "${GREEN}✅ GOOGLE_CLIENT_ID is set${NC}"
    else
        echo -e "${RED}❌ GOOGLE_CLIENT_ID is NOT set${NC}"
    fi
    
    if grep -q "JWT_SECRET" "$ENV_FILE"; then
        echo -e "${GREEN}✅ JWT_SECRET is set${NC}"
    else
        echo -e "${RED}❌ JWT_SECRET is NOT set${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
fi

echo ""
echo "🔧 Quick Fixes..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "📱 For Android - Get SHA-1:"
echo "   cd android && ./gradlew signingReport"
echo ""
echo "🍎 For iOS - Install pods:"
echo "   cd ios && pod install"
echo ""
echo "🖥️  For Backend - Set environment variables:"
echo "   GOOGLE_CLIENT_ID=your_web_client_id"
echo "   JWT_SECRET=your_secret_key"
echo ""
echo "🔍 View detailed logs:"
echo "   npx react-native log-android   # Android logs"
echo "   npx react-native log-ios       # iOS logs"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "Check complete! Review any ❌ or ⚠️  items above."
echo "═══════════════════════════════════════════════════════════════"