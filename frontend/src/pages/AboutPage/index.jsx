import React, { useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/auth/AuthModal';

const AboutPage = () => {
    // Reuse auth modal logic from LandingPage if needed, or keeping it simpler for now
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

            <main style={{ paddingTop: '100px', color: 'white', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
                <h1>About Us</h1>
                <p>Coming Soon...</p>
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
