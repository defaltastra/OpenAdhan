# F-Droid Preparation Guide

## What's Included

This project is fully prepared for F-Droid submission with:

### 1. **Metadata** (`fastlane/metadata/android/en-US/`)
- `title.txt` - App name
- `short_description.txt` - One-line description
- `full_description.txt` - Detailed description with features
- `changelogs/` - Version history

### 2. **App Icons** (All densities)
- `mipmap-mdpi/` - Medium density (160 dpi)
- `mipmap-hdpi/` - High density (240 dpi)  
- `mipmap-xhdpi/` - Extra high density (320 dpi)
- `mipmap-xxhdpi/` - Extra extra high density (480 dpi)
- `mipmap-xxxhdpi/` - Extra extra extra high density (640 dpi)

### 3. **Screenshots**
- `main.jpeg` - Main prayer times screen
- `onboarding.jpeg` - Onboarding flow
- `settings.jpeg` - Settings configuration

### 4. **Release APK**
Location: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## F-Droid Submission Process

1. **Register** on https://f-droid.org/
2. **Prepare Repository Metadata**:
   - Fork the F-Droid Data repository
   - Add app definition to `metadata/com.openadhan.app.yml` with:
```yaml
AntiFeatures:
  - NonFreeAssets  # If using any proprietary assets
License: Custom
SourceCode: https://github.com/yourusername/openadhan
IssueTracker: https://github.com/yourusername/openadhan/issues
Categories:
  - Religion
  - System
BuildVersion:
  - versionName: 0.0.1
    versionCode: 1
    commit: v0.0.1
    gradle:
      - yes
    prebuild: echo 'gradle.buildCache = false' >> gradle.properties
    gradle:
      - release
```

3. **Update Build Metadata** (optional automated builds):
   - F-Droid can automatically build from your GitHub tags
   - Set up GitHub Actions to tag releases
   - F-Droid will detect tags and build them

4. **Wait for Review**:
   - F-Droid team reviews your app
   - Approval typically takes 1-4 weeks
   - Community feedback period

## APK Signing

For F-Droid submission, use test keys initially:
```bash
# Generate key if needed
keytool -genkey -v -keystore release.keystore -alias openadhan \
  -keyalg RSA -keysize 2048 -validity 10000

# Sign the APK with test key
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore release.keystore app-release-unsigned.apk openadhan

# Zipalign for size optimization
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

Note: F-Droid will resign the APK with their own keys before distribution.

## Privacy Checklist

✓ No ads
✓ No tracking
✓ No user accounts  
✓ No proprietary libraries (Capacitor is open source)
✓ All data stored locally
✓ Offline-first design
✓ Non-commercial license included

## License Note

The app uses a custom "OpenAdhan Non-Commercial License v1.0" which restricts commercial use.
F-Droid may require this to be a standard open source license for automation. Consider using:
- GPL v3.0 (if you want to allow private/commercial use with source sharing)
- AGPL v3.0 (stronger copyleft for network services)
- CC0 1.0 (public domain)

## Next Steps

1. Create GitHub repository
2. Add F-Droid metadata via PR to F-Droid/fdroiddata
3. Wait for approval and automated builds
4. Get app listed on f-droid.org

See: https://f-droid.org/en/docs/Submitting_Applications/
