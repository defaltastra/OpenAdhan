<div align="center">
  <img src="android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" alt="OpenAdhan Logo" width="120" height="120" />
  <h1>OpenAdhan</h1>
  <p><strong>Accurate, offline prayer times with complete privacy</strong></p>
  <p>No tracking • No ads • No accounts</p>
  
  [![License](https://img.shields.io/badge/license-Non--Commercial-blue)](#license)
  [![Platform](https://img.shields.io/badge/platform-Android-green)]()
  [![Release](https://img.shields.io/badge/release-0.0.1-orange)]()
</div>

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🕐 **Prayer Times** | Accurate calculations using 15+ methods |
| 📍 **Smart Location** | GPS auto-detection or manual city selection |
| 🔔 **Notifications** | Per-prayer adhan alerts, scheduled to the exact second |
| 🎵 **Adhan Audio** | Traditional or Madinah style — plays via native OS even when app is killed |
| 🔄 **Offline First** | No internet needed after initial location setup |
| 🌙 **Themes** | Dark and light mode support |
| 🧭 **Qibla Compass** | Real-time direction to Mecca |
| 🏠 **Widgets** | Android home screen prayer widgets (small & large) |
| 🌍 **Multilingual** | English, Arabic (RTL), French |
| 🔒 **Privacy First** | All data stored locally, no tracking |

---

## 🔔 Adhan Notification Architecture

Adhan audio is bundled directly as Android native resources (`res/raw`).
This means the OS plays the sound **at the exact prayer time** — even if the app is in the background or completely killed — with no delay.

| Setting | Behaviour |
|---------|-----------|
| **Adhan off** | Silent vibration notification |
| **Default – Full** | Full traditional adhan (~3 min) |
| **Default – 5s** | First 5 seconds of traditional adhan |
| **Madinah – Full** | Full Madinah-style adhan (~3.8 min) |
| **Madinah – 5s** | First 5 seconds of Madinah adhan |

Timing uses Android's `SCHEDULE_EXACT_ALARM` permission so the notification fires at the precise prayer minute.

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Android Studio (for native builds)
- Java 11+

### Web Development
```bash
npm install
npm run dev
```

### Android APK Build

**Debug Build:**
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

**Release Build:**
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

APK output locations:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🚀 Quick Start

### Set Your Location
1. Open the **Location** tab
2. Choose **GPS auto-detection** or **manual city selection**
3. GPS: Grant permission and confirm
4. Manual: Pick your city from the list
5. ✅ Location saved — no internet needed after this

### Configure Prayer Times
1. Go to **Settings**
2. Choose your **calculation method** (15+ options)
3. Select your **madhab**
4. The app auto-suggests the correct method based on your country

### Set Up Adhan
1. Open **Settings → Adhan Sound**
2. Choose **Traditional** or **Madinah** style
3. Choose **Full** or **5-second** playback mode
4. Enable **Play Adhan on Notification** toggle
5. Enable notifications per prayer below

### Use Home Screen Widgets (Android)
1. Long-press your home screen → tap **Widgets**
2. Search and select **OpenAdhan**
3. Choose **small** (next prayer) or **large** (full list)

---

## 🔐 Privacy & Security

✅ All data stored locally on device
✅ No internet needed after initial setup
✅ No tracking or analytics
✅ No user accounts required
✅ No ads whatsoever

Your prayer times, location, and preferences never leave your device.

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: IndexedDB (web) / SQLite (native)
- **Audio**: Native Android `res/raw` resources via Capacitor notification channels
- **Routing**: React Router
- **Build**: Vite 6
- **Native Bridge**: Capacitor 8

---

## 📄 License

MIT (see [LICENSE](LICENSE))

---

## 📱 F-Droid

Designed for F-Droid distribution — fully open source, no proprietary SDKs, no tracking.

- Metadata: `metadata/com.openadhan.app/` (en-US, ar, fr)
- Build config: `metadata/com.openadhan.app.yml`
- Package name: `com.openadhan.app`
