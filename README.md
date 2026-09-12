# Lua Deobfuscator - AI-Powered Code Analysis Tool

A powerful, mobile-friendly AI-powered tool for deobfuscating Lua and Luau code, making obfuscated scripts readable and analyzable. Works as both a **web application** and **native Android APK**.

## ✨ Features

**Static Analysis Pipeline** - 7-stage deterministic deobfuscation:
- String decoding (hex, decimal, base64, byte arrays)
- Constant folding and mathematical simplification
- Variable name inference
- Function structure analysis
- Roblox API detection
- Security warning system
- Syntax validation

**🤖 AI-Powered Reconstruction** - Google Gemini integration:
- Auto, Deep, Reconstruction, Explain, Translate, Security modes
- Graceful fallback to static analysis if API unavailable
- Resilient model selection (multiple fallback models)

**📱 Multi-Platform**:
- Web UI (React 19 + Vite)
- Android APK (via Capacitor)
- Mobile-optimized responsive design

**🔍 Interactive Features**:
- Real-time code comparison
- AI chat assistant for code questions
- Analysis history with localStorage persistence
- Raw URL fetching (GitHub, rscripts.net)
- Export to JSON/Markdown
- Sample scripts for testing

## 🚀 Quick Start

### Web Application (Development)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start dev server
npm run dev
# Open http://localhost:3000
```

### Production Web Build

```bash
npm run build
npm start
# Runs on http://localhost:3000
```

### 📱 Android APK (One-time Setup)

**Easiest way (Automated):**
```bash
bash CAPACITOR_SETUP.sh
npm run apk:debug
```

**Or manually:**
```bash
# Prerequisites: Java 17+, Android SDK, Gradle
# See BUILD_APK.md for detailed setup

npm install
npm run cap:add    # Add Android platform
npm run apk:debug  # Build debug APK

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

**See [BUILD_APK.md](./BUILD_APK.md) for full Android setup guide.**

## 📐 Architecture

```
Lua Deobfuscator/
├── src/
│   ├── App.tsx              Main React component (web + mobile)
│   ├── components/          UI components (Header, CodeConsole, AnalysisPanel, etc.)
│   ├── utils/
│   │   ├── luaParser.ts     7-stage static analysis engine
│   │   ├── sampleScripts.ts Sample obfuscated code
│   │   └── urlHelper.ts     URL normalization
│   ├── types.ts             TypeScript interfaces
│   └── main.tsx             React entry point
├── server.ts                Express backend (web only, excluded from APK)
├── capacitor.config.json    Android configuration
├── vite.config.ts           Frontend build config
├── package.json             Dependencies & scripts
└── BUILD_APK.md             Android APK build guide
```

## 📊 Analysis Modes

| Mode | Purpose |
|------|----------|
| **AUTO** | Automatic detection & reconstruction (default) |
| **DEEP** | Aggressive semantic analysis with maximum inference |
| **RECONSTRUCTION** | Focus on code clarity and naming |
| **EXPLAIN** | Keep original code, add detailed comments |
| **TRANSLATE** | Convert to modern Luau with type annotations |
| **SECURITY** | Highlight suspicious payloads & API calls |

## 🔌 Key Endpoints (Web API)

- `GET /api/health` - Health check
- `POST /api/fetch-raw` - Download raw script from URL (safe, no execution)
- `POST /api/deobfuscate` - AI deobfuscation pipeline
- `POST /api/chat` - Interactive code analysis chat

## 🔬 Static Analysis Details

The `luaParser.ts` performs 7 stages:

1. **Tokenization** - Lexical analysis & token classification
2. **String Decoding** - Hex escapes, byte arrays, base64, concatenation
3. **Constant Folding** - Simplify arithmetic & type conversions
4. **Identifier Inference** - Rename obfuscated variables logically
5. **Function Detection** - Extract function signatures & dependencies
6. **Roblox API Mapping** - Identify Roblox-specific calls
7. **Security Auditing** - Detect webhooks, dynamic code loading, suspicious patterns

## 🔐 Environment Variables

```bash
GEMINI_API_KEY=your-api-key           # Required for AI features
PORT=3000                              # Server port (web only)
NODE_ENV=development|production        # Runtime mode
DISABLE_HMR=true                       # Disable Vite HMR (AI Studio)
```

## 🛠 Technologies

- **Frontend**: React 19, Vite 6.2, Tailwind CSS, Lucide React
- **Backend**: Express.js, TypeScript, esbuild
- **AI**: Google Gemini API with resilience fallbacks
- **Mobile**: Capacitor, Android SDK, Gradle
- **Build**: Vite (web), esbuild (backend), Gradle (APK)

## ⚡ Performance

- **Static Analysis**: <100ms for typical scripts
- **AI Processing**: 2-10s depending on code length and Gemini load
- **APK Size**: ~45MB (includes React, Express, and Lua parser)
- **Memory**: ~50-100MB on Android (varies by device)

## ⚠️ Limitations

- **AI Mode**: Requires internet connection (Gemini API)
- **Static Mode**: Works fully offline; less accurate for complex obfuscation
- **Code Size**: Recommended <16KB for best results; backend limits to 15MB uploads
- **Android**: Tested on API 24+ (Android 7.0+)

## 🐛 Troubleshooting

### "GEMINI_API_KEY not set"
The app will gracefully use static analysis only. Set the key in `.env` or environment variables for AI features.

### "APK crashes on startup"
Check `logcat` in Android Studio:
```bash
adb logcat | grep LuaDeobfuscator
```

### "Build fails: Gradle error"
Ensure Java 17+ and Android SDK are correctly installed:
```bash
java -version
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list
```

### More help
See [BUILD_APK.md](./BUILD_APK.md) for detailed troubleshooting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is open source. See LICENSE file for details.

## 📞 Support

- **Issues**: GitHub Issues (for bugs & feature requests)
- **Docs**: See `BUILD_APK.md` for Android setup, `BUILD_WEB.md` for web deployment
- **Examples**: Sample scripts included in the UI

---

**Created by** JMY12970 | **Latest Update**: 2026-09-12
