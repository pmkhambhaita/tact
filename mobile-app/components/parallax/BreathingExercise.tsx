/**
 * BreathingExercise - Calming exercise for stressed users
 * Triggered when panic/stress words are detected
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { X, Wind } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

interface BreathingExerciseProps {
  visible: boolean;
  onClose: () => void;
}

const BREATH_PHASES = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'] as const;
const PHASE_DURATIONS = [4000, 4000, 4000, 4000]; // 4-4-4-4 box breathing

export function BreathingExercise({ visible, onClose }: BreathingExerciseProps) {
  const { isDark, colors } = useTheme();
  const { impactLight } = useHaptics();
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!visible) return;

    // Animate circle
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.3, { duration: 4000 }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000 })
      ),
      -1,
      false
    );

    // Phase transitions
    let currentPhase = 0;
    const phaseInterval = setInterval(() => {
      currentPhase = (currentPhase + 1) % 4;
      setPhase(currentPhase);
      impactLight();
    }, 4000);

    // Countdown timer
    let count = 4;
    const countdownInterval = setInterval(() => {
      count = count > 1 ? count - 1 : 4;
      setCountdown(count);
    }, 1000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(countdownInterval);
      cancelAnimation(scale);
    };
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleClose = () => {
    impactLight();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView
        intensity={90}
        tint={isDark ? 'dark' : 'light'}
        style={styles.overlay}
      >
        {/* Close button */}
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Wind size={24} color={colors.accent} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Let's breathe together
          </Text>

          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Take a moment to center yourself
          </Text>

          {/* Breathing circle */}
          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathCircle,
                { borderColor: colors.accent },
                animatedStyle,
              ]}
            >
              <Text style={[styles.countdown, { color: colors.accent }]}>
                {countdown}
              </Text>
            </Animated.View>
          </View>

          {/* Phase indicator */}
          <Text style={[styles.phase, { color: colors.text }]}>
            {BREATH_PHASES[phase]}
          </Text>

          {/* Phase dots */}
          <View style={styles.phaseDots}>
            {BREATH_PHASES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.phaseDot,
                  {
                    backgroundColor:
                      i === phase ? colors.accent : colors.textMuted + '40',
                  },
                ]}
              />
            ))}
          </View>

          {/* Instructions */}
          <Text style={[styles.instructions, { color: colors.textMuted }]}>
            Follow the expanding circle.{'\n'}
            Tap anywhere when you feel ready.
          </Text>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  breathCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: {
    fontSize: 48,
    fontWeight: '300',
  },
  phase: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  phaseDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
