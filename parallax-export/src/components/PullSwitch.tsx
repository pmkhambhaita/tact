import React, { useState } from 'react';
import { motion, useSpring, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface PullSwitchProps {
    isDark: boolean;
    toggleTheme: () => void;
}

const PullSwitch: React.FC<PullSwitchProps> = ({ isDark, toggleTheme }) => {
    const controls = useAnimation();
    const [isPulling, setIsPulling] = useState(false);

    // The physics value for the vertical stretch/pull
    const y = useSpring(0, { stiffness: 300, damping: 15 });

    // Handle Drag Pull
    const handleDragEnd = async (event: any, info: PanInfo) => {
        const pullDistance = info.offset.y;

        if (pullDistance > 50) {
            // Trigger Switch
            toggleTheme();
            // Snap back with bounce
            controls.start({ y: 0, transition: { type: "spring", stiffness: 500, damping: 12, mass: 1 } });
        } else {
            // Just snap back
            controls.start({ y: 0, transition: { type: "spring", stiffness: 400, damping: 15 } });
        }
        setIsPulling(false);
    };

    // Click handler fallback
    const handleClick = async () => {
        if (isPulling) return;

        // Animate down
        await controls.start({
            y: 80,
            transition: { type: "spring", stiffness: 200, damping: 15 } // Slower "pull"
        });

        toggleTheme();

        // Flop back up
        controls.start({
            y: 0,
            transition: { type: "spring", stiffness: 400, damping: 10, mass: 1.5 } // Bouncy return
        });
    };

    return (
        <div className="fixed top-0 right-16 z-[60] flex flex-col items-center">
            {/* Label */}
            <div className={`mb-2 text-[10px] uppercase tracking-widest opacity-40 font-bold transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pull to Switch
            </div>

            {/* Container specifically for the string physics */}
            <motion.div
                className="flex flex-col items-center cursor-grab active:cursor-grabbing"
                animate={controls}
                drag="y"
                dragConstraints={{ top: 0, bottom: 100 }}
                dragElastic={0.1}
                onDragStart={() => setIsPulling(true)}
                onDragEnd={handleDragEnd}
                onClick={handleClick}
                whileTap={{ cursor: "grabbing" }}
            >
                {/* The String */}
                <div className={`w-0.5 h-24 ${isDark ? 'bg-slate-600' : 'bg-slate-300'} transition-colors duration-300 origin-top bg-gradient-to-b from-transparent to-current`}></div>

                {/* The Knob / Handle */}
                <div className={`
             relative w-12 h-12 rounded-full shadow-xl flex items-center justify-center 
             transition-all duration-500 border-4 backdrop-blur-sm
             ${isDark
                        ? 'bg-slate-800/80 border-slate-700 shadow-orange-900/40 ring-1 ring-white/10'
                        : 'bg-white/80 border-slate-100 shadow-slate-300/50 ring-1 ring-black/5'}
        `}>
                    <motion.div
                        initial={false}
                        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 1 : 1 }}
                        transition={{ type: "spring", stiffness: 150, damping: 12 }}
                    >
                        {isDark ? (
                            <Moon className="w-5 h-5 text-orange-400 fill-orange-400/20" />
                        ) : (
                            <Sun className="w-5 h-5 text-orange-500" />
                        )}
                    </motion.div>

                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 ${isDark ? 'bg-orange-400/10' : 'bg-orange-400/5'}`}></div>
                </div>
            </motion.div>
        </div>
    );
};

export default PullSwitch;
