import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
// import AuthPage from './pages/AuthPage'; // Deleted
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthModal from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import LogoutNotification from './components/auth/LogoutNotification';
import './App.css';

function App() {
  const { isLoggingOut } = useAuth();

  return (
    <div className="App">
      {isLoggingOut && <LogoutNotification />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* <Route path="/login" element={<AuthPage />} /> - Removed */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <AuthModal />
    </div>
  );
}

export default App;
