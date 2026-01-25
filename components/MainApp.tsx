import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, RefreshCw, AlertCircle, ShieldCheck, User, Sparkles, Settings2, History, X, Clock, Copy, Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import TactMeter from './TactMeter';
import SmartText from './SmartText';
import PullSwitch from './PullSwitch';
import ShaderBackground from './ShaderBackground';
import LoadingScreen from './LoadingScreen';
import TiltCard from './TiltCard';
import DisclaimerModal from './DisclaimerModal';
import { AnalysisResult, AnalysisSettings, HistoryItem } from '../types';

const RECEIVER_OPTIONS = ["Boss", "Coworker", "Partner", "Friend", "Client", "Parent"];
const TONE_OPTIONS = ["Professional", "Empathetic", "Direct", "Casual", "Assertive"];

// Backend URL (Relative path for Vercel & Vite Proxy)
const API_URL = '/api/analyze';

import { useTheme } from './ThemeContext';

interface MainAppProps {
    mode?: 'standalone' | 'embedded';
    initialInput?: string;
    initialSettings?: AnalysisSettings;
}

const MainApp: React.FC<MainAppProps> = ({ mode = 'standalone', initialInput = '', initialSettings }) => {
    // Theme from Context
    const { isDark } = useTheme();

    const location = useLocation();
    const [input, setInput] = useState(initialInput);
    const [settings, setSettings] = useState<AnalysisSettings>(initialSettings || {
        receiverType: 'Boss',
        intendedTone: 'Professional',
        userTraits: ''
    });

    useEffect(() => {
        if (location.state) {
            const { draftContext, intendedTone } = location.state as any;
            if (draftContext) setInput(draftContext);
            if (intendedTone) setSettings(s => ({ ...s, intendedTone }));
        }
    }, [location]);

    // Sync state with props if they change (e.g. step transition in Parallax)
    useEffect(() => {
        if (initialInput) setInput(initialInput);
        if (initialSettings) setSettings(initialSettings);
    }, [initialInput, initialSettings]);

    const [loadingApp, setLoadingApp] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // History State
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Initial App Load Simulation
    useEffect(() => {
        setTimeout(() => setLoadingApp(false), 2000);
    }, []);

    // Sync Dark Mode with DOM
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);



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
        <>
            <AnimatePresence>
                {loadingApp && <LoadingScreen isDark={isDark} />}
            </AnimatePresence>

            <DisclaimerModal isDark={isDark} onAccept={() => { }} />

            <div className={`min-h-screen transition-colors duration-500 ease-in-out ${isDark ? 'text-slate-100' : 'text-slate-900'} flex flex-col items-center justify-center relative overflow-x-hidden ${mode === 'embedded' ? 'p-0' : 'p-4 md:p-8'
                }`}>

                {/* Background Shader */}
                <ShaderBackground isDark={isDark} />



                {/* History Sidebar - Higher Z-Index */}
                <div
                    className={`fixed inset-y-0 right-0 w-80 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] border-l flex flex-col ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        } ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                        <h3 className={`font-semibold flex items-center gap-2 font-serif ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                            <Clock className="w-4 h-4" /> History
                        </h3>
                        <button onClick={() => setShowHistory(false)} className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {history.length === 0 ? (
                            <div className={`text-center text-sm py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No history yet.</div>
                        ) : (
                            history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => loadHistoryItem(item)}
                                    className={`group p-3 rounded-lg border cursor-pointer transition-all ${isDark
                                        ? 'border-slate-700 hover:border-orange-500/30 hover:bg-slate-700/50'
                                        : 'border-slate-100 hover:border-orange-200 hover:bg-orange-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.result.score < 50
                                            ? (isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600')
                                            : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')
                                            }`}>
                                            Score: {item.result.score}
                                        </span>
                                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.timestamp}</span>
                                    </div>
                                    <div className={`text-sm line-clamp-2 mb-2 font-medium font-serif ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{item.input}"</div>
                                    <div className={`flex gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        <span>To: {item.settings.receiverType}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Overlay for history - Below sidebar, above content/switch */}
                {showHistory && (
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity"
                        onClick={() => setShowHistory(false)}
                    />
                )}

                <header className={`w-full max-w-4xl flex justify-between items-center relative z-10 animate-in fade-in slide-in-from-top-4 duration-700 text-left ${mode === 'embedded' ? 'mb-6' : 'mb-12'
                    }`}>
                    <h1 className={`font-bold tracking-tight flex items-center gap-3 font-serif ${isDark ? 'text-slate-100' : 'text-slate-800'} ${mode === 'embedded' ? 'text-2xl' : 'text-4xl'
                        }`}>
                        {mode === 'standalone' ? (
                            <>
                                <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800 text-orange-400' : 'bg-slate-900 text-white'}`}>
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                Tact
                            </>
                        ) : (
                            <span className="text-lg opacity-80 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" /> Tone Refinement
                            </span>
                        )}
                        {/* Added for navigation back to landing page if needed, though typically apps keep user in app */}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowHistory(true)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-full ${isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span className="hidden sm:inline">History</span>
                        </button>
                    </div>
                </header>

                <main className="w-full max-w-4xl flex-1 flex flex-col relative z-10">
                    {!result ? (
                        <div className="flex-1 flex flex-col justify-center transition-all duration-500 ease-in-out">

                            <div className={`space-y-3 text-center md:text-left ${mode === 'embedded' ? 'mb-6' : 'mb-10'}`}>
                                {mode === 'standalone' && (
                                    <>
                                        <h2 className={`text-5xl md:text-6xl font-serif font-medium leading-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                            Check your tone.
                                        </h2>
                                        <p className={`text-xl md:text-2xl font-light italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Say what you mean, without the mean.
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Context Settings Bar */}
                            <TiltCard isDark={isDark} className="mb-8">
                                <div className={`rounded-2xl p-8 flex flex-col md:flex-row gap-8 backdrop-blur-xl transition-colors duration-500 shadow-2xl ${isDark
                                    ? 'bg-slate-800/40 border border-white/10'
                                    : 'bg-white/60 border border-white/40'
                                    }`}>
                                    <div className="flex-1 space-y-4">
                                        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <User className="w-3 h-3" /> Receiver
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {RECEIVER_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSettings(s => ({ ...s, receiverType: opt }))}
                                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border ${settings.receiverType === opt
                                                        ? (isDark ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-900/20' : 'bg-slate-900 text-white border-slate-900 shadow-lg')
                                                        : (isDark ? 'bg-slate-700/50 text-slate-300 border-slate-600 hover:border-slate-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50')
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
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${isDark
                                                ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:border-slate-400 focus:bg-slate-700'
                                                : 'bg-slate-50/50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white'
                                                }`}
                                        />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <Sparkles className="w-3 h-3" /> Intended Tone
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {TONE_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSettings(s => ({ ...s, intendedTone: opt }))}
                                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border ${settings.intendedTone === opt
                                                        ? (isDark ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-900/20' : 'bg-slate-900 text-white border-slate-900 shadow-lg')
                                                        : (isDark ? 'bg-slate-700/50 text-slate-300 border-slate-600 hover:border-slate-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50')
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
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${isDark
                                                ? 'bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:border-slate-400 focus:bg-slate-700'
                                                : 'bg-slate-50/50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Optional Traits */}
                            <div className="mb-6 px-2">
                                <div className="relative group">
                                    <Settings2 className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <input
                                        type="text"
                                        placeholder="Optional: Add personal context (e.g., 'I tend to be overly blunt')"
                                        value={settings.userTraits}
                                        onChange={(e) => setSettings(s => ({ ...s, userTraits: e.target.value }))}
                                        className={`w-full pl-8 pr-4 py-2 bg-transparent border-b outline-none text-sm transition-all focus:pl-10 ${isDark
                                            ? 'border-slate-700 text-slate-300 placeholder:text-slate-600 focus:border-slate-500'
                                            : 'border-slate-200 text-slate-600 placeholder:text-slate-400 focus:border-slate-800'
                                            }`}
                                    />
                                </div>
                            </div>

                            <TiltCard isDark={isDark}>
                                <div className={`relative group rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-slate-800/40 border border-white/10' : 'bg-white/60 border border-white/40'}`}>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Type your message to your ${settings.receiverType.toLowerCase() || 'receiver'} here...`}
                                        className={`relative w-full h-56 p-8 bg-transparent outline-none resize-none text-lg font-serif leading-relaxed transition-all ${isDark
                                            ? 'text-slate-200 placeholder:text-slate-600 focus:ring-0'
                                            : 'text-slate-700 placeholder:text-slate-300 focus:ring-0'
                                            }`}
                                    />
                                </div>
                            </TiltCard>

                            {error && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm justify-center">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* Center Refine Button Container */}
                            <div className="mt-10 flex justify-center w-full">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading || !input.trim()}
                                    className={`flex items-center gap-3 px-10 py-4 rounded-full font-medium text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                                        ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 hover:-translate-y-1'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-slate-900/30 hover:-translate-y-1'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Refining...
                                        </>
                                    ) : (
                                        <>
                                            Analyze Tone
                                            <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* HUD Header */}
                            <TiltCard isDark={isDark}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                    {/* Score Gauge */}
                                    <div className={`col-span-1 flex flex-col items-center justify-center p-8 rounded-3xl backdrop-blur-md shadow-lg border transition-colors ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white/70 border-white/40'
                                        }`}>
                                        <TactMeter score={result.score} isDark={isDark} />
                                        <p className={`mt-6 font-medium text-xs uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tact Score</p>
                                    </div>

                                    {/* Summary & Perception */}
                                    <div className={`col-span-1 md:col-span-2 flex flex-col justify-between p-8 rounded-3xl backdrop-blur-md shadow-lg border transition-colors ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white/70 border-white/40'
                                        }`}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`px-2.5 py-1 text-xs rounded-md uppercase font-bold tracking-wider ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    Target: {settings.receiverType}
                                                </span>
                                                <span className={`px-2.5 py-1 text-xs rounded-md uppercase font-bold tracking-wider ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    Goal: {settings.intendedTone}
                                                </span>
                                            </div>
                                            <h3 className={`text-xl font-serif font-medium mb-3 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Analysis</h3>
                                            <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{result.summary}</p>
                                        </div>

                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className={`p-5 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50/80'}`}>
                                                <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Perception ({settings.receiverType})</span>
                                                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{result.audience_perception.primary_receiver}</p>
                                            </div>
                                            <div className={`p-5 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50/80'}`}>
                                                <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Neutral Observer</span>
                                                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{result.audience_perception.neutral_observer}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>

                            {/* Suggested Rewrite */}
                            {result.rewritten_message && (
                                <TiltCard isDark={isDark}>
                                    <div className={`rounded-3xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden transition-colors shadow-xl ${isDark
                                        ? 'bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-md'
                                        : 'bg-emerald-50/60 border border-emerald-100 backdrop-blur-md'
                                        }`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <Sparkles className="w-32 h-32 text-emerald-500" />
                                        </div>

                                        <div className="flex-1 relative z-10">
                                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Suggested Revision
                                            </h3>
                                            <p className={`text-xl md:text-2xl font-serif italic leading-relaxed ${isDark ? 'text-emerald-100' : 'text-slate-800'}`}>
                                                "{result.rewritten_message}"
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 relative z-10 min-w-[140px] w-full md:w-auto">
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border ${isDark ? 'bg-emerald-900/30 border-emerald-500/30' : 'bg-white border-emerald-100'
                                                }`}>
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Score: {result.rewritten_score}</span>
                                            </div>
                                            <button
                                                onClick={handleCopyRewrite}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-sm w-full justify-center ${isDark
                                                    ? 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200'
                                                    }`}
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copied ? "Copied" : "Copy Text"}
                                            </button>
                                        </div>
                                    </div>
                                </TiltCard>
                            )}

                            {/* Smart Text Area */}
                            <TiltCard isDark={isDark}>
                                <div className={`p-10 rounded-3xl shadow-lg border mb-10 min-h-[240px] transition-colors backdrop-blur-md ${isDark ? 'bg-slate-800/60 border-white/10' : 'bg-white/70 border-white/40'
                                    }`}>
                                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Detailed Feedback</h3>
                                    <div className={`text-2xl leading-loose font-serif ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                                        <SmartText text={input} highlights={result.highlights} />
                                    </div>
                                </div>
                            </TiltCard>

                            <div className="flex justify-center mb-16">
                                <button
                                    onClick={reset}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-full transition-colors ${isDark
                                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Analyze another message
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default MainApp;
