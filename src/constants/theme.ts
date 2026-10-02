/**
 * CampusConnect Centralized Design System & Theme Tokens
 */

import '@/global.css';
import { Platform } from 'react-native';
import { EventCategory } from '@/types';

export const Colors = {
  light: {
    // Brand
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    primaryDark: '#1D4ED8',
    primaryText: '#FFFFFF',
    secondary: '#059669',
    secondaryLight: '#ECFDF5',
    secondaryDark: '#047857',
    accent: '#7C3AED',
    accentLight: '#F5F3FF',

    // Base & Surfaces
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',

    // Status Feedback
    success: '#10B981',
    successLight: '#ECFDF5',
    successText: '#047857',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    warningText: '#B45309',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    errorText: '#B91C1C',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
    infoText: '#1D4ED8',
  },
  dark: {
    // Brand
    primary: '#3B82F6',
    primaryLight: '#1E3A8A',
    primaryDark: '#1D4ED8',
    primaryText: '#FFFFFF',
    secondary: '#10B981',
    secondaryLight: '#064E3B',
    secondaryDark: '#059669',
    accent: '#A78BFA',
    accentLight: '#4C1D95',

    // Base & Surfaces
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    background: '#0B0F19',
    card: '#131B2E',
    surface: '#131B2E',
    surfaceElevated: '#1E293B',
    border: '#1E293B',
    borderLight: '#1A2234',
    backgroundElement: '#1A2234',
    backgroundSelected: '#26334D',

    // Status Feedback
    success: '#10B981',
    successLight: '#064E3B',
    successText: '#6EE7B7',
    warning: '#F59E0B',
    warningLight: '#78350F',
    warningText: '#FCD34D',
    error: '#EF4444',
    errorLight: '#7F1D1D',
    errorText: '#FCA5A5',
    info: '#3B82F6',
    infoLight: '#1E3A8A',
    infoText: '#93C5FD',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const CategoryTheme: Record<
  EventCategory,
  { text: string; bg: string; border: string; icon: string }
> = {
  Technical: {
    text: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'code-slash-outline',
  },
  Cultural: {
    text: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    icon: 'musical-notes-outline',
  },
  Sports: {
    text: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: 'football-outline',
  },
  Workshop: {
    text: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: 'bulb-outline',
  },
  Seminar: {
    text: '#0891B2',
    bg: '#ECFEFF',
    border: '#A5F3FC',
    icon: 'school-outline',
  },
  Other: {
    text: '#4B5563',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    icon: 'grid-outline',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    serif: 'var(--font-serif, Georgia, serif)',
    rounded: 'var(--font-rounded, system-ui)',
    mono: 'var(--font-mono, monospace)',
  },
});

export const Typography = {
  size: {
    xs: 11,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const Spacing = {
  none: 0,
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
