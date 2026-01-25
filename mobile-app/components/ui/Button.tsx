/**
 * Button - iOS-style buttons with haptic feedback
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { isDark, colors } = useTheme();
  const { impactLight } = useHaptics();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    impactLight();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = (): string => {
    if (disabled) return isDark ? '#334155' : '#e2e8f0';
    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'secondary':
        return isDark ? '#334155' : '#f1f5f9';
      case 'ghost':
        return 'transparent';
      case 'outline':
        return 'transparent';
      default:
        return colors.accent;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return isDark ? '#64748b' : '#94a3b8';
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return isDark ? '#f8fafc' : '#0f172a';
      case 'ghost':
        return colors.accent;
      case 'outline':
        return isDark ? '#f8fafc' : '#0f172a';
      default:
        return '#ffffff';
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
          text: { fontSize: 14 },
        };
      case 'md':
        return {
          button: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16 },
          text: { fontSize: 16 },
        };
      case 'lg':
        return {
          button: { paddingHorizontal: 28, paddingVertical: 18, borderRadius: 20 },
          text: { fontSize: 18 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        sizeStyles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? (isDark ? '#475569' : '#cbd5e1') : undefined,
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: getTextColor() },
              icon ? { marginLeft: 8 } : undefined,
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
});
