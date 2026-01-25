/**
 * SmartText - Renders text with inline highlights and tooltips
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { Highlight } from '@/types';

interface SmartTextProps {
  text: string;
  highlights: Highlight[];
}

interface TooltipData {
  highlight: Highlight;
  position: { x: number; y: number };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SmartText({ text, highlights }: SmartTextProps) {
  const { isDark, colors } = useTheme();
  const { impactLight } = useHaptics();
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  // Filter valid highlights
  const validHighlights = highlights.filter(
    (h) => h.text && text.includes(h.text)
  );

  if (validHighlights.length === 0) {
    return (
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    );
  }

  // Create regex pattern for splitting
  const escapeRegExp = (string: string) =>
    string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const pattern = new RegExp(
    `(${validHighlights.map((h) => escapeRegExp(h.text)).join('|')})`,
    'g'
  );

  const parts = text.split(pattern);

  const getHighlightForText = (part: string): Highlight | undefined =>
    validHighlights.find((h) => h.text === part);

  const getHighlightColor = (type: Highlight['type']) => {
    switch (type) {
      case 'positive':
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
          text: colors.success,
        };
      case 'negative':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
          text: colors.error,
        };
      case 'neutral':
        return {
          bg: isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.15)',
          text: colors.warning,
        };
    }
  };

  const handleHighlightPress = (
    highlight: Highlight,
    event: { nativeEvent: { pageX: number; pageY: number } }
  ) => {
    impactLight();
    setActiveTooltip({
      highlight,
      position: {
        x: event.nativeEvent.pageX,
        y: event.nativeEvent.pageY,
      },
    });
  };

  return (
    <>
      <Text style={[styles.text, { color: colors.text }]}>
        {parts.map((part, index) => {
          const highlight = getHighlightForText(part);

          if (highlight) {
            const colors = getHighlightColor(highlight.type);

            return (
              <Text
                key={index}
                style={[
                  styles.highlight,
                  { backgroundColor: colors.bg, color: colors.text },
                ]}
                onPress={(event) => handleHighlightPress(highlight, event)}
              >
                {part}
              </Text>
            );
          }

          return part;
        })}
      </Text>

      {/* Tooltip Modal */}
      <Modal
        visible={activeTooltip !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveTooltip(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActiveTooltip(null)}
        >
          {activeTooltip && (
            <View
              style={[
                styles.tooltipContainer,
                {
                  left: Math.min(
                    Math.max(activeTooltip.position.x - 120, 16),
                    SCREEN_WIDTH - 256
                  ),
                  top: activeTooltip.position.y + 10,
                },
              ]}
            >
              <BlurView
                intensity={80}
                tint={isDark ? 'dark' : 'light'}
                style={styles.tooltipBlur}
              >
                <View
                  style={[
                    styles.tooltipContent,
                    {
                      backgroundColor: isDark
                        ? 'rgba(30, 41, 59, 0.9)'
                        : 'rgba(255, 255, 255, 0.9)',
                    },
                  ]}
                >
                  <View style={styles.tooltipHeader}>
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor:
                            getHighlightColor(activeTooltip.highlight.type).bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          {
                            color: getHighlightColor(activeTooltip.highlight.type)
                              .text,
                          },
                        ]}
                      >
                        {activeTooltip.highlight.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tooltipText, { color: colors.text }]}>
                    "{activeTooltip.highlight.text}"
                  </Text>
                  <Text
                    style={[
                      styles.tooltipSuggestion,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {activeTooltip.highlight.suggestion}
                  </Text>
                </View>
              </BlurView>
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 26,
  },
  highlight: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tooltipContainer: {
    position: 'absolute',
    width: 240,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tooltipContent: {
    padding: 16,
  },
  tooltipHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  tooltipSuggestion: {
    fontSize: 14,
    lineHeight: 20,
  },
});
