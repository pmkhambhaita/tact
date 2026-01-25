/**
 * Tact Mobile - Theme Hook
 * Provides theme state and utilities
 */

import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/useAppStore';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Accents
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  error: string;

  // Glass effects
  glassBackground: string;
  glassBorder: string;
}

const lightColors: ThemeColors = {
  background: '#f8fafc',       // slate-50
  backgroundSecondary: '#f1f5f9', // slate-100
  card: 'rgba(255, 255, 255, 0.72)',
  cardBorder: 'rgba(255, 255, 255, 0.18)',

  text: '#0f172a',             // slate-900
  textSecondary: '#334155',     // slate-700
  textMuted: '#64748b',         // slate-500

  accent: '#f97316',            // orange-500
  accentLight: '#ffedd5',       // orange-100
  success: '#22c55e',           // green-500
  warning: '#f59e0b',           // amber-500
  error: '#ef4444',             // red-500

  glassBackground: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
};

const darkColors: ThemeColors = {
  background: '#0f172a',        // slate-900
  backgroundSecondary: '#1e293b', // slate-800
  card: 'rgba(30, 41, 59, 0.72)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',

  text: '#f8fafc',              // slate-50
  textSecondary: '#e2e8f0',      // slate-200
  textMuted: '#94a3b8',          // slate-400

  accent: '#f97316',             // orange-500
  accentLight: '#431407',        // orange-950
  success: '#22c55e',            // green-500
  warning: '#f59e0b',            // amber-500
  error: '#ef4444',              // red-500

  glassBackground: 'rgba(30, 41, 59, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { settings, setTheme } = useSettingsStore();

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && systemColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    if (settings.theme === 'system') {
      setTheme(isDark ? 'light' : 'dark');
    } else {
      setTheme(isDark ? 'light' : 'dark');
    }
  };

  return {
    isDark,
    colors,
    theme: settings.theme,
    setTheme,
    toggleTheme,
  };
}

export { lightColors, darkColors };
