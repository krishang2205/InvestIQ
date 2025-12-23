
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading, openAuthModal } = useAuth(); // Add openAuthModal

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
    }

    if (!user) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                gap: '1.5rem'
            }}>
                <h2>Access Restricted</h2>
                <p style={{ color: 'var(--color-secondary)' }}>Please sign in to view this page.</p>
                <button
                    onClick={() => openAuthModal('login')}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'var(--color-accent)',
                        color: 'black',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    Sign In
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
