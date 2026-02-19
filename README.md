<div align="center">
  <img src="android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" alt="OpenAdhan Logo" width="120" height="120" />
  <h1>OpenAdhan</h1>
  <p><strong>Offline prayer times with complete privacy</strong></p>
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
| 📍 **Smart Location** | GPS auto-detection or manual selection |
| 🔔 **Notifications** | Customizable adhan alerts per prayer |
| 🎵 **Adhan Audio** | Use defaults or upload custom audio |
| 🔄 **Offline First** | No internet needed after setup |
| 🌙 **Themes** | Dark and light mode support |
| 🧭 **Qibla Compass** | Real-time direction to Mecca |
| 🏠 **Widgets** | Android home screen prayer widgets |
| 🌍 **Multilingual** | English, Arabic (RTL), French |
| 🔒 **Privacy First** | All data stored locally, no tracking |

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Android Studio (for native builds)
- Java 11+

### Web Development
```bash
# Install dependencies
npm install

# Start dev server
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

The APK will be generated in:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 🚀 Quick Start

### Set Your Location
1. Open the **Location** tab
2. Choose **GPS auto-detection** or **manual selection**
3. If GPS: Grant permission and confirm the detected location
4. If manual: Select country → select city
5. ✅ Location saved automatically

### Configure Prayer Times
1. Go to **Settings**
2. Choose your **calculation method** (15+ options available)
3. Select your **madhab** (Hanafi or Shafi'i)
4. Settings sync automatically

### Set Up Adhan Notifications
1. Open **Settings → Adhan Sound**
2. Pick a default adhan or tap **Upload** for your own MP3
3. Use **Play** to preview before saving
4. Enable notifications for each prayer in Settings

### Use Home Screen Widgets (Android)
1. Long-press your home screen
2. Tap **"Widgets"**
3. Search and select **"OpenAdhan"**
4. Choose **small** (next prayer) or **large** (full prayer list)
5. Widgets update automatically throughout the day

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Main Screen</strong></td>
      <td align="center"><strong>Onboarding</strong></td>
      <td align="center"><strong>Settings</strong></td>
    </tr>
    <tr>
      <td><img src="main.jpeg" alt="Main Screen" width="200" /></td>
      <td><img src="onboarding.jpeg" alt="Onboarding" width="200" /></td>
      <td><img src="settings.jpeg" alt="Settings" width="200" /></td>
    </tr>
  </table>
</div>

## 🔐 Privacy & Security

✅ All data stored locally  
✅ No internet needed after initial setup  
✅ No tracking or analytics  
✅ No user accounts required  
✅ No ads whatsoever  

Your prayer times, locations, and preferences never leave your device.

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: SQLite (expo-sqlite)
- **Routing**: React Router
- **Build**: Vite 6
- **Native Bridge**: Capacitor 8

## 📄 License

OpenAdhan Non-Commercial License v1.0 (see [LICENSE](LICENSE))

## 📱 F-Droid

This app is designed for F-Droid distribution with no proprietary dependencies or tracking.

**Get the app:**
1. Install [F-Droid](https://f-droid.org/)
2. Search for "OpenAdhan"
3. Install and enjoy offline prayer times!