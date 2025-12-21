import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustStrip from './components/TrustStrip';
import FeatureSwitcher from './components/FeatureSwitcher';
import ScrollReveal from './components/ScrollReveal';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import AuthModal from './components/AuthModal';

import Capabilities from './components/Capabilities';
import TargetAudience from './components/TargetAudience';
import Compliance from './components/Compliance';
import Footer from './components/Footer';

import StockTicker from './components/StockTicker';

function App() {
  const [authModal, setAuthModal] = React.useState({ isOpen: false, type: 'login' });

  const openAuth = (type) => {
    setAuthModal({ isOpen: true, type });
  };

  return (
    <div className="App">
      <Header onAuth={openAuth} />
      <StockTicker />
      <Hero onAuth={openAuth} />
      <ScrollReveal><TrustStrip /></ScrollReveal>
      <ScrollReveal><FeatureSwitcher /></ScrollReveal>
      <ScrollReveal><Testimonials /></ScrollReveal>
      <ScrollReveal><Capabilities /></ScrollReveal>
      <ScrollReveal><Pricing /></ScrollReveal>
      <ScrollReveal><TargetAudience /></ScrollReveal>
      <ScrollReveal><Compliance /></ScrollReveal>
      <Footer />
      <AuthModal
        isOpen={authModal.isOpen}
        type={authModal.type}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
      />
    </div>
  );
}

export default App;
