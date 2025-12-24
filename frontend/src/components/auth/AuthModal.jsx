
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthModal.module.css';

const AuthModal = () => {
    const {
        isAuthModalOpen,
        closeAuthModal,
        authMode,
        signInWithGoogle,
        loginWithMagicLink,
        signupWithMagicLink,
        setAuthMode
    } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeAuthModal();
        };
        if (isAuthModalOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isAuthModalOpen, closeAuthModal]);

    if (!isAuthModalOpen) return null;

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithGoogle();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            if (authMode === 'login') {
                await loginWithMagicLink(email);
                setSuccessMessage('Check your email for the login link!');
            } else {
                await signupWithMagicLink(email);
                setSuccessMessage('Check your email to confirm your account!');
            }
        } catch (err) {
            if (err.message.includes("Signups not allowed")) {
                setError("Account not found. Please Sign Up first.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeAuthModal()}>
            <div className={styles.modal}>
                <button className={styles.closeButton} onClick={closeAuthModal} aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className={styles.subtitle}>
                        {authMode === 'login'
                            ? 'Enter your details to access your portfolio.'
                            : 'Join InvestIQ to start your AI investing journey.'}
                    </p>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${authMode === 'login' ? styles.active : ''}`}
                        onClick={() => setAuthMode('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`${styles.tab} ${authMode === 'signup' ? styles.active : ''}`}
                        onClick={() => setAuthMode('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <button className={styles.googleButton} onClick={handleGoogleLogin} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className={styles.divider}>or continue with email</div>

                <form className={styles.form} onSubmit={handleEmailLogin}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading
                            ? 'Processing...'
                            : (authMode === 'login' ? 'Sign In with Email' : 'Create Account')
                        }
                    </button>
                </form>

                {error && <div className={styles.error}>{error}</div>}
                {successMessage && <div className={styles.success}>{successMessage}</div>}
            </div>
        </div>
    );
};

export default AuthModal;
