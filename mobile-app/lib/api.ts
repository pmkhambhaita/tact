/**
 * Tact Mobile - API Service Layer
 * Handles all communication with the backend server
 */

import {
  AnalysisResult,
  AnalysisSettings,
  ParallaxResponse,
  ParallaxDraftResponse,
  ParallaxOption,
} from '@/types';

// Configure your backend URL here
// For development, you might use your local server
// For production, this should point to your deployed backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-tact-backend.vercel.app';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

/**
 * Custom fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Base API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Request failed with status ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Network errors
      if (error.message === 'Network request failed') {
        throw new Error('Unable to connect. Please check your internet connection.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// ============================================================
// TACT API
// ============================================================

export interface AnalyzeRequest {
  text: string;
  settings: AnalysisSettings;
}

/**
 * Analyze a message for tone and communication effectiveness
 * @param text - The message to analyze (max 2500 characters)
 * @param settings - Context settings (receiver, tone, traits)
 */
export async function analyzeMessage(
  text: string,
  settings: AnalysisSettings
): Promise<AnalysisResult> {
  // Validate input
  if (!text.trim()) {
    throw new Error('Message cannot be empty');
  }

  if (text.length > 2500) {
    throw new Error('Message must be 2500 characters or less');
  }

  return apiRequest<AnalysisResult>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ text, settings }),
  });
}

// ============================================================
// PARALLAX API
// ============================================================

export interface ParallaxChatRequest {
  message: string;
}

export interface ParallaxDraftRequest {
  situation: string;
  strategy: ParallaxOption;
}

/**
 * Start a Parallax session with a situation description
 * @param message - The situation/problem description
 */
export async function parallaxChat(
  message: string
): Promise<ParallaxResponse> {
  if (!message.trim()) {
    throw new Error('Situation description cannot be empty');
  }

  return apiRequest<ParallaxResponse>('/api/parallax/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/**
 * Generate a draft message based on selected strategy
 * @param situation - The original situation
 * @param strategy - The selected strategy option
 */
export async function parallaxDraft(
  situation: string,
  strategy: ParallaxOption
): Promise<ParallaxDraftResponse> {
  return apiRequest<ParallaxDraftResponse>('/api/parallax/draft', {
    method: 'POST',
    body: JSON.stringify({ situation, strategy }),
  });
}

// ============================================================
// Health Check
// ============================================================

/**
 * Check if the API server is reachable
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/health`,
      { method: 'GET' },
      5000
    );
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  analyzeMessage,
  parallaxChat,
  parallaxDraft,
  healthCheck,
};
