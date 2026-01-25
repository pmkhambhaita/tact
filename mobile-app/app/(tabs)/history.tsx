/**
 * History Screen - View past analyses and sessions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import {
  MessageSquare,
  Compass,
  Clock,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { TactMeterMini } from '@/components/tact/TactMeter';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useTactHistoryStore, useParallaxStore } from '@/store/useAppStore';
import { HistoryItem, ParallaxSession, RISK_COLORS } from '@/types';

type TabType = 'tact' | 'parallax';

export default function HistoryScreen() {
  const { isDark, colors } = useTheme();
  const { impactLight, warning } = useHaptics();
  const { history: tactHistory, removeItem, clearHistory } = useTactHistoryStore();
  const {
    sessions: parallaxSessions,
    clearSessions,
  } = useParallaxStore();

  const [activeTab, setActiveTab] = useState<TabType>('tact');

  const handleTabChange = (tab: TabType) => {
    impactLight();
    setActiveTab(tab);
  };

  const handleClearHistory = () => {
    warning();
    Alert.alert(
      'Clear History',
      `Are you sure you want to clear all ${activeTab === 'tact' ? 'Tact' : 'Parallax'} history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            if (activeTab === 'tact') {
              clearHistory();
            } else {
              clearSessions();
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (id: number | string) => {
    warning();
    if (activeTab === 'tact') {
      removeItem(id as number);
    }
    // Add parallax deletion if needed
  };

  const isEmpty =
    activeTab === 'tact'
      ? tactHistory.length === 0
      : parallaxSessions.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
        {!isEmpty && (
          <Pressable onPress={handleClearHistory}>
            <Trash2 size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => handleTabChange('tact')}
          style={[
            styles.tab,
            activeTab === 'tact' && { backgroundColor: colors.accent + '20' },
          ]}
        >
          <MessageSquare
            size={18}
            color={activeTab === 'tact' ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'tact' ? colors.accent : colors.textMuted,
              },
            ]}
          >
            Tact
          </Text>
          {tactHistory.length > 0 && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    activeTab === 'tact' ? colors.accent : colors.textMuted,
                },
              ]}
            >
              <Text style={styles.badgeText}>{tactHistory.length}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => handleTabChange('parallax')}
          style={[
            styles.tab,
            activeTab === 'parallax' && { backgroundColor: colors.accent + '20' },
          ]}
        >
          <Compass
            size={18}
            color={activeTab === 'parallax' ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'parallax' ? colors.accent : colors.textMuted,
              },
            ]}
          >
            Parallax
          </Text>
          {parallaxSessions.length > 0 && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    activeTab === 'parallax' ? colors.accent : colors.textMuted,
                },
              ]}
            >
              <Text style={styles.badgeText}>{parallaxSessions.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Content */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Animated.View entering={FadeIn} style={styles.emptyContent}>
            {activeTab === 'tact' ? (
              <MessageSquare size={48} color={colors.textMuted} strokeWidth={1} />
            ) : (
              <Compass size={48} color={colors.textMuted} strokeWidth={1} />
            )}
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No history yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {activeTab === 'tact'
                ? 'Your analyzed messages will appear here'
                : 'Your Parallax sessions will appear here'}
            </Text>
          </Animated.View>
        </View>
      ) : (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.listContainer}
        >
          {activeTab === 'tact' ? (
            <TactHistoryList
              data={tactHistory}
              onDelete={handleDeleteItem}
              colors={colors}
              isDark={isDark}
            />
          ) : (
            <ParallaxHistoryList
              data={parallaxSessions}
              colors={colors}
              isDark={isDark}
            />
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function TactHistoryList({
  data,
  onDelete,
  colors,
  isDark,
}: {
  data: HistoryItem[];
  onDelete: (id: number) => void;
  colors: any;
  isDark: boolean;
}) {
  return (
    <Animated.FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      itemLayoutAnimation={Layout}
      renderItem={({ item, index }) => (
        <Animated.View
          entering={FadeInDown.delay(index * 50)}
          exiting={FadeOut}
        >
          <GlassCard style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.historyMeta}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                  {item.timestamp}
                </Text>
                <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
                <Text style={[styles.receiver, { color: colors.textMuted }]}>
                  {item.settings.receiverType}
                </Text>
              </View>
              <TactMeterMini score={item.result.score} />
            </View>

            <Text
              style={[styles.historyText, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.input}
            </Text>

            <Text
              style={[styles.historySummary, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.result.summary}
            </Text>

            <View style={styles.historyActions}>
              <Pressable
                onPress={() => onDelete(item.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>
      )}
      ListFooterComponent={<View style={styles.bottomPadding} />}
    />
  );
}

function ParallaxHistoryList({
  data,
  colors,
  isDark,
}: {
  data: ParallaxSession[];
  colors: any;
  isDark: boolean;
}) {
  return (
    <Animated.FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      itemLayoutAnimation={Layout}
      renderItem={({ item, index }) => (
        <Animated.View
          entering={FadeInDown.delay(index * 50)}
          exiting={FadeOut}
        >
          <GlassCard style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={styles.historyMeta}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                  {item.timestamp}
                </Text>
              </View>
              {item.selectedOption && (
                <View
                  style={[
                    styles.riskBadge,
                    {
                      backgroundColor:
                        RISK_COLORS[item.selectedOption.risk_level] + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.riskText,
                      { color: RISK_COLORS[item.selectedOption.risk_level] },
                    ]}
                  >
                    {item.selectedOption.risk_level}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.historyText, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.situation}
            </Text>

            {item.selectedOption && (
              <View style={styles.selectedStrategy}>
                <Text style={[styles.strategyLabel, { color: colors.textMuted }]}>
                  Chose:
                </Text>
                <Text
                  style={[styles.strategyTitle, { color: colors.textSecondary }]}
                >
                  {item.selectedOption.title}
                </Text>
              </View>
            )}

            <View style={styles.historyFooter}>
              <View style={styles.statusIndicators}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.textMuted }]}>
                  {item.response.options.length} options
                </Text>
                {item.draft && (
                  <>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: colors.accent },
                      ]}
                    />
                    <Text
                      style={[styles.statusText, { color: colors.textMuted }]}
                    >
                      Draft created
                    </Text>
                  </>
                )}
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </View>
          </GlassCard>
        </Animated.View>
      )}
      ListFooterComponent={<View style={styles.bottomPadding} />}
    />
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  historyCard: {
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestamp: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
  },
  receiver: {
    fontSize: 12,
  },
  historyText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 6,
  },
  historySummary: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedStrategy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  strategyLabel: {
    fontSize: 12,
  },
  strategyTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    marginRight: 8,
  },
  bottomPadding: {
    height: 120,
  },
});
