import React, { useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/auth/AuthModal';
import Hero from './sections/Hero';
import Philosophy from './sections/Philosophy';
import Founders from './sections/Founders';

const AboutPage = () => {
    const [authModal, setAuthModal] = React.useState({ isOpen: false, type: 'login' });

    const openAuth = (type) => {
        setAuthModal({ isOpen: true, type });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="AboutPage" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <Header onAuth={openAuth} />

            <main>
                <Hero />
                <Philosophy />
                <Founders />
            </main>

            <Footer />
            <AuthModal
                isOpen={authModal.isOpen}
                type={authModal.type}
                onClose={() => setAuthModal({ ...authModal, isOpen: false })}
            />
        </div>
    );
};

export default AboutPage;
