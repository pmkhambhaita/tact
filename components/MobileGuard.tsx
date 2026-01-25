import React, { useEffect, useState } from 'react';
import { ShieldAlert, Monitor } from 'lucide-react';
import ShaderBackground from './ShaderBackground';

const MobileGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // Block on tablets and below for safety
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden text-center">
                <ShaderBackground isDark={true} />
                <div className="relative z-10 max-w-md bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-indigo-500/30 shadow-2xl">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                        <Monitor className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-serif font-bold mb-4">Desktop Experience Required</h1>
                    <p className="text-slate-400 leading-relaxed mb-8">
                        Parallax is designed for deep work and strategy. For the best experience, please use a desktop or laptop computer.
                    </p>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Screen too small
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default MobileGuard;
