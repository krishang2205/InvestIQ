import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
// import AuthModal from '../../components/auth/AuthModal'; // Removed, global in App
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
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                // Short timeout to ensure DOM is ready/rendered
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <div className="LandingPage">
            <Header />
            <StockTicker />
            <Hero />
            <ScrollReveal><TrustStrip /></ScrollReveal>
            <ScrollReveal><FeatureSwitcher /></ScrollReveal>
            <ScrollReveal><Testimonials /></ScrollReveal>
            <ScrollReveal><Capabilities /></ScrollReveal>
            <ScrollReveal><Pricing /></ScrollReveal>
            <ScrollReveal><TargetAudience /></ScrollReveal>
            <ScrollReveal><Compliance /></ScrollReveal>
            <Footer />
        </div>
    );
};

export default LandingPage;
