import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import ParallaxSession from './components/ParallaxSession';
import MobileGuard from './components/MobileGuard';
import { PullSwitch } from './components/PullSwitch';
import { useTheme } from './components/ThemeContext';

const GlobalSwitch = () => {
    const { isDark, toggleTheme } = useTheme();
    return <PullSwitch isDark={isDark} toggleTheme={toggleTheme} />;
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <Router>
                <MobileGuard>
                    <GlobalSwitch />
                    <Routes>
                        {/* ParallaxSession is the main and only route for this standalone app */}
                        <Route path="/" element={<ParallaxSession />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </MobileGuard>
            </Router>
        </ThemeProvider>
    );
};

export default App;
