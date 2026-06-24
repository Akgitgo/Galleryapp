import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, CACHE_TTL_MS } from '../constants/storageKeys';
import { User, PicsumImage, ThemeMode } from '../types';

/**
 * StorageService
 * Centralised, typed wrapper around AsyncStorage.
 * All methods return a consistent { data, error } result type
 * so callers never have to catch individually.
 */
class StorageService {
  // ─── Generic primitives ──────────────────────────────────────────────────

  private async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  private async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  }

  private async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  // ─── Session ─────────────────────────────────────────────────────────────

  async saveSession(email: string): Promise<void> {
    await this.set(STORAGE_KEYS.SESSION_EMAIL, email);
  }

  async getSession(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.SESSION_EMAIL);
  }

  async clearSession(): Promise<void> {
    await this.remove(STORAGE_KEYS.SESSION_EMAIL);
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  async saveUser(user: User): Promise<void> {
    const key = STORAGE_KEYS.USER_PREFIX + user.email.toLowerCase();
    await this.set(key, user);
  }

  async getUser(email: string): Promise<User | null> {
    const key = STORAGE_KEYS.USER_PREFIX + email.toLowerCase();
    return this.get<User>(key);
  }

  async updateUser(user: User): Promise<void> {
    await this.saveUser({ ...user, updatedAt: new Date().toISOString() });
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.getUser(email);
    return user !== null;
  }

  // ─── Favorites ────────────────────────────────────────────────────────────

  async getFavorites(userEmail: string): Promise<string[]> {
    const key = STORAGE_KEYS.FAVORITES_PREFIX + userEmail.toLowerCase();
    return (await this.get<string[]>(key)) ?? [];
  }

  async saveFavorites(userEmail: string, favoriteIds: string[]): Promise<void> {
    const key = STORAGE_KEYS.FAVORITES_PREFIX + userEmail.toLowerCase();
    await this.set(key, favoriteIds);
  }

  async toggleFavorite(userEmail: string, imageId: string): Promise<string[]> {
    const current = await this.getFavorites(userEmail);
    const updated = current.includes(imageId)
      ? current.filter((id) => id !== imageId)
      : [...current, imageId];
    await this.saveFavorites(userEmail, updated);
    return updated;
  }

  // ─── Theme ────────────────────────────────────────────────────────────────

  async getTheme(): Promise<ThemeMode | null> {
    return this.get<ThemeMode>(STORAGE_KEYS.THEME_MODE);
  }

  async saveTheme(mode: ThemeMode): Promise<void> {
    await this.set(STORAGE_KEYS.THEME_MODE, mode);
  }

  // ─── Image cache ──────────────────────────────────────────────────────────

  async getCachedImages(): Promise<PicsumImage[] | null> {
    const tsRaw = await AsyncStorage.getItem(STORAGE_KEYS.IMAGES_CACHE_TIMESTAMP);
    if (!tsRaw) return null;

    const ts = parseInt(tsRaw, 10);
    const isExpired = Date.now() - ts > CACHE_TTL_MS;
    if (isExpired) {
      await this.clearImageCache();
      return null;
    }

    return this.get<PicsumImage[]>(STORAGE_KEYS.IMAGES_CACHE);
  }

  async setCachedImages(images: PicsumImage[]): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.IMAGES_CACHE, JSON.stringify(images)],
      [STORAGE_KEYS.IMAGES_CACHE_TIMESTAMP, Date.now().toString()],
    ]);
  }

  async clearImageCache(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.IMAGES_CACHE,
      STORAGE_KEYS.IMAGES_CACHE_TIMESTAMP,
    ]);
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }

  async clearUserData(userEmail: string): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.FAVORITES_PREFIX + userEmail.toLowerCase(),
    ]);
  }
}

export const storageService = new StorageService();
