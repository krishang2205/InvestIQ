import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* Future routes can be added here, e.g.:
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        */}
      </Routes>
    </div>
  );
}

export default App;
