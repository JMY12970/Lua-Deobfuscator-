#!/bin/bash
# Automated setup script for Capacitor Android APK build
# Usage: bash CAPACITOR_SETUP.sh

set -e

echo "🚀 Lua Deobfuscator - Android APK Setup"
echo "=========================================='" 
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  Found: $NODE_VERSION"
echo ""

# Check Java
echo "✓ Checking Java JDK..."
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install JDK 17+ from https://adoptopenjdk.net"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo "  Found: $JAVA_VERSION"
echo ""

# Check ANDROID_HOME
echo "✓ Checking ANDROID_HOME..."
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME not set. Please set it before running this script:"
    echo "   export ANDROID_HOME=/path/to/android/sdk"
    exit 1
fi
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME points to non-existent directory: $ANDROID_HOME"
    exit 1
fi
echo "  Found: $ANDROID_HOME"
echo ""

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install
echo ""

# Install Capacitor CLI globally if not present
if ! command -v cap &> /dev/null; then
    echo "📦 Installing Capacitor CLI globally..."
    npm install -g @capacitor/cli
fi
echo ""

# Initialize Capacitor if needed
if [ ! -f "capacitor.config.json" ]; then
    echo "⚙️  Initializing Capacitor..."
    npx cap init
else
    echo "✓ Capacitor already configured"
fi
echo ""

# Add Android platform
if [ ! -d "android" ]; then
    echo "📱 Adding Android platform..."
    npx cap add android
else
    echo "✓ Android platform already added"
fi
echo ""

# Sync project
echo "🔄 Syncing Capacitor configuration..."
npx cap sync android
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Build the web app: npm run build:web"
echo "2. Build debug APK:   npm run apk:debug"
echo "3. Open in Android Studio: npm run cap:open"
echo ""
echo "For more info, see BUILD_APK.md"
