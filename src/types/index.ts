// ─── User & Auth ─────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  fullName: string;
  email: string;
  gender: Gender;
  mobileNumber: string;
  address: string;
  city: string;
  password: string;
  avatar?: string; // base64 or predefined avatar key
  createdAt: string;
  updatedAt: string;
}

export type UserProfile = Omit<User, 'password' | 'createdAt' | 'updatedAt'>;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  gender: Gender;
  mobileNumber: string;
  address: string;
  city: string;
  password: string;
  confirmPassword: string;
}

export interface EditProfileData {
  fullName: string;
  mobileNumber: string;
  gender: Gender;
  address: string;
  city: string;
  avatar?: string;
}

// ─── API / Gallery ────────────────────────────────────────────────────────────

export interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export type FilterType = 'all' | 'a-m' | 'n-z';

// ─── Theme ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark';

export interface AppColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  borderLight: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  placeholder: string;
  inputBackground: string;
  overlay: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  heartActive: string;
  heartInactive: string;
  shimmer: string;
  white: string;
  black: string;
}

// ─── Navigation Param Lists ───────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ImageDetails: { image: PicsumImage; fromFavorites?: boolean };
};

export type FavoritesStackParamList = {
  Favorites: undefined;
  ImageDetails: { image: PicsumImage; fromFavorites?: boolean };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Splash: undefined;
};

// ─── API State ────────────────────────────────────────────────────────────────

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface PaginatedState<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string | null;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export interface StorageResult<T> {
  data: T | null;
  error: string | null;
}
