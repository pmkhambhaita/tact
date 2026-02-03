import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Zap, MessageSquare, Sparkles } from 'lucide-react';
import ShaderBackground from './ShaderBackground';

import { useTheme } from './ThemeContext';

const LandingPage: React.FC = () => {
    const { isDark } = useTheme();

    // Auto-typing demo effect
    const [demoText, setDemoText] = useState("");
    const fullText = "Hey boss, your idea is actually terrible and won't work.";
    const correctedText = "I have some concerns about the feasibility of this approach and would love to propose an alternative.";

    useEffect(() => {
        // Typing animation loop
        let timeout: NodeJS.Timeout;
        let currentIndex = 0;

        const type = () => {
            if (currentIndex < fullText.length) {
                setDemoText(fullText.slice(0, currentIndex + 1));
                currentIndex++;
                timeout = setTimeout(type, 50);
            } else {
                timeout = setTimeout(() => {
                    // Simulate "Correction"
                    setDemoText(correctedText);
                }, 1500);
            }
        };

        timeout = setTimeout(type, 1000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className={`min-h-screen relative overflow-hidden flex flex-col ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <ShaderBackground isDark={isDark} />

            {/* Nav */}
            <div className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2 font-serif font-bold text-2xl">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-slate-900 text-white'}`}>
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    Tact
                </div>

                <div className="flex gap-4">
                    <Link to="/tact">
                        <button className={`px-6 py-2.5 rounded-full font-medium transition-all ${isDark
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xl'
                            }`}>
                            Open Tone Coach
                        </button>
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4 mt-10 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl"
                >
                    <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-8">
                        The courage to ask.<br />
                        <span className="italic bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-transparent">The confidence to act.</span>
                    </h1>

                    <p className={`text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        AI-powered tone analysis to help you navigate high-stakes moments.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/tact">
                            <button className={`group relative px-8 py-4 rounded-full text-lg font-bold flex items-center gap-3 overflow-hidden transition-all ${isDark
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}>
                                <Zap className="w-5 h-5" />
                                <span>Check My Tone</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Demo Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="mt-20 w-full max-w-2xl"
                >
                    <div className={`rounded-2xl p-6 backdrop-blur-md border shadow-2xl transition-colors ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white/60 border-white/40'
                        }`}>
                        <div className="flex items-center gap-2 mb-4 opacity-50">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className={`font-serif text-xl md:text-2xl text-left min-h-[80px] ${demoText === correctedText ? 'text-emerald-500 transition-colors duration-500' : (isDark ? 'text-slate-300' : 'text-slate-700')
                            }`}>
                            "{demoText}"
                            <span className="animate-pulse">|</span>
                        </div>
                        {demoText === correctedText && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-500 uppercase tracking-widest"
                            >
                                <Sparkles className="w-4 h-4" /> Optimized by Tact
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Features */}
            <div className={`relative z-10 py-24 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-lg ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-500'}`}>
                            <MessageSquare />
                        </div>
                        <h3 className="text-xl font-bold mb-3 font-serif">Tone Check</h3>
                        <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Refine your message with advanced sentiment analysis to ensure you sound professional.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-lg ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-500'}`}>
                            <ShieldCheck />
                        </div>
                        <h3 className="text-xl font-bold mb-3 font-serif">Incognito Mode</h3>
                        <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Your high-stakes questions are private. We sandbox your situation so you can explore safely.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-12 text-center text-sm opacity-60">
                <p>&copy; {new Date().getFullYear()} Tact. Powered by Groq & Google AI.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
