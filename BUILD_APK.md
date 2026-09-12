# Building Android APK - Lua Deobfuscator

## Quick Start (Automated)

```bash
# One command to set everything up
bash CAPACITOR_SETUP.sh

# Then build APK
npm run apk:debug
```

## Prerequisites

1. **Node.js** (v18+)
2. **Java Development Kit (JDK)** 17 or higher
   ```bash
   # macOS
   brew install openjdk@17
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ```

3. **Android SDK & Android Studio**
   - Download from https://developer.android.com/studio
   - Or install via homebrew:
   ```bash
   brew install android-sdk
   ```

4. **Environment Variables** (add to `~/.bashrc`, `~/.zshrc`, or `.env.local`)
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   # or
   export ANDROID_HOME=$HOME/Android/Sdk           # Linux
   # or
   export ANDROID_HOME=C:\Users\YourUser\AppData\Local\Android\sdk  # Windows
   
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

5. **Google Gemini API Key**
   - Sign up at https://ai.google.dev
   - Get your API key
   - Create `.env` file:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```

## Setup (One-time)

**Option A: Automated (Recommended)**
```bash
bash CAPACITOR_SETUP.sh
```

**Option B: Manual**
```bash
# Install dependencies
npm install

# Initialize Capacitor
npm run cap:init

# Add Android platform
npm run cap:add
```

## Build Debug APK

```bash
# Build web and sync with Android
npm run cap:build

# Build APK (debug mode)
npm run apk:debug

# APK output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Build Release APK

```bash
# Build the web app and sync with Android
npm run cap:build

# Build AAB (Android App Bundle) for Play Store
npm run apk:release

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Test on Device / Emulator

```bash
# Start Android emulator or connect physical device via USB

# Open Android project in Android Studio
npm run cap:open

# In Android Studio:
# - Click "Run" button or press Shift+F10
# - Select target device/emulator
# - APK will be installed automatically
```

## Alternative: Direct Gradle Build

```bash
cd android
./gradlew assembleDebug      # Debug APK
./gradlew assembleRelease    # Release APK (requires signing)
cd ..
```

## Troubleshooting

### "ANDROID_HOME not set"
```bash
export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

### "No Java JDK found"
```bash
# Check your JAVA_HOME
echo $JAVA_HOME

# Set it correctly
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### "Gradle build fails"
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

### "APK won't run - crashes on startup"
- Check `logcat` in Android Studio
- Ensure `GEMINI_API_KEY` is set in environment or `.env`
- The app will gracefully fall back to static analysis if API key is missing

### "Cannot find gradle"
```bash
# Gradle wrapper should be in android/ folder
# If missing, regenerate Android project
npm run cap:add
```

## Distribution

Once you have `app-debug.apk` or `app-release.aab`:

1. **Share directly** (debug APK only, for testing)
   ```bash
   # Copy to GitHub Releases
   cp android/app/build/outputs/apk/debug/app-debug.apk ./
   git add app-debug.apk
   git commit -m "Add debug APK v1.0.0"
   git push
   ```

2. **Publish to Google Play Store** (release AAB)
   - Sign the AAB with a keystore
   - Upload to Google Play Console

3. **Publish to GitHub Packages** (Maven Registry)
   - Use the `.aab` or `.apk` as an artifact

## Architecture

- **Frontend**: React 19 + Vite (runs in WebView on Android)
- **Backend**: Express.js (bundled in APK, runs as native service)
- **Static Analysis**: Lua parser (TypeScript, works on both platforms)
- **AI Processing**: Google Gemini API (cloud-based, needs internet)

The Android app wraps your web UI in a native container via Capacitor, allowing full access to device features while keeping your code mostly unchanged.

## Next Steps

1. Run automated setup: `bash CAPACITOR_SETUP.sh`
2. Build debug APK: `npm run apk:debug`
3. Test on emulator or device
4. Once working, build release version for distribution

---

**Questions?** Check the [Capacitor docs](https://capacitorjs.com/docs) or file an issue in the repo.
