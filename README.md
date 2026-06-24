# GalleryApp 📸

A production-quality React Native image gallery application built with Expo SDK 51 and TypeScript. Implements a complete authentication flow, profile management, and a fully-featured image gallery dashboard powered by the [Picsum Photos API](https://picsum.photos).

---

## Features

### Authentication
- **Register** — Full name, email, gender (radio buttons), mobile (10-digit Indian), address, city (dropdown), password with confirmation
- **Login** — Email + password validation against locally stored credentials
- **Session Persistence** — Login state survives app restarts via AsyncStorage

### Image Gallery (Home Screen)
- **Grid layout** — 2-column FlatList with optimised rendering
- **Infinite scroll** — Loads 20 images per page from Picsum API; fetches next page on scroll-end
- **Pull-to-refresh** — Deduplication guard prevents double fetches
- **Skeleton loaders** — Animated shimmer placeholders during initial load
- **Search** — Case-insensitive real-time author name search with 350ms debounce
- **Filter** — Pills: All Images / Author A–M / Author N–Z
- **Search + Filter together** — Filters are composed; both work simultaneously

### Favorites
- Heart button on every card with bounce animation
- Persisted to AsyncStorage per user (survives restarts)
- Optimistic UI update with rollback on storage failure
- Dedicated Favorites tab with own search bar
- Confirmation dialog on remove

### Image Details
- Full-resolution image display with loading indicator
- Author name, Image ID, resolution metadata
- **Full-screen viewer** — Modal with black background and expand tap
- **Download** — Saves to device gallery via `expo-media-library` with progress indicator
- **Share** — Native share sheet via `expo-sharing` (shares file) or `Share.share` (shares URL)

### Profile
- Displays all user info with icon rows
- **Avatar selection** — Pick from 12 built-in presets OR choose from photo library
- Member-since date and favorites count stats
- Edit Profile with full form (except email)
- Logout with confirmation

### Dark Mode
- System preference detected on first launch
- Toggle button in gallery header (sun/moon icon)
- Persisted to AsyncStorage
- All screens, modals, and components respect the active theme

---

## Architecture

### State Management — Zustand

Three stores with clean separation:

| Store | Responsibility |
|-------|----------------|
| `authStore` | User object, session, login/register/logout/updateProfile |
| `galleryStore` | Images, pagination, favorites, search query, filter type |
| `themeStore` | Light/dark mode, colour palette |

**Selectors** are exported from each store for memoized, targeted subscriptions:
```ts
const filteredImages = useGalleryStore(selectFilteredImages);
const isFav = useGalleryStore(selectIsFavorite(imageId));
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useDebounce<T>` | Generic debounce with configurable delay |
| `useSearch` | Wires search input → debounce → store |
| `usePagination` | FlatList handlers with double-trigger guard |
| `useApi<T>` | Generic one-shot API call with loading/error state |
| `useStorage` | Typed AsyncStorage operations with loading state |

### Services

**`StorageService`** — Centralised AsyncStorage wrapper:
- Typed getters/setters for users, session, favorites, theme, image cache
- Cache TTL of 5 minutes for API responses
- `multiSet` for atomic writes where applicable

### API

**`picsumApi.ts`** — Thin client with:
- 10-second request timeout via `AbortController`
- Typed `ApiError` with status codes
- Retry utility available in `helpers.ts`

---

## Navigation

```
RootStack
├── Auth (not authenticated)
│   ├── Login
│   └── Register
└── Main (authenticated)
    ├── HomeTab → HomeStack
    │   ├── Home
    │   └── ImageDetails
    ├── FavoritesTab → FavoritesStack
    │   ├── FavoritesHome
    │   └── ImageDetails
    └── ProfileTab → ProfileStack
        ├── ProfileHome
        └── EditProfile
```

Navigation reacts to `isAuthenticated` in `authStore`. Switching between auth states is handled by replacing the root screen with a `fade` animation.

---

## Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | React Native (Expo) | SDK 51 |
| Language | TypeScript | ^5.3 |
| Navigation | React Navigation v6 | Native Stack + Bottom Tabs |
| State | Zustand | ^4.5 |
| Storage | @react-native-async-storage | 1.23.1 |
| Icons | @expo/vector-icons (Ionicons) | ^14 |
| File download | expo-file-system | ~17.0 |
| Gallery save | expo-media-library | ~16.0 |
| File sharing | expo-sharing | ~12.0 |
| Image picker | expo-image-picker | ~15.0 |
| Testing | Jest + jest-expo + @testing-library/react-native | ^29 |

---

## Assumptions Made

1. **No real backend** — All auth is simulated via AsyncStorage. Passwords are stored as plain strings (acceptable for an intern assignment; production would use bcrypt + a real API).
2. **Email as unique key** — Email is used as the primary user identifier in AsyncStorage.
3. **Favorites per user** — Favorites are scoped to the logged-in user's email, so two users on the same device have independent favorites.
4. **Indian phone numbers** — Mobile validation expects 10-digit numbers starting with 6–9.
5. **Pagination resets on refresh** — Pull-to-refresh resets to page 1 and replaces all images.
6. **No offline cache fallback** — The 5-minute image cache is a nice-to-have; the app still works without it.
7. **Avatar URIs** — Preset avatars are loaded from the DiceBear API. Custom avatars from the gallery are stored as base64 in AsyncStorage (small size expected for profile photos).
8. **ImageDetails screen** — The screen receives the `PicsumImage` object via navigation params so it doesn't need a separate API call.

---

## Testing

```bash
npm test                  # Run all tests
npm run test:coverage     # Run with coverage report
```

### Test Coverage

| File | What's tested |
|------|--------------|
| `validation.test.ts` | All field validators and form-level validators |
| `helpers.test.ts` | capitalize, formatName, truncate, getInitials, URL builders, filter, search, applyFilterAndSearch, generateId, formatDate |
| `authStore.test.ts` | login (validation, not found, wrong pw, success), register (validation, duplicate email, success), logout, initAuth (restore, stale session, no session), updateProfile |
| `galleryStore.test.ts` | fetchImages (load, skip if loaded, error, refresh), toggleFavorite (add, remove, rollback), selectFilteredImages (all/a-m/n-z/search+filter), selectIsFavorite, initFavorites, resetGallery |

---

## Folder Structure

```
GalleryApp/
├── src/
│   ├── api/
│   │   └── picsumApi.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── SearchBar.tsx
│   │   └── forms/
│   │       ├── CityDropdown.tsx
│   │       └── RadioButton.tsx
│   ├── constants/
│   │   ├── avatars.ts
│   │   ├── cities.ts
│   │   ├── colors.ts
│   │   └── storageKeys.ts
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useDebounce.ts
│   │   ├── usePagination.ts
│   │   ├── useSearch.ts
│   │   └── useStorage.ts
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── favorites/
│   │   │   └── FavoritesScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── imageDetails/
│   │   │   └── ImageDetailsScreen.tsx
│   │   └── profile/
│   │       ├── EditProfileScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── services/
│   │   └── storageService.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── galleryStore.ts
│   │   └── themeStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── validation.ts
│   └── __tests__/
│       ├── authStore.test.ts
│       ├── galleryStore.test.ts
│       ├── helpers.test.ts
│       └── validation.test.ts
├── App.tsx
├── app.json
├── babel.config.js
├── eas.json
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── SETUP.md
```

---

## Pre-mortem & Design Decisions

Before building, the following risks were identified and mitigated:

| Risk | Mitigation |
|------|-----------|
| Search + filter + pagination creating race conditions | Derived `filteredImages` is computed synchronously from `allImages` in Zustand selector; pagination fetches new API pages without interfering with client-side filtering |
| AsyncStorage concurrent writes | `StorageService` class encapsulates all writes; favorites rollback on failure |
| FlatList re-rendering all cards on favorite toggle | `ImageCardWrapper` subscribes only to `selectIsFavorite(id)` — only the toggled card re-renders |
| Image download permissions differ by Android API level | `expo-media-library` handles the API level difference internally; we just call `requestPermissionsAsync()` |
| Session pointing to deleted user after AsyncStorage clear | `initAuth` validates that the user record exists; clears stale session if not |
| Double-trigger on infinite scroll | `usePagination` guards with a 500ms timestamp check and in-flight flag |
| TypeScript navigation types breaking | All param lists declared in `navigation/types.ts` and globally augmented; `NativeStackScreenProps` used everywhere |

---

## Bonus Features Implemented

- ✅ **Dark Mode** with system detection and persistence
- ✅ **Debounced Search** (350ms, custom `useDebounce` hook)
- ✅ **Profile Avatar Selection** (12 presets + photo library picker)
- ✅ **Reusable Components** (Button, Input, SearchBar, FilterBar, ImageCard, Avatar, EmptyState, Loader variants)
- ✅ **Custom Hooks** (useApi, usePagination, useSearch, useStorage, useDebounce)
- ✅ **Image Sharing** (native share sheet via expo-sharing)
- ✅ **Pull-to-Refresh Optimisation** (duplicate-call guard in usePagination)
- ✅ **Unit Tests** (validation, helpers, authStore, galleryStore)

---

## Author

Built as a React Native intern assignment demonstration.  
API: [picsum.photos](https://picsum.photos) by David Marby & Nijiko Yonskai.
