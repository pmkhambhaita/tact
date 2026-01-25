/**
 * Tact Mobile - Global App Store
 * Zustand store for app-wide state management
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HistoryItem,
  ParallaxSession,
  AppSettings,
  ThemeMode,
} from '@/types';

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: '@tact/settings',
  TACT_HISTORY: '@tact/history',
  PARALLAX_HISTORY: '@tact/parallax_history',
} as const;

// ============================================================
// App Settings Store
// ============================================================

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  acceptDisclaimer: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    theme: 'system',
    hapticFeedback: true,
    disclaimerAccepted: false,
  },
  isLoading: true,

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored) as AppSettings;
        set({ settings: parsed, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  },

  setTheme: async (theme) => {
    await get().updateSettings({ theme });
  },

  acceptDisclaimer: async () => {
    await get().updateSettings({ disclaimerAccepted: true });
  },
}));

// ============================================================
// Tact History Store
// ============================================================

interface TactHistoryState {
  history: HistoryItem[];
  isLoading: boolean;
  loadHistory: () => Promise<void>;
  addItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useTactHistoryStore = create<TactHistoryState>((set, get) => ({
  history: [],
  isLoading: true,

  loadHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TACT_HISTORY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        set({ history: parsed, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      set({ isLoading: false });
    }
  },

  addItem: async (item) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updated = [newItem, ...get().history].slice(0, 50); // Keep last 50
    set({ history: updated });
    await AsyncStorage.setItem(STORAGE_KEYS.TACT_HISTORY, JSON.stringify(updated));
  },

  removeItem: async (id) => {
    const updated = get().history.filter((item) => item.id !== id);
    set({ history: updated });
    await AsyncStorage.setItem(STORAGE_KEYS.TACT_HISTORY, JSON.stringify(updated));
  },

  clearHistory: async () => {
    set({ history: [] });
    await AsyncStorage.removeItem(STORAGE_KEYS.TACT_HISTORY);
  },
}));

// ============================================================
// Parallax Session Store
// ============================================================

interface ParallaxState {
  sessions: ParallaxSession[];
  currentSession: ParallaxSession | null;
  isLoading: boolean;
  loadSessions: () => Promise<void>;
  setCurrentSession: (session: ParallaxSession | null) => void;
  addSession: (session: Omit<ParallaxSession, 'id' | 'timestamp'>) => Promise<ParallaxSession>;
  updateSession: (id: string, updates: Partial<ParallaxSession>) => Promise<void>;
  clearSessions: () => Promise<void>;
}

export const useParallaxStore = create<ParallaxState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: true,

  loadSessions: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PARALLAX_HISTORY);
      if (stored) {
        const parsed = JSON.parse(stored) as ParallaxSession[];
        set({ sessions: parsed, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      set({ isLoading: false });
    }
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  addSession: async (sessionData) => {
    const newSession: ParallaxSession = {
      ...sessionData,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updated = [newSession, ...get().sessions].slice(0, 20); // Keep last 20
    set({ sessions: updated, currentSession: newSession });
    await AsyncStorage.setItem(STORAGE_KEYS.PARALLAX_HISTORY, JSON.stringify(updated));
    return newSession;
  },

  updateSession: async (id, updates) => {
    const updated = get().sessions.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    const currentSession = get().currentSession;
    if (currentSession?.id === id) {
      set({ currentSession: { ...currentSession, ...updates } });
    }
    set({ sessions: updated });
    await AsyncStorage.setItem(STORAGE_KEYS.PARALLAX_HISTORY, JSON.stringify(updated));
  },

  clearSessions: async () => {
    set({ sessions: [], currentSession: null });
    await AsyncStorage.removeItem(STORAGE_KEYS.PARALLAX_HISTORY);
  },
}));
