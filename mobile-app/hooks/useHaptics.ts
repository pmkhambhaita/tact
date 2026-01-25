/**
 * Tact Mobile - Haptics Hook
 * Provides haptic feedback utilities
 */

import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/useAppStore';

export function useHaptics() {
  const { settings } = useSettingsStore();

  const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(style);
    }
  };

  const notification = (type: Haptics.NotificationFeedbackType) => {
    if (settings.hapticFeedback) {
      Haptics.notificationAsync(type);
    }
  };

  const selection = () => {
    if (settings.hapticFeedback) {
      Haptics.selectionAsync();
    }
  };

  return {
    impact,
    notification,
    selection,
    impactLight: () => impact(Haptics.ImpactFeedbackStyle.Light),
    impactMedium: () => impact(Haptics.ImpactFeedbackStyle.Medium),
    impactHeavy: () => impact(Haptics.ImpactFeedbackStyle.Heavy),
    success: () => notification(Haptics.NotificationFeedbackType.Success),
    warning: () => notification(Haptics.NotificationFeedbackType.Warning),
    error: () => notification(Haptics.NotificationFeedbackType.Error),
  };
}
