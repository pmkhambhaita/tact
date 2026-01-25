/**
 * Tact Mobile - Type Definitions
 * Ported from web app with mobile-specific additions
 */

// ============================================================
// TACT (Tone Coach) Types
// ============================================================

export interface Highlight {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
  suggestion: string;
}

export interface AudiencePerception {
  primary_receiver: string;
  neutral_observer: string;
}

export interface AnalysisResult {
  score: number;
  summary: string;
  audience_perception: AudiencePerception;
  highlights: Highlight[];
  rewritten_message: string | null;
  rewritten_score: number | null;
}

export interface AnalysisSettings {
  receiverType: string;
  intendedTone: string;
  userTraits: string;
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  input: string;
  settings: AnalysisSettings;
  result: AnalysisResult;
}

// ============================================================
// PARALLAX (Decision Helper) Types
// ============================================================

export interface ParallaxOption {
  id: string;
  title: string;
  description: string;
  risk_level: 'Low' | 'Medium' | 'High';
  pros: string[];
  cons: string[];
  dos: string[];
  donts: string[];
  recommended: boolean;
}

export interface ParallaxAnalysis {
  internal_monologue: string;
  panic_check: string;
}

export interface ParallaxResponse {
  analysis: ParallaxAnalysis;
  options: ParallaxOption[];
  advice: string;
}

export interface ParallaxDraftResponse {
  draft: string;
}

export interface ParallaxSession {
  id: string;
  timestamp: string;
  situation: string;
  response: ParallaxResponse;
  selectedOption?: ParallaxOption;
  draft?: string;
}

// ============================================================
// App-Wide Types
// ============================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  hapticFeedback: boolean;
  disclaimerAccepted: boolean;
}

// Receiver type presets
export const RECEIVER_TYPES = [
  'Boss',
  'Coworker',
  'Partner',
  'Friend',
  'Client',
  'Parent',
] as const;

export type ReceiverType = typeof RECEIVER_TYPES[number] | string;

// Tone presets
export const TONE_TYPES = [
  'Professional',
  'Empathetic',
  'Direct',
  'Casual',
  'Assertive',
] as const;

export type ToneType = typeof TONE_TYPES[number] | string;

// Risk level colors
export const RISK_COLORS = {
  Low: '#22c55e',    // green-500
  Medium: '#f97316', // orange-500
  High: '#ef4444',   // red-500
} as const;

// Score thresholds
export const SCORE_THRESHOLDS = {
  BAD: 40,
  OKAY: 75,
  GOOD: 85,
} as const;
