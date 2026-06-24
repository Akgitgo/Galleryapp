import { AppColors } from '../types';

export const lightColors: AppColors = {
  primary: '#6C63FF',
  primaryLight: '#9B95FF',
  primaryDark: '#4C46CC',
  secondary: '#FF6B6B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  placeholder: '#9CA3AF',
  inputBackground: '#F9FAFB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  tabBar: '#FFFFFF',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#9CA3AF',
  heartActive: '#EF4444',
  heartInactive: '#D1D5DB',
  shimmer: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors: AppColors = {
  primary: '#8B85FF',
  primaryLight: '#B8B3FF',
  primaryDark: '#6C63FF',
  secondary: '#FF8585',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  card: '#1E1E30',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textDisabled: '#6B7280',
  border: '#2D2D42',
  borderLight: '#252535',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
  placeholder: '#6B7280',
  inputBackground: '#252535',
  overlay: 'rgba(0, 0, 0, 0.7)',
  tabBar: '#1A1A2E',
  tabBarActive: '#8B85FF',
  tabBarInactive: '#6B7280',
  heartActive: '#F87171',
  heartInactive: '#4B5563',
  shimmer: '#2D2D42',
  white: '#FFFFFF',
  black: '#000000',
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Border radius
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Typography
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
