/**
 * TactMeter - Animated gauge showing tone score (0-100)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { SCORE_THRESHOLDS } from '@/types';

interface TactMeterProps {
  score: number;
  size?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TactMeter({ score, size = 180 }: TactMeterProps) {
  const { isDark, colors } = useTheme();
  const animatedScore = useSharedValue(0);

  useEffect(() => {
    animatedScore.value = withSpring(score, {
      damping: 15,
      stiffness: 80,
    });
  }, [score]);

  // Calculate dimensions
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Arc calculations (180 degree arc, from -180 to 0 degrees)
  const startAngle = 180;
  const endAngle = 0;
  const arcLength = Math.PI * radius;

  // Create arc path
  const createArcPath = (startDeg: number, endDeg: number): string => {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = endDeg - startDeg > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const arcPath = createArcPath(startAngle, endAngle);

  // Get color based on score
  const getScoreColor = (value: number): string => {
    if (value < SCORE_THRESHOLDS.BAD) return colors.error;
    if (value < SCORE_THRESHOLDS.OKAY) return colors.warning;
    return colors.success;
  };

  const scoreColor = getScoreColor(score);

  // Animated props for the progress arc
  const animatedArcProps = useAnimatedProps(() => {
    const progress = animatedScore.value / 100;
    const dashLength = arcLength * progress;

    return {
      strokeDashoffset: arcLength - dashLength,
    };
  });

  // Animated needle rotation
  const needleRotation = useDerivedValue(() => {
    return interpolate(animatedScore.value, [0, 100], [-90, 90]);
  });

  // Needle path (small triangle)
  const needleLength = radius * 0.75;
  const needleWidth = 6;

  return (
    <View style={[styles.container, { width: size, height: size * 0.6 }]}>
      <Svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.error} />
            <Stop offset="50%" stopColor={colors.warning} />
            <Stop offset="100%" stopColor={colors.success} />
          </LinearGradient>
        </Defs>

        <G transform={`translate(0, ${-size * 0.4})`}>
          {/* Background arc */}
          <Path
            d={arcPath}
            stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <AnimatedPath
            d={arcPath}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            animatedProps={animatedArcProps}
          />

          {/* Center circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 0.15}
            fill={scoreColor}
          />
        </G>
      </Svg>

      {/* Score display */}
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: scoreColor }]}>
          {Math.round(score)}
        </Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          Tact Score
        </Text>
      </View>
    </View>
  );
}

// Compact version for lists
export function TactMeterMini({ score }: { score: number }) {
  const { colors } = useTheme();

  const getScoreColor = (value: number): string => {
    if (value < SCORE_THRESHOLDS.BAD) return colors.error;
    if (value < SCORE_THRESHOLDS.OKAY) return colors.warning;
    return colors.success;
  };

  return (
    <View style={styles.miniContainer}>
      <View
        style={[
          styles.miniBadge,
          { backgroundColor: getScoreColor(score) + '20' },
        ]}
      >
        <Text
          style={[styles.miniScore, { color: getScoreColor(score) }]}
        >
          {Math.round(score)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scoreContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  miniContainer: {
    alignItems: 'center',
  },
  miniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniScore: {
    fontSize: 14,
    fontWeight: '600',
  },
});
