import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import styles from './AuthModal.module.css';

const AuthModal = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeBtn}>
                    <X size={24} />
                </button>

                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Lock size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className={styles.title}>
                        {type === 'login' ? 'Welcome Back' : 'Join InvestIQ'}
                    </h3>
                    <p className={styles.subtitle}>
                        The AI-powered future of investing awaits.
                    </p>
                </div>

                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.field}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={styles.input}
                        />
                    </div>
                    <button className={styles.submitBtn}>
                        {type === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p className={styles.disclaimer}>
                    This is a demo interface for future integration.
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
