import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ onAuth }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                    </div>
                    <span className={styles.logo}>Invest<span className={styles.gold}>IQ</span></span>
                </div>

                <nav className={styles.nav}>
                    <Link to="/about" className={styles.link}>About Us</Link>
                    <a href="#features" className={styles.link} onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
                    <a href="#testimonials" className={styles.link} onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }}>Reviews</a>
                    <a href="#pricing" className={styles.link} onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>Pricing</a>
                    <button className={styles.signInButton} onClick={() => onAuth('login')}>Sign In</button>
                    <button className={styles.signUpButton} onClick={() => onAuth('signup')}>Sign Up</button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
