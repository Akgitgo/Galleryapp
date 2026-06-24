/**
 * Centralized AsyncStorage key definitions.
 * Prevents key typos and makes refactoring safe.
 */
export const STORAGE_KEYS = {
  // Auth
  SESSION_EMAIL: '@gallery_app:session_email',
  USER_PREFIX: '@gallery_app:user:',

  // Per-user data (append user email)
  FAVORITES_PREFIX: '@gallery_app:favorites:',

  // App settings
  THEME_MODE: '@gallery_app:theme_mode',

  // Cache
  IMAGES_CACHE: '@gallery_app:images_cache',
  IMAGES_CACHE_TIMESTAMP: '@gallery_app:images_cache_ts',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// Cache TTL: 5 minutes
export const CACHE_TTL_MS = 5 * 60 * 1000;
