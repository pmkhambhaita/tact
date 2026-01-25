import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, Zap, Lock, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ShaderBackground from './ShaderBackground';

interface ParallaxOption {
    id: string;
    title: string;
    description: string;
    risk_level: 'Low' | 'Medium' | 'High';
    pros: string[];
    cons: string[];
    recommended: boolean;
}

interface ParallaxResponse {
    analysis: {
        internal_monologue: string;
        panic_check: string;
    };
    options: ParallaxOption[];
    advice: string;
}

const ParallaxChat: React.FC = () => {
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(true); // Default to dark for "Incognito" feel
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ type: 'user' | 'ai', content: any }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<ParallaxResponse | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, response]);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { type: 'user', content: userMsg }]);
        setInput('');
        setIsLoading(true);
        setResponse(null);

        try {
            const res = await fetch('/api/parallax/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data: ParallaxResponse = await res.json();
            setResponse(data);
            setMessages(prev => [...prev, { type: 'ai', content: data.analysis.panic_check }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { type: 'ai', content: "I'm having trouble connecting to the strategy mainframe. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionSelect = (option: ParallaxOption) => {
        // Here we draft a rough message based on the option and navigate to Tact
        const draftText = `Context: ${messages[0].content}\nSelected Strategy: ${option.title}\n\n[Drafting message...]`;

        // In a real agentic flow, we might ask the AI to draft it first. 
        // For now, let's pass the context to Tact to let the user write it or just placeholder.
        // Actually, let's just pass the goal.

        navigate('/tact', {
            state: {
                draftContext: `Situation: ${messages[0].content}\nChosen Strategy: ${option.title} (${option.description})`,
                intendedTone: option.title.includes('Honest') ? 'Sincere' : 'Professional'
            }
        });
    };

    return (
        <div className={`min-h-screen flex flex-col relative overflow-hidden ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <ShaderBackground isDark={isDark} />

            {/* Header */}
            <header className="relative z-20 p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-2 font-bold font-serif text-xl">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                        <Zap className="w-5 h-5" />
                    </div>
                    Parallax
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-500/30">
                    <Lock className="w-3 h-3" /> INCOGNITO MODE ACTIVE
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 relative z-10 overflow-y-auto p-4 md:p-8 space-y-6 max-w-3xl mx-auto w-full">
                {/* Introduction */}
                {messages.length === 0 && (
                    <div className="text-center mt-20 opacity-60">
                        <Shield className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
                        <h2 className="text-2xl font-serif mb-2">What's the situation?</h2>
                        <p>I'm ready to weigh the risks. Tell me what happened.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.type === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-lg'
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-sm text-slate-400">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Analyzing Handbook Protocols...
                        </div>
                    </div>
                )}

                {/* Analysis & Options Block */}
                {response && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Internal Monologue */}
                        <div className="bg-slate-800/80 border border-indigo-500/30 p-4 rounded-xl text-sm font-mono text-indigo-200 shadow-lg">
                            <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs uppercase tracking-widest font-bold">
                                <Zap className="w-3 h-3" /> Internal Monologue
                            </div>
                            {response.analysis.internal_monologue}
                        </div>

                        {/* Options */}
                        <div className="grid gap-4">
                            {response.options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionSelect(opt)}
                                    className="group text-left relative overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 p-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors">
                                            Option {opt.id}: {opt.title}
                                        </h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${opt.risk_level === 'High' ? 'bg-red-900/30 text-red-400' :
                                                opt.risk_level === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-emerald-900/30 text-emerald-400'
                                            }`}>
                                            {opt.risk_level} Risk
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{opt.description}</p>

                                    {opt.recommended && (
                                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">
                                            Recommended
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-indigo-400 transition-colors mt-auto">
                                        Select Strategy <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="relative z-20 p-4 pb-8 max-w-3xl mx-auto w-full">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Type your situation..."
                        disabled={isLoading || !!response} // Disable after response to force option selection (wizard style)
                        className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-500 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !input.trim() || !!response}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-0 transition-all disabled:scale-75"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ParallaxChat;
