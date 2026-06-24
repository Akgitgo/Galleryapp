import { create } from 'zustand';
import { Appearance } from 'react-native';
import { ThemeMode, AppColors } from '../types';
import { lightColors, darkColors } from '../constants/colors';
import { storageService } from '../services/storageService';

interface ThemeState {
  mode: ThemeMode;
  colors: AppColors;
  isDark: boolean;
  isInitialized: boolean;

  // Actions
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: lightColors,
  isDark: false,
  isInitialized: false,

  setTheme: (mode) => {
    const colors = mode === 'dark' ? darkColors : lightColors;
    set({ mode, colors, isDark: mode === 'dark' });
    // Persist async (fire and forget)
    storageService.saveTheme(mode).catch(console.error);
  },

  toggleTheme: () => {
    const { mode, setTheme } = get();
    setTheme(mode === 'light' ? 'dark' : 'light');
  },

  initTheme: async () => {
    try {
      const saved = await storageService.getTheme();
      if (saved) {
        get().setTheme(saved);
      } else {
        // Use device preference as default
        const systemMode = Appearance.getColorScheme();
        get().setTheme(systemMode === 'dark' ? 'dark' : 'light');
      }
    } catch {
      // Fallback to light
      get().setTheme('light');
    } finally {
      set({ isInitialized: true });
    }
  },
}));

// Convenience selector
export const useColors = () => useThemeStore((s) => s.colors);
export const useIsDark = () => useThemeStore((s) => s.isDark);
