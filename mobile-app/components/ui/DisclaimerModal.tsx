/**
 * DisclaimerModal - One-time consent gate
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Shield, CheckSquare, Square } from 'lucide-react-native';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useSettingsStore } from '@/store/useAppStore';

export function DisclaimerModal() {
  const { isDark, colors } = useTheme();
  const { selection, success } = useHaptics();
  const { acceptDisclaimer } = useSettingsStore();
  const [accepted, setAccepted] = useState(false);

  const handleToggleAccept = () => {
    selection();
    setAccepted(!accepted);
  };

  const handleEnter = () => {
    if (accepted) {
      success();
      acceptDisclaimer();
    }
  };

  return (
    <Modal visible transparent animationType="fade">
      <BlurView
        intensity={90}
        tint={isDark ? 'dark' : 'light'}
        style={styles.overlay}
      >
        <Animated.View
          entering={FadeInDown.springify().damping(15)}
          style={[
            styles.container,
            {
              backgroundColor: isDark
                ? 'rgba(15, 23, 42, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.accent + '20' },
            ]}
          >
            <Shield size={32} color={colors.accent} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome to Tact
          </Text>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              By using this application, you acknowledge and agree to the
              following:
            </Text>

            <View style={styles.terms}>
              <Text style={[styles.term, { color: colors.textSecondary }]}>
                • This is a personal communication tool designed to help you
                craft more thoughtful messages.
              </Text>
              <Text style={[styles.term, { color: colors.textSecondary }]}>
                • Your messages are processed by AI services (Groq/Google) to
                provide analysis and suggestions.
              </Text>
              <Text style={[styles.term, { color: colors.textSecondary }]}>
                • We do not store or retain your message content on our servers.
              </Text>
              <Text style={[styles.term, { color: colors.textSecondary }]}>
                • This tool is for personal, non-commercial use only.
              </Text>
              <Text style={[styles.term, { color: colors.textSecondary }]}>
                • AI suggestions are advisory only - always review before
                sending any message.
              </Text>
            </View>
          </ScrollView>

          {/* Checkbox */}
          <Pressable onPress={handleToggleAccept} style={styles.checkboxRow}>
            {accepted ? (
              <CheckSquare size={24} color={colors.accent} />
            ) : (
              <Square size={24} color={colors.textMuted} />
            )}
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              I understand and agree to these terms
            </Text>
          </Pressable>

          {/* Button */}
          <Button
            onPress={handleEnter}
            disabled={!accepted}
            fullWidth
            size="lg"
          >
            Enter Tact
          </Button>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 240,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  terms: {
    gap: 12,
  },
  term: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  checkboxLabel: {
    fontSize: 15,
    flex: 1,
  },
});
