import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface LoadingScreenProps {
    isDark: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isDark }) => {
    return (
        <motion.div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-500 ${isDark ? 'bg-slate-900' : 'bg-slate-50'
                }`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <div className="flex flex-col items-center gap-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`p-6 rounded-3xl shadow-2xl ${isDark ? 'bg-slate-800 text-orange-400' : 'bg-slate-900 text-white'
                        }`}
                >
                    <ShieldCheck className="w-16 h-16" />
                </motion.div>

                <motion.div
                    className={`h-1 w-48 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'
                        }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        className={`h-full rounded-full ${isDark ? 'bg-orange-500' : 'bg-slate-900'
                            }`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </motion.div>

                <motion.h2
                    className={`font-serif tracking-widest text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    LOADING INTELLIGENCE
                </motion.h2>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
