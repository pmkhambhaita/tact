import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, Shield, CheckCircle2, ChevronRight, Layout, Edit3 } from 'lucide-react';
import ShaderBackground from './ShaderBackground';
import MainApp from './MainApp';
import BreathingExercise from './BreathingExercise';
import { useTheme } from './ThemeContext';

// Reuse types from ParallaxChat roughly, but adapted
interface ParallaxOption {
    id: string;
    title: string;
    description: string;
    risk_level: 'Low' | 'Medium' | 'High';
    pros: string[];
    cons: string[];
    dos?: string[];
    donts?: string[];
    recommended: boolean;
}

interface ParallaxResponse {
    analysis: {
        internal_monologue: string; // The "Rationalization"
        panic_check: string;
    };
    options: ParallaxOption[];
    advice: string;
}

const ParallaxSession: React.FC = () => {
    // Phase 0: Input, 1: Strategy, 2: Execution (Tact)
    const [phase, setPhase] = useState<0 | 1 | 2>(0);
    const [situation, setSituation] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<ParallaxResponse | null>(null);
    const [selectedOption, setSelectedOption] = useState<ParallaxOption | null>(null);
    const [isDrafting, setIsDrafting] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState('');

    const { isDark } = useTheme();
    const [showBreathing, setShowBreathing] = useState(false);

    const checkStress = (text: string) => {
        const stressWords = ['nervous', 'scared', 'panic', 'anxious', 'afraid', 'terrified', 'stressed', 'overwhelmed'];
        return stressWords.some(word => text.toLowerCase().includes(word));
    };

    const executeAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/parallax/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: situation })
            });
            const data = await res.json();
            setAnalysisData(data);
            setPhase(1);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyze = async () => {
        if (!situation.trim()) return;

        if (checkStress(situation)) {
            setShowBreathing(true);
        } else {
            executeAnalysis();
        }
    };

    const handleBreathingComplete = () => {
        setShowBreathing(false);
        executeAnalysis();
    };

    const handleSelectOption = (opt: ParallaxOption) => {
        setSelectedOption(opt);
        setGeneratedDraft(''); // Reset draft when changing option
        setPhase(2);
    };

    const handleGenerateDraft = async () => {
        if (!selectedOption) return;
        setIsDrafting(true);
        try {
            const res = await fetch('/api/parallax/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    situation,
                    strategy: selectedOption
                })
            });
            const data = await res.json();
            setGeneratedDraft(data.draft);
            // We need MainApp to update when generatedDraft changes.
            // Since we pass it as initialInput, and we added a useEffect in MainApp to track it, this should work.
        } catch (e) {
            console.error(e);
        } finally {
            setIsDrafting(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col relative overflow-x-hidden ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <AnimatePresence>
                {showBreathing && <BreathingExercise onComplete={handleBreathingComplete} />}
            </AnimatePresence>
            <ShaderBackground isDark={isDark} />

            {/* Global Header */}
            <header className="relative z-20 p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-serif text-xl font-bold tracking-tight">Parallax</span>
                </div>

                {/* Visual Progress Stepper */}
                <div className="hidden md:flex items-center gap-4 text-sm font-medium opacity-60">
                    <div className={`flex items-center gap-2 ${phase >= 0 ? 'text-indigo-400 opacity-100' : ''}`}>
                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">1</div>
                        Input
                    </div>
                    <div className="w-8 h-px bg-white/20"></div>
                    <div className={`flex items-center gap-2 ${phase >= 1 ? 'text-indigo-400 opacity-100' : ''}`}>
                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">2</div>
                        Strategy
                    </div>
                    <div className="w-8 h-px bg-white/20"></div>
                    <div className={`flex items-center gap-2 ${phase >= 2 ? 'text-indigo-400 opacity-100' : ''}`}>
                        <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">3</div>
                        Execution
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10 container mx-auto px-4 py-8 max-w-5xl flex flex-col justify-center">
                <AnimatePresence mode="wait">

                    {/* PHASE 0: INPUT */}
                    {phase === 0 && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto"
                        >
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight">
                                    What's the <span className="text-indigo-400 italic">situation?</span>
                                </h1>
                                <p className="text-lg text-slate-400">Describe the trigger, the panic, or the email you're afraid to send.</p>
                            </div>

                            <div className="w-full relative group">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <textarea
                                    value={situation}
                                    onChange={(e) => setSituation(e.target.value)}
                                    placeholder="e.g. I uploaded the wrong pricing sheet and the deadline passed an hour ago..."
                                    className="w-full h-48 bg-slate-800/80 border border-slate-700 focus:border-indigo-500 rounded-3xl p-8 text-lg outline-none resize-none shadow-2xl transition-all relative z-10 placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !situation.trim()}
                                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-900/40 hover:shadow-indigo-900/60 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? (
                                    <>Analyzing Risks...</>
                                ) : (
                                    <>
                                        Analyze Situation <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* PHASE 1: STRATEGY */}
                    {phase === 1 && analysisData && (
                        <motion.div
                            key="strategy"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-5xl"
                        >
                            {/* Analysis Dashboard */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                                {/* Internal Monologue Card */}
                                <div className="lg:col-span-3 bg-slate-800/60 border border-slate-700/50 backdrop-blur-md rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                                        <Zap className="w-4 h-4" /> Internal Monologue
                                    </div>
                                    <p className="text-xl font-serif leading-relaxed text-slate-200">
                                        "{analysisData.analysis.internal_monologue}"
                                    </p>
                                    <div className="mt-6 flex gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> Policy Check: Cleared</span>
                                        <span className="flex items-center gap-1.5"><Layout className="w-4 h-4 text-indigo-500" /> Strategic Alignment: High</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-serif font-medium mb-6 flex items-center gap-3">
                                <Layout className="w-6 h-6 text-indigo-400" /> Strategic Options
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analysisData.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSelectOption(option)}
                                        className={`text-left relative group p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${option.recommended
                                            ? 'bg-slate-800/80 border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/20'
                                            : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                                            }`}
                                    >
                                        {option.recommended && (
                                            <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg">
                                                Recommended
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 ${option.risk_level === 'High' ? 'bg-red-500/10 text-red-400' :
                                                option.risk_level === 'Medium' ? 'bg-orange-500/10 text-orange-400' :
                                                    'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                {option.risk_level} Risk
                                            </span>
                                            <h4 className="text-2xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                                                {option.title}
                                            </h4>
                                        </div>

                                        <p className="text-slate-400 leading-relaxed mb-6">
                                            {option.description}
                                        </p>

                                        <div className="flex items-center text-sm font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            Select & execute this strategy <ArrowRight className="w-4 h-4 ml-2" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 2: EXECUTION (EMBEDDED TACT) */}
                    {phase === 2 && selectedOption && (
                        <motion.div
                            key="execution"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full flex gap-8 items-start"
                        >
                            {/* Implementation Tips Sidebar */}
                            <div className="hidden lg:block w-80 shrink-0 sticky top-10">
                                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
                                    <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                                        <Edit3 className="w-4 h-4" /> Strategy Context
                                    </div>

                                    <h4 className="font-bold text-lg text-white mb-2">{selectedOption.title}</h4>
                                    <p className="text-sm text-slate-400 mb-6">{selectedOption.description}</p>

                                    <div className="space-y-6">
                                        {/* DOS */}
                                        {selectedOption.dos && selectedOption.dos.length > 0 && (
                                            <div>
                                                <div className="text-xs font-bold text-emerald-400 mb-2 uppercase flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3" /> Make sure to say:
                                                </div>
                                                <ul className="text-sm text-slate-300 space-y-2 pl-2 border-l-2 border-emerald-500/20">
                                                    {selectedOption.dos.map((d, i) => <li key={i}>"{d}"</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {/* DONTS */}
                                        {selectedOption.donts && selectedOption.donts.length > 0 && (
                                            <div>
                                                <div className="text-xs font-bold text-red-400 mb-2 uppercase flex items-center gap-2">
                                                    <Shield className="w-3 h-3" /> Avoid:
                                                </div>
                                                <ul className="text-sm text-slate-300 space-y-2 pl-2 border-l-2 border-red-500/20">
                                                    {selectedOption.donts.map((d, i) => <li key={i}>{d}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-white/10">
                                            <button
                                                onClick={handleGenerateDraft}
                                                disabled={isDrafting}
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isDrafting ? (
                                                    <ArrowRight className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Edit3 className="w-4 h-4" />
                                                )}
                                                {isDrafting ? 'Drafting...' : 'Generate New Draft'}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setPhase(1)}
                                        className="mt-8 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                                    >
                                        <ArrowRight className="w-3 h-3 rotate-180" /> Back to Strategies
                                    </button>
                                </div>
                            </div>

                            {/* Main Editor Area */}
                            <div className="flex-1">
                                <div className="bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden">
                                    <MainApp
                                        mode="embedded"
                                        initialInput={generatedDraft || `Context from Strategy: ${selectedOption.title}\n\n[Draft your message here...]`}
                                        initialSettings={{
                                            receiverType: 'Boss', // Could infer
                                            intendedTone: 'Professional',
                                            userTraits: ''
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

export default ParallaxSession;
