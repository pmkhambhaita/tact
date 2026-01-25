/**
 * Tact (Tone Coach) - Main Editor Screen
 * Analyzes messages for tone and provides suggestions
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Clipboard,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import {
  Send,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Users,
  Eye,
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextInput';
import { ChipSelector } from '@/components/ui/ChipSelector';
import { TactMeter } from '@/components/tact/TactMeter';
import { SmartText } from '@/components/tact/SmartText';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useTactHistoryStore } from '@/store/useAppStore';
import { analyzeMessage } from '@/lib/api';
import {
  AnalysisResult,
  AnalysisSettings,
  RECEIVER_TYPES,
  TONE_TYPES,
  SCORE_THRESHOLDS,
} from '@/types';

export default function TactScreen() {
  const { isDark, colors } = useTheme();
  const { success, error: hapticError } = useHaptics();
  const { addItem } = useTactHistoryStore();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  // State
  const [input, setInput] = useState('');
  const [settings, setSettings] = useState<AnalysisSettings>({
    receiverType: 'Boss',
    intendedTone: 'Professional',
    userTraits: '',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await analyzeMessage(input, settings);
      setResult(data);
      success();

      // Save to history
      addItem({ input, settings, result: data });

      // Scroll to top to see results
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      hapticError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.rewritten_message) {
      await Clipboard.setString(result.rewritten_message);
      setCopied(true);
      success();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInput('');
    setError(null);
    inputRef.current?.focus();
  };

  const characterCount = input.length;
  const isOverLimit = characterCount > 2500;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          {result ? (
            <Pressable onPress={handleReset} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.text} />
              <Text style={[styles.backText, { color: colors.text }]}>
                New Analysis
              </Text>
            </Pressable>
          ) : (
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Tact</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Say what you mean, without the mean
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!result ? (
            // Editor View
            <Animated.View entering={FadeIn} layout={Layout}>
              {/* Message Input */}
              <GlassCard elevated style={styles.card}>
                <TextArea
                  ref={inputRef}
                  placeholder="Type your message here..."
                  value={input}
                  onChangeText={setInput}
                  maxLength={2500}
                  style={styles.textArea}
                />
                <View style={styles.charCount}>
                  <Text
                    style={[
                      styles.charCountText,
                      {
                        color: isOverLimit ? colors.error : colors.textMuted,
                      },
                    ]}
                  >
                    {characterCount}/2500
                  </Text>
                </View>
              </GlassCard>

              {/* Settings */}
              <GlassCard elevated style={styles.card}>
                <View style={styles.settingsHeader}>
                  <Sparkles size={18} color={colors.accent} />
                  <Text style={[styles.settingsTitle, { color: colors.text }]}>
                    Context
                  </Text>
                </View>

                <ChipSelector
                  label="Who are you messaging?"
                  options={RECEIVER_TYPES}
                  selected={settings.receiverType}
                  onSelect={(value) =>
                    setSettings((s) => ({ ...s, receiverType: value }))
                  }
                />

                <ChipSelector
                  label="Intended tone"
                  options={TONE_TYPES}
                  selected={settings.intendedTone}
                  onSelect={(value) =>
                    setSettings((s) => ({ ...s, intendedTone: value }))
                  }
                />
              </GlassCard>

              {/* Error */}
              {error && (
                <Animated.View entering={FadeInDown} exiting={FadeOut}>
                  <GlassCard style={[styles.card, styles.errorCard]}>
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {error}
                    </Text>
                  </GlassCard>
                </Animated.View>
              )}

              {/* Analyze Button */}
              <Button
                onPress={handleAnalyze}
                loading={isLoading}
                disabled={!input.trim() || isOverLimit}
                fullWidth
                size="lg"
                icon={<Send size={20} color="#fff" />}
              >
                Analyze Tone
              </Button>
            </Animated.View>
          ) : (
            // Results View
            <Animated.View entering={FadeIn} layout={Layout}>
              {/* Score */}
              <GlassCard elevated style={styles.card}>
                <TactMeter score={result.score} />
              </GlassCard>

              {/* Summary */}
              <GlassCard elevated style={styles.card}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Analysis
                </Text>
                <Text
                  style={[styles.summaryText, { color: colors.textSecondary }]}
                >
                  {result.summary}
                </Text>
              </GlassCard>

              {/* Audience Perception */}
              <GlassCard elevated style={styles.card}>
                <View style={styles.perceptionHeader}>
                  <Users size={18} color={colors.accent} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    How It Sounds
                  </Text>
                </View>

                <View style={styles.perceptionItem}>
                  <Text
                    style={[styles.perceptionLabel, { color: colors.textMuted }]}
                  >
                    To your {settings.receiverType.toLowerCase()}
                  </Text>
                  <Text
                    style={[
                      styles.perceptionValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {result.audience_perception.primary_receiver}
                  </Text>
                </View>

                <View style={[styles.perceptionItem, styles.noBorder]}>
                  <View style={styles.observerLabel}>
                    <Eye size={14} color={colors.textMuted} />
                    <Text
                      style={[
                        styles.perceptionLabel,
                        { color: colors.textMuted, marginLeft: 6 },
                      ]}
                    >
                      Neutral observer
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.perceptionValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {result.audience_perception.neutral_observer}
                  </Text>
                </View>
              </GlassCard>

              {/* Rewritten Message */}
              {result.rewritten_message &&
                result.score < SCORE_THRESHOLDS.GOOD && (
                  <Animated.View entering={FadeInDown.delay(200)}>
                    <GlassCard
                      elevated
                      style={[styles.card, styles.rewriteCard]}
                    >
                      <View style={styles.rewriteHeader}>
                        <View style={styles.rewriteTitle}>
                          <Sparkles size={18} color={colors.success} />
                          <Text
                            style={[styles.sectionTitle, { color: colors.text }]}
                          >
                            Suggested Revision
                          </Text>
                        </View>
                        {result.rewritten_score && (
                          <View
                            style={[
                              styles.scoreBadge,
                              { backgroundColor: colors.success + '20' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.scoreBadgeText,
                                { color: colors.success },
                              ]}
                            >
                              {result.rewritten_score}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.rewriteText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {result.rewritten_message}
                      </Text>

                      <Button
                        onPress={handleCopy}
                        variant="secondary"
                        size="sm"
                        icon={
                          copied ? (
                            <Check size={16} color={colors.success} />
                          ) : (
                            <Copy size={16} color={colors.textSecondary} />
                          )
                        }
                        style={styles.copyButton}
                      >
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                      </Button>
                    </GlassCard>
                  </Animated.View>
                )}

              {/* Highlighted Text */}
              {result.highlights.length > 0 && (
                <Animated.View entering={FadeInDown.delay(300)}>
                  <GlassCard elevated style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Feedback
                    </Text>
                    <Text
                      style={[styles.tapHint, { color: colors.textMuted }]}
                    >
                      Tap highlighted words for suggestions
                    </Text>
                    <View style={styles.smartTextContainer}>
                      <SmartText text={input} highlights={result.highlights} />
                    </View>
                  </GlassCard>
                </Animated.View>
              )}

              {/* New Analysis Button */}
              <Button
                onPress={handleReset}
                variant="outline"
                fullWidth
                size="lg"
                icon={<RefreshCw size={20} color={colors.text} />}
                style={styles.newAnalysisButton}
              >
                Analyze New Message
              </Button>
            </Animated.View>
          )}

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCountText: {
    fontSize: 12,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  perceptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  perceptionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  perceptionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  perceptionValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  observerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewriteCard: {
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  rewriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewriteTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rewriteText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  copyButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  tapHint: {
    fontSize: 12,
    marginBottom: 12,
  },
  smartTextContainer: {
    paddingVertical: 8,
  },
  newAnalysisButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 120,
  },
});
