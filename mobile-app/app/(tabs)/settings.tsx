/**
 * Settings Screen - App configuration
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Sun,
  Moon,
  Smartphone,
  Vibrate,
  Info,
  ExternalLink,
  Shield,
  Heart,
  Github,
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useSettingsStore } from '@/store/useAppStore';
import { ThemeMode } from '@/types';

export default function SettingsScreen() {
  const { isDark, colors, theme, setTheme } = useTheme();
  const { selection, impactLight } = useHaptics();
  const { settings, updateSettings } = useSettingsStore();

  const handleThemeChange = (newTheme: ThemeMode) => {
    selection();
    setTheme(newTheme);
  };

  const handleHapticToggle = (value: boolean) => {
    impactLight();
    updateSettings({ hapticFeedback: value });
  };

  const handleLinkPress = (url: string) => {
    impactLight();
    Linking.openURL(url);
  };

  const themeOptions: { value: ThemeMode; icon: any; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Smartphone, label: 'System' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            Appearance
          </Text>
          <GlassCard style={styles.card}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Theme
            </Text>
            <View style={styles.themeSelector}>
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <Pressable
                  key={value}
                  onPress={() => handleThemeChange(value)}
                  style={[
                    styles.themeOption,
                    theme === value && {
                      backgroundColor: colors.accent + '20',
                      borderColor: colors.accent,
                    },
                  ]}
                >
                  <Icon
                    size={20}
                    color={theme === value ? colors.accent : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      {
                        color:
                          theme === value ? colors.accent : colors.textMuted,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Interaction Section */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            Interaction
          </Text>
          <GlassCard style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Vibrate size={20} color={colors.accent} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Haptic Feedback
                  </Text>
                  <Text
                    style={[styles.settingDesc, { color: colors.textMuted }]}
                  >
                    Vibration on interactions
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={handleHapticToggle}
                trackColor={{
                  false: colors.textMuted + '40',
                  true: colors.accent,
                }}
                thumbColor="#fff"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            About
          </Text>
          <GlassCard style={styles.card} noPadding>
            <Pressable
              style={styles.linkRow}
              onPress={() => handleLinkPress('https://github.com/your-repo/tact')}
            >
              <View style={styles.linkInfo}>
                <Github size={20} color={colors.textSecondary} />
                <Text style={[styles.linkLabel, { color: colors.text }]}>
                  Source Code
                </Text>
              </View>
              <ExternalLink size={16} color={colors.textMuted} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

            <Pressable
              style={styles.linkRow}
              onPress={() => handleLinkPress('https://tact.app/privacy')}
            >
              <View style={styles.linkInfo}>
                <Shield size={20} color={colors.textSecondary} />
                <Text style={[styles.linkLabel, { color: colors.text }]}>
                  Privacy Policy
                </Text>
              </View>
              <ExternalLink size={16} color={colors.textMuted} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

            <View style={styles.linkRow}>
              <View style={styles.linkInfo}>
                <Info size={20} color={colors.textSecondary} />
                <Text style={[styles.linkLabel, { color: colors.text }]}>
                  Version
                </Text>
              </View>
              <Text style={[styles.versionText, { color: colors.textMuted }]}>
                1.0.0
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={styles.footer}
        >
          <View style={styles.footerContent}>
            <Heart size={16} color={colors.accent} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Say what you mean, without the mean
            </Text>
          </View>
          <Text style={[styles.copyright, { color: colors.textMuted }]}>
            Powered by Groq & Google AI
          </Text>
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  linkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  versionText: {
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  copyright: {
    fontSize: 12,
  },
  bottomPadding: {
    height: 120,
  },
});
