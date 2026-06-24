import { create } from 'zustand';
import { User, LoginCredentials, RegisterData, EditProfileData } from '../types';
import { storageService } from '../services/storageService';
import { validateLogin, validateRegister, validateEditProfile } from '../utils/validation';
import { generateId, formatName } from '../utils/helpers';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  register: (data: RegisterData) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  logout: () => Promise<void>;
  updateProfile: (data: EditProfileData) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  updateAvatar: (avatar: string) => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials) => {
    // Client-side validation first
    const validation = validateLogin(credentials);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    set({ isLoading: true, error: null });
    try {
      const user = await storageService.getUser(credentials.email);

      if (!user) {
        set({ isLoading: false, error: 'No account found with this email address.' });
        return { success: false, errors: { email: 'No account found with this email address.' } };
      }

      if (user.password !== credentials.password) {
        set({ isLoading: false, error: 'Incorrect password. Please try again.' });
        return { success: false, errors: { password: 'Incorrect password. Please try again.' } };
      }

      await storageService.saveSession(user.email);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      const message = 'Login failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, errors: { general: message } };
    }
  },

  register: async (data) => {
    const validation = validateRegister(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    set({ isLoading: true, error: null });
    try {
      const exists = await storageService.emailExists(data.email);
      if (exists) {
        set({ isLoading: false });
        return {
          success: false,
          errors: { email: 'An account with this email already exists.' },
        };
      }

      const now = new Date().toISOString();
      const newUser: User = {
        id: generateId(),
        fullName: formatName(data.fullName),
        email: data.email.toLowerCase().trim(),
        gender: data.gender,
        mobileNumber: data.mobileNumber.replace(/\D/g, ''),
        address: data.address.trim(),
        city: data.city,
        password: data.password,
        avatar: undefined,
        createdAt: now,
        updatedAt: now,
      };

      await storageService.saveUser(newUser);
      await storageService.saveSession(newUser.email);
      set({ user: newUser, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch {
      const message = 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, errors: { general: message } };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await storageService.clearSession();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  updateProfile: async (data) => {
    const validation = validateEditProfile(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const { user } = get();
    if (!user) return { success: false, errors: { general: 'Not authenticated.' } };

    set({ isLoading: true, error: null });
    try {
      const updated: User = {
        ...user,
        fullName: formatName(data.fullName),
        mobileNumber: data.mobileNumber.replace(/\D/g, ''),
        gender: data.gender,
        address: data.address.trim(),
        city: data.city,
        avatar: data.avatar ?? user.avatar,
        updatedAt: new Date().toISOString(),
      };

      await storageService.updateUser(updated);
      set({ user: updated, isLoading: false });
      return { success: true };
    } catch {
      const message = 'Failed to update profile. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, errors: { general: message } };
    }
  },

  updateAvatar: async (avatar) => {
    const { user } = get();
    if (!user) return;

    const updated: User = { ...user, avatar, updatedAt: new Date().toISOString() };
    await storageService.updateUser(updated);
    set({ user: updated });
  },

  initAuth: async () => {
    try {
      const sessionEmail = await storageService.getSession();
      if (sessionEmail) {
        const user = await storageService.getUser(sessionEmail);
        if (user) {
          set({ user, isAuthenticated: true });
        } else {
          // Session references a deleted user — clear it
          await storageService.clearSession();
        }
      }
    } catch (err) {
      console.error('[AuthStore] initAuth error:', err);
    } finally {
      set({ isInitialized: true });
    }
  },

  clearError: () => set({ error: null }),
}));

// Convenience selectors
export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
