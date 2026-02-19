# OpenAdhan

Offline prayer times app with complete privacy - no tracking, no ads.

## Features

- 📿 Accurate prayer times based on astronomical calculations
- 🕌 15+ calculation methods (MWL, ISNA, Makkah, etc.)
- 🔔 Customizable adhan notifications
- 📍 Save multiple locations
- 🎵 Upload custom adhan or use defaults
- 🌙 Dark/light theme
- 🔒 Private by default

## Setup

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Run the app:
```bash
npm run dev
```

## Android

Build web assets:
```bash
npm run build
```

Sync Capacitor and build APK:
```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

## How to Use

### Set Your Location
1. Go to Location tab
2. Choose GPS auto-detection or manual country/city selection
3. If using GPS: Allow location permission and select the detected location
4. If manual: Select your country, then select your city
5. Location is saved automatically

### Choose Prayer Calculation
1. Go to Settings
2. Select your preferred calculation method
3. Choose your madhab (Hanafi or Shafi)
4. Settings are saved automatically

### Adhan Sound
1. Go to Settings → Adhan Sound
2. Choose from default adhans, or
3. Click "Upload" to add your own MP3
4. Click play button to preview
5. Select to use for notifications

### Notifications
Enable/disable notifications for each prayer individually in Settings.

### Home Screen Widgets (Android)
OpenAdhan includes home screen widgets for Android:
1. Long press on your home screen
2. Tap "Widgets"
3. Search for "OpenAdhan"
4. Choose between small widget (next prayer + countdown) or large widget (full prayer times)
5. Tap to go to app, hold to access quick settings

## Screenshots

### Main Screen
![Main Screen](main.jpeg)

### Onboarding Flow
![Onboarding](onboarding.jpeg)

### Settings
![Settings](settings.jpeg)

## Privacy

- All data stored locally 
- No internet connection needed after initial load
- No tracking or analytics
- No user accounts
- No ads

## Tech Stack

- React + TypeScript
- SQLite (expo-sqlite)
- Tailwind CSS
- Framer Motion
- React Router

## License

OpenAdhan Non-Commercial License v1.0 (see LICENSE)
## F-Droid

This app is designed for F-Droid distribution. It contains no proprietary libraries or tracking code.

**Installation:**
1. Install F-Droid from https://f-droid.org/
2. Search for "OpenAdhan" in the F-Droid app
3. Install and enjoy!