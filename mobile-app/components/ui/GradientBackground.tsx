/**
 * GradientBackground - Animated gradient background (simplified shader replacement)
 */

import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const { width, height } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function GradientBackground() {
  const { isDark } = useTheme();
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 20000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animation.value, [0, 1], [0, -50]);
    const scale = interpolate(animation.value, [0, 0.5, 1], [1, 1.05, 1]);
    const opacity = interpolate(animation.value, [0, 0.5, 1], [0.8, 1, 0.8]);

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const darkColors = [
    '#0f172a', // slate-900
    '#1e293b', // slate-800
    '#0f172a', // slate-900
    '#1e1b4b', // indigo-950 hint
  ] as const;

  const lightColors = [
    '#f8fafc', // slate-50
    '#e2e8f0', // slate-200
    '#f1f5f9', // slate-100
    '#fff7ed', // orange-50 hint
  ] as const;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={isDark ? darkColors : lightColors}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle overlay gradient for depth */}
      <LinearGradient
        colors={
          isDark
            ? ['transparent', 'rgba(249, 115, 22, 0.03)', 'transparent']
            : ['transparent', 'rgba(249, 115, 22, 0.05)', 'transparent']
        }
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.overlay]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width * 1.2,
    height: height * 1.2,
    left: -width * 0.1,
    top: -height * 0.1,
  },
  overlay: {
    opacity: 0.5,
  },
});
