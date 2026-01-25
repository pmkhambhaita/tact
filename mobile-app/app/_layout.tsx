/**
 * Root Layout - Providers and global configuration
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GradientBackground } from '@/components/ui/GradientBackground';
import {
  useSettingsStore,
  useTactHistoryStore,
  useParallaxStore,
} from '@/store/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { DisclaimerModal } from '@/components/ui/DisclaimerModal';
import '../global.css';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isDark, colors } = useTheme();
  const { settings, loadSettings } = useSettingsStore();
  const { loadHistory } = useTactHistoryStore();
  const { loadSessions } = useParallaxStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([loadSettings(), loadHistory(), loadSessions()]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <GradientBackground />

      {!settings.disclaimerAccepted && <DisclaimerModal />}

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AppContent />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
