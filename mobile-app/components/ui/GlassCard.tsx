/**
 * GlassCard - iOS Liquid Glass Effect Card
 * Implements the new iOS 26 design language
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  className?: string;
  noPadding?: boolean;
  elevated?: boolean;
  onPress?: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function GlassCard({
  children,
  style,
  intensity = 60,
  noPadding = false,
  elevated = false,
}: GlassCardProps) {
  const { isDark, colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle: ViewStyle = {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...(elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 24,
      elevation: 8,
    }),
  };

  const contentStyle: ViewStyle = {
    padding: noPadding ? 0 : 16,
  };

  // On iOS, use blur effect for true liquid glass
  if (Platform.OS === 'ios') {
    return (
      <Animated.View style={[containerStyle, animatedStyle, style]}>
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill]}
        />
        <View
          style={[
            contentStyle,
            {
              backgroundColor: isDark
                ? 'rgba(30, 41, 59, 0.4)'
                : 'rgba(255, 255, 255, 0.4)',
            },
          ]}
        >
          {children}
        </View>
      </Animated.View>
    );
  }

  // On Android, fall back to translucent background
  return (
    <Animated.View
      style={[
        containerStyle,
        animatedStyle,
        {
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
        },
        style,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </Animated.View>
  );
}

export function GlassPressable({
  children,
  style,
  intensity = 60,
  noPadding = false,
  elevated = false,
  onPress,
}: GlassCardProps) {
  const { isDark, colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle: ViewStyle = {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...(elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.4 : 0.15,
      shadowRadius: 24,
      elevation: 8,
    }),
  };

  const contentStyle: ViewStyle = {
    padding: noPadding ? 0 : 16,
  };

  if (Platform.OS === 'ios') {
    return (
      <Animated.View
        style={[containerStyle, animatedStyle, style]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
      >
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill]}
        />
        <View
          style={[
            contentStyle,
            {
              backgroundColor: isDark
                ? 'rgba(30, 41, 59, 0.4)'
                : 'rgba(255, 255, 255, 0.4)',
            },
          ]}
        >
          {children}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        containerStyle,
        animatedStyle,
        {
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
        },
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <View style={contentStyle}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({});
