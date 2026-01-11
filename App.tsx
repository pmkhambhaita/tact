import React, { useState, useEffect } from 'react';
import { Send, RefreshCw, AlertCircle, ShieldCheck, User, Sparkles, Settings2, History, X, Clock, ChevronRight, Copy, Check } from 'lucide-react';
import TactMeter from './components/TactMeter';
import SmartText from './components/SmartText';
import { AnalysisResult, AnalysisSettings, HistoryItem } from './types';

const RECEIVER_OPTIONS = ["Boss", "Coworker", "Partner", "Friend", "Client", "Parent"];
const TONE_OPTIONS = ["Professional", "Empathetic", "Direct", "Casual", "Assertive"];

// Backend URL (Relative path for Vercel & Vite Proxy)
const API_URL = '/api/analyze';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [settings, setSettings] = useState<AnalysisSettings>({
    receiverType: 'Boss',
    intendedTone: 'Professional',
    userTraits: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('tact_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newInput: string, newSettings: AnalysisSettings, newResult: AnalysisResult) => {
    const newItem: HistoryItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      input: newInput,
      settings: newSettings,
      result: newResult
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    sessionStorage.setItem('tact_history', JSON.stringify(updatedHistory));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setInput(item.input);
    setSettings(item.settings);
    setResult(item.result);
    setShowHistory(false);
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input,
          settings: settings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Server error");
      }

      const data = await response.json();
      setResult(data);
      saveToHistory(input, settings, data);

    } catch (err: any) {
      console.error("Analysis failed", err);
      setError(err.message || "Failed to analyze tone. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopyRewrite = async () => {
    if (result?.rewritten_message) {
      await navigator.clipboard.writeText(result.rewritten_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto relative">
      {/* History Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-slate-200 flex flex-col ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4" /> History
          </h3>
          <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">No history yet.</div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => loadHistoryItem(item)}
                className="group p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.result.score < 50 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                    Score: {item.result.score}
                  </span>
                  <span className="text-xs text-slate-400">{item.timestamp}</span>
                </div>
                <div className="text-sm text-slate-700 line-clamp-2 mb-2 font-medium">"{item.input}"</div>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span>To: {item.settings.receiverType}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overlay for history */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setShowHistory(false)}
        />
      )}

      <header className="w-full flex justify-between items-center mb-8 relative z-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-slate-600" />
          Tact
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col relative z-10">
        {!result ? (
          <div className="flex-1 flex flex-col justify-center transition-all duration-500 ease-in-out">

            <div className="mb-8 space-y-2">
              <h2 className="text-4xl font-light text-slate-800">Check your tone.</h2>
              <p className="text-slate-500 text-xl font-medium">
                Say what you mean, without the mean.
              </p>
            </div>

            {/* Context Settings Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <User className="w-3 h-3" /> Receiver
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {RECEIVER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSettings(s => ({ ...s, receiverType: opt }))}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${settings.receiverType === opt
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={settings.receiverType}
                  onChange={(e) => setSettings(s => ({ ...s, receiverType: e.target.value }))}
                  placeholder="Or type custom receiver..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>

              <div className="flex-1 space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Intended Tone
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {TONE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSettings(s => ({ ...s, intendedTone: opt }))}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors border ${settings.intendedTone === opt
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={settings.intendedTone}
                  onChange={(e) => setSettings(s => ({ ...s, intendedTone: e.target.value }))}
                  placeholder="Or type custom tone..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Optional Traits */}
            <div className="mb-4">
              <div className="relative">
                <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Optional: Add personal context (e.g., 'I tend to be overly blunt')"
                  value={settings.userTraits}
                  onChange={(e) => setSettings(s => ({ ...s, userTraits: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2 bg-transparent border-b border-slate-200 focus:border-slate-800 outline-none text-slate-600 placeholder:text-slate-300 text-sm transition-colors"
                />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Type your message to your ${settings.receiverType.toLowerCase() || 'receiver'} here...`}
                className="relative w-full h-48 p-6 bg-white rounded-lg shadow-sm border border-slate-100 focus:ring-2 focus:ring-slate-200 focus:border-transparent resize-none text-lg text-slate-700 placeholder:text-slate-300 outline-none transition-all"
              />
            </div>

            {error && (
              <div className="mt-4 p-4 bg-orange-50 text-orange-600 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !input.trim()}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 ${isLoading || !input.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    Analyze Tone
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HUD Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Score Gauge */}
              <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <TactMeter score={result.score} />
                <p className="mt-4 text-slate-500 font-medium text-sm uppercase tracking-wider">Tact Score</p>
              </div>

              {/* Summary & Perception */}
              <div className="col-span-1 md:col-span-2 flex flex-col justify-between p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded uppercase font-bold tracking-wide">
                      Target: {settings.receiverType}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded uppercase font-bold tracking-wide">
                      Goal: {settings.intendedTone}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Analysis Summary</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{result.summary}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Perception ({settings.receiverType})</span>
                    <p className="text-slate-700 text-sm">{result.audience_perception.primary_receiver}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">Neutral Observer</span>
                    <p className="text-slate-700 text-sm">{result.audience_perception.neutral_observer}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Rewrite */}
            {result.rewritten_message && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Sparkles className="w-24 h-24 text-emerald-600" />
                </div>

                <div className="flex-1 relative z-10">
                  <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Suggested Revision
                  </h3>
                  <p className="text-slate-800 text-lg font-medium leading-relaxed italic">
                    "{result.rewritten_message}"
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 relative z-10 min-w-[140px] w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-emerald-700">Score: {result.rewritten_score}</span>
                  </div>
                  <button
                    onClick={handleCopyRewrite}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md w-full justify-center"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy Text"}
                  </button>
                </div>
              </div>
            )}

            {/* Smart Text Area */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 min-h-[200px]">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6">Detailed Feedback</h3>
              <div className="text-xl leading-loose text-slate-800">
                <SmartText text={input} highlights={result.highlights} />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-2 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze another message
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;