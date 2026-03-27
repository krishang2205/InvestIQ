import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import AuthModal from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import LogoutNotification from './components/auth/LogoutNotification';
import ProtectedRoute from './components/auth/ProtectedRoute';

import DashboardLayout from './pages/Dashboard/components/DashboardLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MarketMoodIndexPage from './pages/Dashboard/MarketMoodIndexPage';
import IntelligenceReportPage from './pages/Dashboard/IntelligenceReportPage';
import PortfolioPage from './pages/Dashboard/PortfolioPage';
import LearningModelPage from './pages/Dashboard/LearningModelPage';

import './App.css';

function App() {
  const { isLoggingOut } = useAuth();

  return (
    <div className="App">
      {isLoggingOut && <LogoutNotification />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="market-mood-index" element={<MarketMoodIndexPage />} />
          <Route path="intelligence-reports" element={<IntelligenceReportPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="learning-model" element={<LearningModelPage />} />
        </Route>
      </Routes>

      <AuthModal />
    </div>
  );
}

export default App;