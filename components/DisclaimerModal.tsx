import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface DisclaimerModalProps {
    isDark: boolean;
    onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isDark, onAccept }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('tact_disclaimer_accepted');
        if (!hasAccepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        if (isChecked) {
            localStorage.setItem('tact_disclaimer_accepted', 'true');
            setIsVisible(false);
            onAccept();
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl border ${isDark
                        ? 'bg-slate-900 border-slate-700 shadow-black/50'
                        : 'bg-white border-slate-200 shadow-slate-200/50'
                        }`}
                >
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className={`p-4 rounded-full ${isDark ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-100 text-orange-600'}`}>
                            <ShieldAlert className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h2 className={`text-2xl font-bold font-serif ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Usage Disclaimer
                            </h2>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Tact is an AI-powered communication coach. Please confirm you understand the usage guidelines before proceeding.
                            </p>
                        </div>

                        <div className={`w-full p-4 rounded-xl text-left text-sm border ${isDark
                            ? 'bg-slate-800/50 border-slate-700 text-slate-300'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                            }`}>
                            <p>
                                By accessing this tool, you agree that it is for <strong>personal use only</strong>.
                                Use for academic, commercial, or enterprise purposes is strictly prohibited without a license.
                            </p>
                        </div>

                        <label className={`flex items-start gap-3 cursor-pointer group text-left w-full p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                            }`}>
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={isChecked}
                                    onChange={(e) => setIsChecked(e.target.checked)}
                                />
                                <div className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${isChecked
                                        ? (isDark ? 'bg-orange-500 border-orange-500' : 'bg-slate-900 border-slate-900')
                                        : (isDark ? 'border-slate-600 group-hover:border-slate-500' : 'border-slate-300 group-hover:border-slate-400')
                                    }`}>
                                    {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                </div>
                            </div>
                            <span className={`text-sm select-none ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                I agree to not use this tool for academic or commercial purposes.
                            </span>
                        </label>

                        <button
                            onClick={handleAccept}
                            disabled={!isChecked}
                            className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 ${isChecked
                                    ? (isDark
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40 hover:bg-orange-400 hover:-translate-y-0.5'
                                        : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5')
                                    : (isDark
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                                }`}
                        >
                            Enter Tact
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DisclaimerModal;
