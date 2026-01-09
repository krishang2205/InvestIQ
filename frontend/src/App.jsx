import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
// import AuthPage from './pages/AuthPage'; // Deleted
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthModal from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import LogoutNotification from './components/auth/LogoutNotification';
import DashboardLayout from './pages/Dashboard/components/DashboardLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MarketMoodIndexPage from './pages/Dashboard/MarketMoodIndexPage';
import IntelligenceReportPage from './pages/Dashboard/IntelligenceReportPage';
import PortfolioPage from './pages/Dashboard/PortfolioPage';
import './App.css';

function App() {
  const { isLoggingOut } = useAuth();

  return (
    <div className="App">
      {isLoggingOut && <LogoutNotification />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="market-mood-index" element={<MarketMoodIndexPage />} />
          <Route path="market-mood-index" element={<MarketMoodIndexPage />} />
          <Route path="intelligence-reports" element={<IntelligenceReportPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
        </Route>
      </Routes>
      <AuthModal />
    </div>
  );
}

export default App;
