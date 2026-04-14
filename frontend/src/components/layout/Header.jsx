import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
    const { openAuthModal } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (location.pathname === '/') {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/', { state: { scrollTo: id } });
        }
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <div className={styles.logoWrapper} onClick={() => navigate('/')}>
                        <div className={styles.logoIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                        </div>
                        <span className={styles.logo}>Invest<span className={styles.gold}>IQ</span></span>
                    </div>

                    <nav className={styles.navLinks}>
                        <Link to="/" className={styles.link}>Product</Link>
                        <Link to="/about" className={styles.link}>About Us</Link>
                        <a href="#features" className={styles.link} onClick={(e) => handleNavClick(e, 'features')}>Features</a>
                        <a href="#testimonials" className={styles.link} onClick={(e) => handleNavClick(e, 'testimonials')}>Reviews</a>
                        <a href="#pricing" className={styles.link} onClick={(e) => handleNavClick(e, 'pricing')}>Pricing</a>
                    </nav>
                </div>

                <div className={styles.rightSection}>
                    <button className={`${styles.authButton} ${styles.desktopOnly}`} onClick={() => openAuthModal('login')}>
                        Sign In / Sign Up
                    </button>
                    <button 
                        className={styles.mobileMenuBtn} 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className={styles.mobileNav}>
                    <Link to="/" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>Product</Link>
                    <Link to="/about" className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                    <a href="#features" className={styles.mobileLink} onClick={(e) => handleNavClick(e, 'features')}>Features</a>
                    <a href="#testimonials" className={styles.mobileLink} onClick={(e) => handleNavClick(e, 'testimonials')}>Reviews</a>
                    <a href="#pricing" className={styles.mobileLink} onClick={(e) => handleNavClick(e, 'pricing')}>Pricing</a>
                    
                    <button className={styles.mobileAuthButton} onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal('login');
                    }}>
                        Sign In / Sign Up
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
