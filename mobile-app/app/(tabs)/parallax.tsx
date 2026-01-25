/**
 * Parallax (Decision Helper) - Devil's Advocate Chat
 * 3-phase process: Input -> Strategy -> Execution
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import {
  Send,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Brain,
  Target,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react-native';
import { GlassCard, GlassPressable } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextInput';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useParallaxStore } from '@/store/useAppStore';
import { parallaxChat, parallaxDraft } from '@/lib/api';
import { ParallaxOption, ParallaxResponse, RISK_COLORS } from '@/types';
import { router } from 'expo-router';

type Phase = 0 | 1 | 2;

export default function ParallaxScreen() {
  const { isDark, colors } = useTheme();
  const { success, error: hapticError, impactMedium } = useHaptics();
  const { addSession, updateSession, currentSession, setCurrentSession } =
    useParallaxStore();
  const scrollRef = useRef<ScrollView>(null);

  // State
  const [phase, setPhase] = useState<Phase>(0);
  const [situation, setSituation] = useState('');
  const [response, setResponse] = useState<ParallaxResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<ParallaxOption | null>(
    null
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmitSituation = async () => {
    if (!situation.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await parallaxChat(situation);
      setResponse(data);

      // Save session
      await addSession({ situation, response: data });

      setPhase(1);
      success();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      hapticError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option: ParallaxOption) => {
    impactMedium();
    setSelectedOption(option);
    setPhase(2);

    // Update session
    if (currentSession) {
      updateSession(currentSession.id, { selectedOption: option });
    }

    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleGenerateDraft = async () => {
    if (!selectedOption) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await parallaxDraft(situation, selectedOption);
      setDraft(data.draft);

      // Update session
      if (currentSession) {
        updateSession(currentSession.id, { draft: data.draft });
      }

      success();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft generation failed');
      hapticError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (draft) {
      await Clipboard.setString(draft);
      setCopied(true);
      success();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseDraftInTact = () => {
    // Navigate to Tact with pre-filled draft
    // This would require passing the draft via navigation params
    router.push({
      pathname: '/(tabs)',
      params: { prefill: draft || '' },
    });
  };

  const handleReset = () => {
    setPhase(0);
    setSituation('');
    setResponse(null);
    setSelectedOption(null);
    setDraft(null);
    setError(null);
    setCurrentSession(null);
  };

  const getRiskColor = (level: ParallaxOption['risk_level']) =>
    RISK_COLORS[level];

  const getPhaseTitle = () => {
    switch (phase) {
      case 0:
        return "What's happening?";
      case 1:
        return 'Your Options';
      case 2:
        return 'Game Plan';
    }
  };

  const getPhaseSubtitle = () => {
    switch (phase) {
      case 0:
        return 'Describe your situation and let me help you think it through';
      case 1:
        return 'Choose a strategy that feels right for your situation';
      case 2:
        return "Here's how to execute your chosen approach";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          {phase > 0 ? (
            <Pressable
              onPress={() => setPhase((p) => (p - 1) as Phase)}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color={colors.text} />
              <Text style={[styles.backText, { color: colors.text }]}>
                Back
              </Text>
            </Pressable>
          ) : (
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Parallax
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Your workplace devil's advocate
              </Text>
            </View>
          )}

          {/* Phase indicator */}
          <View style={styles.phaseIndicator}>
            {[0, 1, 2].map((p) => (
              <View
                key={p}
                style={[
                  styles.phaseDot,
                  {
                    backgroundColor:
                      p <= phase ? colors.accent : colors.textMuted + '40',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Phase Header */}
          <Animated.View entering={FadeIn} key={phase}>
            <Text style={[styles.phaseTitle, { color: colors.text }]}>
              {getPhaseTitle()}
            </Text>
            <Text
              style={[styles.phaseSubtitle, { color: colors.textSecondary }]}
            >
              {getPhaseSubtitle()}
            </Text>
          </Animated.View>

          {/* Phase 0: Input */}
          {phase === 0 && (
            <Animated.View entering={FadeIn} layout={Layout}>
              <GlassCard elevated style={styles.card}>
                <TextArea
                  placeholder="Tell me what's going on at work..."
                  value={situation}
                  onChangeText={setSituation}
                  style={styles.textArea}
                />
              </GlassCard>

              {error && (
                <Animated.View entering={FadeInDown}>
                  <GlassCard style={[styles.card, styles.errorCard]}>
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {error}
                    </Text>
                  </GlassCard>
                </Animated.View>
              )}

              <Button
                onPress={handleSubmitSituation}
                loading={isLoading}
                disabled={!situation.trim()}
                fullWidth
                size="lg"
                icon={<Brain size={20} color="#fff" />}
              >
                Analyze Situation
              </Button>
            </Animated.View>
          )}

          {/* Phase 1: Strategy Options */}
          {phase === 1 && response && (
            <Animated.View entering={FadeIn} layout={Layout}>
              {/* Analysis/Panic Check */}
              <GlassCard elevated style={styles.card}>
                <View style={styles.analysisHeader}>
                  <Brain size={18} color={colors.accent} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Reality Check
                  </Text>
                </View>
                <Text
                  style={[styles.analysisText, { color: colors.textSecondary }]}
                >
                  {response.analysis.panic_check}
                </Text>
              </GlassCard>

              {/* Options */}
              {response.options.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={FadeInRight.delay(index * 100)}
                >
                  <Pressable onPress={() => handleSelectOption(option)}>
                    <GlassCard
                      elevated
                      style={[
                        styles.card,
                        styles.optionCard,
                        option.recommended && {
                          borderWidth: 2,
                          borderColor: colors.accent + '60',
                        },
                      ]}
                    >
                      {/* Option Header */}
                      <View style={styles.optionHeader}>
                        <View style={styles.optionTitleRow}>
                          <Text
                            style={[styles.optionId, { color: colors.accent }]}
                          >
                            {option.id}
                          </Text>
                          <Text
                            style={[styles.optionTitle, { color: colors.text }]}
                          >
                            {option.title}
                          </Text>
                        </View>

                        {option.recommended && (
                          <View
                            style={[
                              styles.recommendedBadge,
                              { backgroundColor: colors.accent + '20' },
                            ]}
                          >
                            <Sparkles size={12} color={colors.accent} />
                            <Text
                              style={[
                                styles.recommendedText,
                                { color: colors.accent },
                              ]}
                            >
                              Recommended
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Risk Level */}
                      <View
                        style={[
                          styles.riskBadge,
                          { backgroundColor: getRiskColor(option.risk_level) + '20' },
                        ]}
                      >
                        <AlertTriangle
                          size={14}
                          color={getRiskColor(option.risk_level)}
                        />
                        <Text
                          style={[
                            styles.riskText,
                            { color: getRiskColor(option.risk_level) },
                          ]}
                        >
                          {option.risk_level} Risk
                        </Text>
                      </View>

                      {/* Description */}
                      <Text
                        style={[
                          styles.optionDesc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {option.description}
                      </Text>

                      {/* Pros/Cons */}
                      <View style={styles.prosConsContainer}>
                        <View style={styles.prosConsList}>
                          <View style={styles.prosConsHeader}>
                            <ThumbsUp size={14} color={colors.success} />
                            <Text
                              style={[
                                styles.prosConsTitle,
                                { color: colors.success },
                              ]}
                            >
                              Pros
                            </Text>
                          </View>
                          {option.pros.map((pro, i) => (
                            <Text
                              key={i}
                              style={[
                                styles.prosConsItem,
                                { color: colors.textSecondary },
                              ]}
                            >
                              • {pro}
                            </Text>
                          ))}
                        </View>

                        <View style={styles.prosConsList}>
                          <View style={styles.prosConsHeader}>
                            <ThumbsDown size={14} color={colors.error} />
                            <Text
                              style={[
                                styles.prosConsTitle,
                                { color: colors.error },
                              ]}
                            >
                              Cons
                            </Text>
                          </View>
                          {option.cons.map((con, i) => (
                            <Text
                              key={i}
                              style={[
                                styles.prosConsItem,
                                { color: colors.textSecondary },
                              ]}
                            >
                              • {con}
                            </Text>
                          ))}
                        </View>
                      </View>

                      {/* Select Arrow */}
                      <View style={styles.selectHint}>
                        <Text
                          style={[styles.selectText, { color: colors.accent }]}
                        >
                          Choose this approach
                        </Text>
                        <ArrowRight size={16} color={colors.accent} />
                      </View>
                    </GlassCard>
                  </Pressable>
                </Animated.View>
              ))}

              {/* Advice */}
              <GlassCard style={styles.card}>
                <Text style={[styles.adviceText, { color: colors.textMuted }]}>
                  {response.advice}
                </Text>
              </GlassCard>
            </Animated.View>
          )}

          {/* Phase 2: Execution */}
          {phase === 2 && selectedOption && (
            <Animated.View entering={FadeIn} layout={Layout}>
              {/* Selected Strategy Summary */}
              <GlassCard
                elevated
                style={[
                  styles.card,
                  { borderColor: colors.accent + '40', borderWidth: 1 },
                ]}
              >
                <View style={styles.selectedHeader}>
                  <Target size={18} color={colors.accent} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {selectedOption.title}
                  </Text>
                </View>
              </GlassCard>

              {/* Dos */}
              <GlassCard elevated style={styles.card}>
                <View style={styles.dosHeader}>
                  <CheckCircle2 size={18} color={colors.success} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Do This
                  </Text>
                </View>
                {selectedOption.dos.map((item, i) => (
                  <Animated.View
                    key={i}
                    entering={FadeInDown.delay(i * 50)}
                    style={styles.listItem}
                  >
                    <View
                      style={[
                        styles.listBullet,
                        { backgroundColor: colors.success + '20' },
                      ]}
                    >
                      <Check size={12} color={colors.success} />
                    </View>
                    <Text
                      style={[styles.listText, { color: colors.textSecondary }]}
                    >
                      {item}
                    </Text>
                  </Animated.View>
                ))}
              </GlassCard>

              {/* Don'ts */}
              <GlassCard elevated style={styles.card}>
                <View style={styles.dosHeader}>
                  <XCircle size={18} color={colors.error} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Avoid This
                  </Text>
                </View>
                {selectedOption.donts.map((item, i) => (
                  <Animated.View
                    key={i}
                    entering={FadeInDown.delay(i * 50)}
                    style={styles.listItem}
                  >
                    <View
                      style={[
                        styles.listBullet,
                        { backgroundColor: colors.error + '20' },
                      ]}
                    >
                      <XCircle size={12} color={colors.error} />
                    </View>
                    <Text
                      style={[styles.listText, { color: colors.textSecondary }]}
                    >
                      {item}
                    </Text>
                  </Animated.View>
                ))}
              </GlassCard>

              {/* Generate Draft Button */}
              {!draft && (
                <Button
                  onPress={handleGenerateDraft}
                  loading={isLoading}
                  fullWidth
                  size="lg"
                  icon={<FileText size={20} color="#fff" />}
                >
                  Generate Draft Message
                </Button>
              )}

              {/* Draft Result */}
              {draft && (
                <Animated.View entering={FadeInDown}>
                  <GlassCard
                    elevated
                    style={[
                      styles.card,
                      { borderColor: colors.accent + '40', borderWidth: 1 },
                    ]}
                  >
                    <View style={styles.draftHeader}>
                      <FileText size={18} color={colors.accent} />
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        Your Draft
                      </Text>
                    </View>

                    <Text
                      style={[styles.draftText, { color: colors.textSecondary }]}
                    >
                      {draft}
                    </Text>

                    <View style={styles.draftActions}>
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
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>

                      <Button
                        onPress={handleUseDraftInTact}
                        variant="outline"
                        size="sm"
                        icon={<Sparkles size={16} color={colors.accent} />}
                      >
                        Refine in Tact
                      </Button>
                    </View>
                  </GlassCard>
                </Animated.View>
              )}

              {/* Error */}
              {error && (
                <Animated.View entering={FadeInDown}>
                  <GlassCard style={[styles.card, styles.errorCard]}>
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {error}
                    </Text>
                  </GlassCard>
                </Animated.View>
              )}

              {/* Start Over */}
              <Button
                onPress={handleReset}
                variant="ghost"
                fullWidth
                size="lg"
                icon={<RefreshCw size={20} color={colors.textMuted} />}
                style={styles.resetButton}
              >
                Start New Session
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  phaseIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  phaseSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 140,
  },
  errorCard: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 24,
  },
  optionCard: {
    paddingBottom: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionId: {
    fontSize: 20,
    fontWeight: '700',
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  prosConsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  prosConsList: {
    flex: 1,
  },
  prosConsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  prosConsTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  prosConsItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  selectHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  listBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  listText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  draftText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  draftActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    marginTop: 8,
  },
  bottomPadding: {
    height: 120,
  },
});
