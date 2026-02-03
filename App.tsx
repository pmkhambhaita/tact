import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import MainApp from './components/MainApp';
import LandingPage from './components/LandingPage';

import MobileGuard from './components/MobileGuard';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import PullSwitch from './components/PullSwitch';

// Helper component to render PullSwitch with context
const GlobalSwitch = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="fixed top-0 right-0 z-[100]">
      <PullSwitch isDark={isDark} toggleTheme={toggleTheme} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <MobileGuard>
          <GlobalSwitch />
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/tact" element={<MainApp />} />
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileGuard>
        <Analytics />
      </Router>
    </ThemeProvider>
  );
};

export default App;