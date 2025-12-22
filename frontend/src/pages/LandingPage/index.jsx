import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/auth/AuthModal';
import ScrollReveal from '../../components/ui/ScrollReveal';
import StockTicker from '../../components/ui/StockTicker';

import Hero from './sections/Hero';
import TrustStrip from './sections/TrustStrip';
import FeatureSwitcher from './sections/FeatureSwitcher';
import Testimonials from './sections/Testimonials';
import Pricing from './sections/Pricing';
import Capabilities from './sections/Capabilities';
import TargetAudience from './sections/TargetAudience';
import Compliance from './sections/Compliance';

const LandingPage = () => {
    const [authModal, setAuthModal] = React.useState({ isOpen: false, type: 'login' });

    const openAuth = (type) => {
        setAuthModal({ isOpen: true, type });
    };

    return (
        <div className="LandingPage">
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
};

export default LandingPage;
