import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BreathingExercise: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [step, setStep] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('inhale');
    const [timeLeft, setTimeLeft] = useState(4);

    useEffect(() => {
        if (step === 'ready') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (step === 'inhale') {
                        setStep('hold');
                        return 4;
                    } else if (step === 'hold') {
                        setStep('exhale');
                        return 4;
                    } else {
                        setStep('ready');
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xl text-white"
        >
            <div className="relative mb-12">
                {/* Breathing Circle Animation */}
                <motion.div
                    animate={{
                        scale: step === 'inhale' ? 1.5 : step === 'exhale' ? 1 : 1.5,
                        opacity: step === 'hold' ? 0.8 : 1,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-48 h-48 rounded-full bg-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.3)] flex items-center justify-center relative border border-indigo-500/30"
                >
                    <motion.div
                        animate={{
                            scale: step === 'inhale' ? 1.2 : step === 'exhale' ? 0.8 : 1.2,
                        }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-full bg-indigo-400/30 blur-xl absolute"
                    />
                    <div className="text-4xl font-serif font-bold text-indigo-100 z-10">
                        {step !== 'ready' && timeLeft}
                    </div>
                </motion.div>

                {/* Particle System (Simplified CSS for performance) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className={`w-64 h-64 border border-indigo-300/10 rounded-full animate-ping ${step === 'inhale' || step === 'exhale' ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-4 max-w-md px-6">
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-3xl font-serif font-medium"
                    >
                        {step === 'inhale' && "Breathe in slowly..."}
                        {step === 'hold' && "Hold..."}
                        {step === 'exhale' && "Release..."}
                        {step === 'ready' && "Feeling better?"}
                    </motion.h2>
                </AnimatePresence>

                {step === 'ready' && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={onComplete}
                        className="mt-8 px-8 py-3 bg-white text-indigo-900 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                    >
                        Let's solve this.
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default BreathingExercise;
