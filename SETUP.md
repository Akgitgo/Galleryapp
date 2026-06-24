# GalleryApp — Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 LTS | https://nodejs.org |
| npm | ≥ 9 | Bundled with Node |
| Expo CLI | Latest | `npm i -g expo-cli` |
| EAS CLI | Latest | `npm i -g eas-cli` |
| Android Studio | Latest | For Android emulator |
| Xcode (macOS only) | ≥ 15 | For iOS simulator |

---

## 1 — Clone and Install

```bash
git clone <your-repo-url>
cd GalleryApp
npm install
```

---

## 2 — Run on a Device / Emulator

### Android (emulator or physical device)

```bash
# Start the dev server
npx expo start

# Press 'a' in the terminal to open on Android
# OR scan the QR code with the Expo Go app
```

### iOS (macOS only)

```bash
npx expo start
# Press 'i' to open iOS simulator
```

### Physical Device (recommended for media library features)

1. Install **Expo Go** from the Play Store / App Store
2. Run `npx expo start`
3. Scan the QR code shown in the terminal

---

## 3 — Run Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run a specific test file
npx jest src/__tests__/validation.test.ts
```

---

## 4 — Build APK (for submission)

### Option A — EAS Build (recommended)

```bash
# Log in to your Expo account
eas login

# Configure your project (first time only)
eas build:configure

# Build APK (preview profile)
npm run build:apk
```

The APK download link will appear in your terminal once the build completes (usually 5–10 minutes on EAS cloud).

### Option B — Local Build

```bash
# Requires Android Studio and Java 17+
npx expo run:android --variant release
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 5 — Environment Notes

### Permissions Required

The app requests these permissions at runtime:

| Permission | Purpose |
|------------|---------|
| `INTERNET` | Fetch images from Picsum API |
| `READ_MEDIA_IMAGES` (Android 13+) | Save downloaded images |
| `WRITE_EXTERNAL_STORAGE` (Android < 13) | Save downloaded images |
| `NSPhotoLibraryUsageDescription` (iOS) | Save images to camera roll |
| `NSPhotoLibraryAddUsageDescription` (iOS) | Write to photo library |

### Media Download

- **Android 13+ (API 33+)**: Uses `MediaStore` API via `expo-media-library` — no permissions dialog for adding to gallery
- **Android < 13**: Requests `WRITE_EXTERNAL_STORAGE` at runtime
- **iOS**: Requests photo library add permission at runtime

### Avatar Selection

- Uses `expo-image-picker` to select from the device photo library
- Alternatively, 12 built-in preset avatars are always available (no permissions needed)

---

## 6 — Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Metro bundler port in use` | Run `npx expo start --port 8082` |
| `Unable to resolve module` | Delete `node_modules/` and re-run `npm install` |
| `Image download fails on emulator` | Use a physical device for media library features |
| `Network request failed` | Ensure device/emulator has internet access |
| TypeScript path aliases not resolving | Ensure `babel-plugin-module-resolver` is installed |

---

## 7 — Folder Structure

```
GalleryApp/
├── src/
│   ├── api/            # Picsum Photos API client
│   ├── components/
│   │   ├── common/     # Button, Input, ImageCard, SearchBar, etc.
│   │   └── forms/      # RadioButton, CityDropdown
│   ├── constants/      # Colors, cities, storage keys, avatars
│   ├── hooks/          # useDebounce, useApi, usePagination, useSearch, useStorage
│   ├── navigation/     # AppNavigator, AuthNavigator, TabNavigator
│   ├── screens/
│   │   ├── auth/       # LoginScreen, RegisterScreen
│   │   ├── home/       # HomeScreen
│   │   ├── favorites/  # FavoritesScreen
│   │   ├── imageDetails/ # ImageDetailsScreen
│   │   └── profile/    # ProfileScreen, EditProfileScreen
│   ├── services/       # storageService (AsyncStorage wrapper)
│   ├── store/          # Zustand stores: auth, gallery, theme
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # validation, helpers
│   └── __tests__/      # Unit tests
├── App.tsx             # Root component
├── app.json            # Expo config
├── babel.config.js
├── tsconfig.json
├── eas.json            # EAS Build profiles
├── package.json
├── README.md
└── SETUP.md            # ← You are here
```
