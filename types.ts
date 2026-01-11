export interface Highlight {
  substring: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;
  better_alternative: string;
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
  rewritten_message: string;
  rewritten_score: number;
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
